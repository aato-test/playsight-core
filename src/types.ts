export type StepType =
  // Navigation & Browsing
  | 'navigate'
  | 'scroll'
  | 'wait_for'
  | 'screenshot'
  // Interaction
  | 'click'
  | 'input'
  | 'select_dropdown'
  | 'hover'
  | 'press_key'
  // Data Extraction & Web Scraping
  | 'extract_text'
  | 'extract_attribute'
  | 'extract_table'
  | 'extract_list'
  | 'extract_html'
  // Pagination & Loops
  | 'pagination'
  | 'loop_elements'
  // Data Export & Output
  | 'export_json'
  | 'export_csv'
  | 'webhook_push'
  // Validation & Anti-Bot
  | 'assert'
  | 'cookie_banner'
  | 'captcha_detect';

export interface NavigateStepData {
  url: string;
  timeout: number;
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface ScrollStepData {
  direction: 'down' | 'up' | 'to_bottom' | 'to_selector';
  selector?: string;
  distancePx: number;
  smooth: boolean;
  timeout: number;
}

export interface WaitForStepData {
  waitType: 'selector' | 'timeout' | 'networkidle';
  selector?: string;
  durationMs: number;
  timeout: number;
}

export interface ScreenshotStepData {
  captureFullPage: boolean;
  selector?: string;
  fileName: string;
  timeout: number;
}

export interface ClickStepData {
  selector: string;
  clickType: 'single' | 'double' | 'right';
  waitForSelector: boolean;
  timeout: number;
}

export interface InputStepData {
  selector: string;
  value: string;
  clearFirst: boolean;
  maskInput: boolean;
  timeout: number;
}

export interface SelectDropdownStepData {
  selector: string;
  selectValue: string;
  selectBy: 'value' | 'label' | 'index';
  timeout: number;
}

export interface HoverStepData {
  selector: string;
  timeout: number;
}

export interface PressKeyStepData {
  key: string;
  selector?: string;
  timeout: number;
}

export interface ExtractTextStepData {
  selector: string;
  variableName: string;
  extractMultiple: boolean;
  trimWhitespace: boolean;
  timeout: number;
}

export interface ExtractAttributeStepData {
  selector: string;
  attribute: string;
  variableName: string;
  extractMultiple: boolean;
  timeout: number;
}

export interface ExtractTableStepData {
  selector: string;
  variableName: string;
  parseHeaders: boolean;
  timeout: number;
}

export interface ExtractListStepData {
  parentSelector: string;
  itemSelector: string;
  variableName: string;
  timeout: number;
}

export interface ExtractHtmlStepData {
  selector: string;
  htmlType: 'innerHTML' | 'outerHTML';
  variableName: string;
  timeout: number;
}

export interface PaginationStepData {
  nextButtonSelector: string;
  maxPages: number;
  waitAfterClickMs: number;
  timeout: number;
}

export interface LoopElementsStepData {
  itemSelector: string;
  maxItems: number;
  timeout: number;
}

export interface ExportJsonStepData {
  datasetVariable: string;
  fileName: string;
  prettyPrint: boolean;
  timeout: number;
}

export interface ExportCsvStepData {
  datasetVariable: string;
  fileName: string;
  delimiter: string;
  timeout: number;
}

export interface WebhookPushStepData {
  endpointUrl: string;
  method: 'POST' | 'PUT';
  authHeader?: string;
  timeout: number;
}

export interface AssertStepData {
  selector: string;
  assertionType: 'is_visible' | 'text_contains' | 'text_equals' | 'has_value' | 'url_contains' | 'expression';
  expectedValue: string;
  failureMessage: string;
  timeout: number;
}

export interface CookieBannerStepData {
  acceptSelector: string;
  dismissSelector?: string;
  optional: boolean;
  timeout: number;
}

export interface CaptchaDetectStepData {
  alertOnDetect: boolean;
  actionOnDetect: 'wait_for_user' | 'abort';
  timeout: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'local';
  role: string;
  teamId: string;
}

export type StepData =
  | NavigateStepData
  | ScrollStepData
  | WaitForStepData
  | ScreenshotStepData
  | ClickStepData
  | InputStepData
  | SelectDropdownStepData
  | HoverStepData
  | PressKeyStepData
  | ExtractTextStepData
  | ExtractAttributeStepData
  | ExtractTableStepData
  | ExtractListStepData
  | ExtractHtmlStepData
  | PaginationStepData
  | LoopElementsStepData
  | ExportJsonStepData
  | ExportCsvStepData
  | WebhookPushStepData
  | AssertStepData
  | CookieBannerStepData
  | CaptchaDetectStepData;

export interface TestNode {
  id: string;
  type: StepType;
  title: string;
  description?: string;
  position: { x: number; y: number };
  data: StepData;
  status?: 'idle' | 'running' | 'success' | 'failed';
  errorMessage?: string;
  confidence?: number; // e.g. 98%
  source?: string; // e.g. 'DOM inspection'
  lastExecution?: string; // e.g. 'Passed · 1.12s'
  jiraIssue?: string; // e.g. 'CHK-184'
}

export interface ConnectionEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface TestSuite {
  id: string;
  teamId?: string;
  repositoryId?: string;
  branchName?: string;
  name: string;
  description: string;
  targetBrowser: 'chromium' | 'firefox' | 'webkit';
  baseUrl: string;
  environment?: 'local' | 'staging' | 'production';
  triggerType?: 'manual' | 'push' | 'pull_request' | 'scheduled';
  triggerConfig?: {
    branches?: string[];
    paths?: string[];
    cronExpression?: string;
  };
  nodes: TestNode[];
  edges: ConnectionEdge[];
  status?: 'passing' | 'needs_attention' | 'failed';
  averageDuration?: string;
  lastRunTime?: string;
  jiraIssue?: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  teamId: string;
  title: string;
  description: string;
  stepType: StepType;
  definition: TestNode;
  jiraIssueKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubInstallation {
  id: string;
  installationId: number;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  avatarUrl: string | null;
  status: 'active' | 'suspended' | 'deleted';
  installedAt: string;
}

export interface GitHubRepository {
  id: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
  description: string | null;
  branchesCount?: number;
  updatedAt: string;
}

export interface GitHubBranch {
  id: string;
  name: string;
  commitSha: string;
  commitMessage: string | null;
  isProtected: boolean;
  lastCommitAt: string | null;
}

export interface GitHubStatusResponse {
  connected: boolean;
  installation: GitHubInstallation | null;
  app: {
    id?: string;
    name: string;
    slug: string;
    clientId?: string;
    isConfigured: boolean;
    installUrl: string;
  };
  repositoriesCount: number;
}

export interface JiraStatusResponse {
  connected: boolean;
  connection: {
    id: string;
    siteName: string;
    siteUrl: string;
    status: string;
  } | null;
  issuesCount: number;
}

export interface PlaywrightTraceAction {
  stepNumber: number;
  title: string;
  action: string;
  apiCall: string;
  durationMs: number;
  status: 'passed' | 'failed';
  timestamp: string;
}

export interface PlaywrightConsoleLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface PlaywrightNetworkRequest {
  method: string;
  url: string;
  status: number;
  type: string;
  durationMs: number;
  size: string;
}

export interface PlaywrightScreenshot {
  action: string;
  label: string;
  timestamp: string;
  previewUrl: string;
}

export interface PlaywrightTraceData {
  durationMs: number;
  actions: PlaywrightTraceAction[];
  consoleLogs: PlaywrightConsoleLog[];
  networkRequests: PlaywrightNetworkRequest[];
  screenshots: PlaywrightScreenshot[];
  domSnapshot: {
    htmlSnippet: string;
    inspectedSelector: string;
    computedStyles?: Record<string, string>;
  };
}

export interface TestRunResult {
  id: string;
  suiteId: string;
  suiteName: string;
  status: 'passed' | 'failed' | 'running';
  durationMs: number;
  totalSteps: number;
  passedSteps: number;
  timestamp: string;
  startedAt: string;
  browser: string;
  triggeredBy: string;
  traceData?: PlaywrightTraceData;
  error?: string | null;
  releaseGateStatus?: 'pending' | 'passed' | 'failed';
  releaseGate?: {
    status: 'pending' | 'passed' | 'failed';
    reason: string;
    blockingFailures: string[];
  };
  artifacts?: {
    id: string;
    kind: 'screenshot' | 'trace';
    label: string;
    nodeId?: string | null;
    contentType: string;
    sizeBytes: number;
    url: string;
  }[];
}

export type ActiveTab =
  | 'overview'
  | 'workflows'
  | 'test-runs'
  | 'traceability'
  | 'test-data'
  | 'copilot'
  | 'settings'
  | 'environments'
  | 'integrations'
  // Backward compatibility aliases
  | 'dashboard'
  | 'builder'
  | 'history'
  | 'jira'
  | 'team';

export interface TeamMessage {
  id: string;
  sender: string;
  handle: string;
  avatar: string;
  time: string;
  content: string;
}

export interface TestHistoryRecord {
  id: string;
  status: 'passed' | 'failed';
  testName: string;
  trigger: string;
  browser?: string;
  durationM: number;
  reportId: string;
  timestamp: string;
  stepsCount: number;
  errorMessage?: string;
  consoleLogs?: string[];
  traceData?: PlaywrightTraceData;
}

export type JiraPriority = 'highest' | 'high' | 'medium' | 'low';
export type JiraStatus = 'todo' | 'inprogress' | 'review' | 'done';
export type JiraIssueType = 'story' | 'bug' | 'task';
export type JiraSyncStatus = 'synced' | 'pending' | 'conflict' | 'auto_healed' | 'failed';

export interface JiraIssue {
  id: string;
  key: string;
  title: string;
  status: JiraStatus;
  priority: JiraPriority;
  type: JiraIssueType;
  storyPoints: number;
  assignee: {
    name: string;
    avatar?: string;
    role: string;
  };
  labels: string[];
  description: string;
  linkedSuiteId?: string;
  linkedSuiteName?: string;
  stepCoverage?: number;
  assertionCoverage?: number;
  testPassRate?: number;
  syncStatus?: JiraSyncStatus;
  lastSyncedAt?: string;
  conflictReason?: string;
  lastExecution?: string;
  updatedAt: string;
}

export type PipelineStatus = 'passed' | 'deploying' | 'failed' | 'queued';

export interface BranchInfo {
  name: string;
  commit: string;
  author: string;
  pipelineStatus: PipelineStatus;
  ciService: 'Vercel Preview' | 'GitHub Actions';
  previewUrl?: string;
  lastUpdated: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'ai' | 'user';
  timestamp: string;
  text: string;
  diagnostic?: {
    issueType: 'selector_instability' | 'dom_mutation' | 'assertion_failure' | 'timeout';
    targetSelector: string;
    confidence: number;
    reason: string;
    oldSelector: string;
    newSelector: string;
    diff: {
      removed: string;
      added: string;
    };
    recommendation: string;
    affectedStepId: string;
    affectedSuiteId: string;
    linkedJiraKey?: string;
  };
  healProposal?: {
    targetNodeId: string;
    oldSelector: string;
    newSelector: string;
    confidence: number;
    applied?: boolean;
    explanation?: string;
  };
  suggestedActions?: Array<{
    id: string;
    label: string;
    actionType: 'heal_node' | 'add_assertion' | 'fix_timeout' | 'generate_happy_path' | 'review_diff';
    payload?: any;
  }>;
}
