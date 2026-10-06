import React from 'react';
import { Server, Globe, Shield, CheckCircle2, RefreshCw, ExternalLink, Activity, Cpu } from 'lucide-react';

interface EnvironmentsViewProps {
  currentEnvironment: 'local' | 'staging' | 'production';
  onEnvironmentChange: (env: 'local' | 'staging' | 'production') => void;
  currentBranch: string;
}

export const EnvironmentsView: React.FC<EnvironmentsViewProps> = ({
  currentEnvironment,
  onEnvironmentChange,
  currentBranch,
}) => {
  const envConfigs = [
    {
      id: 'local',
      name: 'Local Dev Worker',
      type: 'Localhost Node Server',
      url: 'http://localhost:3000',
      status: 'healthy',
      workers: '2 Playwright processes',
      latency: '24ms',
      lastPing: '3s ago',
      features: ['Live reload & Hot Module Replacement', 'Headful debugging mode enabled', 'Local mock test data & credentials'],
    },
    {
      id: 'staging',
      name: 'Staging Kubernetes Pod',
      type: 'Cloud Container Cluster',
      url: 'https://staging.app.example.com',
      status: 'healthy',
      workers: '8 Playwright runners',
      latency: '42ms',
      lastPing: '1s ago',
      features: ['SCA Stripe test sandbox integration', 'OAuth SAML identity simulator', 'Nightly automated regression suite'],
    },
    {
      id: 'production',
      name: 'Production Canary Pool',
      type: 'Live Global Ingress',
      url: 'https://app.example.com',
      status: 'monitored',
      workers: '4 Read-only synthetic runners',
      latency: '36ms',
      lastPing: '5s ago',
      features: ['Synthetic health & uptime pings', 'Restricted assert-only read mode', 'Zero database write operations allowed'],
    },
  ];

  return (
    <div
      id="environments-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-900"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Server className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Target Execution Environments
            </h1>
          </div>
          <p className="text-sm md:text-base font-medium text-slate-600 mt-1.5">
            Browser execution runners & base URL configurations for branch <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">{currentBranch}</span>
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {envConfigs.map((env) => {
          const isSelected = currentEnvironment === env.id;
          return (
            <div
              key={env.id}
              className={`rounded-2xl border-2 bg-white p-6 flex flex-col justify-between space-y-5 transition-all shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900 block">
                      {env.name}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      {env.type}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                      Standby
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono font-bold text-indigo-950 bg-slate-100 p-3 rounded-xl border border-slate-200 truncate flex items-center justify-between">
                  <span className="truncate">{env.url}</span>
                  <Globe className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>

                <div className="space-y-2.5 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-slate-400" />
                      Runners:
                    </span>
                    <span className="font-bold text-slate-900">{env.workers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-slate-400" />
                      Latency:
                    </span>
                    <span className="font-bold text-emerald-700">{env.latency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                      Heartbeat:
                    </span>
                    <span className="font-medium text-slate-700">{env.lastPing}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2.5 text-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Capabilities
                  </span>
                  {env.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="leading-snug font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onEnvironmentChange(env.id as any)}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/25'
                    : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 border border-slate-300'
                }`}
              >
                {isSelected ? '✓ Current Execution Environment' : 'Switch to Environment'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
