import { randomUUID } from 'node:crypto';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { db, hasDatabase } from '../db';
import { auditEvents, type AuditRow } from '../db/schema';
import { memoryStore } from '../db/memoryStore';

export type AuditEventType =
  | 'run_created'
  | 'run_started'
  | 'test_started'
  | 'test_passed'
  | 'test_failed'
  | 'run_completed'
  | 'run_cancelled'
  | 'rerun_started'
  | 'release_gate_passed'
  | 'release_gate_failed'
  | 'suite_created'
  | 'suite_updated'
  | 'suite_deleted';

export async function recordAudit(event: {
  eventType: AuditEventType;
  message: string;
  teamId?: string;
  runId?: string | null;
  suiteId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const row: AuditRow = {
    id: randomUUID(),
    teamId: event.teamId || 'team-default',
    eventType: event.eventType,
    message: event.message,
    runId: event.runId ?? null,
    suiteId: event.suiteId ?? null,
    metadata: event.metadata ?? {},
    createdAt: new Date(),
  };

  if (hasDatabase && db) {
    await db.insert(auditEvents).values(row);
  } else {
    memoryStore.audit.set(row.id, row);
  }
}

export async function listAudit(filter: { runId?: string; suiteId?: string; limit: number }) {
  if (hasDatabase && db) {
    const conditions: SQL[] = [];
    if (filter.runId) conditions.push(eq(auditEvents.runId, filter.runId));
    if (filter.suiteId) conditions.push(eq(auditEvents.suiteId, filter.suiteId));
    return db
      .select()
      .from(auditEvents)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(auditEvents.createdAt))
      .limit(filter.limit);
  }

  let list = Array.from(memoryStore.audit.values());
  if (filter.runId) list = list.filter((a) => a.runId === filter.runId);
  if (filter.suiteId) list = list.filter((a) => a.suiteId === filter.suiteId);
  return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, filter.limit);
}
