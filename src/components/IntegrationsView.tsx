import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  Github,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Unlink,
  Radio,
  FolderGit2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  fetchGitHubStatus,
  getGitHubInstallUrl,
  disconnectGitHub,
  fetchGitHubRepositories,
  fetchGitHubBranches,
  syncGitHubBranches,
  fetchJiraStatus,
} from '../services/api';
import { GitHubStatusResponse, GitHubRepository, GitHubBranch, JiraStatusResponse } from '../types';

interface IntegrationsViewProps {
  currentBranch?: string;
  onRefreshWorkspace?: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  currentBranch = 'main',
  onRefreshWorkspace,
}) => {
  const [githubStatus, setGithubStatus] = useState<GitHubStatusResponse | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [jiraStatus, setJiraStatus] = useState<JiraStatusResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gh, repos, jira] = await Promise.all([
        fetchGitHubStatus(),
        fetchGitHubRepositories(),
        fetchJiraStatus(),
      ]);

      if (gh) setGithubStatus(gh);
      if (repos) {
        setRepositories(repos);
        if (repos.length > 0 && !selectedRepoId) {
          setSelectedRepoId(repos[0].id);
        }
      }
      if (jira) setJiraStatus(jira);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRepoId) {
      fetchGitHubBranches(selectedRepoId).then((br) => {
        if (br) setBranches(br);
      });
    }
  }, [selectedRepoId]);

  const handleConnectGitHub = async () => {
    setIsLoading(true);
    try {
      const url = await getGitHubInstallUrl();
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setNotice({
          type: 'success',
          message: 'GitHub App installation window opened. Complete the authorization and click Refresh.',
        });
      } else {
        setNotice({
          type: 'error',
          message: 'Could not generate GitHub App installation URL.',
        });
      }
    } catch {
      setNotice({
        type: 'error',
        message: 'Network error communicating with backend.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (!window.confirm('Are you sure you want to disconnect the GitHub App integration?')) {
      return;
    }
    setIsLoading(true);
    try {
      const ok = await disconnectGitHub();
      if (ok) {
        setGithubStatus(null);
        setRepositories([]);
        setBranches([]);
        setSelectedRepoId(null);
        setNotice({
          type: 'success',
          message: 'GitHub App integration disconnected successfully.',
        });
        if (onRefreshWorkspace) onRefreshWorkspace();
      } else {
        setNotice({
          type: 'error',
          message: 'Failed to disconnect GitHub App.',
        });
      }
    } catch {
      setNotice({
        type: 'error',
        message: 'Network error disconnecting GitHub App.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncBranches = async (repoId: string) => {
    setIsSyncing(true);
    try {
      const updated = await syncGitHubBranches(repoId);
      if (updated) {
        setBranches(updated);
        setNotice({
          type: 'success',
          message: `Branches re-synced successfully (${updated.length} branches discovered).`,
        });
      }
    } catch {
      setNotice({
        type: 'error',
        message: 'Failed to sync branches from GitHub.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const isGitHubConnected = Boolean(githubStatus?.connected);
  const isJiraConnected = Boolean(jiraStatus?.connected);

  return (
    <div
      id="integrations-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-900"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Integrations & Quality Pipelines
            </h1>
          </div>
          <p className="text-sm md:text-base font-medium text-slate-600 mt-1.5">
            Connect GitHub, Jira and other tools · CI/CD triggers, branch sync, and requirement traceability.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Notification Banner */}
      {notice && (
        <div
          className={`p-4.5 rounded-2xl border text-sm font-medium flex items-center justify-between transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-500 hover:text-slate-800 text-xs font-bold px-2 py-0.5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* =========================================
            1. GitHub App Integration Card
            ========================================= */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <Github className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    GitHub App
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
                      Official App
                    </span>
                  </h3>
                  <p className="text-sm text-slate-600">Repositories, branches & automated webhook triggers</p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                  isGitHubConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isGitHubConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {isGitHubConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {/* Connection Details */}
            {isGitHubConnected && githubStatus?.installation ? (
              <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Target Account:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {githubStatus.installation.accountLogin}
                    <span className="text-xs px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300 font-mono">
                      {githubStatus.installation.accountType}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Installation ID:</span>
                  <span className="font-mono font-medium text-slate-900">#{githubStatus.installation.installationId}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Accessible Repositories:</span>
                  <span className="font-bold text-indigo-700">{repositories.length} synced</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Webhooks:</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-mono text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    HMAC Verified (push, PR)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  Connect PlaySight with your GitHub account or organization via the official GitHub App.
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm space-y-1.5">
                  <li>Automatic discovery of accessible repositories and branches</li>
                  <li>Automated test execution on <code className="text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300">push</code> and <code className="text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300">pull_request</code></li>
                  <li>Secure server-side token management (zero client credentials stored)</li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {isGitHubConnected ? (
              <>
                <button
                  onClick={handleConnectGitHub}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Configure App Permissions
                </button>
                <button
                  onClick={handleDisconnectGitHub}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-sm font-bold transition-colors cursor-pointer"
                >
                  <Unlink className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectGitHub}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <Github className="w-4.5 h-4.5" />
                Connect GitHub App
              </button>
            )}
          </div>
        </div>

        {/* =========================================
            2. Atlassian Jira Cloud Integration Card
            ========================================= */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Atlassian Jira Cloud
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
                      OAuth 2.0 / API
                    </span>
                  </h3>
                  <p className="text-sm text-slate-600">Traceability, issue linkage & bidirectional test gate sync</p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                  isJiraConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isJiraConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {isJiraConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {/* Jira Details */}
            {isJiraConnected && jiraStatus?.connection ? (
              <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Connected Site:</span>
                  <span className="font-bold text-slate-900">{jiraStatus.connection.siteName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Site URL:</span>
                  <span className="font-mono text-blue-700 text-xs truncate max-w-[240px] font-bold">
                    {jiraStatus.connection.siteUrl}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Linked Issues:</span>
                  <span className="font-bold text-emerald-700">{jiraStatus.issuesCount} active issues</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500">Sync Pipeline:</span>
                  <span className="text-slate-900 font-mono text-xs font-bold">Real-time Bi-directional</span>
                </div>
              </div>
            ) : (
              <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  Connect PlaySight with your Jira Cloud instance to attach PlaySight test suites and test runs directly to Jira user stories and bugs.
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm space-y-1.5">
                  <li>Link individual test cases to Jira issue keys (e.g. <code className="text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300">CHK-184</code>)</li>
                  <li>View release gate status and test passes directly on Jira Kanban cards</li>
                  <li>Auto-heal failing selectors with conflict resolution</li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {isJiraConnected ? (
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                Active Jira Cloud Session
              </span>
            ) : (
              <button
                onClick={loadData}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Radio className="w-4.5 h-4.5" />
                Configure Jira Cloud Connection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discovered GitHub Repositories & Branches Explorer */}
      {repositories.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Discovered GitHub Repositories & Branches
              </h3>
            </div>
            {selectedRepoId && (
              <button
                onClick={() => handleSyncBranches(selectedRepoId)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                Sync Branches
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Repositories List */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block px-1">
                Repositories ({repositories.length})
              </span>
              <div className="space-y-2">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => setSelectedRepoId(repo.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedRepoId === repo.id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate">{repo.fullName}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-medium">
                      <span>Default: <code className="text-indigo-700 font-bold">{repo.defaultBranch}</code></span>
                      <span className="text-slate-400">{repo.isPrivate ? 'Private' : 'Public'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Discovered Branches for Selected Repo */}
            <div className="md:col-span-2 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block px-1">
                Discovered Branches ({branches.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      b.name === currentBranch
                        ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-500/10'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5 truncate">
                        <GitBranch className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {b.name}
                      </span>
                      {b.isProtected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Protected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5 font-mono flex items-center justify-between">
                      <span>SHA: <span className="font-semibold text-slate-700">{b.commitSha.slice(0, 7)}</span></span>
                      {b.name === currentBranch && (
                        <span className="text-indigo-700 text-xs font-bold">Active Branch</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
