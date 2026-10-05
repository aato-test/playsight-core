import { config } from 'dotenv';
import path from 'node:path';

// Server-only env loading. Later files never override values already set.
for (const file of ['.env.development.local', '.env.local', '.env']) {
  config({ path: path.resolve(process.cwd(), file), quiet: true });
}

export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || '',
  artifactsDir: path.resolve(process.cwd(), process.env.ARTIFACTS_DIR || 'artifacts'),
  executorConcurrency: Math.max(1, Number(process.env.EXECUTOR_CONCURRENCY || 1)),
  headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  copilotModel: process.env.COPILOT_MODEL || 'openai/gpt-5-mini',
};
