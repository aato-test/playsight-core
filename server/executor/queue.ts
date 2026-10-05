import { inArray, eq } from 'drizzle-orm';
import { db, hasDatabase } from '../db';
import { runs, testResults } from '../db/schema';
import { env } from '../env';
import { executeRun } from './runner';
import { memoryStore } from '../db/memoryStore';

const pending: string[] = [];
let active = 0;

export function enqueueRun(runId: string) {
  pending.push(runId);
  drain();
}

function drain() {
  while (active < env.executorConcurrency && pending.length > 0) {
    const runId = pending.shift()!;
    active++;
    executeRun(runId)
      .catch((error) => console.error(`[executor] run ${runId} crashed`, error))
      .finally(() => {
        active--;
        drain();
      });
  }
}

export function dequeueIfPending(runId: string) {
  const index = pending.indexOf(runId);
  if (index === -1) return false;
  pending.splice(index, 1);
  return true;
}

/** On boot: runs interrupted by a restart are failed honestly; queued runs are resumed. */
export async function recoverRuns() {
  if (!hasDatabase || !db) {
    for (const r of memoryStore.runs.values()) {
      if (r.status === 'queued') enqueueRun(r.id);
    }
    return;
  }

  const interrupted = await db.select({ id: runs.id }).from(runs).where(eq(runs.status, 'running'));
  if (interrupted.length) {
    const ids = interrupted.map((r) => r.id);
    await db
      .update(runs)
      .set({
        status: 'failed',
        completedAt: new Date(),
        releaseGateStatus: 'failed',
        error: 'Executor restarted while this run was in progress',
      })
      .where(inArray(runs.id, ids));
    await db
      .update(testResults)
      .set({ status: 'failed', error: 'Executor restarted while this test was in progress' })
      .where(inArray(testResults.runId, ids));
  }
  const queued = await db.select({ id: runs.id }).from(runs).where(eq(runs.status, 'queued'));
  queued.forEach((r) => enqueueRun(r.id));
}
