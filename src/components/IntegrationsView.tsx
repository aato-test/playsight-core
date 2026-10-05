import React from 'react';
import { Layers, CheckCircle2, GitPullRequest, Terminal, ExternalLink } from 'lucide-react';

interface IntegrationsViewProps {
  currentBranch: string;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ currentBranch }) => {
  const integrations = [
    {
      id: 'jira',
      name: 'Atlassian Jira Software',
      category: 'Traceability & Issue Tracking',
      status: 'connected',
      details: 'Syncing CHK & AUTH epics · Bi-directional status callback',
      syncFrequency: 'Every 30 seconds',
    },
    {
      id: 'github',
      name: 'GitHub Actions CI',
      category: 'CI/CD Automation Pipeline',
      status: 'connected',
      details: `Active branch: ${currentBranch} · Webhook triggers on PR commit`,
      syncFrequency: 'Event-driven',
    },
    {
      id: 'playwright',
      name: 'Playwright Browser Runner Engine',
      category: 'Headless Browser Execution',
      status: 'connected',
      details: 'Chromium 124, Firefox 125, WebKit 17.4 runtime drivers installed',
      syncFrequency: 'On-demand execution',
    },
    {
      id: 'slack',
      name: 'Slack Alerts & PagerDuty',
      category: 'Incident & Failure Telemetry',
      status: 'configured',
      details: '#qa-regression-alerts channel webhook active',
      syncFrequency: 'On test failure threshold',
    },
  ];

  return (
    <div
      id="integrations-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-[#F8FAFC]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Workspace Integrations
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Connected quality engineering pipelines & services · <span className="text-teal-400">{currentBranch}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="rounded border border-[#1E293B] bg-[#0F172A] p-4 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F8FAFC] font-mono">{item.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Connected
                </span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">{item.category}</div>
              <p className="text-xs text-[#94A3B8] font-mono mt-2 bg-[#020617] p-2.5 rounded border border-[#1E293B]">
                {item.details}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>Sync: {item.syncFrequency}</span>
              <span className="text-teal-400">Settings</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
