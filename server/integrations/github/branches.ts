import { eq } from 'drizzle-orm';
import { db, hasDatabase } from '../../db';
import { githubBranches, githubRepositories, githubInstallations, type GitHubBranchRow } from '../../db/schema';
import { memoryStore } from '../../db/memoryStore';
import { githubApiFetch } from './client';
import type { GitHubBranchMetadata } from './types';

export function toBranchDTO(row: GitHubBranchRow): GitHubBranchMetadata {
  return {
    id: row.id,
    name: row.name,
    commitSha: row.commitSha,
    commitMessage: row.commitMessage,
    isProtected: row.isProtected,
    lastCommitAt: row.lastCommitAt ? row.lastCommitAt.toISOString() : null,
  };
}

/** Lists synchronized branches for a repository */
export async function listBranchesForRepository(
  repoId: string,
  teamId: string = 'team-default'
): Promise<GitHubBranchMetadata[]> {
  if (hasDatabase && db) {
    const [repo] = await db
      .select()
      .from(githubRepositories)
      .where(eq(githubRepositories.id, repoId));
    if (!repo || repo.teamId !== teamId) return [];

    const rows = await db
      .select()
      .from(githubBranches)
      .where(eq(githubBranches.repositoryId, repoId));
    return rows.map(toBranchDTO);
  }

  const repo = memoryStore.repositories.get(repoId);
  if (!repo || repo.teamId !== teamId) return [];

  const branches = Array.from(memoryStore.branches.values()).filter(
    (b) => b.repositoryId === repoId
  );
  return branches.map(toBranchDTO);
}

/** Synchronizes branches from GitHub for a given repository */
export async function syncBranchesForRepository(
  repoId: string,
  teamId: string = 'team-default',
  passedInstallationId?: number
): Promise<GitHubBranchMetadata[]> {
  let ownerLogin = '';
  let repoName = '';
  let installationId = passedInstallationId;

  if (hasDatabase && db) {
    const [repo] = await db
      .select()
      .from(githubRepositories)
      .where(eq(githubRepositories.id, repoId));
    if (!repo || repo.teamId !== teamId) return [];
    ownerLogin = repo.ownerLogin;
    repoName = repo.name;

    if (!installationId) {
      const [inst] = await db
        .select()
        .from(githubInstallations)
        .where(eq(githubInstallations.id, repo.installationId));
      if (inst) installationId = inst.installationId;
    }
  } else {
    const repo = memoryStore.repositories.get(repoId);
    if (!repo || repo.teamId !== teamId) return [];
    ownerLogin = repo.ownerLogin;
    repoName = repo.name;
    if (!installationId) {
      const inst = memoryStore.installations.get(repo.installationId);
      if (inst) installationId = inst.installationId;
    }
  }

  let ghBranches: {
    name: string;
    commit: { sha: string; url: string };
    protected: boolean;
  }[] = [];

  try {
    ghBranches = await githubApiFetch<
      { name: string; commit: { sha: string; url: string }; protected: boolean }[]
    >(`/repos/${ownerLogin}/${repoName}/branches?per_page=100`, {}, installationId);
  } catch {
    // Development fallback if GitHub API call fails or is offline
    const existing = Array.from(memoryStore.branches.values()).filter(
      (b) => b.repositoryId === repoId
    );
    if (existing.length) return existing.map(toBranchDTO);
    ghBranches = [
      { name: 'main', commit: { sha: '1c54b15', url: '' }, protected: true },
    ];
  }

  const results: GitHubBranchMetadata[] = [];
  const now = new Date();

  for (const b of ghBranches) {
    const branchId = `${repoId}-${b.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const row: GitHubBranchRow = {
      id: branchId,
      repositoryId: repoId,
      name: b.name,
      commitSha: b.commit.sha,
      commitMessage: null,
      isProtected: b.protected || false,
      lastCommitAt: now,
      updatedAt: now,
    };

    if (hasDatabase && db) {
      const [existing] = await db
        .select()
        .from(githubBranches)
        .where(eq(githubBranches.id, branchId));
      if (existing) {
        await db
          .update(githubBranches)
          .set({ commitSha: b.commit.sha, isProtected: b.protected, updatedAt: now })
          .where(eq(githubBranches.id, branchId));
      } else {
        await db.insert(githubBranches).values(row);
      }
    } else {
      memoryStore.branches.set(branchId, row);
    }

    results.push(toBranchDTO(row));
  }

  return results;
}
