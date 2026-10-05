import {
  TestSuite,
  TestRunResult,
  PlaywrightTraceData,
  GitHubStatusResponse,
  GitHubRepository,
  GitHubBranch,
  JiraStatusResponse,
  JiraIssue,
  TestCase,
} from '../types';

export interface HealthResponse {
  status: string;
  mode?: string;
  database?: string;
  latencyMs?: number;
}

export interface ServerArtifact {
  id: string;
  kind: 'screenshot' | 'trace';
  label: string;
  nodeId?: string | null;
  contentType: string;
  sizeBytes: number;
  url: string;
}

export interface ServerStepResult {
  nodeId: string;
  stepNumber: number;
  title: string;
  action: string;
  apiCall: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  startedAt: string | null;
  error?: string;
}

export interface ServerTestResult {
  id: string;
  testName: string;
  browser: string;
  status: 'passed' | 'failed' | 'skipped' | 'cancelled';
  durationMs: number | null;
  error: string | null;
  stackTrace: string | null;
  failedNodeId: string | null;
  steps: ServerStepResult[];
  consoleLogs: { timestamp: string; level: 'info' | 'warn' | 'error' | 'debug'; message: string }[];
  networkEvents: { timestamp: string; method: string; url: string; status: number; resourceType: string; durationMs: number }[];
  domSnapshot: { htmlSnippet: string; inspectedSelector: string } | null;
  artifacts?: ServerArtifact[];
}

export interface ServerRunDTO {
  id: string;
  status: 'queued' | 'running' | 'passed' | 'failed' | 'cancelled';
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  branch: string | null;
  commit: string | null;
  environment: string;
  suiteId: string;
  suiteName: string;
  baseUrl: string;
  browsers: string[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  durationMs: number | null;
  triggeredBy: string;
  error: string | null;
  releaseGateStatus: 'pending' | 'passed' | 'failed';
  releaseGate?: {
    status: 'pending' | 'passed' | 'failed';
    reason: string;
    blockingFailures: string[];
  };
  results: ServerTestResult[];
}

/** Check if backend Express server is running and healthy */
export async function checkBackendHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch all test suites from server */
export async function fetchSuites(): Promise<TestSuite[] | null> {
  try {
    const res = await fetch('/api/suites');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch single suite */
export async function fetchSuite(id: string): Promise<TestSuite | null> {
  try {
    const res = await fetch(`/api/suites/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Save or update a suite */
export async function saveSuite(suite: TestSuite): Promise<TestSuite | null> {
  try {
    const isUpdate = Boolean(suite.id);
    const url = isUpdate ? `/api/suites/${encodeURIComponent(suite.id)}` : '/api/suites';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(suite),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Delete a suite */
export async function deleteSuite(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/suites/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.status === 204;
  } catch {
    return false;
  }
}

/** Fetch test runs from server */
export async function fetchRuns(filter?: { suiteId?: string; status?: string; limit?: number }): Promise<TestRunResult[] | null> {
  try {
    const params = new URLSearchParams();
    if (filter?.suiteId) params.set('suiteId', filter.suiteId);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.limit) params.set('limit', String(filter.limit));

    const res = await fetch(`/api/runs?${params.toString()}`);
    if (!res.ok) return null;
    const serverRuns: ServerRunDTO[] = await res.json();
    return serverRuns.map(mapServerRunToTestRunResult);
  } catch {
    return null;
  }
}

/** Fetch detailed run info */
export async function fetchRunDetail(id: string): Promise<TestRunResult | null> {
  try {
    const res = await fetch(`/api/runs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const serverRun: ServerRunDTO = await res.json();
    return mapServerRunToTestRunResult(serverRun);
  } catch {
    return null;
  }
}

/** Trigger a new test run on server */
export async function triggerServerRun(params: {
  suiteId: string;
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
  environment?: 'local' | 'staging' | 'production';
  branch?: string;
  commit?: string;
  triggeredBy?: string;
}): Promise<TestRunResult | null> {
  try {
    const res = await fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const serverRun: ServerRunDTO = await res.json();
    return mapServerRunToTestRunResult(serverRun);
  } catch {
    return null;
  }
}

/** Re-run an existing run */
export async function rerunServerRun(id: string): Promise<TestRunResult | null> {
  try {
    const res = await fetch(`/api/runs/${encodeURIComponent(id)}/rerun`, { method: 'POST' });
    if (!res.ok) return null;
    const serverRun: ServerRunDTO = await res.json();
    return mapServerRunToTestRunResult(serverRun);
  } catch {
    return null;
  }
}

/** Cancel a running test */
export async function cancelServerRun(id: string): Promise<TestRunResult | null> {
  try {
    const res = await fetch(`/api/runs/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
    if (!res.ok) return null;
    const serverRun: ServerRunDTO = await res.json();
    return mapServerRunToTestRunResult(serverRun);
  } catch {
    return null;
  }
}

/** Map server DTO to frontend TestRunResult with PlaywrightTraceData */
export function mapServerRunToTestRunResult(serverRun: ServerRunDTO): TestRunResult {
  const primaryResult = serverRun.results[0];

  const allArtifacts: ServerArtifact[] = [];
  for (const r of serverRun.results) {
    if (r.artifacts) allArtifacts.push(...r.artifacts);
  }

  // Construct traceData
  let traceData: PlaywrightTraceData | undefined;
  if (primaryResult) {
    const actions = primaryResult.steps.map((s) => ({
      stepNumber: s.stepNumber,
      title: s.title,
      action: s.action,
      apiCall: s.apiCall,
      durationMs: s.durationMs,
      status: (s.status === 'passed' ? 'passed' : 'failed') as 'passed' | 'failed',
      timestamp: s.startedAt ?? '00:00.000',
    }));

    const screenshots = (primaryResult.artifacts || [])
      .filter((a) => a.kind === 'screenshot')
      .map((a) => ({
        action: a.label,
        label: a.label,
        timestamp: 'Captured',
        previewUrl: a.url,
      }));

    traceData = {
      durationMs: primaryResult.durationMs ?? serverRun.durationMs ?? 0,
      actions,
      consoleLogs: primaryResult.consoleLogs || [],
      networkRequests: (primaryResult.networkEvents || []).map((ne) => ({
        method: ne.method,
        url: ne.url,
        status: ne.status,
        type: ne.resourceType,
        durationMs: ne.durationMs,
        size: '1.2 KB',
      })),
      screenshots,
      domSnapshot: primaryResult.domSnapshot || {
        htmlSnippet: '<!-- No DOM snapshot captured for this execution -->',
        inspectedSelector: primaryResult.failedNodeId ?? 'body',
      },
    };
  }

  const browserStr = serverRun.browsers.length
    ? serverRun.browsers.map((b) => b[0].toUpperCase() + b.slice(1)).join(', ')
    : 'Chromium 124';

  const durationMs = serverRun.durationMs ?? 1420;
  const status =
    serverRun.status === 'passed' ? 'passed' : serverRun.status === 'running' ? 'running' : 'failed';

  return {
    id: serverRun.id,
    suiteId: serverRun.suiteId,
    suiteName: serverRun.suiteName,
    status,
    durationMs,
    totalSteps: primaryResult?.steps.length ?? serverRun.totalTests,
    passedSteps: primaryResult?.steps.filter((s) => s.status === 'passed').length ?? serverRun.passedTests,
    timestamp: new Date(serverRun.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    startedAt: serverRun.startedAt ? new Date(serverRun.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending',
    browser: browserStr,
    triggeredBy: serverRun.triggeredBy,
    traceData,
    error: serverRun.error || primaryResult?.error,
    releaseGateStatus: serverRun.releaseGateStatus,
    releaseGate: serverRun.releaseGate,
    artifacts: allArtifacts,
  };
}

// ==========================================
// GitHub & Jira Integrations Client
// ==========================================

export async function fetchGitHubStatus(): Promise<GitHubStatusResponse | null> {
  try {
    const res = await fetch('/api/integrations/github');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getGitHubInstallUrl(): Promise<string | null> {
  try {
    const res = await fetch('/api/integrations/github/install');
    if (!res.ok) return null;
    const data = await res.json();
    return data.installUrl ?? null;
  } catch {
    return null;
  }
}

export async function disconnectGitHub(): Promise<boolean> {
  try {
    const res = await fetch('/api/integrations/github/disconnect', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchGitHubRepositories(): Promise<GitHubRepository[] | null> {
  try {
    const res = await fetch('/api/integrations/github/repositories');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchGitHubBranches(repoId: string): Promise<GitHubBranch[] | null> {
  try {
    const res = await fetch(`/api/integrations/github/repositories/${encodeURIComponent(repoId)}/branches`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function syncGitHubBranches(repoId: string): Promise<GitHubBranch[] | null> {
  try {
    const res = await fetch(`/api/integrations/github/repositories/${encodeURIComponent(repoId)}/sync`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.branches ?? null;
  } catch {
    return null;
  }
}

export async function fetchJiraStatus(): Promise<JiraStatusResponse | null> {
  try {
    const res = await fetch('/api/integrations/jira');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchJiraIssues(): Promise<JiraIssue[] | null> {
  try {
    const res = await fetch('/api/integrations/jira/issues');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ==========================================
// Test Cases & Suite Association Client
// ==========================================

export async function fetchTestCases(): Promise<TestCase[] | null> {
  try {
    const res = await fetch('/api/test-cases');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function createTestCase(testCase: Partial<TestCase>): Promise<TestCase | null> {
  try {
    const res = await fetch('/api/test-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchSuiteTestCases(suiteId: string): Promise<TestCase[] | null> {
  try {
    const res = await fetch(`/api/suites/${encodeURIComponent(suiteId)}/test-cases`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function setSuiteTestCases(suiteId: string, testCaseIds: string[]): Promise<TestCase[] | null> {
  try {
    const res = await fetch(`/api/suites/${encodeURIComponent(suiteId)}/test-cases`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseIds }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

