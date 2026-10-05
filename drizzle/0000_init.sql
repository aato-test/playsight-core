CREATE TABLE "artifacts" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"result_id" text NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"node_id" text,
	"storage_path" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text,
	"suite_id" text,
	"event_type" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"branch" text,
	"commit" text,
	"environment" text DEFAULT 'staging' NOT NULL,
	"suite_id" text NOT NULL,
	"suite_name" text NOT NULL,
	"suite_snapshot" jsonb NOT NULL,
	"browsers" jsonb NOT NULL,
	"total_tests" integer DEFAULT 0 NOT NULL,
	"passed_tests" integer DEFAULT 0 NOT NULL,
	"failed_tests" integer DEFAULT 0 NOT NULL,
	"skipped_tests" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer,
	"release_gate_status" text DEFAULT 'pending' NOT NULL,
	"triggered_by" text DEFAULT 'PlaySight UI' NOT NULL,
	"rerun_of" text,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"suite_id" text NOT NULL,
	"test_name" text NOT NULL,
	"browser" text NOT NULL,
	"browser_version" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"blocking" boolean DEFAULT true NOT NULL,
	"duration_ms" integer,
	"error" text,
	"stack_trace" text,
	"failed_node_id" text,
	"screenshot_path" text,
	"trace_path" text,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"console_logs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"network_events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dom_snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_suites" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"base_url" text DEFAULT '' NOT NULL,
	"browser" text DEFAULT 'chromium' NOT NULL,
	"environment" text DEFAULT 'staging' NOT NULL,
	"jira_issue" text,
	"definition" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "artifacts_run_id_idx" ON "artifacts" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_events_run_id_idx" ON "audit_events" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "runs_created_at_idx" ON "runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runs_suite_id_idx" ON "runs" USING btree ("suite_id");--> statement-breakpoint
CREATE INDEX "test_results_run_id_idx" ON "test_results" USING btree ("run_id");