import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db, hasDatabase } from '../db';
import { runs, testSuites, type SuiteRow } from '../db/schema';
import type { SuiteInput } from '../../shared/suite';
import { recordAudit } from './audit';
import { memoryStore } from '../db/memoryStore';

export async function listSuites() {
  if (hasDatabase && db) {
    const rows = await db.select().from(testSuites).orderBy(desc(testSuites.updatedAt));
    const latest = await latestRunBySuite();
    return rows.map((row) => toSuiteDTO(row, latest.get(row.id)));
  }

  const rows = Array.from(memoryStore.suites.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  const latest = getMemoryLatestRuns();
  return rows.map((row) => toSuiteDTO(row, latest.get(row.id)));
}

export async function getSuite(id: string) {
  if (hasDatabase && db) {
    const [row] = await db.select().from(testSuites).where(eq(testSuites.id, id));
    return row ?? null;
  }
  return memoryStore.suites.get(id) ?? null;
}

export async function createSuite(input: SuiteInput, id?: string) {
  const suiteId = id ?? `suite-${randomUUID()}`;
  const now = new Date();
  const row: SuiteRow = {
    id: suiteId,
    name: input.name,
    description: input.description ?? '',
    baseUrl: input.baseUrl ?? '',
    browser: input.browser ?? 'chromium',
    environment: input.environment ?? 'staging',
    jiraIssue: input.jiraIssue ?? null,
    definition: input.definition,
    createdAt: now,
    updatedAt: now,
  };

  if (hasDatabase && db) {
    const [dbRow] = await db.insert(testSuites).values(row).returning();
    await recordAudit({
      eventType: 'suite_created',
      suiteId: dbRow.id,
      message: `Suite "${dbRow.name}" created`,
      metadata: { steps: dbRow.definition.nodes.length },
    });
    return toSuiteDTO(dbRow);
  }

  memoryStore.suites.set(row.id, row);
  await recordAudit({
    eventType: 'suite_created',
    suiteId: row.id,
    message: `Suite "${row.name}" created`,
    metadata: { steps: row.definition.nodes.length },
  });
  return toSuiteDTO(row);
}

export async function updateSuite(id: string, input: SuiteInput) {
  const now = new Date();

  if (hasDatabase && db) {
    const [row] = await db
      .update(testSuites)
      .set({ ...input, updatedAt: now })
      .where(eq(testSuites.id, id))
      .returning();
    if (!row) return null;
    await recordAudit({
      eventType: 'suite_updated',
      suiteId: row.id,
      message: `Suite "${row.name}" updated`,
      metadata: { steps: row.definition.nodes.length, browser: row.browser },
    });
    const latest = await latestRunBySuite(id);
    return toSuiteDTO(row, latest.get(id));
  }

  const existing = memoryStore.suites.get(id);
  if (!existing) return null;

  const updated: SuiteRow = {
    ...existing,
    name: input.name,
    description: input.description ?? '',
    baseUrl: input.baseUrl ?? '',
    browser: input.browser ?? existing.browser,
    environment: input.environment ?? existing.environment,
    jiraIssue: input.jiraIssue ?? null,
    definition: input.definition,
    updatedAt: now,
  };

  memoryStore.suites.set(id, updated);
  await recordAudit({
    eventType: 'suite_updated',
    suiteId: updated.id,
    message: `Suite "${updated.name}" updated`,
    metadata: { steps: updated.definition.nodes.length, browser: updated.browser },
  });
  const latest = getMemoryLatestRuns(id);
  return toSuiteDTO(updated, latest.get(id));
}

export async function deleteSuite(id: string) {
  if (hasDatabase && db) {
    const [row] = await db.delete(testSuites).where(eq(testSuites.id, id)).returning();
    if (!row) return false;
    await recordAudit({
      eventType: 'suite_deleted',
      suiteId: id,
      message: `Suite "${row.name}" deleted`,
    });
    return true;
  }

  const existing = memoryStore.suites.get(id);
  if (!existing) return false;
  memoryStore.suites.delete(id);
  await recordAudit({
    eventType: 'suite_deleted',
    suiteId: id,
    message: `Suite "${existing.name}" deleted`,
  });
  return true;
}

async function latestRunBySuite(suiteId?: string) {
  if (!hasDatabase || !db) return getMemoryLatestRuns(suiteId);
  const rows = await db
    .selectDistinctOn([runs.suiteId], {
      suiteId: runs.suiteId,
      status: runs.status,
      createdAt: runs.createdAt,
    })
    .from(runs)
    .where(suiteId ? eq(runs.suiteId, suiteId) : undefined)
    .orderBy(runs.suiteId, desc(runs.createdAt));
  return new Map(rows.map((r) => [r.suiteId, r]));
}

function getMemoryLatestRuns(suiteId?: string) {
  const map = new Map<string, { status: string; createdAt: Date }>();
  const allRuns = Array.from(memoryStore.runs.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  for (const r of allRuns) {
    if (suiteId && r.suiteId !== suiteId) continue;
    if (!map.has(r.suiteId)) {
      map.set(r.suiteId, { status: r.status, createdAt: r.createdAt });
    }
  }
  return map;
}

/** Maps a DB row to the frontend's existing `TestSuite` shape. */
export function toSuiteDTO(row: SuiteRow, latest?: { status: string; createdAt: Date }) {
  const status = !latest
    ? 'draft'
    : latest.status === 'passed'
      ? 'passing'
      : latest.status === 'failed'
        ? 'needs_attention'
        : 'draft';
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    baseUrl: row.baseUrl,
    environment: row.environment,
    targetBrowser: row.browser,
    jiraIssue: row.jiraIssue ?? undefined,
    nodes: row.definition.nodes,
    edges: row.definition.edges,
    status,
    lastRunAt: latest?.createdAt.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
