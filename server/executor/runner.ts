import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit, type Browser, type BrowserType, type Page } from 'playwright';
import { eq } from 'drizzle-orm';
import { db, hasDatabase } from '../db';
import {
  runs,
  testResults,
  type ConsoleEntry,
  type NetworkEntry,
  type ResultRow,
  type RunRow,
  type StepResult,
} from '../db/schema';
import { env } from '../env';
import { orderNodes, type ExecutableNode } from '../../shared/suite';
import { describeApiCall, executeStep } from './steps';
import { artifactFilePath, saveArtifact } from '../services/artifacts';
import { recordAudit } from '../services/audit';
import { evaluateReleaseGate } from '../services/releaseGate';
import { memoryStore } from '../db/memoryStore';

const BROWSERS: Record<string, BrowserType> = { chromium, firefox, webkit };
const MAX_LOG_ENTRIES = 300;

interface RunControl {
  cancelled: boolean;
  browser?: Browser;
}
const controls = new Map<string, RunControl>();

export function requestCancel(runId: string) {
  const control = controls.get(runId);
  if (!control) return false;
  control.cancelled = true;
  control.browser?.close().catch(() => {});
  return true;
}

async function getRunRow(runId: string): Promise<RunRow | null> {
  if (hasDatabase && db) {
    const [run] = await db.select().from(runs).where(eq(runs.id, runId));
    return run ?? null;
  }
  return memoryStore.runs.get(runId) ?? null;
}

async function updateRunRow(runId: string, patch: Partial<RunRow>) {
  if (hasDatabase && db) {
    await db.update(runs).set(patch).where(eq(runs.id, runId));
  } else {
    const existing = memoryStore.runs.get(runId);
    if (existing) memoryStore.runs.set(runId, { ...existing, ...patch });
  }
}

async function getResultsRows(runId: string): Promise<ResultRow[]> {
  if (hasDatabase && db) {
    return db.select().from(testResults).where(eq(testResults.runId, runId));
  }
  return Array.from(memoryStore.results.values()).filter((r) => r.runId === runId);
}

async function updateResultRow(resultId: string, patch: Partial<ResultRow>) {
  if (hasDatabase && db) {
    await db.update(testResults).set(patch).where(eq(testResults.id, resultId));
  } else {
    const existing = memoryStore.results.get(resultId);
    if (existing) memoryStore.results.set(resultId, { ...existing, ...patch });
  }
}

export async function executeRun(runId: string) {
  const run = await getRunRow(runId);
  if (!run || run.status !== 'queued') return;

  const control: RunControl = { cancelled: false };
  controls.set(runId, control);
  const startedAt = new Date();

  try {
    await updateRunRow(runId, { status: 'running', startedAt });
    await recordAudit({
      eventType: 'run_started',
      runId,
      suiteId: run.suiteId,
      message: `Run started for "${run.suiteName}" on ${run.browsers.join(', ')}`,
    });

    const results = await getResultsRows(runId);
    const { baseUrl, definition } = run.suiteSnapshot;
    const ordered = orderNodes(definition.nodes, definition.edges);

    for (const result of results) {
      if (control.cancelled) {
        await updateResultRow(result.id, { status: 'cancelled' });
        continue;
      }
      await executeTest({ runId, result, ordered, baseUrl, control });
    }

    const finalResults = await getResultsRows(runId);
    const gate = evaluateReleaseGate(finalResults, control.cancelled);
    const passed = finalResults.filter((r) => r.status === 'passed').length;
    const failed = finalResults.filter((r) => r.status === 'failed').length;
    const skipped = finalResults.length - passed - failed;
    const status = control.cancelled ? 'cancelled' : failed > 0 ? 'failed' : 'passed';
    const completedAt = new Date();

    await updateRunRow(runId, {
      status,
      completedAt,
      durationMs: completedAt.getTime() - startedAt.getTime(),
      totalTests: finalResults.length,
      passedTests: passed,
      failedTests: failed,
      skippedTests: skipped,
      releaseGateStatus: gate.status,
    });

    await recordAudit({
      eventType: status === 'cancelled' ? 'run_cancelled' : 'run_completed',
      runId,
      suiteId: run.suiteId,
      message: `Run ${status}: ${passed} passed, ${failed} failed, ${skipped} skipped`,
      metadata: { status, passed, failed, skipped, durationMs: completedAt.getTime() - startedAt.getTime() },
    });
    await recordAudit({
      eventType: gate.status === 'passed' ? 'release_gate_passed' : 'release_gate_failed',
      runId,
      suiteId: run.suiteId,
      message: `Release gate ${gate.status}: ${gate.reason}`,
      metadata: { blockingFailures: gate.blockingFailures },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateRunRow(runId, { status: 'failed', completedAt: new Date(), releaseGateStatus: 'failed', error: message });
    await recordAudit({
      eventType: 'run_completed',
      runId,
      suiteId: run.suiteId,
      message: `Run errored: ${message}`,
      metadata: { status: 'failed', error: message },
    });
  } finally {
    controls.delete(runId);
  }
}

async function executeTest(ctx: {
  runId: string;
  result: ResultRow;
  ordered: ExecutableNode[];
  baseUrl: string;
  control: RunControl;
}) {
  const { runId, result, ordered, baseUrl, control } = ctx;
  const testStart = Date.now();
  const consoleLogs: ConsoleEntry[] = [];
  const networkEvents: NetworkEntry[] = [];
  const steps: StepResult[] = ordered.map((node, i) => ({
    nodeId: node.id,
    stepNumber: i + 1,
    title: node.title,
    action: node.type,
    apiCall: describeApiCall(node, baseUrl),
    status: 'skipped',
    durationMs: 0,
    startedAt: null,
  }));
  const stamp = () => `${((Date.now() - testStart) / 1000).toFixed(2)}s`;

  await updateResultRow(result.id, { status: 'running', steps });
  await recordAudit({
    eventType: 'test_started',
    runId,
    suiteId: result.suiteId,
    message: `Test "${result.testName}" started on ${result.browser}`,
    metadata: { resultId: result.id, browser: result.browser },
  });

  let browser: Browser | undefined;
  let page: Page | undefined;
  let tracing = false;
  let error: string | null = null;
  let stackTrace: string | null = null;
  let failedNodeId: string | null = null;
  let screenshotPath: string | null = null;
  let tracePath: string | null = null;
  let domSnapshot: { htmlSnippet: string; inspectedSelector: string } | null = null;
  let browserVersion: string | null = null;

  try {
    const type = BROWSERS[result.browser];
    if (!type) throw new Error(`Unsupported browser "${result.browser}"`);
    try {
      browser = await type.launch({ headless: env.headless });
    } catch (launchError) {
      const msg = launchError instanceof Error ? launchError.message.split('\n')[0] : String(launchError);
      throw new Error(
        `Could not launch ${result.browser}. Install it with "pnpm exec playwright install ${result.browser}". (${msg})`
      );
    }
    control.browser = browser;
    browserVersion = browser.version();
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
    tracing = true;
    page = await context.newPage();

    const requestStarts = new WeakMap<object, number>();
    page.on('console', (msg) => {
      if (consoleLogs.length >= MAX_LOG_ENTRIES) return;
      const t = msg.type();
      const level = t === 'error' ? 'error' : t === 'warning' ? 'warn' : t === 'debug' ? 'debug' : 'info';
      consoleLogs.push({ timestamp: stamp(), level, message: msg.text().slice(0, 2000) });
    });
    page.on('pageerror', (err) => {
      if (consoleLogs.length >= MAX_LOG_ENTRIES) return;
      consoleLogs.push({ timestamp: stamp(), level: 'error', message: `Uncaught: ${err.message}`.slice(0, 2000) });
    });
    page.on('request', (req) => requestStarts.set(req, Date.now()));
    page.on('requestfailed', (req) => {
      if (networkEvents.length >= MAX_LOG_ENTRIES) return;
      networkEvents.push({
        timestamp: stamp(),
        method: req.method(),
        url: req.url().slice(0, 1000),
        status: 0,
        resourceType: req.resourceType(),
        failure: req.failure()?.errorText ?? 'failed',
        durationMs: Date.now() - (requestStarts.get(req) ?? Date.now()),
      });
    });
    page.on('response', (res) => {
      const req = res.request();
      const type = req.resourceType();
      const relevant = res.status() >= 400 || type === 'document' || type === 'xhr' || type === 'fetch';
      if (!relevant || networkEvents.length >= MAX_LOG_ENTRIES) return;
      networkEvents.push({
        timestamp: stamp(),
        method: req.method(),
        url: res.url().slice(0, 1000),
        status: res.status(),
        resourceType: type,
        durationMs: Date.now() - (requestStarts.get(req) ?? Date.now()),
      });
    });

    for (let i = 0; i < ordered.length; i++) {
      const node = ordered[i];
      const step = steps[i];
      if (control.cancelled) break;
      step.startedAt = new Date().toISOString();
      const t0 = Date.now();
      try {
        await executeStep(page, node, baseUrl);
        step.status = 'passed';
        step.durationMs = Date.now() - t0;
        if (node.data.captureScreenshot) {
          const artifact = await saveArtifact({
            runId,
            resultId: result.id,
            kind: 'screenshot',
            label: `After: ${node.title}`,
            nodeId: node.id,
            fileName: `step-${i + 1}.png`,
            contentType: 'image/png',
            data: await page.screenshot(),
          });
          screenshotPath ??= artifact.storagePath;
        }
      } catch (stepError) {
        step.status = 'failed';
        step.durationMs = Date.now() - t0;
        const err = stepError instanceof Error ? stepError : new Error(String(stepError));
        error = control.cancelled ? 'Run cancelled by user' : stripAnsi(err.message);
        step.error = error;
        stackTrace = err.stack ? stripAnsi(err.stack) : null;
        failedNodeId = node.id;
        if (!control.cancelled) {
          const shot = await page.screenshot().catch(() => null);
          if (shot) {
            const artifact = await saveArtifact({
              runId,
              resultId: result.id,
              kind: 'screenshot',
              label: `Failure: ${node.title}`,
              nodeId: node.id,
              fileName: `failure-step-${i + 1}.png`,
              contentType: 'image/png',
              data: shot,
            });
            screenshotPath = artifact.storagePath;
          }
          domSnapshot = await captureDom(page, node);
        }
        break;
      }
    }
  } catch (testError) {
    const err = testError instanceof Error ? testError : new Error(String(testError));
    error = control.cancelled ? 'Run cancelled by user' : stripAnsi(err.message);
    stackTrace = err.stack ? stripAnsi(err.stack) : null;
  } finally {
    if (tracing && page && !control.cancelled) {
      const file = artifactFilePath(runId, result.id, 'trace.zip');
      try {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await page.context().tracing.stop({ path: file });
        const artifact = await saveArtifact({
          runId,
          resultId: result.id,
          kind: 'trace',
          label: 'Playwright trace',
          fileName: 'trace.zip',
          contentType: 'application/zip',
          existingFile: file,
        });
        tracePath = artifact.storagePath;
      } catch {
        // Trace capture is best-effort; the result itself is still recorded.
      }
    }
    await browser?.close().catch(() => {});
    control.browser = undefined;
  }

  const status = control.cancelled ? 'cancelled' : error ? 'failed' : 'passed';
  await updateResultRow(result.id, {
    status,
    browserVersion,
    durationMs: Date.now() - testStart,
    error,
    stackTrace,
    failedNodeId,
    screenshotPath,
    tracePath,
    steps,
    consoleLogs,
    networkEvents,
    domSnapshot,
  });

  if (status !== 'cancelled') {
    await recordAudit({
      eventType: status === 'passed' ? 'test_passed' : 'test_failed',
      runId,
      suiteId: result.suiteId,
      message:
        status === 'passed'
          ? `Test "${result.testName}" passed on ${result.browser}`
          : `Test "${result.testName}" failed on ${result.browser}: ${error?.split('\n')[0]}`,
      metadata: { resultId: result.id, browser: result.browser, failedNodeId, durationMs: Date.now() - testStart },
    });
  }
}

async function captureDom(page: Page, node: ExecutableNode) {
  const selector = 'selector' in node.data ? node.data.selector : '';
  try {
    const html = selector
      ? await page
          .locator(selector)
          .first()
          .evaluate((el) => (el as Element).outerHTML, undefined, { timeout: 1000 })
          .catch(() => null)
      : null;
    const fallback = html ?? (await page.evaluate(() => document.body?.outerHTML ?? ''));
    return {
      inspectedSelector: selector || page.url(),
      htmlSnippet: (html ? fallback : `<!-- selector not found; page body follows -->\n${fallback}`).slice(0, 6000),
    };
  } catch {
    return null;
  }
}

function stripAnsi(value: string) {
  // eslint-disable-next-line no-control-regex
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}
