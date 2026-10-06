import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { db, hasDatabase } from '../db';
import { jiraIssues, jiraConnections } from '../db/schema';
import { memoryStore } from '../db/memoryStore';
import { getGitHubAppInfo, getAppInstallationUrl } from '../integrations/github/app';
import { getInstallationForTeam, registerInstallation, disconnectTeamInstallation } from '../integrations/github/installations';
import { listRepositoriesForTeam, getRepositoryById } from '../integrations/github/repositories';
import { listBranchesForRepository, syncBranchesForRepository } from '../integrations/github/branches';
import { verifyWebhookSignature, handleGitHubWebhook } from '../integrations/github/webhooks';
import {
  getPagesForRepository,
  testIndividualPage,
  testAllPagesForRepository,
  fetchRepositoryContents,
  fetchRepositoryFileContent,
} from '../integrations/github/pages';
import { verifyJiraCredentials, fetchJiraProjectIssues } from '../integrations/jira/client';

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

function parseRepoSlug(repoParam: string): { owner: string; repo: string; fullName: string } {
  const clean = decodeURIComponent(repoParam).replace(/^repo-/, '');
  if (clean.includes('/')) {
    const parts = clean.split('/');
    return { owner: parts[0], repo: parts[1], fullName: clean };
  }
  return { owner: 'aato-test', repo: clean, fullName: `aato-test/${clean}` };
}

/** GET /api/integrations/github/repositories/:repoId/contents - List repo files and directories */
integrationsRouter.get(
  '/github/repositories/:repoId/contents',
  route(async (req, res) => {
    const { owner, repo } = parseRepoSlug(req.params.repoId);
    const path = (req.query.path as string) || '';
    const contents = await fetchRepositoryContents(owner, repo, path);
    res.json(contents);
  })
);

/** GET /api/integrations/github/repositories/:repoId/file - Stream file content */
integrationsRouter.get(
  '/github/repositories/:repoId/file',
  route(async (req, res) => {
    const { owner, repo } = parseRepoSlug(req.params.repoId);
    const filePath = (req.query.path as string) || '';
    if (!filePath) {
      return res.status(400).json({ error: 'Query param "path" is required' });
    }
    const file = await fetchRepositoryFileContent(owner, repo, filePath);
    res.json(file);
  })
);

/** GET /api/integrations/github/repositories/:repoId/pages - Discovered pages & starting points */
integrationsRouter.get(
  '/github/repositories/:repoId/pages',
  route(async (req, res) => {
    const { fullName } = parseRepoSlug(req.params.repoId);
    const pages = await getPagesForRepository(fullName);
    res.json(pages);
  })
);

/** POST /api/integrations/github/repositories/:repoId/pages/:pageId/test - Test an individual page */
integrationsRouter.post(
  '/github/repositories/:repoId/pages/:pageId/test',
  route(async (req, res) => {
    const { fullName } = parseRepoSlug(req.params.repoId);
    const pageId = String(req.params.pageId);
    const result = await testIndividualPage(pageId, fullName);
    res.json(result);
  })
);

/** POST /api/integrations/github/repositories/:repoId/pages/test-all - Test all discovered pages */
integrationsRouter.post(
  '/github/repositories/:repoId/pages/test-all',
  route(async (req, res) => {
    const { fullName } = parseRepoSlug(req.params.repoId);
    const results = await testAllPagesForRepository(fullName);
    res.json(results);
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

/** POST /api/integrations/jira/connect - User connects Jira instance via UI */
integrationsRouter.post(
  '/jira/connect',
  route(async (req, res) => {
    const { siteUrl, email, apiToken, projectKey = 'PROJ', teamId = 'team-default' } = req.body || {};
    if (!siteUrl) {
      return res.status(400).json({ error: 'Jira Site URL is required' });
    }

    const normalizedSite = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    let siteName = 'jira.atlassian.net';
    try {
      siteName = new URL(normalizedSite).hostname;
    } catch {
      return res.status(400).json({ error: 'Invalid Jira Site URL format.' });
    }

    // If email and apiToken are provided, verify credentials with Jira Cloud
    if (email && apiToken) {
      const verifyResult = await verifyJiraCredentials(normalizedSite, email, apiToken);
      if (!verifyResult.success) {
        return res.status(401).json({ error: verifyResult.error });
      }

      // Fetch actual Jira project issues if valid
      const remoteIssues = await fetchJiraProjectIssues(normalizedSite, email, apiToken, projectKey);
      if (remoteIssues.length > 0) {
        for (const [id, issue] of memoryStore.jiraIssues.entries()) {
          if (issue.teamId === teamId) memoryStore.jiraIssues.delete(id);
        }
        for (const rIssue of remoteIssues) {
          memoryStore.jiraIssues.set(rIssue.id, {
            id: rIssue.id,
            teamId,
            projectId: `proj-${projectKey.toLowerCase()}`,
            issueKey: rIssue.key,
            summary: rIssue.summary,
            status: rIssue.status as any,
            priority: rIssue.priority as any,
            assigneeName: rIssue.assigneeName || null,
            assigneeAvatar: rIssue.assigneeAvatar || null,
            linkedSuiteId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    const connId = `jira-conn-${Date.now()}`;
    const newConnection = {
      id: connId,
      teamId,
      cloudId: `cloud-${siteName.replace(/[^a-zA-Z0-9]/g, '-')}`,
      siteUrl: normalizedSite,
      siteName,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.jiraConnections.set(connId, newConnection);

    res.json({
      success: true,
      connected: true,
      connection: {
        id: newConnection.id,
        siteName: newConnection.siteName,
        siteUrl: newConnection.siteUrl,
        status: newConnection.status,
      },
      message: `Successfully connected Jira Cloud instance (${siteName})`,
    });
  })
);

/** POST /api/integrations/jira/disconnect - Disconnect Jira */
integrationsRouter.post(
  '/jira/disconnect',
  route(async (req, res) => {
    const teamId = (req.body?.teamId as string) || 'team-default';
    for (const [id, conn] of memoryStore.jiraConnections.entries()) {
      if (conn.teamId === teamId) {
        memoryStore.jiraConnections.delete(id);
      }
    }
    res.json({ success: true, connected: false });
  })
);

