import { generateAppJwt, isGitHubAppConfigured } from './app';

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache = new Map<number, CachedToken>();

/** Obtains an authenticated installation access token from GitHub */
export async function getInstallationAccessToken(installationId: number): Promise<string> {
  const cached = tokenCache.get(installationId);
  // Cache with 2-minute safety window
  if (cached && cached.expiresAt > Date.now() + 120_000) {
    return cached.token;
  }

  if (!isGitHubAppConfigured()) {
    // Development fallback mock token if no GitHub App credentials are set
    return `ghs_dev_token_${installationId}_mock`;
  }

  const jwt = generateAppJwt();
  const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PlaySight-Core-Automation',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create GitHub installation token (${res.status}): ${errorText}`);
  }

  const data = (await res.json()) as { token: string; expires_at: string };
  const expiresAt = new Date(data.expires_at).getTime();
  tokenCache.set(installationId, { token: data.token, expiresAt });

  return data.token;
}

/** Executes authenticated GitHub REST API request */
export async function githubApiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  installationId?: number
): Promise<T> {
  let authHeader = '';

  if (installationId) {
    const token = await getInstallationAccessToken(installationId);
    authHeader = `token ${token}`;
  } else if (isGitHubAppConfigured()) {
    const jwt = generateAppJwt();
    authHeader = `Bearer ${jwt}`;
  }

  const url = endpoint.startsWith('https://') ? endpoint : `https://api.github.com${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'PlaySight-Core-Automation',
    ...(options.headers as Record<string, string>),
  };

  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API ${options.method || 'GET'} ${endpoint} failed (${res.status}): ${errText}`);
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}
