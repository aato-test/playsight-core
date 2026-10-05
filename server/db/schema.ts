import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { SuiteDefinition } from '../../shared/suite';

export type RunStatus = 'queued' | 'running' | 'passed' | 'failed' | 'cancelled';
export type ResultStatus = 'queued' | 'running' | 'passed' | 'failed' | 'skipped' | 'cancelled';
export type ReleaseGateStatus = 'pending' | 'passed' | 'failed';

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

export const testSuites = pgTable('test_suites', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  baseUrl: text('base_url').notNull().default(''),
  browser: text('browser').notNull().default('chromium'),
  environment: text('environment').notNull().default('staging'),
  jiraIssue: text('jira_issue'),
  definition: jsonb('definition').$type<SuiteDefinition>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const runs = pgTable(
  'runs',
  {
    id: text('id').primaryKey(),
    status: text('status').$type<RunStatus>().notNull().default('queued'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
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
    rerunOf: text('rerun_of'),
    error: text('error'),
  },
  (t) => [index('runs_created_at_idx').on(t.createdAt), index('runs_suite_id_idx').on(t.suiteId)]
);

export const testResults = pgTable(
  'test_results',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    suiteId: text('suite_id').notNull(),
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

export const auditEvents = pgTable(
  'audit_events',
  {
    id: text('id').primaryKey(),
    runId: text('run_id'),
    suiteId: text('suite_id'),
    eventType: text('event_type').notNull(),
    message: text('message').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_events_created_at_idx').on(t.createdAt), index('audit_events_run_id_idx').on(t.runId)]
);

export type SuiteRow = typeof testSuites.$inferSelect;
export type RunRow = typeof runs.$inferSelect;
export type ResultRow = typeof testResults.$inferSelect;
export type ArtifactRow = typeof artifacts.$inferSelect;
export type AuditRow = typeof auditEvents.$inferSelect;
