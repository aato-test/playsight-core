import crypto from 'node:crypto';
import { env } from '../../env';
import type { GitHubAppInfo } from './types';

function base64Url(data: string | Buffer): string {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return buf.toString('base64url');
}

/** Determines if GitHub App environment credentials are configured */
export function isGitHubAppConfigured(): boolean {
  return Boolean(env.githubAppId && env.githubAppPrivateKey);
}

/** Generates RS256 signed JWT for authenticating as the GitHub App */
export function generateAppJwt(): string {
  if (!isGitHubAppConfigured()) {
    throw new Error('GitHub App is not configured. GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are required.');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60, // 60 seconds clock drift allowance
    exp: now + 540, // 9 minutes validity (GitHub max is 10)
    iss: env.githubAppId,
  };

  const header = { alg: 'RS256', typ: 'JWT' };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const toSign = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(toSign);
  signer.end();
  const signature = signer.sign(env.githubAppPrivateKey);

  return `${toSign}.${base64Url(signature)}`;
}

/** Generates GitHub App installation URL */
export function getAppInstallationUrl(state: string = 'team-default'): string {
  const appSlug = env.githubAppName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `https://github.com/apps/${appSlug}/installations/new?state=${encodeURIComponent(state)}`;
}

/** Safe GitHub App info returned to client (never exposes private key) */
export function getGitHubAppInfo(): GitHubAppInfo {
  return {
    id: env.githubAppId,
    name: env.githubAppName,
    slug: env.githubAppName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    clientId: env.githubAppClientId,
    isConfigured: isGitHubAppConfigured(),
    installUrl: getAppInstallationUrl(),
  };
}
