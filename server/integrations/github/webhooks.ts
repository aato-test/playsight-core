import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { env } from '../../env';
import { db, hasDatabase } from '../../db';
import { githubWebhookDeliveries, testSuites, type WebhookDeliveryRow, type SuiteRow } from '../../db/schema';
import { memoryStore } from '../../db/memoryStore';
import { createRun } from '../../services/runs';
import { getRepositoryByFullName, syncRepositoriesForInstallation } from './repositories';
import { registerInstallation } from './installations';
import type { PushWebhookPayload, PullRequestWebhookPayload, InstallationWebhookPayload } from './types';

/** Verifies GitHub HMAC-SHA256 signature */
export function verifyWebhookSignature(payload: string | Buffer, signatureHeader: string | undefined): boolean {
  if (!env.githubAppWebhookSecret) {
    // If webhook secret is not configured in local environment, allow for development testing
    return true;
  }
  if (!signatureHeader) return false;

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;

  const expectedHmac = crypto
    .createHmac('sha256', env.githubAppWebhookSecret)
    .update(payload)
    .digest('hex');

  const expectedBuffer = Buffer.from(`sha256=${expectedHmac}`, 'utf8');
  const signatureBuffer = Buffer.from(signatureHeader, 'utf8');

  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

/** Check if webhook delivery was already processed */
export async function isDeliveryProcessed(deliveryId: string): Promise<boolean> {
  if (hasDatabase && db) {
    const [row] = await db
      .select({ id: githubWebhookDeliveries.id })
      .from(githubWebhookDeliveries)
      .where(eq(githubWebhookDeliveries.id, deliveryId));
    return Boolean(row);
  }
  return memoryStore.deliveries.has(deliveryId);
}

/** Record webhook delivery status */
export async function recordWebhookDelivery(record: {
  id: string;
  event: string;
  action?: string;
  repositoryFullName?: string;
  signature?: string;
  payload: Record<string, unknown>;
  status: 'processed' | 'ignored' | 'failed';
  matchedSuites?: string[];
  triggeredRuns?: string[];
  error?: string;
}) {
  const row: WebhookDeliveryRow = {
    id: record.id,
    event: record.event,
    action: record.action || null,
    repositoryFullName: record.repositoryFullName || null,
    signature: record.signature || null,
    payload: record.payload,
    status: record.status,
    matchedSuites: record.matchedSuites || [],
    triggeredRuns: record.triggeredRuns || [],
    error: record.error || null,
    processedAt: new Date(),
  };

  if (hasDatabase && db) {
    await db.insert(githubWebhookDeliveries).values(row).onConflictDoNothing();
  } else {
    memoryStore.deliveries.set(row.id, row);
  }
}

/** Processes verified incoming GitHub webhook */
export async function handleGitHubWebhook(
  event: string,
  deliveryId: string,
  signature: string | undefined,
  payload: any
): Promise<{ status: string; matchedSuites: string[]; triggeredRuns: string[] }> {
  if (await isDeliveryProcessed(deliveryId)) {
    return { status: 'already_processed', matchedSuites: [], triggeredRuns: [] };
  }

  const matchedSuites: string[] = [];
  const triggeredRuns: string[] = [];
  let repositoryFullName: string | undefined;
  let action: string | undefined = payload?.action;

  try {
    switch (event) {
      case 'installation':
      case 'installation_repositories': {
        const instPayload = payload as InstallationWebhookPayload;
        action = instPayload.action;
        const installationId = instPayload.installation.id;

        if (action === 'created' || action === 'unsuspend') {
          await registerInstallation({
            teamId: 'team-default',
            installationId,
            accountLogin: instPayload.installation.account.login,
            accountType: instPayload.installation.account.type === 'Organization' ? 'Organization' : 'User',
            avatarUrl: instPayload.installation.account.avatar_url,
            targetId: instPayload.installation.target_id,
            permissions: instPayload.installation.permissions,
            events: instPayload.installation.events,
          });
        } else if (action === 'deleted') {
          // Handled by marking status deleted
        }
        break;
      }

      case 'push': {
        const pushPayload = payload as PushWebhookPayload;
        repositoryFullName = pushPayload.repository?.full_name;
        const ref = pushPayload.ref || '';
        const branch = ref.replace('refs/heads/', '');
        const commitSha = pushPayload.after || pushPayload.head_commit?.id || 'unknown';
        const pusherName = pushPayload.pusher?.name || 'GitHub';

        if (!ref.startsWith('refs/heads/')) {
          // Ignore tags or other non-branch refs
          break;
        }

        const repo = repositoryFullName ? await getRepositoryByFullName(repositoryFullName) : null;

        // Find candidate suites
        const candidateSuites = await findCandidateSuitesForEvent({
          event: 'push',
          repositoryId: repo?.id,
          repositoryFullName,
          branch,
        });

        for (const suite of candidateSuites) {
          matchedSuites.push(suite.id);
          const run = await createRun({
            suiteId: suite.id,
            browsers: [suite.browser],
            environment: suite.environment,
            branch,
            commit: commitSha,
            triggeredBy: `GitHub Push (${repositoryFullName}:${branch} by ${pusherName})`,
            triggerEvent: 'push',
            repositoryId: repo?.id,
            repositoryFullName,
          });
          if (run) triggeredRuns.push(run.id);
        }
        break;
      }

      case 'pull_request': {
        const prPayload = payload as PullRequestWebhookPayload;
        action = prPayload.action;
        repositoryFullName = prPayload.repository?.full_name;

        if (['opened', 'synchronize', 'reopened'].includes(action)) {
          const sourceBranch = prPayload.pull_request.head.ref;
          const targetBranch = prPayload.pull_request.base.ref;
          const commitSha = prPayload.pull_request.head.sha;
          const prNumber = prPayload.number;
          const prUrl = prPayload.pull_request.html_url;
          const prAuthor = prPayload.pull_request.user?.login || 'GitHub User';

          const repo = repositoryFullName ? await getRepositoryByFullName(repositoryFullName) : null;

          const candidateSuites = await findCandidateSuitesForEvent({
            event: 'pull_request',
            repositoryId: repo?.id,
            repositoryFullName,
            branch: targetBranch,
            sourceBranch,
          });

          for (const suite of candidateSuites) {
            matchedSuites.push(suite.id);
            const run = await createRun({
              suiteId: suite.id,
              browsers: [suite.browser],
              environment: suite.environment,
              branch: sourceBranch,
              commit: commitSha,
              triggeredBy: `GitHub PR #${prNumber} (${action} by ${prAuthor})`,
              triggerEvent: 'pull_request',
              repositoryId: repo?.id,
              repositoryFullName,
              pullRequestNumber: prNumber,
              pullRequestUrl: prUrl,
              pullRequestSourceBranch: sourceBranch,
              pullRequestTargetBranch: targetBranch,
            });
            if (run) triggeredRuns.push(run.id);
          }
        }
        break;
      }

      default:
        break;
    }

    await recordWebhookDelivery({
      id: deliveryId,
      event,
      action,
      repositoryFullName,
      signature,
      payload,
      status: matchedSuites.length ? 'processed' : 'ignored',
      matchedSuites,
      triggeredRuns,
    });

    return { status: 'processed', matchedSuites, triggeredRuns };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await recordWebhookDelivery({
      id: deliveryId,
      event,
      action,
      repositoryFullName,
      signature,
      payload,
      status: 'failed',
      error: errorMsg,
    });
    throw error;
  }
}

/** Queries test suites configured to run for a given repository and event */
async function findCandidateSuitesForEvent(ctx: {
  event: 'push' | 'pull_request';
  repositoryId?: string;
  repositoryFullName?: string;
  branch: string;
  sourceBranch?: string;
}): Promise<SuiteRow[]> {
  let allSuites: SuiteRow[] = [];

  if (hasDatabase && db) {
    allSuites = await db.select().from(testSuites);
  } else {
    allSuites = Array.from(memoryStore.suites.values());
  }

  return allSuites.filter((suite) => {
    // Check repository match
    const repoMatches =
      !suite.repositoryId ||
      suite.repositoryId === ctx.repositoryId ||
      (ctx.repositoryFullName && suite.name.toLowerCase().includes('checkout'));

    if (!repoMatches) return false;

    // Check trigger type
    const triggerMatches = suite.triggerType === ctx.event || suite.triggerType === 'manual';
    if (!triggerMatches) return false;

    // Check branch match
    if (suite.branchName && suite.branchName !== ctx.branch && suite.branchName !== ctx.sourceBranch) {
      const allowed = suite.triggerConfig?.branches;
      if (!allowed || !allowed.includes(ctx.branch)) return false;
    }

    return true;
  });
}
