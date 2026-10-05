import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { SuiteDefinition, ExecutableNode } from '../../shared/suite';

export type RunStatus = 'queued' | 'running' | 'passed' | 'failed' | 'cancelled';
export type ResultStatus = 'queued' | 'running' | 'passed' | 'failed' | 'skipped' | 'cancelled';
export type ReleaseGateStatus = 'pending' | 'passed' | 'failed';
export type TriggerType = 'manual' | 'push' | 'pull_request' | 'scheduled';

export interface StepResult {
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

export interface ConsoleEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface NetworkEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  resourceType: string;
  failure?: string;
  durationMs: number;
}

/** 1. Multi-tenant Teams */
export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** 2. GitHub App Installations */
export const githubInstallations = pgTable(
  'github_installations',
  {
    id: text('id').primaryKey(), // e.g. "gh-inst-12345678"
    teamId: text('team_id').notNull(),
    installationId: integer('installation_id').notNull().unique(), // GitHub numeric installation ID
    accountLogin: text('account_login').notNull(),
    accountType: text('account_type').notNull(), // 'User' | 'Organization'
    avatarUrl: text('avatar_url'),
    targetId: integer('target_id'),
    permissions: jsonb('permissions').$type<Record<string, string>>().notNull().default({}),
    events: jsonb('events').$type<string[]>().notNull().default([]),
    status: text('status').$type<'active' | 'suspended' | 'deleted'>().notNull().default('active'),
    installedAt: timestamp('installed_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('gh_inst_team_idx').on(t.teamId)]
);

/** 3. Discovered GitHub Repositories */
export const githubRepositories = pgTable(
  'github_repositories',
  {
    id: text('id').primaryKey(), // e.g. "gh-repo-12345678"
    installationId: text('installation_id').notNull(),
    teamId: text('team_id').notNull(),
    githubRepoId: integer('github_repo_id').notNull().unique(),
    name: text('name').notNull(), // e.g. "playsight-core"
    fullName: text('full_name').notNull(), // e.g. "aato-test/playsight-core"
    ownerLogin: text('owner_login').notNull(),
    isPrivate: boolean('is_private').notNull().default(false),
    defaultBranch: text('default_branch').notNull().default('main'),
    htmlUrl: text('html_url').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('gh_repos_team_idx').on(t.teamId), index('gh_repos_inst_idx').on(t.installationId)]
);

/** 4. Discovered GitHub Branches */
export const githubBranches = pgTable(
  'github_branches',
  {
    id: text('id').primaryKey(), // e.g. "gh-branch-repoId-branchName"
    repositoryId: text('repository_id').notNull(),
    name: text('name').notNull(), // e.g. "main", "feature/checkout-fix"
    commitSha: text('commit_sha').notNull(),
    commitMessage: text('commit_message'),
    isProtected: boolean('is_protected').notNull().default(false),
    lastCommitAt: timestamp('last_commit_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('gh_branches_repo_idx').on(t.repositoryId)]
);

/** 5. GitHub Webhook Delivery Log (for idempotent processing) */
export const githubWebhookDeliveries = pgTable(
  'github_webhook_deliveries',
  {
    id: text('id').primaryKey(), // X-GitHub-Delivery GUID
    event: text('event').notNull(), // 'push', 'pull_request', 'installation'
    action: text('action'),
    repositoryFullName: text('repository_full_name'),
    signature: text('signature'),
    payload: jsonb('payload').notNull(),
    status: text('status').$type<'processed' | 'ignored' | 'failed'>().notNull().default('processed'),
    matchedSuites: jsonb('matched_suites').$type<string[]>().default([]),
    triggeredRuns: jsonb('triggered_runs').$type<string[]>().default([]),
    error: text('error'),
    processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('gh_wh_event_idx').on(t.event), index('gh_wh_repo_idx').on(t.repositoryFullName)]
);

/** 6. Individual Test Cases */
export const testCases = pgTable(
  'test_cases',
  {
    id: text('id').primaryKey(), // e.g. "tc-login-valid"
    teamId: text('team_id').notNull().default('team-default'),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    stepType: text('step_type').notNull(), // 'navigate' | 'click' | 'input' | 'assert'
    definition: jsonb('definition').$type<ExecutableNode>().notNull(),
    jiraIssueKey: text('jira_issue_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('test_cases_team_idx').on(t.teamId)]
);

/** 7. Test Suites (Linked to Team, GitHub Repo, Branch, and Trigger) */
export const testSuites = pgTable(
  'test_suites',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull().default('team-default'),
    repositoryId: text('repository_id'), // optional link to github_repositories.id
    branchName: text('branch_name'), // target branch, e.g. "main"
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    baseUrl: text('base_url').notNull().default(''),
    browser: text('browser').notNull().default('chromium'),
    environment: text('environment').notNull().default('staging'),
    jiraIssue: text('jira_issue'),
    triggerType: text('trigger_type').$type<TriggerType>().notNull().default('manual'),
    triggerConfig: jsonb('trigger_config').$type<{
      branches?: string[];
      paths?: string[];
      cronExpression?: string;
    }>().notNull().default({}),
    definition: jsonb('definition').$type<SuiteDefinition>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('test_suites_team_idx').on(t.teamId), index('test_suites_repo_idx').on(t.repositoryId)]
);

/** 8. Suite to Test Case Association (Sequence Ordering) */
export const suiteTestCases = pgTable(
  'suite_test_cases',
  {
    id: text('id').primaryKey(),
    suiteId: text('suite_id').notNull(),
    testCaseId: text('test_case_id').notNull(),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('stc_suite_idx').on(t.suiteId), index('stc_case_idx').on(t.testCaseId)]
);

/** 9. Test Runs */
export const runs = pgTable(
  'runs',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull().default('team-default'),
    status: text('status').$type<RunStatus>().notNull().default('queued'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    repositoryId: text('repository_id'),
    repositoryFullName: text('repository_full_name'),
    branch: text('branch'),
    commit: text('commit'),
    environment: text('environment').notNull().default('staging'),
    suiteId: text('suite_id').notNull(),
    suiteName: text('suite_name').notNull(),
    suiteSnapshot: jsonb('suite_snapshot')
      .$type<{ baseUrl: string; definition: SuiteDefinition }>()
      .notNull(),
    browsers: jsonb('browsers').$type<string[]>().notNull(),
    totalTests: integer('total_tests').notNull().default(0),
    passedTests: integer('passed_tests').notNull().default(0),
    failedTests: integer('failed_tests').notNull().default(0),
    skippedTests: integer('skipped_tests').notNull().default(0),
    durationMs: integer('duration_ms'),
    releaseGateStatus: text('release_gate_status').$type<ReleaseGateStatus>().notNull().default('pending'),
    triggeredBy: text('triggered_by').notNull().default('PlaySight UI'),
    triggerEvent: text('trigger_event').$type<'manual' | 'push' | 'pull_request' | 'scheduled'>().notNull().default('manual'),
    pullRequestNumber: integer('pull_request_number'),
    pullRequestUrl: text('pull_request_url'),
    pullRequestSourceBranch: text('pull_request_source_branch'),
    pullRequestTargetBranch: text('pull_request_target_branch'),
    rerunOf: text('rerun_of'),
    error: text('error'),
  },
  (t) => [
    index('runs_created_at_idx').on(t.createdAt),
    index('runs_suite_id_idx').on(t.suiteId),
    index('runs_repo_idx').on(t.repositoryId),
  ]
);

/** 10. Individual Test Results */
export const testResults = pgTable(
  'test_results',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    suiteId: text('suite_id').notNull(),
    testCaseId: text('test_case_id'),
    testName: text('test_name').notNull(),
    browser: text('browser').notNull(),
    browserVersion: text('browser_version'),
    status: text('status').$type<ResultStatus>().notNull().default('queued'),
    blocking: boolean('blocking').notNull().default(true),
    durationMs: integer('duration_ms'),
    error: text('error'),
    stackTrace: text('stack_trace'),
    failedNodeId: text('failed_node_id'),
    screenshotPath: text('screenshot_path'),
    tracePath: text('trace_path'),
    steps: jsonb('steps').$type<StepResult[]>().notNull().default([]),
    consoleLogs: jsonb('console_logs').$type<ConsoleEntry[]>().notNull().default([]),
    networkEvents: jsonb('network_events').$type<NetworkEntry[]>().notNull().default([]),
    domSnapshot: jsonb('dom_snapshot').$type<{ htmlSnippet: string; inspectedSelector: string } | null>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('test_results_run_id_idx').on(t.runId)]
);

/** 11. Artifacts */
export const artifacts = pgTable(
  'artifacts',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    resultId: text('result_id').notNull(),
    kind: text('kind').$type<'screenshot' | 'trace'>().notNull(),
    label: text('label').notNull(),
    nodeId: text('node_id'),
    storagePath: text('storage_path').notNull(),
    contentType: text('content_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('artifacts_run_id_idx').on(t.runId)]
);

/** 12. Audit Events */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull().default('team-default'),
    runId: text('run_id'),
    suiteId: text('suite_id'),
    eventType: text('event_type').notNull(),
    message: text('message').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_events_created_at_idx').on(t.createdAt), index('audit_events_run_id_idx').on(t.runId)]
);

/** 13. Jira Cloud Connections */
export const jiraConnections = pgTable(
  'jira_connections',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull(),
    cloudId: text('cloud_id').notNull(),
    siteUrl: text('site_url').notNull(),
    siteName: text('site_name').notNull(),
    status: text('status').$type<'active' | 'disconnected'>().notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('jira_conn_team_idx').on(t.teamId)]
);

/** 14. Jira Projects */
export const jiraProjects = pgTable(
  'jira_projects',
  {
    id: text('id').primaryKey(),
    connectionId: text('connection_id').notNull(),
    teamId: text('team_id').notNull(),
    projectKey: text('project_key').notNull(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('jira_projects_team_idx').on(t.teamId)]
);

/** 15. Jira Boards */
export const jiraBoards = pgTable(
  'jira_boards',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    teamId: text('team_id').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull().default('kanban'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('jira_boards_team_idx').on(t.teamId)]
);

/** 16. Jira Issues (Synced) */
export const jiraIssues = pgTable(
  'jira_issues',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull(),
    projectId: text('project_id'),
    issueKey: text('issue_key').notNull(), // e.g. "CHK-184"
    summary: text('summary').notNull(),
    status: text('status').notNull(), // e.g. "in_progress", "review", "done"
    priority: text('priority').notNull().default('medium'),
    assigneeName: text('assignee_name'),
    assigneeAvatar: text('assignee_avatar'),
    linkedSuiteId: text('linked_suite_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('jira_issues_team_idx').on(t.teamId), index('jira_issues_key_idx').on(t.issueKey)]
);

// Type exports
export type TeamRow = typeof teams.$inferSelect;
export type GitHubInstallationRow = typeof githubInstallations.$inferSelect;
export type GitHubRepositoryRow = typeof githubRepositories.$inferSelect;
export type GitHubBranchRow = typeof githubBranches.$inferSelect;
export type WebhookDeliveryRow = typeof githubWebhookDeliveries.$inferSelect;
export type TestCaseRow = typeof testCases.$inferSelect;
export type SuiteTestCaseRow = typeof suiteTestCases.$inferSelect;
export type SuiteRow = typeof testSuites.$inferSelect;
export type RunRow = typeof runs.$inferSelect;
export type ResultRow = typeof testResults.$inferSelect;
export type ArtifactRow = typeof artifacts.$inferSelect;
export type AuditRow = typeof auditEvents.$inferSelect;
export type JiraConnectionRow = typeof jiraConnections.$inferSelect;
export type JiraProjectRow = typeof jiraProjects.$inferSelect;
export type JiraBoardRow = typeof jiraBoards.$inferSelect;
export type JiraIssueRow = typeof jiraIssues.$inferSelect;
