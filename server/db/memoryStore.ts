import { randomUUID } from 'node:crypto';
import type { SuiteRow, RunRow, ResultRow, ArtifactRow, AuditRow } from './schema';
import type { SuiteInput, SuiteDefinition } from '../../shared/suite';
import { evaluateReleaseGate } from '../services/releaseGate';

// In-memory collections
const suitesMap = new Map<string, SuiteRow>();
const runsMap = new Map<string, RunRow>();
const resultsMap = new Map<string, ResultRow>();
const artifactsMap = new Map<string, ArtifactRow>();
const auditMap = new Map<string, AuditRow>();

// Initial demo suites
const INITIAL_DEMO_SUITES: (SuiteInput & { id: string })[] = [
  {
    id: 'demo-playwright-docs',
    name: 'Demo: Playwright docs navigation',
    description: 'Opens playwright.dev, follows "Get started" and verifies the installation page. Expected to pass.',
    baseUrl: 'https://playwright.dev',
    browser: 'chromium',
    environment: 'production',
    jiraIssue: 'CHK-182',
    definition: {
      nodes: [
        {
          id: 'pw-1',
          type: 'navigate',
          title: 'Open homepage',
          position: { x: 80, y: 120 },
          data: { url: '/', timeout: 30000, waitUntil: 'domcontentloaded' },
        },
        {
          id: 'pw-2',
          type: 'click',
          title: 'Click Get started',
          position: { x: 380, y: 120 },
          data: { selector: 'a.getStarted_Sjon, a:has-text("Get started")', clickType: 'single', waitForSelector: true, timeout: 15000 },
        },
        {
          id: 'pw-3',
          type: 'assert',
          title: 'URL is docs intro',
          position: { x: 680, y: 120 },
          data: { selector: '', assertionType: 'url_contains', expectedValue: '/docs/intro', failureMessage: '', timeout: 15000 },
        },
        {
          id: 'pw-4',
          type: 'assert',
          title: 'Heading mentions Installation',
          position: { x: 980, y: 120 },
          data: { selector: 'h1', assertionType: 'text_contains', expectedValue: 'Installation', failureMessage: '', timeout: 15000, captureScreenshot: true },
        },
      ],
      edges: [
        { id: 'pw-e1', sourceId: 'pw-1', targetId: 'pw-2' },
        { id: 'pw-e2', sourceId: 'pw-2', targetId: 'pw-3' },
        { id: 'pw-e3', sourceId: 'pw-3', targetId: 'pw-4' },
      ],
    },
  },
  {
    id: 'demo-example-missing-login',
    name: 'Demo: Example.com missing login button',
    description: 'Verifies example.com, then asserts a login button that does not exist. Expected to fail with evidence.',
    baseUrl: 'https://example.com',
    browser: 'chromium',
    environment: 'staging',
    jiraIssue: 'CHK-184',
    definition: {
      nodes: [
        {
          id: 'ex-1',
          type: 'navigate',
          title: 'Open example.com',
          position: { x: 80, y: 120 },
          data: { url: '/', timeout: 30000, waitUntil: 'load' },
        },
        {
          id: 'ex-2',
          type: 'assert',
          title: 'Heading is Example Domain',
          position: { x: 380, y: 120 },
          data: { selector: 'h1', assertionType: 'text_equals', expectedValue: 'Example Domain', failureMessage: '', timeout: 10000 },
        },
        {
          id: 'ex-3',
          type: 'assert',
          title: 'Login button visible',
          position: { x: 680, y: 120 },
          data: { selector: '#login-button', assertionType: 'is_visible', expectedValue: '', failureMessage: 'Login button should be rendered', timeout: 3000 },
        },
      ],
      edges: [
        { id: 'ex-e1', sourceId: 'ex-1', targetId: 'ex-2' },
        { id: 'ex-e2', sourceId: 'ex-2', targetId: 'ex-3' },
      ],
    },
  },
  {
    id: 'suite-checkout-flow',
    name: 'E2E Checkout Regression Sequence',
    description: 'End-to-end critical checkout flow with payment submission and order confirmation',
    baseUrl: 'https://shop.local.internal',
    browser: 'chromium',
    environment: 'staging',
    jiraIssue: 'CHK-184',
    definition: {
      nodes: [
        {
          id: 'step-1',
          type: 'navigate',
          title: 'Launch Checkout Portal',
          position: { x: 100, y: 180 },
          data: { url: '/checkout', timeout: 5000, waitUntil: 'load' },
        },
        {
          id: 'step-2',
          type: 'input',
          title: 'Enter Customer Email',
          position: { x: 440, y: 180 },
          data: { selector: '#customer-email', value: 'qa-test@internal.net', clearFirst: true, maskInput: false, timeout: 5000 },
        },
        {
          id: 'step-3',
          type: 'click',
          title: 'Select Express Shipping',
          position: { x: 780, y: 180 },
          data: { selector: '[data-testid="shipping-express"]', clickType: 'single', waitForSelector: true, timeout: 5000 },
        },
        {
          id: 'step-4',
          type: 'click',
          title: 'Confirm Payment Submission',
          position: { x: 1120, y: 180 },
          data: { selector: '[data-testid="checkout-submit"]', clickType: 'single', waitForSelector: true, timeout: 6000 },
        },
        {
          id: 'step-5',
          type: 'assert',
          title: 'Assert Order Confirmation #',
          position: { x: 1460, y: 180 },
          data: { selector: '.order-success-title', assertionType: 'text_contains', expectedValue: 'Order Confirmed', failureMessage: 'Order confirmation header was not rendered', timeout: 5000 },
        },
      ],
      edges: [
        { id: 'edge-1', sourceId: 'step-1', targetId: 'step-2' },
        { id: 'edge-2', sourceId: 'step-2', targetId: 'step-3' },
        { id: 'edge-3', sourceId: 'step-3', targetId: 'step-4' },
        { id: 'edge-4', sourceId: 'step-4', targetId: 'step-5' },
      ],
    },
  },
];

// Seed initial suites
for (const s of INITIAL_DEMO_SUITES) {
  const now = new Date();
  suitesMap.set(s.id, {
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    baseUrl: s.baseUrl ?? '',
    browser: s.browser ?? 'chromium',
    environment: s.environment ?? 'staging',
    jiraIssue: s.jiraIssue ?? null,
    definition: s.definition,
    createdAt: now,
    updatedAt: now,
  });
}

// Seed the two runs corresponding to artifacts/ directory
const SEED_RUN_1: RunRow = {
  id: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455',
  status: 'passed',
  createdAt: new Date(Date.now() - 3600_000 * 4),
  startedAt: new Date(Date.now() - 3600_000 * 4),
  completedAt: new Date(Date.now() - 3600_000 * 4 + 1420),
  branch: 'main',
  commit: 'f6ef9d5',
  environment: 'production',
  suiteId: 'demo-playwright-docs',
  suiteName: 'Demo: Playwright docs navigation',
  suiteSnapshot: {
    baseUrl: 'https://playwright.dev',
    definition: INITIAL_DEMO_SUITES[0].definition,
  },
  browsers: ['chromium'],
  totalTests: 1,
  passedTests: 1,
  failedTests: 0,
  skippedTests: 0,
  durationMs: 1420,
  releaseGateStatus: 'passed',
  triggeredBy: 'PlaySight Automation',
  rerunOf: null,
  error: null,
};

const SEED_RESULT_1: ResultRow = {
  id: 'res-43706389-cb6c-4f75-a742-592f801b4dff',
  runId: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455',
  suiteId: 'demo-playwright-docs',
  testName: 'Demo: Playwright docs navigation',
  browser: 'chromium',
  browserVersion: '124.0.6367.60',
  status: 'passed',
  blocking: true,
  durationMs: 1420,
  error: null,
  stackTrace: null,
  failedNodeId: null,
  screenshotPath: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455/res-43706389-cb6c-4f75-a742-592f801b4dff/step-4.png',
  tracePath: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455/res-43706389-cb6c-4f75-a742-592f801b4dff/trace.zip',
  steps: [
    { nodeId: 'pw-1', stepNumber: 1, title: 'Open homepage', action: 'navigate', apiCall: "await page.goto('https://playwright.dev', { waitUntil: 'domcontentloaded' })", status: 'passed', durationMs: 420, startedAt: '00:00.000' },
    { nodeId: 'pw-2', stepNumber: 2, title: 'Click Get started', action: 'click', apiCall: "await page.locator('a:has-text(\"Get started\")').click()", status: 'passed', durationMs: 310, startedAt: '00:00.420' },
    { nodeId: 'pw-3', stepNumber: 3, title: 'URL is docs intro', action: 'assert', apiCall: "await expect(page).toHaveURL(/\\/docs\\/intro/)", status: 'passed', durationMs: 190, startedAt: '00:00.730' },
    { nodeId: 'pw-4', stepNumber: 4, title: 'Heading mentions Installation', action: 'assert', apiCall: "await expect(page.locator('h1')).toContainText('Installation')", status: 'passed', durationMs: 500, startedAt: '00:00.920' },
  ],
  consoleLogs: [
    { timestamp: '00:00.320', level: 'info', message: '[playwright] Navigated to https://playwright.dev' },
    { timestamp: '00:00.810', level: 'debug', message: '[dom] Selector "h1" resolved with 1 element' },
  ],
  networkEvents: [
    { timestamp: '00:00.120', method: 'GET', url: 'https://playwright.dev/', status: 200, resourceType: 'document', durationMs: 140 },
    { timestamp: '00:00.460', method: 'GET', url: 'https://playwright.dev/docs/intro', status: 200, resourceType: 'document', durationMs: 180 },
  ],
  domSnapshot: {
    htmlSnippet: '<main><div class="container"><h1>Installation</h1><p>Playwright was created specifically to accommodate the needs of end-to-end testing.</p></div></main>',
    inspectedSelector: 'h1',
  },
  createdAt: SEED_RUN_1.createdAt,
};

const SEED_ARTIFACT_1: ArtifactRow = {
  id: 'art-pw-step4',
  runId: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455',
  resultId: 'res-43706389-cb6c-4f75-a742-592f801b4dff',
  kind: 'screenshot',
  label: 'Step 4 Assertion Snapshot',
  nodeId: 'pw-4',
  storagePath: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455/res-43706389-cb6c-4f75-a742-592f801b4dff/step-4.png',
  contentType: 'image/png',
  sizeBytes: 133165,
  createdAt: SEED_RUN_1.createdAt,
};

const SEED_ARTIFACT_2: ArtifactRow = {
  id: 'art-pw-trace',
  runId: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455',
  resultId: 'res-43706389-cb6c-4f75-a742-592f801b4dff',
  kind: 'trace',
  label: 'Playwright Full Execution Trace',
  nodeId: null,
  storagePath: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455/res-43706389-cb6c-4f75-a742-592f801b4dff/trace.zip',
  contentType: 'application/zip',
  sizeBytes: 2871236,
  createdAt: SEED_RUN_1.createdAt,
};

const SEED_RUN_2: RunRow = {
  id: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3',
  status: 'failed',
  createdAt: new Date(Date.now() - 3600_000 * 2),
  startedAt: new Date(Date.now() - 3600_000 * 2),
  completedAt: new Date(Date.now() - 3600_000 * 2 + 2150),
  branch: 'feature/checkout-fix',
  commit: 'b284c1f',
  environment: 'staging',
  suiteId: 'demo-example-missing-login',
  suiteName: 'Demo: Example.com missing login button',
  suiteSnapshot: {
    baseUrl: 'https://example.com',
    definition: INITIAL_DEMO_SUITES[1].definition,
  },
  browsers: ['chromium'],
  totalTests: 1,
  passedTests: 0,
  failedTests: 1,
  skippedTests: 0,
  durationMs: 2150,
  releaseGateStatus: 'failed',
  triggeredBy: 'CI Webhook (GitHub)',
  rerunOf: null,
  error: 'Element #login-button not found within 3000ms',
};

const SEED_RESULT_2: ResultRow = {
  id: 'res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58',
  runId: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3',
  suiteId: 'demo-example-missing-login',
  testName: 'Demo: Example.com missing login button',
  browser: 'chromium',
  browserVersion: '124.0.6367.60',
  status: 'failed',
  blocking: true,
  durationMs: 2150,
  error: 'Element #login-button not found within 3000ms (Assertion Timeout)',
  stackTrace: 'Error: Timed out 3000ms waiting for expect(locator).toBeVisible()\n  at runner.ts:182:11',
  failedNodeId: 'ex-3',
  screenshotPath: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3/res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58/failure-step-2.png',
  tracePath: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3/res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58/trace.zip',
  steps: [
    { nodeId: 'ex-1', stepNumber: 1, title: 'Open example.com', action: 'navigate', apiCall: "await page.goto('https://example.com', { waitUntil: 'load' })", status: 'passed', durationMs: 380, startedAt: '00:00.000' },
    { nodeId: 'ex-2', stepNumber: 2, title: 'Heading is Example Domain', action: 'assert', apiCall: "await expect(page.locator('h1')).toHaveText('Example Domain')", status: 'passed', durationMs: 220, startedAt: '00:00.380' },
    { nodeId: 'ex-3', stepNumber: 3, title: 'Login button visible', action: 'assert', apiCall: "await expect(page.locator('#login-button')).toBeVisible()", status: 'failed', durationMs: 3000, startedAt: '00:00.600', error: 'Element #login-button not found within 3000ms' },
  ],
  consoleLogs: [
    { timestamp: '00:00.380', level: 'info', message: '[playwright] Navigated to https://example.com' },
    { timestamp: '00:03.600', level: 'error', message: '[playwright] Locator "#login-button" not resolved after 3000ms' },
  ],
  networkEvents: [
    { timestamp: '00:00.100', method: 'GET', url: 'https://example.com/', status: 200, resourceType: 'document', durationMs: 120 },
  ],
  domSnapshot: {
    htmlSnippet: '<body><div><h1>Example Domain</h1><p>This domain is for use in illustrative examples in documents.</p></div></body>',
    inspectedSelector: '#login-button',
  },
  createdAt: SEED_RUN_2.createdAt,
};

const SEED_ARTIFACT_3: ArtifactRow = {
  id: 'art-ex-fail',
  runId: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3',
  resultId: 'res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58',
  kind: 'screenshot',
  label: 'Failure Screenshot Step 3 (#login-button)',
  nodeId: 'ex-3',
  storagePath: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3/res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58/failure-step-2.png',
  contentType: 'image/png',
  sizeBytes: 55614,
  createdAt: SEED_RUN_2.createdAt,
};

const SEED_ARTIFACT_4: ArtifactRow = {
  id: 'art-ex-trace',
  runId: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3',
  resultId: 'res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58',
  kind: 'trace',
  label: 'Failure Execution Trace (.zip)',
  nodeId: null,
  storagePath: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3/res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58/trace.zip',
  contentType: 'application/zip',
  sizeBytes: 59115,
  createdAt: SEED_RUN_2.createdAt,
};

runsMap.set(SEED_RUN_1.id, SEED_RUN_1);
runsMap.set(SEED_RUN_2.id, SEED_RUN_2);
resultsMap.set(SEED_RESULT_1.id, SEED_RESULT_1);
resultsMap.set(SEED_RESULT_2.id, SEED_RESULT_2);
artifactsMap.set(SEED_ARTIFACT_1.id, SEED_ARTIFACT_1);
artifactsMap.set(SEED_ARTIFACT_2.id, SEED_ARTIFACT_2);
artifactsMap.set(SEED_ARTIFACT_3.id, SEED_ARTIFACT_3);
artifactsMap.set(SEED_ARTIFACT_4.id, SEED_ARTIFACT_4);

export const memoryStore = {
  suites: suitesMap,
  runs: runsMap,
  results: resultsMap,
  artifacts: artifactsMap,
  audit: auditMap,
};
