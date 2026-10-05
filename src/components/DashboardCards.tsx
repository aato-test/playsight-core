import React from 'react';
import {
  Plus,
  Play,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Workflow,
  Globe,
  Layers,
  Sparkles,
  GitBranch,
  Shield,
  Activity,
  Terminal,
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
  testRuns,
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
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-[#F8FAFC]"
    >
      {/* Section 7: Overview Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Good morning, Prakash
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Checkout regression workspace · <span className="text-teal-400">{currentBranch}</span>
          </p>
        </div>

        {/* Primary CTA: + Create New Workflow (Section 7) */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-create-new-workflow"
            onClick={onCreateNewWorkflow}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold tracking-tight transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Create New Workflow</span>
          </button>
        </div>
      </div>

      {/* Section 8: Horizontal Engineering Telemetry Section */}
      <div className="rounded border border-[#1E293B] bg-[#0F172A] overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#1E293B]">
          {/* Metric 1: Regression Pass Rate */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
              Regression Pass Rate
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-emerald-400 font-mono tabular-nums tracking-tight">
                94.8%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[#64748B] font-mono">
              <span className="text-emerald-400">+2.4%</span> vs previous run
            </div>
          </div>

          {/* Metric 2: Active Sprint Coverage */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
              Sprint Coverage
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-[#F8FAFC] font-mono tabular-nums tracking-tight">
                82%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[#64748B] font-mono">
              4 of 5 stories verified
            </div>
          </div>

          {/* Metric 3: Runner Latency */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
              Runner Latency
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-cyan-400 font-mono tabular-nums tracking-tight">
                1.42s
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[#64748B] font-mono">
              Chromium Playwright worker
            </div>
          </div>

          {/* Metric 4: Active Workflows */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
              Active Workflows
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-[#F8FAFC] font-mono tabular-nums tracking-tight">
                12
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[#64748B] font-mono">
              3 loaded in workspace
            </div>
          </div>

          {/* Metric 5: Blockers */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
              Blockers
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-rose-400 font-mono tabular-nums tracking-tight">
                3
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[#64748B] font-mono">
              1 auto-heal proposal open
            </div>
          </div>
        </div>
      </div>

      {/* Section 9: Active Test Sequences (Workflow Health Section) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-semibold tracking-tight text-[#F8FAFC]">
              Active Test Sequences
            </h2>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            {suites.length} sequences active on branch
          </span>
        </div>

        {/* Compact Table / List */}
        <div className="rounded border border-[#1E293B] bg-[#0F172A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#020617]/50 text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-medium">Sequence Name</th>
                  <th className="py-2.5 px-4 font-medium">Steps / Browser</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Last Run</th>
                  <th className="py-2.5 px-4 font-medium">Jira Story</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70 font-sans">
                {suites.map((suite) => {
                  const isAttention = suite.status === 'needs_attention';
                  return (
                    <tr
                      key={suite.id}
                      className="hover:bg-[#111827]/70 transition-colors group cursor-pointer"
                      onClick={() => onOpenSuiteInBuilder(suite.id)}
                    >
                      {/* Name & Description */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#F8FAFC] group-hover:text-teal-300 transition-colors">
                          {suite.name}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate max-w-sm">
                          {suite.description}
                        </div>
                      </td>

                      {/* Steps & Browser Icon */}
                      <td className="py-3 px-4 font-mono text-xs text-[#94A3B8]">
                        <span className="text-[#F8FAFC]">{suite.nodes.length} steps</span>
                        <span className="text-[#64748B]"> · </span>
                        <span className="capitalize">{suite.targetBrowser}</span>
                      </td>

                      {/* Status indicator */}
                      <td className="py-3 px-4">
                        {isAttention ? (
                          <div className="inline-flex items-center gap-1.5 text-amber-400 font-mono text-xs">
                            <span className="w-1.5 h-1.5 rounded-xs bg-amber-400 shrink-0" />
                            <span className="font-medium">Needs attention</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
                            <span className="w-1.5 h-1.5 rounded-xs bg-emerald-400 shrink-0" />
                            <span className="font-medium">Passing</span>
                          </div>
                        )}
                      </td>

                      {/* Last run timestamp */}
                      <td className="py-3 px-4 font-mono text-xs text-[#94A3B8] tabular-nums">
                        {suite.lastRunTime || 'Just now'}
                      </td>

                      {/* Jira Story key */}
                      <td className="py-3 px-4 font-mono text-xs text-teal-300">
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
                              className="px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                              title="Diagnose in QA Copilot"
                            >
                              <Sparkles className="w-3 h-3 text-teal-400" />
                              <span>Diagnose</span>
                            </button>
                          )}
                          <button
                            onClick={() => onTriggerQuickRun(suite.id)}
                            disabled={isRunning}
                            className="px-2 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                            title="Execute Test Sequence"
                          >
                            <Play className="w-3 h-3 text-teal-400 fill-current" />
                            <span>Run</span>
                          </button>
                          <button
                            onClick={() => onOpenSuiteInBuilder(suite.id)}
                            className="px-2 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] text-[11px] font-mono transition-colors cursor-pointer"
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

      {/* Telemetry Secondary Grid: Recent Failures & Jira Traceability Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Diagnostic Alert Box */}
        <div className="p-4 rounded border border-[#1E293B] bg-[#0F172A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-mono uppercase tracking-wider">Active Failure Diagnostic</span>
              <span className="text-rose-400 font-mono text-[11px]">1 failed step</span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-[#F8FAFC]">
                Checkout & Payment Gateway · Step 02 (Click)
              </div>
              <div className="mt-1 text-xs text-[#94A3B8] font-mono bg-[#020617] p-2 rounded border border-[#1E293B]">
                Element <span className="text-rose-400">[data-testid="checkout-submit"]</span> not found within 6000ms.
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
            <span className="text-[11px] text-[#64748B] font-mono">
              Auto-heal available (97% match)
            </span>
            <button
              onClick={onOpenCopilot}
              className="text-xs font-mono text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Review Diff in Copilot</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Traceability Linkage Box */}
        <div className="p-4 rounded border border-[#1E293B] bg-[#0F172A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-mono uppercase tracking-wider">Jira Sprint Traceability</span>
              <span className="text-teal-400 font-mono text-[11px]">CHK-184 Linked</span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="text-xs font-semibold text-[#F8FAFC]">
                CHK-184: Checkout payment succeeds
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Linked sequence `Checkout & Payment Gateway` has 92% step coverage and 88% assertion coverage.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
            <span className="text-[11px] text-[#64748B] font-mono">
              Status: In QA · Assigned to Prakash S.
            </span>
            <button
              onClick={onNavigateToTraceability}
              className="text-xs font-mono text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
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
