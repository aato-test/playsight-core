import { config } from 'dotenv';
import path from 'node:path';

// Server-only env loading. Later files never override values already set.
for (const file of ['.env.development.local', '.env.local', '.env']) {
  config({ path: path.resolve(process.cwd(), file), quiet: true });
}

export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3000),
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  artifactsDir: path.resolve(process.cwd(), process.env.ARTIFACTS_DIR || 'artifacts'),
  executorConcurrency: Math.max(1, Number(process.env.EXECUTOR_CONCURRENCY || 1)),
  headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  copilotModel: process.env.COPILOT_MODEL || 'openai/gpt-5-mini',

  // GitHub App Integration
  githubAppId: process.env.GITHUB_APP_ID || '',
  githubAppPrivateKey: process.env.GITHUB_APP_PRIVATE_KEY || '',
  githubAppWebhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET || '',
  githubAppClientId: process.env.GITHUB_APP_CLIENT_ID || '',
  githubAppClientSecret: process.env.GITHUB_APP_CLIENT_SECRET || '',
  githubAppName: process.env.GITHUB_APP_NAME || 'playsight-core',

  // Jira Cloud Integration
  jiraClientId: process.env.JIRA_CLIENT_ID || '',
  jiraClientSecret: process.env.JIRA_CLIENT_SECRET || '',
  jiraRedirectUri: process.env.JIRA_REDIRECT_URI || 'http://localhost:3000/api/integrations/jira/callback',
};
