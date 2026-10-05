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
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-[#F8FAFC]"
    >
      {/* Section 21 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Test Runs
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Recent regression executions across all environments · <span className="text-teal-400">{currentBranch}</span>
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => onTriggerRun()}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer"
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

      {/* Section 21 Controls: Search, Filter, Browser, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F172A] p-2.5 rounded border border-[#1E293B] text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <input
            type="text"
            placeholder="Search workflows, triggers, commit hashes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-teal-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1 text-xs text-[#94A3B8] focus:border-teal-400 focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Browser Filter */}
          <select
            value={browserFilter}
            onChange={(e) => setBrowserFilter(e.target.value as any)}
            className="bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1 text-xs text-[#94A3B8] focus:border-teal-400 focus:outline-none cursor-pointer capitalize"
          >
            <option value="all">Browser: All</option>
            <option value="chromium">Chromium</option>
            <option value="firefox">Firefox</option>
            <option value="webkit">WebKit</option>
          </select>
        </div>
      </div>

      {/* Section 21 Dense Table: Status, Workflow, Trigger, Browser, Duration, Tests, Started, Trace */}
      <div className="rounded border border-[#1E293B] bg-[#0F172A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#020617]/50 text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Workflow</th>
                <th className="py-2.5 px-4 font-medium">Trigger</th>
                <th className="py-2.5 px-4 font-medium">Browser</th>
                <th className="py-2.5 px-4 font-medium">Duration</th>
                <th className="py-2.5 px-4 font-medium">Tests</th>
                <th className="py-2.5 px-4 font-medium">Started</th>
                <th className="py-2.5 px-4 font-medium text-right">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70 font-sans">
              {filteredRuns.map((run) => {
                const isPassed = run.status === 'passed';
                return (
                  <tr
                    key={run.id}
                    className="hover:bg-[#111827]/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTraceRun(run)}
                  >
                    {/* Status */}
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      {isPassed ? (
                        <div className="inline-flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-semibold">Passed</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-semibold">Failed</span>
                        </div>
                      )}
                    </td>

                    {/* Workflow */}
                    <td className="py-3 px-4 font-semibold text-[#F8FAFC] group-hover:text-teal-300 transition-colors">
                      {run.suiteName}
                    </td>

                    {/* Trigger */}
                    <td className="py-3 px-4 font-mono text-xs text-[#94A3B8]">
                      {run.triggeredBy}
                    </td>

                    {/* Browser */}
                    <td className="py-3 px-4 font-mono text-xs text-[#94A3B8]">
                      {run.browser}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 font-mono text-xs text-[#F8FAFC] tabular-nums">
                      {(run.durationMs / 1000).toFixed(2)}s
                    </td>

                    {/* Tests / Steps */}
                    <td className="py-3 px-4 font-mono text-xs text-[#94A3B8] tabular-nums">
                      <span className={isPassed ? 'text-emerald-400' : 'text-amber-400'}>
                        {run.passedSteps}
                      </span>
                      <span>/{run.totalSteps}</span>
                    </td>

                    {/* Started */}
                    <td className="py-3 px-4 font-mono text-xs text-[#64748B] tabular-nums">
                      {run.timestamp}
                    </td>

                    {/* Trace Action (Section 22) */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTraceRun(run);
                        }}
                        className="px-2.5 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-teal-300 hover:text-teal-200 border border-teal-500/30 text-[11px] font-mono transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Open Playwright Trace Viewer"
                      >
                        <Activity className="w-3 h-3 text-teal-400" />
                        <span>View Trace</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
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
