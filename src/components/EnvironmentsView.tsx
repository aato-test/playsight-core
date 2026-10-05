import React, { useState } from 'react';
import { Server, Globe, Shield, CheckCircle2, AlertCircle, RefreshCw, Plus, ExternalLink } from 'lucide-react';

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
      url: 'http://localhost:3000',
      status: 'healthy',
      workers: '2 Playwright processes',
      latency: '24ms',
      lastPing: '3s ago',
      features: ['Live reload', 'Headful debugging', 'Local mock database'],
    },
    {
      id: 'staging',
      name: 'Staging Kubernetes Pod',
      url: 'https://staging.app.example.com',
      status: 'healthy',
      workers: '8 Playwright runners',
      latency: '42ms',
      lastPing: '1s ago',
      features: ['SCA Stripe sandbox', 'OAuth SAML simulator', 'Nightly regression suite'],
    },
    {
      id: 'production',
      name: 'Production Canary Pool',
      url: 'https://app.example.com',
      status: 'monitored',
      workers: '4 Read-only synthetic runners',
      latency: '36ms',
      lastPing: '5s ago',
      features: ['Synthetic health pings', 'Restricted assert-only mode', 'Zero write operations'],
    },
  ];

  return (
    <div
      id="environments-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-[#F8FAFC]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Target Environments
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Browser execution runners & base URL profiles · <span className="text-teal-400">{currentBranch}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {envConfigs.map((env) => {
          const isSelected = currentEnvironment === env.id;
          return (
            <div
              key={env.id}
              className={`rounded border bg-[#0F172A] p-4 flex flex-col justify-between space-y-4 transition-all ${
                isSelected ? 'border-teal-400 ring-1 ring-teal-500/30' : 'border-[#1E293B]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F8FAFC] font-mono uppercase">
                    {env.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="text-xs font-mono text-cyan-300 bg-[#020617] p-2 rounded border border-[#1E293B] truncate">
                  {env.url}
                </div>

                <div className="space-y-1 text-xs text-[#94A3B8] font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Runners:</span>
                    <span className="text-[#F8FAFC]">{env.workers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Latency:</span>
                    <span className="text-teal-300">{env.latency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Heartbeat:</span>
                    <span className="text-[#F8FAFC]">{env.lastPing}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E293B] space-y-1 text-[11px] text-[#64748B]">
                  {env.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-teal-400">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onEnvironmentChange(env.id as any)}
                className={`w-full py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
                }`}
              >
                {isSelected ? 'Selected Active Environment' : 'Switch to Environment'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
