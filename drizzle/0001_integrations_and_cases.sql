CREATE TABLE IF NOT EXISTS "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_installations" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"installation_id" integer NOT NULL UNIQUE,
	"account_login" text NOT NULL,
	"account_type" text NOT NULL,
	"avatar_url" text,
	"target_id" integer,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_repositories" (
	"id" text PRIMARY KEY NOT NULL,
	"installation_id" text NOT NULL,
	"team_id" text NOT NULL,
	"github_repo_id" integer NOT NULL UNIQUE,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"owner_login" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"default_branch" text DEFAULT 'main' NOT NULL,
	"html_url" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_branches" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"name" text NOT NULL,
	"commit_sha" text NOT NULL,
	"commit_message" text,
	"is_protected" boolean DEFAULT false NOT NULL,
	"last_commit_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"action" text,
	"repository_full_name" text,
	"signature" text,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'processed' NOT NULL,
	"matched_suites" jsonb DEFAULT '[]'::jsonb,
	"triggered_runs" jsonb DEFAULT '[]'::jsonb,
	"error" text,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text DEFAULT 'team-default' NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"step_type" text NOT NULL,
	"definition" jsonb NOT NULL,
	"jira_issue_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suite_test_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"suite_id" text NOT NULL,
	"test_case_id" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jira_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"cloud_id" text NOT NULL,
	"site_url" text NOT NULL,
	"site_name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jira_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"team_id" text NOT NULL,
	"project_key" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jira_boards" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"team_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'kanban' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jira_issues" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"project_id" text,
	"issue_key" text NOT NULL,
	"summary" text NOT NULL,
	"status" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assignee_name" text,
	"assignee_avatar" text,
	"linked_suite_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "test_suites" ADD COLUMN IF NOT EXISTS "team_id" text DEFAULT 'team-default' NOT NULL;
ALTER TABLE "test_suites" ADD COLUMN IF NOT EXISTS "repository_id" text;
ALTER TABLE "test_suites" ADD COLUMN IF NOT EXISTS "branch_name" text;
ALTER TABLE "test_suites" ADD COLUMN IF NOT EXISTS "trigger_type" text DEFAULT 'manual' NOT NULL;
ALTER TABLE "test_suites" ADD COLUMN IF NOT EXISTS "trigger_config" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "team_id" text DEFAULT 'team-default' NOT NULL;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "repository_id" text;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "repository_full_name" text;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "trigger_event" text DEFAULT 'manual' NOT NULL;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "pull_request_number" integer;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "pull_request_url" text;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "pull_request_source_branch" text;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "pull_request_target_branch" text;
--> statement-breakpoint
ALTER TABLE "test_results" ADD COLUMN IF NOT EXISTS "test_case_id" text;
ALTER TABLE "audit_events" ADD COLUMN IF NOT EXISTS "team_id" text DEFAULT 'team-default' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gh_inst_team_idx" ON "github_installations" ("team_id");
CREATE INDEX IF NOT EXISTS "gh_repos_team_idx" ON "github_repositories" ("team_id");
CREATE INDEX IF NOT EXISTS "gh_repos_inst_idx" ON "github_repositories" ("installation_id");
CREATE INDEX IF NOT EXISTS "gh_branches_repo_idx" ON "github_branches" ("repository_id");
CREATE INDEX IF NOT EXISTS "gh_wh_event_idx" ON "github_webhook_deliveries" ("event");
CREATE INDEX IF NOT EXISTS "gh_wh_repo_idx" ON "github_webhook_deliveries" ("repository_full_name");
CREATE INDEX IF NOT EXISTS "test_cases_team_idx" ON "test_cases" ("team_id");
CREATE INDEX IF NOT EXISTS "stc_suite_idx" ON "suite_test_cases" ("suite_id");
CREATE INDEX IF NOT EXISTS "stc_case_idx" ON "suite_test_cases" ("test_case_id");
CREATE INDEX IF NOT EXISTS "runs_repo_idx" ON "runs" ("repository_id");
