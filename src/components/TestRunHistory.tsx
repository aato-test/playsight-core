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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Test Runs & Execution Reports
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-medium mt-1.5">
            Run and monitor your tests · Playwright traces & execution logs on branch <span className="text-indigo-700 font-bold">{currentBranch}</span>
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => onTriggerRun()}
          disabled={isRunning}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold tracking-tight transition-all cursor-pointer shadow-md active:scale-98 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Executing Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Trigger Test Run</span>
            </>
          )}
        </button>
      </div>

      {/* Controls: Search, Filter, Browser, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-sans shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
          <Search className="w-4.5 h-4.5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Search workflows, triggers, commit hashes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-700 font-bold focus:border-indigo-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Browser Filter */}
          <select
            value={browserFilter}
            onChange={(e) => setBrowserFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-700 font-bold focus:border-indigo-600 focus:outline-none cursor-pointer capitalize"
          >
            <option value="all">Browser: All</option>
            <option value="chromium">Chromium</option>
            <option value="firefox">Firefox</option>
            <option value="webkit">WebKit</option>
          </select>
        </div>
      </div>

      {/* High-Readability Table: Status, Workflow, Trigger, Browser, Duration, Tests, Started, Trace */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-100/90 text-slate-700 font-sans text-xs font-extrabold uppercase tracking-wider">
                <th className="py-4 px-4.5">Status</th>
                <th className="py-4 px-4.5">Workflow / Test Suite</th>
                <th className="py-4 px-4.5">Triggered By</th>
                <th className="py-4 px-4.5">Browser Engine</th>
                <th className="py-4 px-4.5">Duration</th>
                <th className="py-4 px-4.5">Passed Steps</th>
                <th className="py-4 px-4.5">Timestamp</th>
                <th className="py-4 px-4.5 text-right">Diagnostic Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500 font-sans text-sm">
                    No test runs found matching filters. Trigger a run to record execution telemetry.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((run) => {
                  const isPassed = run.status === 'passed';
                  return (
                    <tr
                      key={run.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTraceRun(run)}
                    >
                      {/* Status */}
                      <td className="py-4 px-4.5 whitespace-nowrap">
                        {isPassed ? (
                          <div className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 text-xs font-bold shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>Passed</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-300 text-xs font-bold shadow-2xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>Failed</span>
                          </div>
                        )}
                      </td>

                      {/* Workflow */}
                      <td className="py-4 px-4.5 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base">
                        {run.suiteName}
                      </td>

                      {/* Trigger */}
                      <td className="py-4 px-4.5 font-sans text-sm text-slate-600 font-medium">
                        {run.triggeredBy}
                      </td>

                      {/* Browser */}
                      <td className="py-4 px-4.5 font-sans text-sm text-slate-700 font-semibold capitalize">
                        {run.browser}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4.5 font-sans text-sm text-slate-900 font-bold tabular-nums">
                        {(run.durationMs / 1000).toFixed(2)}s
                      </td>

                      {/* Tests / Steps */}
                      <td className="py-4 px-4.5 font-sans text-sm text-slate-700 tabular-nums">
                        <span className={isPassed ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                          {run.passedSteps}
                        </span>
                        <span className="font-semibold text-slate-500">/{run.totalSteps}</span>
                      </td>

                      {/* Started */}
                      <td className="py-4 px-4.5 font-sans text-xs text-slate-500 font-medium tabular-nums">
                        {run.timestamp}
                      </td>

                      {/* Trace Action */}
                      <td className="py-4 px-4.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTraceRun(run);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold font-sans transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-indigo-400"
                          title="Open Playwright Trace Viewer"
                        >
                          <Activity className="w-4 h-4 text-indigo-600" />
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
