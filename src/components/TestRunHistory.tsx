import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Activity,
  Play,
  RotateCw,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { TestRunResult } from '../types';
import { TraceViewer } from './TraceViewer';

interface TestRunHistoryProps {
  runs: TestRunResult[];
  currentBranch: string;
  onTriggerRun: (suiteId?: string) => void;
  isRunning: boolean;
}

export const TestRunHistory: React.FC<TestRunHistoryProps> = ({
  runs,
  currentBranch,
  onTriggerRun,
  isRunning,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [browserFilter, setBrowserFilter] = useState<'all' | 'chromium' | 'firefox' | 'webkit'>('all');
  const [selectedTraceRun, setSelectedTraceRun] = useState<TestRunResult | null>(null);

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.suiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.triggeredBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    const matchesBrowser =
      browserFilter === 'all' || run.browser.toLowerCase().includes(browserFilter);
    return matchesSearch && matchesStatus && matchesBrowser;
  });

  return (
    <div
      id="test-runs-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-800"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Test Runs & Reports
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Execution history and Playwright traces · <span className="text-indigo-600 font-medium">{currentBranch}</span>
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => onTriggerRun()}
          disabled={isRunning}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer shadow-xs active:scale-98"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trigger Test Run</span>
            </>
          )}
        </button>
      </div>

      {/* Controls: Search, Filter, Browser, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs font-mono shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search workflows, triggers, commit hashes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Browser Filter */}
          <select
            value={browserFilter}
            onChange={(e) => setBrowserFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer capitalize"
          >
            <option value="all">Browser: All</option>
            <option value="chromium">Chromium</option>
            <option value="firefox">Firefox</option>
            <option value="webkit">WebKit</option>
          </select>
        </div>
      </div>

      {/* Dense Table: Status, Workflow, Trigger, Browser, Duration, Tests, Started, Trace */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Workflow</th>
                <th className="py-3 px-4 font-medium">Trigger</th>
                <th className="py-3 px-4 font-medium">Browser</th>
                <th className="py-3 px-4 font-medium">Duration</th>
                <th className="py-3 px-4 font-medium">Tests</th>
                <th className="py-3 px-4 font-medium">Started</th>
                <th className="py-3 px-4 font-medium text-right">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No test runs found. Trigger a run or connect a GitHub webhook to record execution data.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((run) => {
                  const isPassed = run.status === 'passed';
                  return (
                    <tr
                      key={run.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTraceRun(run)}
                    >
                      {/* Status */}
                      <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                        {isPassed ? (
                          <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="font-semibold">Passed</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px]">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="font-semibold">Failed</span>
                          </div>
                        )}
                      </td>

                      {/* Workflow */}
                      <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {run.suiteName}
                      </td>

                      {/* Trigger */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {run.triggeredBy}
                      </td>

                      {/* Browser */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {run.browser}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-800 tabular-nums">
                        {(run.durationMs / 1000).toFixed(2)}s
                      </td>

                      {/* Tests / Steps */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                        <span className={isPassed ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                          {run.passedSteps}
                        </span>
                        <span>/{run.totalSteps}</span>
                      </td>

                      {/* Started */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-400 tabular-nums">
                        {run.timestamp}
                      </td>

                      {/* Trace Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTraceRun(run);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-mono transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Open Playwright Trace Viewer"
                        >
                          <Activity className="w-3 h-3 text-indigo-600" />
                          <span>View Trace</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Playwright Trace Viewer Modal */}
      <TraceViewer
        isOpen={Boolean(selectedTraceRun)}
        onClose={() => setSelectedTraceRun(null)}
        run={selectedTraceRun}
      />
    </div>
  );
};
