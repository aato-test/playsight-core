import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Clock,
  Globe,
  Camera,
  Layers,
  Activity,
  Code2,
  ExternalLink,
  ChevronRight,
  Download,
} from 'lucide-react';
import { PlaywrightTraceData, TestRunResult, TestHistoryRecord } from '../types';

interface TraceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  run: TestRunResult | TestHistoryRecord | null;
}

export const TraceViewer: React.FC<TraceViewerProps> = ({ isOpen, onClose, run }) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'console' | 'network' | 'screenshots' | 'dom'>('actions');
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(0);

  if (!isOpen || !run) return null;

  const trace = run.traceData;
  const isPassed = run.status === 'passed';
  const actions = trace?.actions || [];
  const consoleLogs = trace?.consoleLogs || [];
  const networkRequests = trace?.networkRequests || [];
  const screenshots = trace?.screenshots || [];
  const domSnapshot = trace?.domSnapshot;

  return (
    <div
      id="playwright-trace-viewer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-xs font-sans select-none"
    >
      <div className="w-full max-w-5xl h-[85vh] bg-[#0F172A] border border-[#1E293B] rounded shadow-2xl flex flex-col overflow-hidden text-[#F8FAFC]">
        {/* Playwright Trace Header (Section 22) */}
        <div className="h-14 px-5 border-b border-[#1E293B] bg-[#020617] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[#111827] border border-[#1E293B] flex items-center justify-center text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#F8FAFC] tracking-tight font-mono uppercase">
                  Playwright Trace Inspector
                </h3>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    isPassed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {run.status.toUpperCase()}
                </span>
                {'releaseGateStatus' in run && run.releaseGateStatus && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      run.releaseGateStatus === 'passed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                    title={run.releaseGate?.reason}
                  >
                    GATE: {run.releaseGateStatus.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                {'suiteName' in run ? run.suiteName : run.testName} · {run.browser || 'Chromium 124'} · {(('durationMs' in run ? run.durationMs : run.durationM * 60000) / 1000).toFixed(2)}s
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const traceArtifact = 'artifacts' in run && run.artifacts?.find((a) => a.kind === 'trace');
                if (traceArtifact) {
                  window.open(traceArtifact.url, '_blank');
                  return;
                }
                const blob = new Blob([JSON.stringify(trace || {}, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `trace-${run.id}.json`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] text-xs font-mono transition-colors cursor-pointer"
              title="Download Trace Artifact (.zip/.json)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Trace</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 22: Visual Timeline Bar */}
        <div className="px-5 py-2.5 border-b border-[#1E293B] bg-[#020617]/40 flex flex-col gap-1.5 shrink-0 font-mono text-[11px]">
          <div className="flex items-center justify-between text-[#64748B]">
            <span>Timeline</span>
            <span>0.00s — {(('durationMs' in run ? run.durationMs : run.durationM * 60000) / 1000).toFixed(2)}s</span>
          </div>
          {/* Waterfall bar */}
          <div className="w-full bg-[#111827] h-5 rounded-xs border border-[#1E293B] flex overflow-hidden relative">
            {actions.map((act, i) => {
              const widthPct = Math.max(15, (act.durationMs / (trace?.durationMs || 1840)) * 100);
              const isSelected = selectedActionIndex === i;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedActionIndex(i)}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full border-r border-[#1E293B] flex items-center justify-center px-1 text-[10px] cursor-pointer transition-colors truncate ${
                    isSelected
                      ? 'bg-teal-500/25 text-teal-300 font-bold border-teal-500'
                      : act.status === 'passed'
                      ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  }`}
                  title={`${act.title} (${act.durationMs}ms)`}
                >
                  {act.action}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation: Actions, Console, Network, Screenshots, DOM snapshot */}
        <div className="px-5 py-1.5 border-b border-[#1E293B] bg-[#020617]/30 flex items-center gap-1.5 shrink-0 font-mono text-xs">
          {[
            { id: 'actions', label: `Actions (${actions.length})` },
            { id: 'console', label: `Console (${consoleLogs.length})` },
            { id: 'network', label: `Network (${networkRequests.length})` },
            { id: 'screenshots', label: `Screenshots (${screenshots.length})` },
            { id: 'dom', label: 'DOM Snapshot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#111827] text-teal-300 border border-[#1E293B] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-5 text-xs font-mono">
          {/* Actions Section */}
          {activeTab === 'actions' && (
            <div className="space-y-2">
              <div className="text-[11px] text-[#64748B] uppercase">Playwright Step Sequence</div>
              <div className="divide-y divide-[#1E293B] rounded border border-[#1E293B] bg-[#020617] overflow-hidden">
                {actions.map((act, index) => {
                  const isActPassed = act.status === 'passed';
                  const isSelected = selectedActionIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedActionIndex(index)}
                      className={`p-3 flex items-start justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#111827] border-l-2 border-teal-400' : 'hover:bg-[#111827]/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#64748B] text-[10px]">0{act.stepNumber}</span>
                        <div>
                          <div className="font-semibold text-[#F8FAFC] flex items-center gap-2">
                            <span>{act.title}</span>
                            <span className="text-[10px] text-teal-400 font-mono">({act.action})</span>
                          </div>
                          <div className="text-[11px] text-[#94A3B8] mt-1 bg-[#0A0F1D] p-1.5 rounded border border-[#1E293B]/70 font-mono">
                            <code>{act.apiCall}</code>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <span
                          className={`text-[10px] font-bold ${
                            isActPassed ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {act.status.toUpperCase()}
                        </span>
                        <div className="text-[10px] text-[#64748B] tabular-nums mt-0.5">
                          {act.durationMs}ms
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Console Section */}
          {activeTab === 'console' && (
            <div className="space-y-2">
              <div className="text-[11px] text-[#64748B] uppercase">Browser Console Stream</div>
              <div className="rounded border border-[#1E293B] bg-[#020617] p-3 space-y-1.5 text-[11px] leading-relaxed">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#64748B] shrink-0 tabular-nums">{log.timestamp}</span>
                    <span
                      className={`uppercase text-[10px] px-1 rounded shrink-0 ${
                        log.level === 'error'
                          ? 'bg-rose-500/20 text-rose-400'
                          : log.level === 'warn'
                          ? 'bg-amber-500/20 text-amber-400'
                          : log.level === 'debug'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span
                      className={
                        log.level === 'error'
                          ? 'text-rose-300'
                          : log.level === 'warn'
                          ? 'text-amber-300'
                          : 'text-[#94A3B8]'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Network Section */}
          {activeTab === 'network' && (
            <div className="space-y-2">
              <div className="text-[11px] text-[#64748B] uppercase">HTTP Network Har</div>
              <div className="rounded border border-[#1E293B] bg-[#020617] overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#1E293B] bg-[#0A0F1D] text-[#64748B] uppercase">
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3">URL</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Size</th>
                      <th className="py-2 px-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60">
                    {networkRequests.map((req, i) => (
                      <tr key={i} className="hover:bg-[#111827]/40">
                        <td className="py-2 px-3 text-cyan-400 font-bold">{req.method}</td>
                        <td className="py-2 px-3 text-[#F8FAFC] truncate max-w-md">{req.url}</td>
                        <td className="py-2 px-3">
                          <span className={req.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[#94A3B8]">{req.type}</td>
                        <td className="py-2 px-3 text-[#64748B]">{req.size}</td>
                        <td className="py-2 px-3 text-right text-teal-300 tabular-nums">
                          {req.durationMs}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Screenshots Section */}
          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              <div className="text-[11px] text-[#64748B] uppercase">Action Frame Captures</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {screenshots.map((shot, i) => (
                  <div key={i} className="rounded border border-[#1E293B] bg-[#020617] p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#F8FAFC]">{shot.label}</span>
                      <span className="text-[#64748B]">{shot.timestamp}</span>
                    </div>
                    <div className="w-full h-44 rounded bg-[#0A0F1D] border border-[#1E293B] overflow-hidden flex items-center justify-center">
                      {shot.previewUrl.startsWith('data:image/svg+xml') ? (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: decodeURIComponent(shot.previewUrl.replace('data:image/svg+xml;utf8,', '')) }}
                        />
                      ) : (
                        <img
                          src={shot.previewUrl}
                          alt={shot.label}
                          className="w-full h-full object-contain bg-[#020617]"
                        />
                      )}
                    </div>
                    <div className="text-[10px] text-[#64748B]">Action trigger: {shot.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOM Snapshot Section */}
          {activeTab === 'dom' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] uppercase">Inspected DOM Node</span>
                <span className="text-teal-300 text-xs">
                  Target: {domSnapshot?.inspectedSelector || 'button[data-testid="payment-submit"]'}
                </span>
              </div>
              <pre className="p-4 rounded border border-[#1E293B] bg-[#020617] text-xs text-[#94A3B8] overflow-x-auto leading-relaxed">
                {domSnapshot?.htmlSnippet || '<!-- DOM Snapshot unavailable -->'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
