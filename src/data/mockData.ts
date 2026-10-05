import {
  TestSuite,
  TestRunResult,
  TestNode,
  ConnectionEdge,
  JiraIssue,
  BranchInfo,
  CopilotMessage,
  TeamMessage,
  TestHistoryRecord,
  PlaywrightTraceData,
  GitHubRepository,
} from '../types';

export const INITIAL_TEST_NODES: TestNode[] = [
  {
    id: 'node-auth-1',
    type: 'navigate',
    title: 'Navigate to Portal',
    description: 'Load authentication portal and wait for clean DOM ready',
    position: { x: 60, y: 140 },
    data: {
      url: 'https://staging.app.example.com/login',
      timeout: 10000,
      waitUntil: 'networkidle',
    },
    status: 'success',
    confidence: 100,
    source: 'Route definition',
    lastExecution: 'Passed · 320ms',
    jiraIssue: 'AUTH-89',
  },
  {
    id: 'node-auth-2',
    type: 'input',
    title: 'Input Username',
    description: 'Inject automation credential into username field',
    position: { x: 380, y: 140 },
    data: {
      selector: 'input#auth-email',
      value: 'qa.lead@playsight.io',
      clearFirst: true,
      maskInput: false,
      timeout: 5000,
    },
    status: 'success',
    confidence: 99,
    source: 'DOM inspection',
    lastExecution: 'Passed · 180ms',
    jiraIssue: 'AUTH-89',
  },
  {
    id: 'node-auth-3',
    type: 'input',
    title: 'Input Password',
    description: 'Fill encrypted auth secret',
    position: { x: 700, y: 140 },
    data: {
      selector: 'input#auth-password',
      value: 'Secur3Pass!99',
      clearFirst: true,
      maskInput: true,
      timeout: 5000,
    },
    status: 'success',
    confidence: 99,
    source: 'DOM inspection',
    lastExecution: 'Passed · 210ms',
    jiraIssue: 'AUTH-89',
  },
  {
    id: 'node-auth-4',
    type: 'click',
    title: 'Click Sign In',
    description: 'Dispatch mouse pointer click event to submit button',
    position: { x: 1020, y: 140 },
    data: {
      selector: 'button#login-submit',
      clickType: 'single',
      waitForSelector: true,
      timeout: 8000,
    },
    status: 'success',
    confidence: 96,
    source: 'Auto-healed',
    lastExecution: 'Passed · 640ms',
    jiraIssue: 'AUTH-89',
  },
  {
    id: 'node-auth-5',
    type: 'assert',
    title: 'Assert Dashboard Header',
    description: 'Verify authenticated redirect header element is visible',
    position: { x: 1340, y: 140 },
    data: {
      selector: 'h1.dashboard-heading',
      assertionType: 'is_visible',
      expectedValue: 'Welcome back, Prakash',
      failureMessage: 'Expected dashboard welcome header was not visible after login',
      timeout: 10000,
    },
    status: 'success',
    confidence: 98,
    source: 'DOM inspection',
    lastExecution: 'Passed · 490ms',
    jiraIssue: 'AUTH-89',
  },
];

export const INITIAL_EDGES: ConnectionEdge[] = [
  { id: 'edge-auth-1-2', sourceId: 'node-auth-1', targetId: 'node-auth-2' },
  { id: 'edge-auth-2-3', sourceId: 'node-auth-2', targetId: 'node-auth-3' },
  { id: 'edge-auth-3-4', sourceId: 'node-auth-3', targetId: 'node-auth-4' },
  { id: 'edge-auth-4-5', sourceId: 'node-auth-4', targetId: 'node-auth-5' },
];

export const CHECKOUT_TEST_NODES: TestNode[] = [
  {
    id: 'node-chk-1',
    type: 'navigate',
    title: 'Navigate to Checkout',
    description: 'Open checkout view on staging environment',
    position: { x: 80, y: 140 },
    data: {
      url: '/checkout',
      timeout: 8000,
      waitUntil: 'networkidle',
    },
    status: 'success',
    confidence: 100,
    source: 'Route definition',
    lastExecution: 'Passed · 420ms',
    jiraIssue: 'CHK-184',
  },
  {
    id: 'node-chk-2',
    type: 'click',
    title: 'Click Submit Payment',
    description: 'Trigger primary order placement button',
    position: { x: 420, y: 140 },
    data: {
      selector: '[data-testid="checkout-submit"]',
      clickType: 'single',
      waitForSelector: true,
      timeout: 6000,
    },
    status: 'failed',
    errorMessage: 'Element [data-testid="checkout-submit"] not found within 6000ms. Mutation observed in PR #482: renamed to data-testid="payment-submit".',
    confidence: 72,
    source: 'DOM inspection',
    lastExecution: 'Failed · 1.12s',
    jiraIssue: 'CHK-184',
  },
  {
    id: 'node-chk-3',
    type: 'assert',
    title: 'Assert Payment Success',
    description: 'Verify transaction state confirms successfully',
    position: { x: 760, y: 140 },
    data: {
      selector: 'div.confirmation-banner',
      assertionType: 'expression',
      expectedValue: 'payment.status === "success"',
      failureMessage: 'Expected payment status success was not received in response',
      timeout: 8000,
    },
    status: 'idle',
    confidence: 95,
    source: 'Assertion rule',
    lastExecution: 'Ready',
    jiraIssue: 'CHK-184',
  },
];

export const CHECKOUT_EDGES: ConnectionEdge[] = [
  { id: 'edge-chk-1-2', sourceId: 'node-chk-1', targetId: 'node-chk-2' },
  { id: 'edge-chk-2-3', sourceId: 'node-chk-2', targetId: 'node-chk-3' },
];

export const SEARCH_TEST_NODES: TestNode[] = [
  {
    id: 'node-srch-1',
    type: 'navigate',
    title: 'Navigate to Search',
    description: 'Open enterprise catalog search surface',
    position: { x: 80, y: 140 },
    data: {
      url: '/catalog/search',
      timeout: 6000,
      waitUntil: 'load',
    },
    status: 'success',
    confidence: 100,
    source: 'Route definition',
    lastExecution: 'Passed · 310ms',
    jiraIssue: 'SRCH-42',
  },
  {
    id: 'node-srch-2',
    type: 'input',
    title: 'Input Query: Kubernetes',
    description: 'Type search keyword into debounced input field',
    position: { x: 400, y: 140 },
    data: {
      selector: 'input#search-input',
      value: 'Kubernetes cluster deployment',
      clearFirst: true,
      maskInput: false,
      timeout: 5000,
    },
    status: 'success',
    confidence: 99,
    source: 'DOM inspection',
    lastExecution: 'Passed · 240ms',
    jiraIssue: 'SRCH-42',
  },
  {
    id: 'node-srch-3',
    type: 'click',
    title: 'Apply Filter: Production',
    description: 'Toggle facet tag for cluster environment filter',
    position: { x: 720, y: 140 },
    data: {
      selector: 'button[data-facet="env-prod"]',
      clickType: 'single',
      waitForSelector: true,
      timeout: 5000,
    },
    status: 'success',
    confidence: 97,
    source: 'DOM inspection',
    lastExecution: 'Passed · 190ms',
    jiraIssue: 'SRCH-42',
  },
  {
    id: 'node-srch-4',
    type: 'assert',
    title: 'Assert Filtered Count',
    description: 'Verify result counter equals expected non-zero items',
    position: { x: 1040, y: 140 },
    data: {
      selector: 'span#results-count',
      assertionType: 'text_contains',
      expectedValue: '14 items found',
      failureMessage: 'Result count did not match expected query results',
      timeout: 5000,
    },
    status: 'success',
    confidence: 99,
    source: 'Assertion rule',
    lastExecution: 'Passed · 380ms',
    jiraIssue: 'SRCH-42',
  },
];

export const SEARCH_EDGES: ConnectionEdge[] = [
  { id: 'edge-srch-1-2', sourceId: 'node-srch-1', targetId: 'node-srch-2' },
  { id: 'edge-srch-2-3', sourceId: 'node-srch-2', targetId: 'node-srch-3' },
  { id: 'edge-srch-3-4', sourceId: 'node-srch-3', targetId: 'node-srch-4' },
];

export const MOCK_TEST_SUITES: TestSuite[] = [
  {
    id: 'suite-cart-checkout',
    repositoryId: 'gh-repo-aato-playsight-core',
    repositoryFullName: 'aato-test/playsight-core',
    branchName: 'main',
    name: 'Checkout & Payment Gateway',
    description: 'End-to-end checkout pipeline validating cart items, credit card input, and 3D-Secure Stripe response.',
    targetBrowser: 'chromium',
    baseUrl: 'https://staging.app.example.com',
    environment: 'staging',
    nodes: CHECKOUT_TEST_NODES,
    edges: CHECKOUT_EDGES,
    status: 'needs_attention',
    averageDuration: '1.84s average',
    lastRunTime: '8m ago',
    jiraIssue: 'CHK-184',
    updatedAt: '8m ago',
  },
  {
    id: 'suite-auth-login',
    repositoryId: 'gh-repo-aato-playsight-core',
    repositoryFullName: 'aato-test/playsight-core',
    branchName: 'main',
    name: 'Authentication E2E Flow',
    description: 'Validates credential submission, session cookie creation, and dashboard arrival.',
    targetBrowser: 'chromium',
    baseUrl: 'https://staging.app.example.com',
    environment: 'staging',
    nodes: INITIAL_TEST_NODES,
    edges: INITIAL_EDGES,
    status: 'passing',
    averageDuration: '1.84s average',
    lastRunTime: '2m ago',
    jiraIssue: 'AUTH-89',
    updatedAt: '2m ago',
  },
  {
    id: 'suite-search-filtering',
    repositoryId: 'gh-repo-aato-playsight-core',
    repositoryFullName: 'aato-test/playsight-core',
    branchName: 'main',
    name: 'Search & Facet Filter Test',
    description: 'Ensures debounced query dispatch, facet aggregation, and catalog search results.',
    targetBrowser: 'firefox',
    baseUrl: 'https://staging.app.example.com',
    environment: 'staging',
    nodes: SEARCH_TEST_NODES,
    edges: SEARCH_EDGES,
    status: 'passing',
    averageDuration: '1.12s average',
    lastRunTime: '18m ago',
    jiraIssue: 'SRCH-42',
    updatedAt: '18m ago',
  },
];

export const SAMPLE_PLAYWRIGHT_TRACE: PlaywrightTraceData = {
  durationMs: 1840,
  actions: [
    {
      stepNumber: 1,
      title: 'Navigate to Checkout',
      action: 'page.goto("/checkout")',
      apiCall: 'await page.goto("https://staging.app.example.com/checkout", { waitUntil: "networkidle" })',
      durationMs: 420,
      status: 'passed',
      timestamp: '00:00.420',
    },
    {
      stepNumber: 2,
      title: 'Wait for Submit Element',
      action: 'page.waitForSelector("[data-testid=\"checkout-submit\"]")',
      apiCall: 'await page.waitForSelector("[data-testid=\\"checkout-submit\\"]", { timeout: 6000 })',
      durationMs: 1120,
      status: 'failed',
      timestamp: '00:01.540',
    },
    {
      stepNumber: 3,
      title: 'Assert Payment Success',
      action: 'expect(payment.status).toBe("success")',
      apiCall: 'await expect(page.locator("div.confirmation-banner")).toContainText("payment.status === \\"success\\"")',
      durationMs: 0,
      status: 'failed',
      timestamp: '00:01.540',
    },
  ],
  consoleLogs: [
    { timestamp: '00:00.120', level: 'info', message: '[browser] [info] Navigation started: https://staging.app.example.com/checkout' },
    { timestamp: '00:00.380', level: 'info', message: '[browser] [info] DOMContentLoaded in 380ms' },
    { timestamp: '00:00.420', level: 'debug', message: '[network] GET /api/v1/checkout/cart 200 OK (84ms)' },
    { timestamp: '00:00.610', level: 'info', message: '[browser] [info] Mounted PaymentMethodContainer component' },
    { timestamp: '00:01.540', level: 'error', message: '[playwright] TimeoutError: page.waitForSelector: Timeout 6000ms exceeded waiting for locator(\'[data-testid="checkout-submit"]\')' },
    { timestamp: '00:01.542', level: 'warn', message: '[diagnostics] Matched similar node: button[data-testid="payment-submit"] (confidence: 97.2%)' },
  ],
  networkRequests: [
    { method: 'GET', url: 'https://staging.app.example.com/checkout', status: 200, type: 'document', durationMs: 142, size: '24.2 KB' },
    { method: 'GET', url: '/static/js/bundle.main.js', status: 200, type: 'script', durationMs: 82, size: '148.5 KB' },
    { method: 'GET', url: '/api/v1/checkout/cart', status: 200, type: 'fetch', durationMs: 64, size: '1.8 KB' },
    { method: 'POST', url: '/api/v1/telemetry/event', status: 204, type: 'xhr', durationMs: 28, size: '0.4 KB' },
  ],
  screenshots: [
    {
      action: 'page.goto',
      label: 'Initial DOM render',
      timestamp: '00:00.420',
      previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" fill="%230f172a"><rect width="640" height="360"/><text x="40" y="80" fill="%2394a3b8" font-family="monospace" font-size="16">PlaySight Staging · /checkout</text><rect x="40" y="120" width="360" height="40" fill="%231e293b" rx="4"/><rect x="40" y="180" width="240" height="36" fill="%2314b8a6" rx="4"/><text x="60" y="204" fill="%23020617" font-family="sans-serif" font-size="13" font-weight="bold">Pay with Card</text></svg>',
    },
    {
      action: 'page.waitForSelector (failed)',
      label: 'Failure state capture',
      timestamp: '00:01.540',
      previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" fill="%230f172a"><rect width="640" height="360"/><rect x="36" y="36" width="568" height="288" fill="none" stroke="%23ef4444" stroke-width="2"/><text x="60" y="90" fill="%23f87171" font-family="monospace" font-size="16">[ERROR] Target selector not found</text><text x="60" y="130" fill="%2394a3b8" font-family="monospace" font-size="13">Expected: [data-testid="checkout-submit"]</text><text x="60" y="160" fill="%2334d399" font-family="monospace" font-size="13">Mutated: button[data-testid="payment-submit"]</text></svg>',
    },
  ],
  domSnapshot: {
    htmlSnippet: `<form id="payment-form" class="checkout-grid">\n  <div class="form-group">\n    <label for="card-element">Card Details</label>\n    <input id="card-element" class="form-control" autocomplete="cc-number" />\n  </div>\n  <!-- DOM Mutation occurred in PR #482 -->\n  <button type="submit" id="btn-submit" data-testid="payment-submit" class="btn-primary">\n    Complete Order ($84.00)\n  </button>\n</form>`,
    inspectedSelector: 'button[data-testid="payment-submit"]',
  },
};

export const MOCK_TEST_RUNS: TestRunResult[] = [
  {
    id: 'run-9402',
    suiteId: 'suite-auth-login',
    suiteName: 'Authentication E2E Flow',
    status: 'passed',
    durationMs: 1840,
    totalSteps: 5,
    passedSteps: 5,
    timestamp: '2m ago',
    startedAt: '09:39 AM',
    browser: 'Chromium 124',
    triggeredBy: 'CI (feature/checkout-fix)',
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'run-9401',
    suiteId: 'suite-cart-checkout',
    suiteName: 'Checkout & Payment Gateway',
    status: 'failed',
    durationMs: 1840,
    totalSteps: 3,
    passedSteps: 1,
    timestamp: '8m ago',
    startedAt: '09:33 AM',
    browser: 'Chromium 124',
    triggeredBy: 'PlaySight UI (Prakash S.)',
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'run-9400',
    suiteId: 'suite-search-filtering',
    suiteName: 'Search & Facet Filter Test',
    status: 'passed',
    durationMs: 1120,
    totalSteps: 4,
    passedSteps: 4,
    timestamp: '18m ago',
    startedAt: '09:23 AM',
    browser: 'Firefox 125',
    triggeredBy: 'Scheduled (Cron)',
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'run-9399',
    suiteId: 'suite-auth-login',
    suiteName: 'Authentication E2E Flow',
    status: 'passed',
    durationMs: 1720,
    totalSteps: 5,
    passedSteps: 5,
    timestamp: '1h ago',
    startedAt: '08:40 AM',
    browser: 'Chromium 124',
    triggeredBy: 'GitHub Actions #418',
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'run-9398',
    suiteId: 'suite-cart-checkout',
    suiteName: 'Checkout & Payment Gateway',
    status: 'passed',
    durationMs: 1910,
    totalSteps: 3,
    passedSteps: 3,
    timestamp: '2h ago',
    startedAt: '07:42 AM',
    browser: 'WebKit 17.4',
    triggeredBy: 'Nightly Regression',
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
];

export const MOCK_BRANCHES: BranchInfo[] = [
  {
    name: 'feature/checkout-fix',
    commit: '7e2b10a',
    author: 'prakash.s@playsight.io',
    pipelineStatus: 'deploying',
    ciService: 'GitHub Actions',
    previewUrl: 'https://staging-checkout-fix.playsight.dev',
    lastUpdated: '12m ago',
  },
  {
    name: 'main',
    commit: '4f9011d',
    author: 'sarah.j@playsight.io',
    pipelineStatus: 'passed',
    ciService: 'GitHub Actions',
    previewUrl: 'https://staging.app.example.com',
    lastUpdated: '3h ago',
  },
  {
    name: 'fix/stripe-3ds-challenge',
    commit: 'c90184b',
    author: 'daniel.j@playsight.io',
    pipelineStatus: 'passed',
    ciService: 'Vercel Preview',
    previewUrl: 'https://staging-stripe-3ds.playsight.dev',
    lastUpdated: '5h ago',
  },
];

export const MOCK_JIRA_ISSUES: JiraIssue[] = [
  {
    id: 'CHK-184',
    key: 'CHK-184',
    title: 'Checkout payment succeeds',
    status: 'inprogress',
    priority: 'highest',
    type: 'story',
    storyPoints: 5,
    assignee: {
      name: 'Prakash S.',
      role: 'Senior QA Engineer',
    },
    labels: ['Checkout', 'Payment-Gateway', 'Regression-Blocker'],
    description: 'Ensure automated end-to-end checkout flow verifies input cards, submission triggers, and asynchronous success notifications without DOM selector degradation.',
    linkedSuiteId: 'suite-cart-checkout',
    linkedSuiteName: 'Checkout & Payment Gateway',
    stepCoverage: 92,
    assertionCoverage: 88,
    testPassRate: 67,
    syncStatus: 'conflict',
    conflictReason: 'Jira issue in progress; target selector mutated in PR #482 to [data-testid="payment-submit"].',
    lastExecution: 'Needs attention · 1.84s',
    lastSyncedAt: '12s ago',
    updatedAt: '12s ago',
  },
  {
    id: 'CHK-192',
    key: 'CHK-192',
    title: 'Stripe SCA 3DS payment challenge fallback',
    status: 'review',
    priority: 'high',
    type: 'story',
    storyPoints: 8,
    assignee: {
      name: 'Sarah J.',
      role: 'SDET Lead',
    },
    labels: ['Security', 'Payments', '3DS'],
    description: 'Intercept and validate 3D-Secure iframe popups when executing card payments under European banking regulations.',
    linkedSuiteId: 'suite-cart-checkout',
    linkedSuiteName: 'Checkout & Payment Gateway',
    stepCoverage: 85,
    assertionCoverage: 82,
    testPassRate: 100,
    syncStatus: 'synced',
    lastExecution: 'Passed · 2.10s',
    lastSyncedAt: '3m ago',
    updatedAt: '3m ago',
  },
  {
    id: 'AUTH-89',
    key: 'AUTH-89',
    title: 'Three-tier auth handshake & session cookie refresh',
    status: 'done',
    priority: 'highest',
    type: 'story',
    storyPoints: 3,
    assignee: {
      name: 'Daniel J.',
      role: 'Automation Engineer',
    },
    labels: ['Auth', 'Security', 'Session'],
    description: 'Validate credential input fields, SAML federation redirection, and dashboard greeting verification.',
    linkedSuiteId: 'suite-auth-login',
    linkedSuiteName: 'Authentication E2E Flow',
    stepCoverage: 96,
    assertionCoverage: 100,
    testPassRate: 100,
    syncStatus: 'synced',
    lastExecution: 'Passed · 1.84s',
    lastSyncedAt: '2m ago',
    updatedAt: '2m ago',
  },
  {
    id: 'SRCH-42',
    key: 'SRCH-42',
    title: 'Debounced catalog facet filtering with Elasticsearch',
    status: 'done',
    priority: 'medium',
    type: 'task',
    storyPoints: 2,
    assignee: {
      name: 'Mike T.',
      role: 'Platform Lead',
    },
    labels: ['Search', 'Performance', 'Elasticsearch'],
    description: 'Assert that 150ms debounce latency accurately retrieves faceted aggregations without thrashing browser workers.',
    linkedSuiteId: 'suite-search-filtering',
    linkedSuiteName: 'Search & Facet Filter Test',
    stepCoverage: 100,
    assertionCoverage: 100,
    testPassRate: 100,
    syncStatus: 'synced',
    lastExecution: 'Passed · 1.12s',
    lastSyncedAt: '18m ago',
    updatedAt: '18m ago',
  },
  {
    id: 'CHK-205',
    key: 'CHK-205',
    title: 'Guest checkout currency conversion rounding precision',
    status: 'todo',
    priority: 'low',
    type: 'bug',
    storyPoints: 2,
    assignee: {
      name: 'Prakash S.',
      role: 'Senior QA Engineer',
    },
    labels: ['Checkout', 'Currency', 'i18n'],
    description: 'Inspect subcent rounding assertions when switching currencies during pre-payment summary calculations.',
    linkedSuiteId: 'suite-cart-checkout',
    linkedSuiteName: 'Checkout & Payment Gateway',
    stepCoverage: 64,
    assertionCoverage: 50,
    testPassRate: 80,
    syncStatus: 'pending',
    lastExecution: 'Queued',
    lastSyncedAt: '1h ago',
    updatedAt: '1h ago',
  },
];

export const INITIAL_COPILOT_MESSAGES: CopilotMessage[] = [
  {
    id: 'copilot-init-1',
    sender: 'ai',
    timestamp: '09:32 AM',
    text: 'PlaySight Diagnostics Engine active on branch `feature/checkout-fix`. Telemetry and DOM mutators are synced with Playwright Runner.',
  },
  {
    id: 'copilot-init-2',
    sender: 'ai',
    timestamp: '09:33 AM',
    text: '⚠️ **Selector instability detected** in sequence `Checkout & Payment Gateway` (Node `node-chk-2`).\n\nThe previous selector failed during Playwright execution due to a commit diff in PR #482.',
    diagnostic: {
      issueType: 'selector_instability',
      targetSelector: '[data-testid="checkout-submit"]',
      confidence: 72,
      reason: 'DOM structure changed between runs.',
      oldSelector: '[data-testid="checkout-submit"]',
      newSelector: '[data-testid="payment-submit"]',
      diff: {
        removed: 'button[data-testid="checkout-submit"]',
        added: 'button[data-testid="payment-submit"]',
      },
      recommendation: 'Update selector to data-testid="payment-submit"',
      affectedStepId: 'node-chk-2',
      affectedSuiteId: 'suite-cart-checkout',
      linkedJiraKey: 'CHK-184',
    },
    healProposal: {
      targetNodeId: 'node-chk-2',
      oldSelector: '[data-testid="checkout-submit"]',
      newSelector: '[data-testid="payment-submit"]',
      confidence: 97,
      explanation: 'Replaced outdated test ID with production button attribute data-testid="payment-submit" (97% confidence from DOM tree match).',
    },
    suggestedActions: [
      {
        id: 'action-heal-1',
        label: 'Auto-Heal Step',
        actionType: 'heal_node',
        payload: { nodeId: 'node-chk-2', newSelector: '[data-testid="payment-submit"]' },
      },
      {
        id: 'action-diff-1',
        label: 'Review DOM Diff',
        actionType: 'review_diff',
      },
    ],
  },
];

export const MOCK_TEST_HISTORY_RECORDS: TestHistoryRecord[] = [
  {
    id: 'hist-1',
    status: 'passed',
    testName: 'Authentication E2E Flow',
    trigger: 'CI (feature/checkout-fix)',
    browser: 'Chromium 124',
    durationM: 0.7,
    reportId: 'rep-auth-0939',
    timestamp: '2m ago',
    stepsCount: 5,
    consoleLogs: [
      '[09:39:12] [OK] Navigated to https://staging.app.example.com/login in 320ms',
      '[09:39:13] [OK] Filled credentials input#auth-email and input#auth-password',
      '[09:39:14] [OK] Clicked button#login-submit with 0 retries',
      '[09:39:14] [OK] Asserted h1.dashboard-heading matches "Welcome back, Prakash"',
    ],
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'hist-2',
    status: 'failed',
    testName: 'Checkout & Payment Gateway',
    trigger: 'PlaySight UI · feature/checkout-fix',
    browser: 'Chromium 124',
    durationM: 1.84 / 60,
    reportId: 'rep-chk-0933',
    timestamp: '8m ago',
    stepsCount: 3,
    errorMessage: 'Step 02 failed: Element [data-testid="checkout-submit"] not found within 6000ms',
    consoleLogs: [
      '[09:33:04] [OK] Navigated to /checkout',
      '[09:33:05] [FAIL] locator.click: Timeout 6000ms exceeded waiting for [data-testid="checkout-submit"]',
      '[09:33:05] [DIAGNOSTIC] Detected replacement: button[data-testid="payment-submit"]',
    ],
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'hist-3',
    status: 'passed',
    testName: 'Search & Facet Filter Test',
    trigger: 'Scheduled (Cron)',
    browser: 'Firefox 125',
    durationM: 1.12 / 60,
    reportId: 'rep-srch-0923',
    timestamp: '18m ago',
    stepsCount: 4,
    consoleLogs: [
      '[09:23:01] [OK] Navigated to /catalog/search',
      '[09:23:01] [OK] Dispatched keystrokes "Kubernetes cluster deployment"',
      '[09:23:02] [OK] Clicked button[data-facet="env-prod"]',
      '[09:23:02] [OK] Asserted span#results-count contains "14 items found"',
    ],
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'hist-4',
    status: 'passed',
    testName: 'Authentication E2E Flow',
    trigger: 'GitHub Actions #418',
    browser: 'Chromium 124',
    durationM: 1.72 / 60,
    reportId: 'rep-auth-0840',
    timestamp: '1h ago',
    stepsCount: 5,
    consoleLogs: ['[OK] Pre-merge regression passed on master branch'],
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
  {
    id: 'hist-5',
    status: 'passed',
    testName: 'Checkout & Payment Gateway',
    trigger: 'Nightly Regression',
    browser: 'WebKit 17.4',
    durationM: 1.91 / 60,
    reportId: 'rep-chk-0742',
    timestamp: '2h ago',
    stepsCount: 3,
    consoleLogs: ['[OK] WebKit rendering pass verified on macOS Sonoma container'],
    traceData: SAMPLE_PLAYWRIGHT_TRACE,
  },
];

export const MOCK_TEAM_MESSAGES: TeamMessage[] = [
  {
    id: 'tm-1',
    sender: 'Sarah J.',
    handle: 'sarah.j',
    avatar: '',
    time: '09:24 AM',
    content: 'Reviewing PR #482 payment gateway selector updates.',
  },
  {
    id: 'tm-2',
    sender: 'Daniel J.',
    handle: 'daniel.j',
    avatar: '',
    time: '09:30 AM',
    content: 'Auth flow verified across Chromium and WebKit containers.',
  },
  {
    id: 'tm-3',
    sender: 'Mike T.',
    handle: 'mike.t',
    avatar: '',
    time: '09:35 AM',
    content: 'Elasticsearch facet filter debouncing latency stable at 1.12s.',
  },
];

export function orderNodes(nodes: TestNode[], edges: ConnectionEdge[]): TestNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();

  nodes.forEach((n) => {
    outgoing.set(n.id, []);
    incoming.set(n.id, 0);
  });

  edges.forEach((e) => {
    outgoing.get(e.sourceId)?.push(e.targetId);
    incoming.set(e.targetId, (incoming.get(e.targetId) || 0) + 1);
  });

  const roots = nodes
    .filter((n) => (incoming.get(n.id) || 0) === 0)
    .sort((a, b) => a.position.x - b.position.x);
  const ordered: TestNode[] = [];
  const visited = new Set<string>();

  const traverse = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodeMap.get(id);
    if (node) ordered.push(node);
    const children = (outgoing.get(id) || []).sort(
      (a, b) => (nodeMap.get(a)?.position.x || 0) - (nodeMap.get(b)?.position.x || 0)
    );
    children.forEach(traverse);
  };

  roots.forEach((root) => traverse(root.id));
  nodes
    .filter((node) => !visited.has(node.id))
    .sort((a, b) => a.position.x - b.position.x)
    .forEach((node) => ordered.push(node));

  return ordered;
}

export function generateExecutorJson(
  nodes: TestNode[],
  edges: ConnectionEdge[],
  suiteName = 'Test Suite',
  browser: 'chromium' | 'firefox' | 'webkit' = 'chromium'
) {
  const orderedNodes = orderNodes(nodes, edges);

  const steps = orderedNodes.map((node, index) => {
    let action = node.type;
    let parameters: Record<string, any> = {};

    if (node.type === 'navigate') {
      const d = node.data as any;
      parameters = {
        url: d.url || 'https://example.com',
        wait_until: d.waitUntil || 'networkidle',
        timeout_ms: d.timeout || 8000,
      };
    } else if (node.type === 'click') {
      const d = node.data as any;
      parameters = {
        selector: d.selector || 'button',
        click_type: d.clickType || 'single',
        wait_for_selector: d.waitForSelector ?? true,
        timeout_ms: d.timeout || 6000,
      };
    } else if (node.type === 'input') {
      const d = node.data as any;
      parameters = {
        selector: d.selector || 'input',
        value: d.maskInput ? '$ENV_SECRET_VALUE' : d.value || '',
        clear_first: d.clearFirst ?? true,
        timeout_ms: d.timeout || 5000,
      };
    } else if (node.type === 'assert') {
      const d = node.data as any;
      parameters = {
        selector: d.selector || 'body',
        assertion_type: d.assertionType || 'is_visible',
        expected_value: d.expectedValue || '',
        timeout_ms: d.timeout || 5000,
      };
    }

    return {
      step_index: index + 1,
      id: node.id,
      title: node.title,
      action,
      confidence: node.confidence ?? 95,
      jira_key: node.jiraIssue ?? 'CHK-184',
      parameters,
    };
  });

  return {
    schema_version: '2.4.0',
    suite_metadata: {
      name: suiteName,
      target_browser: browser,
      generated_by: 'PlaySight Core v2.4 (Prakash S.)',
      timestamp: new Date().toISOString(),
      active_branch: 'feature/checkout-fix',
    },
    execution_pipeline: {
      headless: true,
      viewport: { width: 1440, height: 900 },
      video_recording: 'retain-on-failure',
      trace_recording: 'on',
    },
    steps,
  };
}

export const ACCOUNT_REPOSITORIES: GitHubRepository[] = [
  {
    id: 'gh-repo-aato-playsight-core',
    githubRepoId: 987654321,
    name: 'playsight-core',
    fullName: 'aato-test/playsight-core',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/playsight-core',
    description: 'Collaborative Quality Workspace for End-to-End Regression Automation',
    branchesCount: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gh-repo-aato-playwright-automation',
    githubRepoId: 871234567,
    name: 'playwright-automation',
    fullName: 'aato-test/playwright-automation',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/playwright-automation',
    description: 'Playwright E2E automation test suite',
    branchesCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gh-repo-aato-ticket-priority',
    githubRepoId: 765432198,
    name: 'Customer-Support-Ticket-Priority-Prediction',
    fullName: 'aato-test/Customer-Support-Ticket-Priority-Prediction',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/Customer-Support-Ticket-Priority-Prediction',
    description: 'Machine Learning prioritization workflow for customer support tickets',
    branchesCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gh-repo-aato-playsight',
    githubRepoId: 654321987,
    name: 'playsight',
    fullName: 'aato-test/playsight',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/playsight',
    description: 'PlaySight web automation testing application',
    branchesCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gh-repo-aato-pro',
    githubRepoId: 543210987,
    name: 'pro',
    fullName: 'aato-test/pro',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/pro',
    description: 'Production services & test configurations',
    branchesCount: 1,
    updatedAt: new Date().toISOString(),
  },
];

