export interface GitHubAppInfo {
  id: string;
  name: string;
  slug: string;
  clientId: string;
  isConfigured: boolean;
  installUrl: string;
}

export interface GitHubInstallationMetadata {
  id: string;
  installationId: number;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  avatarUrl: string | null;
  status: 'active' | 'suspended' | 'deleted';
  installedAt: string;
}

export interface GitHubRepositoryMetadata {
  id: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
  description: string | null;
  branchesCount?: number;
  updatedAt: string;
}

export interface GitHubBranchMetadata {
  id: string;
  name: string;
  commitSha: string;
  commitMessage: string | null;
  isProtected: boolean;
  lastCommitAt: string | null;
}

export interface PushWebhookPayload {
  ref: string;
  before: string;
  after: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: { name?: string; login: string };
    private: boolean;
    html_url: string;
    default_branch: string;
  };
  pusher: {
    name: string;
    email?: string;
  };
  commits: {
    id: string;
    message: string;
    timestamp: string;
    url: string;
    author: { name: string; email: string };
  }[];
  head_commit: {
    id: string;
    message: string;
    timestamp: string;
    url: string;
    author: { name: string; email: string };
  } | null;
  installation?: {
    id: number;
  };
}

export interface PullRequestWebhookPayload {
  action: 'opened' | 'synchronize' | 'reopened' | 'closed' | string;
  number: number;
  pull_request: {
    id: number;
    number: number;
    title: string;
    state: string;
    html_url: string;
    head: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        full_name: string;
      };
    };
    base: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        full_name: string;
      };
    };
    user: {
      login: string;
    };
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: { login: string };
    html_url: string;
  };
  installation?: {
    id: number;
  };
}

export interface InstallationWebhookPayload {
  action: 'created' | 'deleted' | 'suspend' | 'unsuspend' | 'new_permissions_accepted';
  installation: {
    id: number;
    account: {
      login: string;
      type: string;
      avatar_url: string;
      id: number;
    };
    permissions: Record<string, string>;
    events: string[];
    target_id: number;
  };
  repositories?: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  }[];
}
