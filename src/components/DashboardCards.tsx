import React from 'react';
import {
  Plus,
  Play,
  RotateCw,
  Workflow,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { TestSuite, TestRunResult, JiraIssue } from '../types';

interface DashboardProps {
  suites: TestSuite[];
  testRuns: TestRunResult[];
  jiraIssues: JiraIssue[];
  currentBranch: string;
  onOpenSuiteInBuilder: (suiteId: string) => void;
  onCreateNewWorkflow: () => void;
  onTriggerQuickRun: (suiteId: string) => void;
  onOpenCopilot: () => void;
  onNavigateToTraceability: () => void;
  isRunning: boolean;
}

export const DashboardCards: React.FC<DashboardProps> = ({
  suites,
  jiraIssues,
  currentBranch,
  onOpenSuiteInBuilder,
  onCreateNewWorkflow,
  onTriggerQuickRun,
  onOpenCopilot,
  onNavigateToTraceability,
  isRunning,
}) => {
  return (
    <div
      id="dashboard-overview-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-100"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Good morning, Prakash
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated quality workspace · <span className="text-indigo-400 font-mono font-medium">{currentBranch}</span>
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-create-new-workflow"
            onClick={onCreateNewWorkflow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-tight transition-all shadow-md cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create New Suite</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Metric 1: Regression Pass Rate */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Pass Rate
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-emerald-400 font-mono tabular-nums tracking-tight">
                94.8%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              <span className="text-emerald-400">+2.4%</span> vs previous run
            </div>
          </div>

          {/* Metric 2: Active Sprint Coverage */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Sprint Coverage
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-white font-mono tabular-nums tracking-tight">
                82%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              4 of 5 stories verified
            </div>
          </div>

          {/* Metric 3: Runner Latency */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Runner Latency
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-blue-400 font-mono tabular-nums tracking-tight">
                1.42s
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              Chromium Playwright worker
            </div>
          </div>

          {/* Metric 4: Active Workflows */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Active Suites
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-white font-mono tabular-nums tracking-tight">
                {suites.length}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              Synced across repositories
            </div>
          </div>

          {/* Metric 5: Blockers */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Pending Issues
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-rose-400 font-mono tabular-nums tracking-tight">
                {jiraIssues.filter((i) => i.status !== 'done').length}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              Linked to Jira Cloud
            </div>
          </div>
        </div>
      </div>

      {/* Active Test Suites Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Active Test Suites
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {suites.length} suites active on branch
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Suite Name</th>
                  <th className="py-3 px-4 font-medium">Steps / Browser</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Last Run</th>
                  <th className="py-3 px-4 font-medium">Jira Story</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-sans">
                {suites.map((suite) => {
                  const isAttention = suite.status === 'needs_attention';
                  return (
                    <tr
                      key={suite.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onOpenSuiteInBuilder(suite.id)}
                    >
                      {/* Name & Description */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {suite.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                          {suite.description}
                        </div>
                      </td>

                      {/* Steps & Browser Icon */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">
                        <span className="text-slate-200">{suite.nodes.length} steps</span>
                        <span className="text-slate-600"> · </span>
                        <span className="capitalize">{suite.targetBrowser}</span>
                      </td>

                      {/* Status indicator */}
                      <td className="py-3 px-4">
                        {isAttention ? (
                          <div className="inline-flex items-center gap-1.5 text-amber-400 font-mono text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span className="font-medium">Needs attention</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="font-medium">Passing</span>
                          </div>
                        )}
                      </td>

                      {/* Last run timestamp */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-400 tabular-nums">
                        {suite.lastRunTime || 'Just now'}
                      </td>

                      {/* Jira Story key */}
                      <td className="py-3 px-4 font-mono text-xs text-indigo-300">
                        {suite.jiraIssue || 'CHK-184'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isAttention && (
                            <button
                              onClick={onOpenCopilot}
                              className="px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                              title="Diagnose in QA Copilot"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>Diagnose</span>
                            </button>
                          )}
                          <button
                            onClick={() => onTriggerQuickRun(suite.id)}
                            disabled={isRunning}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                            title="Execute Test Sequence"
                          >
                            <Play className="w-3 h-3 text-indigo-400 fill-current" />
                            <span>Run</span>
                          </button>
                          <button
                            onClick={() => onOpenSuiteInBuilder(suite.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
                            title="Open in Visual Builder"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Telemetry Secondary Grid: Recent Diagnostics & Jira Linkage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Diagnostic Alert Box */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider">Active Failure Diagnostic</span>
              <span className="text-rose-400 font-mono text-[11px]">1 failed step</span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-white">
                Checkout & Payment Gateway · Step 02 (Click)
              </div>
              <div className="mt-1 text-xs text-slate-300 font-mono bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                Element <span className="text-rose-400">[data-testid="checkout-submit"]</span> not found within 6000ms.
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-heal available (97% match)
            </span>
            <button
              onClick={onOpenCopilot}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Review Diff in Copilot</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Traceability Linkage Box */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider">Jira Sprint Traceability</span>
              <span className="text-indigo-400 font-mono text-[11px]">CHK-184 Linked</span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="text-xs font-semibold text-white">
                CHK-184: Checkout payment succeeds
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Linked sequence `Checkout & Payment Gateway` has 92% step coverage and 88% assertion coverage.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Status: In QA · Assigned to Prakash S.
            </span>
            <button
              onClick={onNavigateToTraceability}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Traceability Matrix</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
