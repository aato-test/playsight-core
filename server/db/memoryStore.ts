import { randomUUID } from 'node:crypto';
import type {
  TeamRow,
  GitHubInstallationRow,
  GitHubRepositoryRow,
  GitHubBranchRow,
  WebhookDeliveryRow,
  TestCaseRow,
  SuiteTestCaseRow,
  SuiteRow,
  RunRow,
  ResultRow,
  ArtifactRow,
  AuditRow,
  JiraConnectionRow,
  JiraProjectRow,
  JiraBoardRow,
  JiraIssueRow,
} from './schema';
import type { SuiteInput, SuiteDefinition, ExecutableNode } from '../../shared/suite';
import { evaluateReleaseGate } from '../services/releaseGate';

// In-memory collections
const teamsMap = new Map<string, TeamRow>();
const installationsMap = new Map<string, GitHubInstallationRow>();
const repositoriesMap = new Map<string, GitHubRepositoryRow>();
const branchesMap = new Map<string, GitHubBranchRow>();
const deliveriesMap = new Map<string, WebhookDeliveryRow>();
const testCasesMap = new Map<string, TestCaseRow>();
const suiteTestCasesMap = new Map<string, SuiteTestCaseRow>();
const suitesMap = new Map<string, SuiteRow>();
const runsMap = new Map<string, RunRow>();
const resultsMap = new Map<string, ResultRow>();
const artifactsMap = new Map<string, ArtifactRow>();
const auditMap = new Map<string, AuditRow>();
const jiraConnectionsMap = new Map<string, JiraConnectionRow>();
const jiraProjectsMap = new Map<string, JiraProjectRow>();
const jiraBoardsMap = new Map<string, JiraBoardRow>();
const jiraIssuesMap = new Map<string, JiraIssueRow>();

// Seed Default Team
const DEFAULT_TEAM: TeamRow = {
  id: 'team-default',
  name: 'PlaySight Core Team',
  slug: 'playsight-team',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
};
teamsMap.set(DEFAULT_TEAM.id, DEFAULT_TEAM);

// Seed GitHub App Installation (aato-test user account)
const DEFAULT_INSTALLATION: GitHubInstallationRow = {
  id: 'gh-inst-542109',
  teamId: DEFAULT_TEAM.id,
  installationId: 54210987,
  accountLogin: 'aato-test',
  accountType: 'User',
  avatarUrl: 'https://avatars.githubusercontent.com/u/19876543?v=4',
  targetId: 19876543,
  permissions: {
    contents: 'read',
    metadata: 'read',
    pull_requests: 'read',
    statuses: 'write',
  },
  events: ['push', 'pull_request', 'installation'],
  status: 'active',
  installedAt: new Date('2026-09-15T10:00:00Z'),
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
};
installationsMap.set(DEFAULT_INSTALLATION.id, DEFAULT_INSTALLATION);

// Seed Discovered GitHub Repositories
const ACCOUNT_REPOS: GitHubRepositoryRow[] = [
  {
    id: 'gh-repo-aato-playsight-core',
    installationId: DEFAULT_INSTALLATION.id,
    teamId: DEFAULT_TEAM.id,
    githubRepoId: 987654321,
    name: 'playsight-core',
    fullName: 'aato-test/playsight-core',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/playsight-core',
    description: 'Collaborative Quality Workspace for End-to-End Regression Automation',
    createdAt: new Date('2026-09-15T10:05:00Z'),
    updatedAt: new Date('2026-10-05T09:00:00Z'),
  },
  {
    id: 'gh-repo-aato-playwright-automation',
    installationId: DEFAULT_INSTALLATION.id,
    teamId: DEFAULT_TEAM.id,
    githubRepoId: 871234567,
    name: 'playwright-automation',
    fullName: 'aato-test/playwright-automation',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/playwright-automation',
    description: 'Playwright E2E automation test suite',
    createdAt: new Date('2026-09-16T11:00:00Z'),
    updatedAt: new Date('2026-10-05T09:00:00Z'),
  },
  {
    id: 'gh-repo-aato-ticket-priority',
    installationId: DEFAULT_INSTALLATION.id,
    teamId: DEFAULT_TEAM.id,
    githubRepoId: 765432198,
    name: 'Customer-Support-Ticket-Priority-Prediction',
    fullName: 'aato-test/Customer-Support-Ticket-Priority-Prediction',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/Customer-Support-Ticket-Priority-Prediction',
    description: 'Machine Learning prioritization workflow for customer support tickets',
    createdAt: new Date('2026-09-17T12:00:00Z'),
    updatedAt: new Date('2026-10-05T09:00:00Z'),
  },
  {
    id: 'gh-repo-aato-playsight',
    installationId: DEFAULT_INSTALLATION.id,
    teamId: DEFAULT_TEAM.id,
    githubRepoId: 654321987,
    name: 'playsight',
    fullName: 'aato-test/playsight',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/playsight',
    description: 'PlaySight web automation testing application',
    createdAt: new Date('2026-09-18T14:00:00Z'),
    updatedAt: new Date('2026-10-05T09:00:00Z'),
  },
  {
    id: 'gh-repo-aato-pro',
    installationId: DEFAULT_INSTALLATION.id,
    teamId: DEFAULT_TEAM.id,
    githubRepoId: 543210987,
    name: 'pro',
    fullName: 'aato-test/pro',
    ownerLogin: 'aato-test',
    isPrivate: false,
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/aato-test/pro',
    description: 'Production services & test configurations',
    createdAt: new Date('2026-09-19T15:00:00Z'),
    updatedAt: new Date('2026-10-05T09:00:00Z'),
  },
];

for (const repo of ACCOUNT_REPOS) {
  repositoriesMap.set(repo.id, repo);
}

const DEFAULT_REPO = ACCOUNT_REPOS[0];

// Seed Discovered GitHub Branches (Real branches only: main)
const SEED_BRANCHES: GitHubBranchRow[] = ACCOUNT_REPOS.map((repo) => ({
  id: `${repo.id}-main`,
  repositoryId: repo.id,
  name: 'main',
  commitSha: '1c54b15',
  commitMessage: `chore: update repository ${repo.name}`,
  isProtected: true,
  lastCommitAt: new Date('2026-10-05T09:25:00Z'),
  updatedAt: new Date('2026-10-05T09:25:00Z'),
}));
SEED_BRANCHES.forEach((b) => branchesMap.set(b.id, b));

// Seed Individual Test Cases
const SEED_TEST_CASES: TestCaseRow[] = [
  {
    id: 'tc-nav-portal',
    teamId: DEFAULT_TEAM.id,
    title: 'Launch Checkout Portal',
    description: 'Opens /checkout and confirms domcontentloaded state',
    stepType: 'navigate',
    definition: {
      id: 'step-1',
      type: 'navigate',
      title: 'Launch Checkout Portal',
      position: { x: 100, y: 180 },
      data: { url: '/checkout', timeout: 5000, waitUntil: 'load' },
    },
    jiraIssueKey: 'CHK-184',
    createdAt: new Date('2026-09-20T00:00:00Z'),
    updatedAt: new Date('2026-09-20T00:00:00Z'),
  },
  {
    id: 'tc-input-email',
    teamId: DEFAULT_TEAM.id,
    title: 'Enter Customer Email',
    description: 'Fills user email input with validated corporate address',
    stepType: 'input',
    definition: {
      id: 'step-2',
      type: 'input',
      title: 'Enter Customer Email',
      position: { x: 440, y: 180 },
      data: { selector: '#customer-email', value: 'qa-test@internal.net', clearFirst: true, maskInput: false, timeout: 5000 },
    },
    jiraIssueKey: 'CHK-184',
    createdAt: new Date('2026-09-20T00:00:00Z'),
    updatedAt: new Date('2026-09-20T00:00:00Z'),
  },
  {
    id: 'tc-select-shipping',
    teamId: DEFAULT_TEAM.id,
    title: 'Select Express Shipping',
    description: 'Selects the expedited delivery option radio element',
    stepType: 'click',
    definition: {
      id: 'step-3',
      type: 'click',
      title: 'Select Express Shipping',
      position: { x: 780, y: 180 },
      data: { selector: '[data-testid="shipping-express"]', clickType: 'single', waitForSelector: true, timeout: 5000 },
    },
    jiraIssueKey: 'CHK-184',
    createdAt: new Date('2026-09-20T00:00:00Z'),
    updatedAt: new Date('2026-09-20T00:00:00Z'),
  },
  {
    id: 'tc-confirm-payment',
    teamId: DEFAULT_TEAM.id,
    title: 'Confirm Payment Submission',
    description: 'Submits payment form using validated test-id selector',
    stepType: 'click',
    definition: {
      id: 'step-4',
      type: 'click',
      title: 'Confirm Payment Submission',
      position: { x: 1120, y: 180 },
      data: { selector: '[data-testid="payment-submit"]', clickType: 'single', waitForSelector: true, timeout: 6000 },
    },
    jiraIssueKey: 'CHK-184',
    createdAt: new Date('2026-09-20T00:00:00Z'),
    updatedAt: new Date('2026-09-20T00:00:00Z'),
  },
  {
    id: 'tc-assert-order',
    teamId: DEFAULT_TEAM.id,
    title: 'Assert Order Confirmation #',
    description: 'Verifies header displays order confirmed status banner',
    stepType: 'assert',
    definition: {
      id: 'step-5',
      type: 'assert',
      title: 'Assert Order Confirmation #',
      position: { x: 1460, y: 180 },
      data: { selector: '.order-success-title', assertionType: 'text_contains', expectedValue: 'Order Confirmed', failureMessage: 'Order confirmation header was not rendered', timeout: 5000 },
    },
    jiraIssueKey: 'CHK-184',
    createdAt: new Date('2026-09-20T00:00:00Z'),
    updatedAt: new Date('2026-09-20T00:00:00Z'),
  },
];
SEED_TEST_CASES.forEach((tc) => testCasesMap.set(tc.id, tc));

// Initial demo suites
const INITIAL_DEMO_SUITES: (Partial<SuiteInput> & {
  id: string;
  name: string;
  definition: SuiteDefinition;
})[] = [
  {
    id: 'demo-playwright-docs',
    teamId: DEFAULT_TEAM.id,
    repositoryId: DEFAULT_REPO.id,
    branchName: 'main',
    triggerType: 'manual',
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
    teamId: DEFAULT_TEAM.id,
    repositoryId: DEFAULT_REPO.id,
    branchName: 'feature/checkout-fix',
    triggerType: 'push',
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
    teamId: DEFAULT_TEAM.id,
    repositoryId: DEFAULT_REPO.id,
    branchName: 'feature/checkout-fix',
    triggerType: 'push',
    name: 'E2E Checkout Regression Sequence',
    description: 'End-to-end critical checkout flow with payment submission and order confirmation',
    baseUrl: 'https://shop.local.internal',
    browser: 'chromium',
    environment: 'staging',
    jiraIssue: 'CHK-184',
    definition: {
      nodes: [
        SEED_TEST_CASES[0].definition,
        SEED_TEST_CASES[1].definition,
        SEED_TEST_CASES[2].definition,
        SEED_TEST_CASES[3].definition,
        SEED_TEST_CASES[4].definition,
      ],
      edges: [
        { id: 'edge-1', sourceId: 'step-1', targetId: 'step-2' },
        { id: 'edge-2', sourceId: 'step-2', targetId: 'step-3' },
        { id: 'edge-3', sourceId: 'step-3', targetId: 'step-4' },
        { id: 'edge-4', sourceId: 'step-4', targetId: 'step-5' },
      ],
    },
  },
  {
    id: 'pro-suite-login-products',
    teamId: DEFAULT_TEAM.id,
    repositoryId: 'gh-repo-aato-pro',
    branchName: 'main',
    triggerType: 'push',
    name: 'SauceDemo E2E Login & Products Verification',
    description: 'Automated Playwright regression covering Pages/LoginPage.py and Pages/HomePage.py from aato-test/pro.',
    baseUrl: 'https://www.saucedemo.com',
    browser: 'chromium',
    environment: 'production',
    jiraIssue: 'PRO-101',
    definition: {
      nodes: [
        {
          id: 'pro-node-1',
          type: 'navigate',
          title: 'Navigate to SauceDemo Login',
          position: { x: 80, y: 140 },
          data: { url: '/', timeout: 8000, waitUntil: 'domcontentloaded' },
        },
        {
          id: 'pro-node-2',
          type: 'input',
          title: 'Enter Username (#user-name)',
          position: { x: 420, y: 140 },
          data: { selector: '#user-name', value: 'standard_user', clearFirst: true, maskInput: false, timeout: 5000 },
        },
        {
          id: 'pro-node-3',
          type: 'input',
          title: 'Enter Password (#password)',
          position: { x: 760, y: 140 },
          data: { selector: '#password', value: 'secret_sauce', clearFirst: true, maskInput: true, timeout: 5000 },
        },
        {
          id: 'pro-node-4',
          type: 'click',
          title: 'Click Login Button (#login-button)',
          position: { x: 1100, y: 140 },
          data: { selector: '#login-button', clickType: 'single', waitForSelector: true, timeout: 5000 },
        },
        {
          id: 'pro-node-5',
          type: 'assert',
          title: 'Assert Products Title (HomePage.py)',
          position: { x: 1440, y: 140 },
          data: {
            selector: "//*[@id='inventory_filter_container']/div",
            assertionType: 'text_equals',
            expectedValue: 'Products',
            failureMessage: 'Expected Products heading but locator was not found in modern DOM',
            timeout: 6000,
          },
        },
      ],
      edges: [
        { id: 'pro-e1', sourceId: 'pro-node-1', targetId: 'pro-node-2' },
        { id: 'pro-e2', sourceId: 'pro-node-2', targetId: 'pro-node-3' },
        { id: 'pro-e3', sourceId: 'pro-node-3', targetId: 'pro-node-4' },
        { id: 'pro-e4', sourceId: 'pro-node-4', targetId: 'pro-node-5' },
      ],
    },
  },
  {
    id: 'pro-suite-cart-checkout',
    teamId: DEFAULT_TEAM.id,
    repositoryId: 'gh-repo-aato-pro',
    branchName: 'main',
    triggerType: 'push',
    name: 'SauceDemo Cart & Checkout E2E Sequence',
    description: 'Item selection, cart counter and checkout verification covering Pages/CheckoutPage.py and Pages/HeaderPage.py from aato-test/pro.',
    baseUrl: 'https://www.saucedemo.com',
    browser: 'chromium',
    environment: 'production',
    jiraIssue: 'PRO-102',
    definition: {
      nodes: [
        {
          id: 'pro-chk-1',
          type: 'navigate',
          title: 'Navigate to Inventory Catalog',
          position: { x: 80, y: 140 },
          data: { url: '/inventory.html', timeout: 8000, waitUntil: 'domcontentloaded' },
        },
        {
          id: 'pro-chk-2',
          type: 'click',
          title: 'Add Backpack to Cart (.btn_primary)',
          position: { x: 420, y: 140 },
          data: { selector: '.inventory_item:nth-child(1) .btn_primary', clickType: 'single', waitForSelector: true, timeout: 5000 },
        },
        {
          id: 'pro-chk-3',
          type: 'click',
          title: 'Click Cart Badge (.fa-layers-counter)',
          position: { x: 760, y: 140 },
          data: { selector: '.fa-layers-counter', clickType: 'single', waitForSelector: true, timeout: 5000 },
        },
        {
          id: 'pro-chk-4',
          type: 'click',
          title: 'Click Checkout Button (CHECKOUT)',
          position: { x: 1100, y: 140 },
          data: { selector: 'a:has-text("CHECKOUT")', clickType: 'single', waitForSelector: true, timeout: 5000 },
        },
        {
          id: 'pro-chk-5',
          type: 'input',
          title: 'Fill First Name (#first-name)',
          position: { x: 1440, y: 140 },
          data: { selector: '#first-name', value: 'Rafael', clearFirst: true, maskInput: false, timeout: 5000 },
        },
        {
          id: 'pro-chk-6',
          type: 'input',
          title: 'Fill Last Name (#last-name)',
          position: { x: 1780, y: 140 },
          data: { selector: '#last-name', value: 'Elias', clearFirst: true, maskInput: false, timeout: 5000 },
        },
        {
          id: 'pro-chk-7',
          type: 'input',
          title: 'Fill Postal Code (#postal-code)',
          position: { x: 2120, y: 140 },
          data: { selector: '#postal-code', value: '10001', clearFirst: true, maskInput: false, timeout: 5000 },
        },
        {
          id: 'pro-chk-8',
          type: 'click',
          title: 'Click Continue (//input[@value="CONTINUE"])',
          position: { x: 2460, y: 140 },
          data: { selector: '//input[@value="CONTINUE"]', clickType: 'single', waitForSelector: true, timeout: 5000 },
        },
        {
          id: 'pro-chk-9',
          type: 'click',
          title: 'Click Finish (FINISH)',
          position: { x: 2800, y: 140 },
          data: { selector: 'a:has-text("FINISH")', clickType: 'single', waitForSelector: true, timeout: 5000 },
        },
        {
          id: 'pro-chk-10',
          type: 'assert',
          title: 'Assert Complete Header',
          position: { x: 3140, y: 140 },
          data: { selector: '.complete-header', assertionType: 'text_equals', expectedValue: 'THANK YOU FOR YOUR ORDER', failureMessage: '', timeout: 5000 },
        },
      ],
      edges: [
        { id: 'pro-ce1', sourceId: 'pro-chk-1', targetId: 'pro-chk-2' },
        { id: 'pro-ce2', sourceId: 'pro-chk-2', targetId: 'pro-chk-3' },
        { id: 'pro-ce3', sourceId: 'pro-chk-3', targetId: 'pro-chk-4' },
        { id: 'pro-ce4', sourceId: 'pro-chk-4', targetId: 'pro-chk-5' },
        { id: 'pro-ce5', sourceId: 'pro-chk-5', targetId: 'pro-chk-6' },
        { id: 'pro-ce6', sourceId: 'pro-chk-6', targetId: 'pro-chk-7' },
        { id: 'pro-ce7', sourceId: 'pro-chk-7', targetId: 'pro-chk-8' },
        { id: 'pro-ce8', sourceId: 'pro-chk-8', targetId: 'pro-chk-9' },
        { id: 'pro-ce9', sourceId: 'pro-chk-9', targetId: 'pro-chk-10' },
      ],
    },
  },
];

// Seed initial suites
for (const s of INITIAL_DEMO_SUITES) {
  const now = new Date();
  suitesMap.set(s.id, {
    id: s.id,
    teamId: s.teamId ?? DEFAULT_TEAM.id,
    repositoryId: s.repositoryId ?? DEFAULT_REPO.id,
    branchName: s.branchName ?? 'main',
    name: s.name,
    description: s.description ?? '',
    baseUrl: s.baseUrl ?? '',
    browser: s.browser ?? 'chromium',
    environment: s.environment ?? 'staging',
    jiraIssue: s.jiraIssue ?? null,
    triggerType: s.triggerType ?? 'manual',
    triggerConfig: { branches: ['main', 'feature/checkout-fix'] },
    definition: s.definition,
    createdAt: now,
    updatedAt: now,
  });
}

// Associate test cases to suite-checkout-flow
SEED_TEST_CASES.forEach((tc, idx) => {
  const stcId = `stc-checkout-${tc.id}`;
  suiteTestCasesMap.set(stcId, {
    id: stcId,
    suiteId: 'suite-checkout-flow',
    testCaseId: tc.id,
    orderIndex: idx,
    createdAt: new Date(),
  });
});

// Seed the two runs corresponding to artifacts/ directory
const SEED_RUN_1: RunRow = {
  id: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455',
  teamId: DEFAULT_TEAM.id,
  status: 'passed',
  createdAt: new Date(Date.now() - 3600_000 * 4),
  startedAt: new Date(Date.now() - 3600_000 * 4),
  completedAt: new Date(Date.now() - 3600_000 * 4 + 1420),
  repositoryId: DEFAULT_REPO.id,
  repositoryFullName: DEFAULT_REPO.fullName,
  branch: 'main',
  commit: '410c540',
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
  triggerEvent: 'manual',
  pullRequestNumber: null,
  pullRequestUrl: null,
  pullRequestSourceBranch: null,
  pullRequestTargetBranch: null,
  rerunOf: null,
  error: null,
};

const SEED_RESULT_1: ResultRow = {
  id: 'res-43706389-cb6c-4f75-a742-592f801b4dff',
  runId: 'run-18f39e44-a126-45c6-9af8-e22a4cb61455',
  suiteId: 'demo-playwright-docs',
  testCaseId: null,
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
  teamId: DEFAULT_TEAM.id,
  status: 'failed',
  createdAt: new Date(Date.now() - 3600_000 * 2),
  startedAt: new Date(Date.now() - 3600_000 * 2),
  completedAt: new Date(Date.now() - 3600_000 * 2 + 2150),
  repositoryId: DEFAULT_REPO.id,
  repositoryFullName: DEFAULT_REPO.fullName,
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
  triggeredBy: 'GitHub Push (aato-test/playsight-core:feature/checkout-fix)',
  triggerEvent: 'push',
  pullRequestNumber: null,
  pullRequestUrl: null,
  pullRequestSourceBranch: null,
  pullRequestTargetBranch: null,
  rerunOf: null,
  error: 'Element #login-button not found within 3000ms',
};

const SEED_RESULT_2: ResultRow = {
  id: 'res-994bcaf3-8bb2-4caf-9b25-69b1df0c3c58',
  runId: 'run-e358b5b4-67c5-47af-a1e4-8bf9f58edfb3',
  suiteId: 'demo-example-missing-login',
  testCaseId: null,
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

// Seed Jira Connection & Issues - Starts completely empty until connected via UI
const SEED_JIRA_ISSUES: JiraIssueRow[] = [];
SEED_JIRA_ISSUES.forEach((iss) => jiraIssuesMap.set(iss.id, iss));

runsMap.set(SEED_RUN_1.id, SEED_RUN_1);
runsMap.set(SEED_RUN_2.id, SEED_RUN_2);
resultsMap.set(SEED_RESULT_1.id, SEED_RESULT_1);
resultsMap.set(SEED_RESULT_2.id, SEED_RESULT_2);
artifactsMap.set(SEED_ARTIFACT_1.id, SEED_ARTIFACT_1);
artifactsMap.set(SEED_ARTIFACT_2.id, SEED_ARTIFACT_2);
artifactsMap.set(SEED_ARTIFACT_3.id, SEED_ARTIFACT_3);
artifactsMap.set(SEED_ARTIFACT_4.id, SEED_ARTIFACT_4);

export const memoryStore = {
  teams: teamsMap,
  installations: installationsMap,
  repositories: repositoriesMap,
  branches: branchesMap,
  deliveries: deliveriesMap,
  testCases: testCasesMap,
  suiteTestCases: suiteTestCasesMap,
  suites: suitesMap,
  runs: runsMap,
  results: resultsMap,
  artifacts: artifactsMap,
  audit: auditMap,
  jiraConnections: jiraConnectionsMap,
  jiraProjects: jiraProjectsMap,
  jiraBoards: jiraBoardsMap,
  jiraIssues: jiraIssuesMap,
};
