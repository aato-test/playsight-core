/**
 * Jira Cloud REST API Client
 * Supports verifying API tokens, fetching projects, and syncing Jira issues
 */

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

export interface JiraIssueResult {
  id: string;
  key: string;
  summary: string;
  status: string;
  priority: string;
  assigneeName?: string;
  assigneeAvatar?: string;
}

export interface JiraAuthVerifyResult {
  success: boolean;
  user?: {
    accountId: string;
    displayName: string;
    emailAddress: string;
  };
  error?: string;
}

/**
 * Verify credentials with Jira Cloud using Basic Auth (Email + API Token)
 */
export async function verifyJiraCredentials(
  siteUrl: string,
  email: string,
  apiToken: string
): Promise<JiraAuthVerifyResult> {
  const normalizedSite = siteUrl.replace(/\/+$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${normalizedSite}/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 401) {
        return {
          success: false,
          error: 'Jira Authentication Failed (401): Invalid Atlassian email or API token.',
        };
      }
      if (res.status === 403) {
        return {
          success: false,
          error: 'Jira Permission Denied (403): Account does not have API access to this site.',
        };
      }
      return {
        success: false,
        error: `Jira Cloud responded with HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      user: {
        accountId: data.accountId || 'jira-user',
        displayName: data.displayName || email,
        emailAddress: data.emailAddress || email,
      },
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: `Connection timed out while reaching ${normalizedSite}. Please check the site URL.`,
      };
    }
    return {
      success: false,
      error: `Could not connect to Jira instance: ${err.message || 'Network error'}`,
    };
  }
}

/**
 * Fetch accessible Jira issues for a given project key
 */
export async function fetchJiraProjectIssues(
  siteUrl: string,
  email: string,
  apiToken: string,
  projectKey: string
): Promise<JiraIssueResult[]> {
  const normalizedSite = siteUrl.replace(/\/+$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64');
  const cleanKey = projectKey.trim().toUpperCase();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const searchUrl = `${normalizedSite}/rest/api/3/search?jql=${encodeURIComponent(
      `project = "${cleanKey}" ORDER BY updated DESC`
    )}&maxResults=25&fields=summary,status,priority,assignee`;

    const res = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.issues || !Array.isArray(data.issues)) return [];

    return data.issues.map((item: any) => ({
      id: item.id || `jira-${item.key}`,
      key: item.key,
      summary: item.fields?.summary || 'Untitled Jira Story',
      status: (item.fields?.status?.name || 'in_progress').toLowerCase().replace(/\s+/g, '_'),
      priority: (item.fields?.priority?.name || 'medium').toLowerCase(),
      assigneeName: item.fields?.assignee?.displayName || undefined,
      assigneeAvatar: item.fields?.assignee?.avatarUrls?.['48x48'] || undefined,
    }));
  } catch (err) {
    console.warn('Could not fetch issues from Jira Cloud:', err);
    return [];
  }
}
