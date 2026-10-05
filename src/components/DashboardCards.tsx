import React from 'react';
import {
  Plus,
  Play,
  RotateCw,
  Workflow,
  Sparkles,
  ArrowUpRight,
  FolderGit2,
  GitBranch,
} from 'lucide-react';
import { TestSuite, TestRunResult, JiraIssue } from '../types';

interface DashboardProps {
  suites: TestSuite[];
  testRuns: TestRunResult[];
  jiraIssues: JiraIssue[];
  currentBranch: string;
  currentRepo?: string;
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
  currentRepo = 'aato-test/playsight-core',
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
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-800"
    >
      {/* Header with Project Repo Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, Prakash
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <span className="font-sans text-slate-900 font-semibold">{currentRepo}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              <span className="font-sans text-indigo-700 font-medium">{currentBranch}</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-sans font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              GitHub App Connected
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-create-new-workflow"
            onClick={onCreateNewWorkflow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-tight transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Suite</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Metric 1: Regression Pass Rate */}
          <div className="p-5 flex flex-col justify-between">
            <span className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Pass Rate
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-400 font-sans tabular-nums tracking-tight">
                —%
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400 font-sans">
              Awaiting test run
            </div>
          </div>

          {/* Metric 2: Active Sprint Coverage */}
          <div className="p-5 flex flex-col justify-between">
            <span className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Sprint Coverage
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-400 font-sans tabular-nums tracking-tight">
                —%
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400 font-sans">
              0 stories verified
            </div>
          </div>

          {/* Metric 3: Runner Latency */}
          <div className="p-5 flex flex-col justify-between">
            <span className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Runner Latency
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-400 font-sans tabular-nums tracking-tight">
                — ms
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400 font-sans">
              Playwright runner idle
            </div>
          </div>

          {/* Metric 4: Active Workflows */}
          <div className="p-5 flex flex-col justify-between">
            <span className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Active Suites
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900 font-sans tabular-nums tracking-tight">
                {suites.length}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 font-sans">
              Configured on branch
            </div>
          </div>

          {/* Metric 5: Blockers */}
          <div className="p-5 flex flex-col justify-between">
            <span className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
              Pending Issues
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900 font-sans tabular-nums tracking-tight">
                {jiraIssues.filter((i) => i.status !== 'done').length}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 font-sans">
              Linked from Jira
            </div>
          </div>
        </div>
      </div>

      {/* Active Test Suites Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Active Test Suites
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {suites.length} suites active on branch
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-sans text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Suite Name</th>
                  <th className="py-3.5 px-4 font-semibold">Steps / Browser</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Last Run</th>
                  <th className="py-3.5 px-4 font-semibold">Jira Story</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {suites.map((suite) => {
                  const isAttention = suite.status === 'needs_attention';
                  return (
                    <tr
                      key={suite.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenSuiteInBuilder(suite.id)}
                    >
                      {/* Name & Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                          {suite.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
                          {suite.description}
                        </div>
                      </td>

                      {/* Steps & Browser Icon */}
                      <td className="py-3.5 px-4 font-sans text-xs text-slate-600">
                        <span className="font-medium text-slate-800">{suite.nodes.length} steps</span>
                        <span className="text-slate-400"> · </span>
                        <span className="capitalize">{suite.targetBrowser}</span>
                      </td>

                      {/* Status indicator */}
                      <td className="py-3.5 px-4">
                        {isAttention ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-sans text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Needs attention</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>Passing</span>
                          </div>
                        )}
                      </td>

                      {/* Last run timestamp */}
                      <td className="py-3.5 px-4 font-sans text-xs text-slate-500 tabular-nums">
                        {suite.lastRunTime || 'Awaiting run'}
                      </td>

                      {/* Jira Story key */}
                      <td className="py-3.5 px-4 font-sans text-xs text-indigo-600 font-semibold">
                        {suite.jiraIssue || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isAttention && (
                            <button
                              onClick={onOpenCopilot}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-sans font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              title="Diagnose in QA Copilot"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Diagnose</span>
                            </button>
                          )}
                          <button
                            onClick={() => onTriggerQuickRun(suite.id)}
                            disabled={isRunning}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-sans font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Execute Test Sequence"
                          >
                            <Play className="w-3.5 h-3.5 text-indigo-600 fill-current" />
                            <span>Run</span>
                          </button>
                          <button
                            onClick={() => onOpenSuiteInBuilder(suite.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-sans font-medium transition-colors cursor-pointer"
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

      {/* Telemetry Secondary Grid: Recent Diagnostics & Jira Linkage (Placeholder Boxes Preserved) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Diagnostic Alert Box */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono uppercase tracking-wider">Active Failure Diagnostic</span>
              <span className="text-slate-400 font-mono text-[11px]">0 active failures</span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-900">
                Diagnostics Standby
              </div>
              <div className="mt-1 text-xs text-slate-600 font-sans bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                No active failure diagnostics. Run a test suite to inspect Playwright execution traces, console logs, and selector auto-healing diffs.
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Diagnostics ready
            </span>
            <button
              onClick={onOpenCopilot}
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Open QA Copilot</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Traceability Linkage Box */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono uppercase tracking-wider">Jira Sprint Traceability</span>
              <span className="text-indigo-600 font-mono text-[11px]">Traceability Ready</span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="text-xs font-semibold text-slate-900">
                Sprint Requirement Coverage
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                Connect PlaySight test suites with Jira user stories in Settings → Integrations or the Traceability view to monitor requirement test coverage.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Awaiting issue link
            </span>
            <button
              onClick={onNavigateToTraceability}
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
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
