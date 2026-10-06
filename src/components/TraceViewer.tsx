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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans select-none"
    >
      <div className="w-full max-w-5xl h-[85vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Playwright Trace Header */}
        <div className="h-16 px-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Playwright Trace Inspector
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    isPassed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {run.status.toUpperCase()}
                </span>
                {'releaseGateStatus' in run && run.releaseGateStatus && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      run.releaseGateStatus === 'passed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                    title={run.releaseGate?.reason}
                  >
                    GATE: {run.releaseGateStatus.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {'suiteName' in run ? run.suiteName : run.testName} · {run.browser || 'Chromium'} · {(('durationMs' in run ? run.durationMs : run.durationM * 60000) / 1000).toFixed(2)}s
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Download Trace Artifact (.zip/.json)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Trace</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Timeline Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-col gap-1.5 shrink-0 text-xs font-medium">
          <div className="flex items-center justify-between text-slate-500 font-semibold">
            <span>Execution Timeline</span>
            <span className="font-mono">0.00s — {(('durationMs' in run ? run.durationMs : run.durationM * 60000) / 1000).toFixed(2)}s</span>
          </div>
          {/* Waterfall bar */}
          <div className="w-full bg-slate-100 h-6 rounded-lg border border-slate-200 flex overflow-hidden relative">
            {actions.map((act, i) => {
              const widthPct = Math.max(15, (act.durationMs / (trace?.durationMs || 1840)) * 100);
              const isSelected = selectedActionIndex === i;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedActionIndex(i)}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full border-r border-white flex items-center justify-center px-1 text-[11px] font-bold cursor-pointer transition-colors truncate ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-inner'
                      : act.status === 'passed'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                  title={`${act.title} (${act.durationMs}ms)`}
                >
                  {act.action}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 shrink-0 text-xs font-bold">
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
              className={`py-3 border-b-2 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* Actions Section */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Playwright Step Sequence</div>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                {actions.map((act, index) => {
                  const isActPassed = act.status === 'passed';
                  const isSelected = selectedActionIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedActionIndex(index)}
                      className={`p-4 flex items-start justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 font-bold text-xs">0{act.stepNumber}</span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{act.title}</span>
                            <span className="text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {act.action}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 font-mono">
                            <code>{act.apiCall}</code>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            isActPassed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {act.status.toUpperCase()}
                        </span>
                        <div className="text-xs text-slate-500 font-mono mt-1">
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
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Browser Console Stream</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 font-mono text-xs leading-relaxed">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-slate-400 shrink-0">{log.timestamp}</span>
                    <span
                      className={`uppercase text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        log.level === 'error'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : log.level === 'warn'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : log.level === 'debug'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span
                      className={
                        log.level === 'error'
                          ? 'text-rose-700 font-semibold'
                          : log.level === 'warn'
                          ? 'text-amber-800 font-semibold'
                          : 'text-slate-700'
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
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTTP Network Activity</div>
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4">URL</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Size</th>
                      <th className="py-2.5 px-4 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {networkRequests.map((req, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">{req.method}</td>
                        <td className="py-2.5 px-4 text-slate-800 font-mono truncate max-w-md">{req.url}</td>
                        <td className="py-2.5 px-4">
                          <span className={`font-mono font-bold ${req.status >= 400 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono">{req.type}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono">{req.size}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700">
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
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action Frame Captures</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {screenshots.map((shot, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{shot.label}</span>
                      <span className="text-slate-400 font-mono">{shot.timestamp}</span>
                    </div>
                    <div className="w-full h-44 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {shot.previewUrl.startsWith('data:image/svg+xml') ? (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: decodeURIComponent(shot.previewUrl.replace('data:image/svg+xml;utf8,', '')) }}
                        />
                      ) : (
                        <img
                          src={shot.previewUrl}
                          alt={shot.label}
                          className="w-full h-full object-contain bg-white"
                        />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Trigger: <span className="font-mono text-indigo-700 font-bold">{shot.action}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOM Snapshot Section */}
          {activeTab === 'dom' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspected DOM Node</span>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  Target: {domSnapshot?.inspectedSelector || 'button[data-testid="payment-submit"]'}
                </span>
              </div>
              <pre className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed shadow-2xs">
                {domSnapshot?.htmlSnippet || '<!-- DOM Snapshot unavailable -->'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
