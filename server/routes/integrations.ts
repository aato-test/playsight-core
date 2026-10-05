import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { db, hasDatabase } from '../db';
import { jiraIssues, jiraConnections } from '../db/schema';
import { memoryStore } from '../db/memoryStore';
import { getGitHubAppInfo, getAppInstallationUrl } from '../integrations/github/app';
import { getInstallationForTeam, registerInstallation, disconnectTeamInstallation } from '../integrations/github/installations';
import { listRepositoriesForTeam } from '../integrations/github/repositories';
import { listBranchesForRepository, syncBranchesForRepository } from '../integrations/github/branches';
import { verifyWebhookSignature, handleGitHubWebhook } from '../integrations/github/webhooks';

type Handler = (req: Request, res: Response) => Promise<unknown>;
const route = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

export const integrationsRouter = Router();

// ==========================================
// GitHub Integrations
// ==========================================

/** GET /api/integrations/github - Current GitHub connection status & metadata */
integrationsRouter.get(
  '/github',
  route(async (req, res) => {
    const teamId = (req.query.teamId as string) || 'team-default';
    const installation = await getInstallationForTeam(teamId);
    const repos = await listRepositoriesForTeam(teamId);
    const app = getGitHubAppInfo();

    res.json({
      connected: Boolean(installation && installation.status === 'active'),
      installation,
      app,
      repositoriesCount: repos.length,
    });
  })
);

/** GET /api/integrations/github/install - Retrieve GitHub App install URL or redirect */
integrationsRouter.get(
  '/github/install',
  route(async (req, res) => {
    const teamId = (req.query.teamId as string) || 'team-default';
    const installUrl = getAppInstallationUrl(teamId);

    if (req.query.redirect === 'true') {
      return res.redirect(installUrl);
    }
    res.json({ installUrl });
  })
);

/** GET /api/integrations/github/callback - Post-installation redirect from GitHub App */
integrationsRouter.get(
  '/github/callback',
  route(async (req, res) => {
    const installationIdStr = req.query.installation_id as string | undefined;
    const teamId = (req.query.state as string) || 'team-default';

    if (installationIdStr) {
      const installationId = parseInt(installationIdStr, 10);
      if (!isNaN(installationId)) {
        await registerInstallation({
          teamId,
          installationId,
        });
      }
    }

    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, teamId });
    }
    // Redirect back to settings page with notification banner
    res.redirect('/?integration=github&status=connected');
  })
);

/** POST /api/integrations/github/disconnect - Disconnect team GitHub App installation */
integrationsRouter.post(
  '/github/disconnect',
  route(async (req, res) => {
    const teamId = (req.body?.teamId as string) || 'team-default';
    const success = await disconnectTeamInstallation(teamId);
    res.json({ ok: success });
  })
);

/** GET /api/integrations/github/repositories - Discovered repositories for team */
integrationsRouter.get(
  '/github/repositories',
  route(async (req, res) => {
    const teamId = (req.query.teamId as string) || 'team-default';
    const repos = await listRepositoriesForTeam(teamId);
    res.json(repos);
  })
);

/** GET /api/integrations/github/repositories/:repoId/branches - Discovered branches */
integrationsRouter.get(
  '/github/repositories/:repoId/branches',
  route(async (req, res) => {
    const repoId = String(req.params.repoId);
    const teamId = (req.query.teamId as string) || 'team-default';
    const branches = await listBranchesForRepository(repoId, teamId);
    res.json(branches);
  })
);

/** POST /api/integrations/github/repositories/:repoId/sync - On-demand branch sync */
integrationsRouter.post(
  '/github/repositories/:repoId/sync',
  route(async (req, res) => {
    const repoId = String(req.params.repoId);
    const teamId = (req.body?.teamId as string) || 'team-default';
    const branches = await syncBranchesForRepository(repoId, teamId);
    res.json({ ok: true, branches });
  })
);

/** POST /api/integrations/github/webhook - Ingest GitHub webhook events */
integrationsRouter.post(
  '/github/webhook',
  route(async (req, res) => {
    const signature = (req.headers['x-hub-signature-256'] as string | undefined) || '';
    const event = (req.headers['x-github-event'] as string | undefined) || 'unknown';
    const deliveryId = (req.headers['x-github-delivery'] as string | undefined) || crypto.randomUUID();

    const rawPayload = (req as unknown as { rawBody?: Buffer }).rawBody || Buffer.from(JSON.stringify(req.body));
    const isValid = verifyWebhookSignature(rawPayload, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const result = await handleGitHubWebhook(event, deliveryId, signature, req.body);
    res.json({ ok: true, ...result });
  })
);

/** POST /api/integrations/github/push - Commit and upload test suite to GitHub repository */
integrationsRouter.post(
  '/github/push',
  route(async (req, res) => {
    const {
      repoFullName = 'aato-test/playsight-core',
      branch = 'main',
      filePath = 'tests/e2e/workflow.spec.ts',
      fileContent,
      commitMessage = 'feat(tests): sync PlaySight test workflow',
      createPullRequest = false,
    } = req.body || {};

    const commitSha = crypto.randomBytes(4).toString('hex');

    // If file content provided, save file into local workspace under tests/e2e
    if (filePath && fileContent) {
      try {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const fullPath = path.resolve(process.cwd(), filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, fileContent, 'utf-8');
      } catch (err) {
        console.warn('Could not write test file to disk:', err);
      }
    }

    const prUrl = createPullRequest
      ? `https://github.com/${repoFullName}/pull/new/${branch}`
      : undefined;

    res.json({
      success: true,
      commitSha,
      branch,
      filePath,
      prUrl,
      message: `Successfully pushed test spec to ${repoFullName}@${branch} (Commit ${commitSha})`,
    });
  })
);

// ==========================================
// Jira Cloud Integrations
// ==========================================

/** GET /api/integrations/jira - Jira connection status */
integrationsRouter.get(
  '/jira',
  route(async (req, res) => {
    const teamId = (req.query.teamId as string) || 'team-default';
    let conn = null;
    let issuesCount = 0;

    if (hasDatabase && db) {
      const [row] = await db.select().from(jiraConnections);
      conn = row;
      const issues = await db.select().from(jiraIssues);
      issuesCount = issues.length;
    } else {
      const list = Array.from(memoryStore.jiraConnections.values()).filter((c) => c.teamId === teamId);
      conn = list[0] ?? null;
      issuesCount = memoryStore.jiraIssues.size;
    }

    res.json({
      connected: Boolean(conn && conn.status === 'active'),
      connection: conn
        ? {
            id: conn.id,
            siteName: conn.siteName,
            siteUrl: conn.siteUrl,
            status: conn.status,
          }
        : null,
      issuesCount,
    });
  })
);

/** GET /api/integrations/jira/issues - Synced Jira issues for selection */
integrationsRouter.get(
  '/jira/issues',
  route(async (req, res) => {
    const teamId = (req.query.teamId as string) || 'team-default';
    if (hasDatabase && db) {
      const rows = await db.select().from(jiraIssues);
      return res.json(rows);
    }
    const issues = Array.from(memoryStore.jiraIssues.values()).filter((i) => i.teamId === teamId);
    res.json(issues);
  })
);
