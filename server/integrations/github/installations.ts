import { eq } from 'drizzle-orm';
import { db, hasDatabase } from '../../db';
import { githubInstallations, type GitHubInstallationRow } from '../../db/schema';
import { memoryStore } from '../../db/memoryStore';
import { githubApiFetch } from './client';
import { syncRepositoriesForInstallation } from './repositories';
import type { GitHubInstallationMetadata } from './types';

export function toInstallationDTO(row: GitHubInstallationRow): GitHubInstallationMetadata {
  return {
    id: row.id,
    installationId: row.installationId,
    accountLogin: row.accountLogin,
    accountType: row.accountType as 'User' | 'Organization',
    avatarUrl: row.avatarUrl,
    status: row.status as 'active' | 'suspended' | 'deleted',
    installedAt: row.installedAt.toISOString(),
  };
}

/** Retrieve active GitHub installation for a team */
export async function getInstallationForTeam(teamId: string = 'team-default'): Promise<GitHubInstallationMetadata | null> {
  if (hasDatabase && db) {
    const [row] = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.teamId, teamId));
    if (!row || row.status === 'deleted') return null;
    return toInstallationDTO(row);
  }

  const list = Array.from(memoryStore.installations.values()).filter(
    (i) => i.teamId === teamId && i.status !== 'deleted'
  );
  return list[0] ? toInstallationDTO(list[0]) : null;
}

/** Retrieve installation row by numeric GitHub installation ID */
export async function getInstallationById(installationId: number): Promise<GitHubInstallationRow | null> {
  if (hasDatabase && db) {
    const [row] = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.installationId, installationId));
    return row ?? null;
  }

  const list = Array.from(memoryStore.installations.values()).filter(
    (i) => i.installationId === installationId
  );
  return list[0] ?? null;
}

/** Registers or updates a GitHub App installation for a team and triggers repo discovery */
export async function registerInstallation(input: {
  teamId: string;
  installationId: number;
  accountLogin?: string;
  accountType?: 'User' | 'Organization';
  avatarUrl?: string;
  targetId?: number;
  permissions?: Record<string, string>;
  events?: string[];
}): Promise<GitHubInstallationMetadata> {
  let accountLogin = input.accountLogin;
  let accountType = input.accountType || 'User';
  let avatarUrl = input.avatarUrl || null;
  let targetId = input.targetId || null;
  let permissions = input.permissions || {};
  let events = input.events || [];

  // Fetch installation metadata from GitHub if missing
  try {
    const ghInst = await githubApiFetch<{
      account: { login: string; type: string; avatar_url: string; id: number };
      permissions: Record<string, string>;
      events: string[];
      target_id: number;
    }>(`/app/installations/${input.installationId}`);

    accountLogin = ghInst.account.login;
    accountType = ghInst.account.type === 'Organization' ? 'Organization' : 'User';
    avatarUrl = ghInst.account.avatar_url;
    targetId = ghInst.target_id;
    permissions = ghInst.permissions;
    events = ghInst.events;
  } catch {
    // If running in development without live GitHub App, retain defaults
    accountLogin ??= 'aato-test';
  }

  const id = `gh-inst-${input.installationId}`;
  const now = new Date();

  const row: GitHubInstallationRow = {
    id,
    teamId: input.teamId,
    installationId: input.installationId,
    accountLogin: accountLogin || 'unknown',
    accountType,
    avatarUrl,
    targetId,
    permissions,
    events,
    status: 'active',
    installedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  if (hasDatabase && db) {
    const existing = await getInstallationById(input.installationId);
    if (existing) {
      await db
        .update(githubInstallations)
        .set({ ...row, updatedAt: now })
        .where(eq(githubInstallations.id, existing.id));
    } else {
      await db.insert(githubInstallations).values(row);
    }
  } else {
    memoryStore.installations.set(id, row);
  }

  // Auto-discover accessible repositories
  await syncRepositoriesForInstallation(input.installationId, input.teamId).catch((err) =>
    console.error('[github] failed to sync repositories on install', err)
  );

  return toInstallationDTO(row);
}

/** Disconnects the GitHub installation from the team */
export async function disconnectTeamInstallation(teamId: string = 'team-default'): Promise<boolean> {
  if (hasDatabase && db) {
    const [row] = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.teamId, teamId));
    if (!row) return false;
    await db
      .update(githubInstallations)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(eq(githubInstallations.id, row.id));
    return true;
  }

  for (const [id, inst] of memoryStore.installations.entries()) {
    if (inst.teamId === teamId) {
      inst.status = 'deleted';
      memoryStore.installations.set(id, inst);
      return true;
    }
  }
  return false;
}
