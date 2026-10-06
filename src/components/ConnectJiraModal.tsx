import React, { useState } from 'react';
import {
  X,
  Radio,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Unlink,
} from 'lucide-react';
import { JiraStatusResponse } from '../types';

interface ConnectJiraModalProps {
  isOpen: boolean;
  onClose: () => void;
  jiraStatus: JiraStatusResponse | null;
  onConnectionSuccess: () => void;
}

export const ConnectJiraModal: React.FC<ConnectJiraModalProps> = ({
  isOpen,
  onClose,
  jiraStatus,
  onConnectionSuccess,
}) => {
  const [siteUrl, setSiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [projectKey, setProjectKey] = useState('QA');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConnected = Boolean(jiraStatus?.connected);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUrl) {
      setError('Please provide your Jira Cloud instance URL (e.g. https://your-company.atlassian.net)');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/integrations/jira/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl,
          email,
          apiToken,
          projectKey: projectKey.trim().toUpperCase(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to connect Jira Cloud');
      }

      onConnectionSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please check site URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Jira Cloud from this workspace?')) return;
    setIsLoading(true);
    try {
      await fetch('/api/integrations/jira/disconnect', { method: 'POST' });
      onConnectionSuccess();
      onClose();
    } catch (err) {
      console.warn('Disconnect error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans text-slate-800">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                {isConnected ? 'Jira Cloud Connection' : 'Connect Jira Cloud'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isConnected ? 'Active Atlassian Integration' : 'Link user stories with automated test suites'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Jira Instance Connected:</div>
                  <div className="font-mono text-[11px] mt-0.5 text-emerald-800">
                    {jiraStatus?.connection?.siteUrl}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    Status: <span className="font-semibold uppercase">Active</span> · Linked to current team workspace
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Unlink className="w-4 h-4" />
                  <span>Disconnect Jira</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium leading-relaxed">
                Connect your team's Jira Cloud instance to associate PlaySight regression test runs with Jira user stories, bug tickets, and release gates.
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jira Cloud Instance URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://your-company.atlassian.net"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-blue-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Atlassian Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Default Project Key
                  </label>
                  <input
                    type="text"
                    value={projectKey}
                    onChange={(e) => setProjectKey(e.target.value)}
                    placeholder="e.g. QA or PROJ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  API Token / OAuth Client Secret
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Atlassian User API Token"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-blue-600 bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Managed server-side; credentials are never exposed to client browsers.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Connecting...' : 'Connect Jira'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
