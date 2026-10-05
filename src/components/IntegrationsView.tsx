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
        message: 'Failed to initiate GitHub connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (!window.confirm('Disconnect GitHub App from this workspace? Repository webhooks will stop triggering runs.')) {
      return;
    }
    setIsLoading(true);
    try {
      const ok = await disconnectGitHub();
      if (ok) {
        await loadData();
        onRefreshWorkspace?.();
        setNotice({ type: 'success', message: 'GitHub App disconnected successfully.' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Failed to disconnect GitHub.' });
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
        setNotice({ type: 'success', message: `Synchronized ${updated.length} branches from GitHub.` });
        onRefreshWorkspace?.();
      }
    } catch {
      setNotice({ type: 'error', message: 'Failed to sync branches.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const isGitHubConnected = Boolean(githubStatus?.connected);
  const isJiraConnected = Boolean(jiraStatus?.connected);

  return (
    <div
      id="integrations-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full font-sans text-slate-100"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            Integrations & Quality Pipelines
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect your team's GitHub App and Atlassian Jira Cloud for automated CI/CD triggering and traceability.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Notification Banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 space-y-4 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-inner">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    GitHub App
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Official App
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Repositories, branches & automated webhook triggers</p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  isGitHubConnected
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isGitHubConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                {isGitHubConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {/* Connection Details */}
            {isGitHubConnected && githubStatus?.installation ? (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Target Account:</span>
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    {githubStatus.installation.accountLogin}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {githubStatus.installation.accountType}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Installation ID:</span>
                  <span className="font-mono text-slate-300">#{githubStatus.installation.installationId}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Accessible Repositories:</span>
                  <span className="font-medium text-indigo-300">{repositories.length} synced</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Webhooks:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    HMAC Verified (push, PR)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <p>
                  Connect PlaySight with your GitHub account or organization via the official GitHub App.
                </p>
                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                  <li>Automatic discovery of accessible repositories and branches</li>
                  <li>Automated test execution on <code className="text-slate-300">push</code> and <code className="text-slate-300">pull_request</code></li>
                  <li>Secure server-side token management (zero client credentials)</li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            {isGitHubConnected ? (
              <>
                <button
                  onClick={handleConnectGitHub}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Configure App Permissions
                </button>
                <button
                  onClick={handleDisconnectGitHub}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs transition-colors cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectGitHub}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
              >
                <Github className="w-4 h-4" />
                Connect GitHub App
              </button>
            )}
          </div>
        </div>

        {/* =========================================
            2. Atlassian Jira Cloud Integration Card
            ========================================= */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 space-y-4 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    Atlassian Jira Cloud
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      OAuth 2.0 (3LO)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Traceability, issue linkage & bidirectional test gate sync</p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  isJiraConnected
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isJiraConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                {isJiraConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {/* Jira Details */}
            {isJiraConnected && jiraStatus?.connection ? (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Connected Site:</span>
                  <span className="font-semibold text-white">{jiraStatus.connection.siteName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Site URL:</span>
                  <span className="font-mono text-blue-300 text-[11px] truncate max-w-[220px]">
                    {jiraStatus.connection.siteUrl}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Linked Issues:</span>
                  <span className="font-medium text-emerald-300">{jiraStatus.issuesCount} active issues</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Sync Pipeline:</span>
                  <span className="text-slate-300 font-mono text-[11px]">Real-time Status Sync</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <p>
                  Connect PlaySight with your Jira Cloud instance to attach PlaySight test suites and test runs directly to Jira user stories and bugs.
                </p>
                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                  <li>Link individual test cases to Jira issue keys (e.g. <code className="text-slate-300">CHK-184</code>)</li>
                  <li>View release gate status directly in your Jira Kanban boards</li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            {isJiraConnected ? (
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Active Jira Cloud Session
              </span>
            ) : (
              <button
                onClick={() => alert('Jira Cloud OAuth flow is ready.')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                Connect Jira Cloud
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discovered GitHub Repositories & Branches Explorer */}
      {repositories.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Discovered GitHub Repositories & Branches
              </h3>
            </div>
            {selectedRepoId && (
              <button
                onClick={() => handleSyncBranches(selectedRepoId)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Branches
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Repositories List */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block px-1">
                Repositories ({repositories.length})
              </span>
              <div className="space-y-1.5">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => setSelectedRepoId(repo.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedRepoId === repo.id
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold truncate">{repo.fullName}</div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Default: <code className="text-indigo-300">{repo.defaultBranch}</code></span>
                      <span>{repo.isPrivate ? 'Private' : 'Public'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Discovered Branches for Selected Repo */}
            <div className="md:col-span-2 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block px-1">
                Discovered Branches ({branches.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border bg-slate-950/60 text-xs transition-all ${
                      b.name === currentBranch
                        ? 'border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-white flex items-center gap-1.5 truncate">
                        <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        {b.name}
                      </span>
                      {b.isProtected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Protected
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center justify-between">
                      <span>SHA: <span className="text-slate-300">{b.commitSha.slice(0, 7)}</span></span>
                      {b.name === currentBranch && (
                        <span className="text-indigo-400 text-[10px] font-semibold">Active Workspace</span>
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
