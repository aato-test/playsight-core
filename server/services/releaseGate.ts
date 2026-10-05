import type { ReleaseGateStatus, ResultRow } from '../db/schema';

export interface ReleaseGateDecision {
  status: ReleaseGateStatus;
  blockingFailures: { resultId: string; testName: string; browser: string; error: string | null }[];
  reason: string;
}

/**
 * Default rule: PASS when no blocking test failed and at least one test ran to completion.
 * Cancelled runs and runs with zero completed tests never pass the gate.
 */
export function evaluateReleaseGate(
  results: Pick<ResultRow, 'id' | 'testName' | 'browser' | 'status' | 'blocking' | 'error'>[],
  runCancelled = false
): ReleaseGateDecision {
  const blockingFailures = results
    .filter((r) => r.blocking && (r.status === 'failed' || r.status === 'cancelled'))
    .map((r) => ({ resultId: r.id, testName: r.testName, browser: r.browser, error: r.error }));
  const completed = results.filter((r) => r.status === 'passed' || r.status === 'failed').length;

  if (runCancelled) {
    return { status: 'failed', blockingFailures, reason: 'Run was cancelled before completion' };
  }
  if (completed === 0) {
    return { status: 'failed', blockingFailures, reason: 'No tests completed' };
  }
  if (blockingFailures.length > 0) {
    return {
      status: 'failed',
      blockingFailures,
      reason: `${blockingFailures.length} blocking test failure(s)`,
    };
  }
  return { status: 'passed', blockingFailures, reason: 'No blocking test failures' };
}
