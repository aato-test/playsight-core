import React, { useState } from 'react';
import {
  GitPullRequest,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Workflow,
  Plus,
  Kanban,
  Table as TableIcon,
  X,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { JiraIssue, TestSuite, JiraStatus, JiraSyncStatus } from '../types';
import { UserAvatar } from './UserAvatar';

interface JiraTraceabilityProps {
  issues: JiraIssue[];
  suites: TestSuite[];
  onUpdateIssue: (issue: JiraIssue) => void;
  onNavigateToBuilder: (suiteId?: string) => void;
  onOpenCopilot: () => void;
  currentBranch: string;
}

export const JiraBoard: React.FC<JiraTraceabilityProps> = ({
  issues,
  suites,
  onUpdateIssue,
  onNavigateToBuilder,
  onOpenCopilot,
  currentBranch,
}) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'kanban'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssueForConflict, setSelectedIssueForConflict] = useState<JiraIssue | null>(null);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<JiraIssue | null>(null);

  const filteredIssues = issues.filter((issue) => {
    return (
      issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.linkedSuiteName && issue.linkedSuiteName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleResolveConflict = (issue: JiraIssue) => {
    // Resolve conflict by syncing Jira status to workflow test state
    const resolvedIssue: JiraIssue = {
      ...issue,
      syncStatus: 'synced',
      conflictReason: undefined,
      lastSyncedAt: 'Just now',
      updatedAt: 'Just now',
    };
    onUpdateIssue(resolvedIssue);
    setSelectedIssueForConflict(null);
  };

  return (
    <div
      id="jira-traceability-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-[#F8FAFC]"
    >
      {/* Section 23 Header: Jira Traceability */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Jira Traceability
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Connect visual test workflows with Jira stories · <span className="text-teal-400">{currentBranch}</span>
          </p>
        </div>

        {/* View Mode Toggle: Matrix vs Kanban */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0F172A] border border-[#1E293B] rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Traceability Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search */}
      <div className="flex items-center justify-between gap-3 bg-[#0F172A] p-2.5 rounded border border-[#1E293B] text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <input
            type="text"
            placeholder="Search Jira key, summary, or linked sequence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-teal-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 text-[#94A3B8] text-[11px]">
          <span>Bidirectional Sync: <strong className="text-emerald-400 font-mono">Active (Atlassian v3 API)</strong></span>
        </div>
      </div>

      {/* Section 23 & 24: Traceability Matrix Table */}
      {viewMode === 'matrix' ? (
        <div className="rounded border border-[#1E293B] bg-[#0F172A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#020617]/50 text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-medium">Issue Key</th>
                  <th className="py-2.5 px-4 font-medium">Story Title</th>
                  <th className="py-2.5 px-4 font-medium">Workflow</th>
                  <th className="py-2.5 px-4 font-medium">Step Coverage</th>
                  <th className="py-2.5 px-4 font-medium">Assertion Coverage</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Last Execution</th>
                  <th className="py-2.5 px-4 font-medium">Sync Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70 font-sans">
                {filteredIssues.map((issue) => {
                  const isConflict = issue.syncStatus === 'conflict';
                  const isAutoHealed = issue.syncStatus === 'auto_healed';

                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-[#111827]/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedIssueDetail(issue)}
                    >
                      {/* Jira Key */}
                      <td className="py-3 px-4 font-mono font-bold text-teal-300">
                        {issue.key}
                      </td>

                      {/* Title & Assignee */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#F8FAFC] group-hover:text-teal-300 transition-colors">
                          {issue.title}
                        </div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                          <span>{issue.assignee.name}</span>
                          <span>·</span>
                          <span className="capitalize">{issue.priority} Priority</span>
                        </div>
                      </td>

                      {/* Workflow */}
                      <td className="py-3 px-4 font-mono text-xs text-[#94A3B8]">
                        {issue.linkedSuiteName ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToBuilder(issue.linkedSuiteId);
                            }}
                            className="text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Workflow className="w-3 h-3 text-teal-400" />
                            <span>{issue.linkedSuiteName}</span>
                          </button>
                        ) : (
                          <span className="text-[#64748B]">Unlinked</span>
                        )}
                      </td>

                      {/* Step Coverage */}
                      <td className="py-3 px-4 font-mono text-xs tabular-nums">
                        <div className="flex items-center gap-2">
                          <span className="text-[#F8FAFC] font-semibold">{issue.stepCoverage ?? 0}%</span>
                          <div className="w-14 bg-[#111827] h-1.5 rounded-xs overflow-hidden">
                            <div
                              className="bg-teal-400 h-1.5 rounded-xs"
                              style={{ width: `${issue.stepCoverage ?? 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Assertion Coverage */}
                      <td className="py-3 px-4 font-mono text-xs tabular-nums">
                        <span className="text-cyan-400 font-semibold">{issue.assertionCoverage ?? 0}%</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-[#111827] border border-[#1E293B] text-[#94A3B8]">
                          {issue.status}
                        </span>
                      </td>

                      {/* Last Execution */}
                      <td className="py-3 px-4 font-mono text-xs">
                        <span
                          className={
                            issue.lastExecution?.includes('Needs attention')
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {issue.lastExecution || 'Passed · 1.84s'}
                        </span>
                      </td>

                      {/* Section 24: Bidirectional Sync Status */}
                      <td className="py-3 px-4 font-mono text-xs">
                        {isConflict ? (
                          <div className="text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>⚠ Differs from state</span>
                          </div>
                        ) : isAutoHealed ? (
                          <div className="text-teal-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>Auto-healed</span>
                          </div>
                        ) : (
                          <div className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>✓ Synced {issue.lastSyncedAt || '12s ago'}</span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {isConflict ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssueForConflict(issue);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono transition-colors cursor-pointer"
                          >
                            Resolve Conflict
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToBuilder(issue.linkedSuiteId);
                            }}
                            className="px-2.5 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] text-[11px] font-mono transition-colors cursor-pointer"
                          >
                            View Suite
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['todo', 'inprogress', 'review', 'done'] as JiraStatus[]).map((status) => {
            const statusIssues = filteredIssues.filter((i) => i.status === status);
            const statusLabel =
              status === 'todo'
                ? 'To Do'
                : status === 'inprogress'
                ? 'In Progress'
                : status === 'review'
                ? 'Review / QA'
                : 'Done';

            return (
              <div
                key={status}
                className="rounded border border-[#1E293B] bg-[#0F172A] p-3 space-y-3 flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] text-xs font-mono">
                  <span className="font-semibold text-[#F8FAFC]">{statusLabel}</span>
                  <span className="text-[#64748B] tabular-nums">{statusIssues.length}</span>
                </div>

                <div className="space-y-2 flex-1">
                  {statusIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueDetail(issue)}
                      className="p-3 rounded bg-[#020617] border border-[#1E293B] hover:border-[#334155] space-y-2 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-teal-400 font-bold">{issue.key}</span>
                        <span className="text-[#64748B]">{issue.storyPoints} pts</span>
                      </div>
                      <div className="text-xs font-semibold text-[#F8FAFC] leading-snug">
                        {issue.title}
                      </div>
                      {issue.linkedSuiteName && (
                        <div className="text-[10px] text-[#94A3B8] font-mono flex items-center gap-1">
                          <Workflow className="w-3 h-3 text-teal-400" />
                          <span className="truncate">{issue.linkedSuiteName}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>{issue.assignee.name}</span>
                        <span className="text-emerald-400 font-mono">{issue.stepCoverage ?? 0}% cov</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section 24: Resolve Conflict Modal */}
      {selectedIssueForConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded shadow-2xl p-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-[#F8FAFC] font-mono">
                  Resolve Jira State Conflict
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssueForConflict(null)}
                className="text-[#64748B] hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs text-teal-300 font-bold">
                {selectedIssueForConflict.key}: {selectedIssueForConflict.title}
              </div>
              <div className="p-3 rounded bg-[#020617] border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] leading-relaxed">
                <strong className="text-amber-400 block mb-1">Conflict Diagnostic:</strong>
                {selectedIssueForConflict.conflictReason || 'Jira status differs from current test workflow state.'}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-2 font-mono">
              <button
                onClick={() => setSelectedIssueForConflict(null)}
                className="px-3 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedIssueForConflict(null);
                  onOpenCopilot();
                }}
                className="px-3 py-1.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 cursor-pointer"
              >
                Inspect in Copilot
              </button>
              <button
                onClick={() => handleResolveConflict(selectedIssueForConflict)}
                className="px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold cursor-pointer"
              >
                Sync with Workflow State
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssueDetail && !selectedIssueForConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded shadow-2xl p-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-teal-300 text-sm">
                  {selectedIssueDetail.key}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111827] border border-[#1E293B] text-[#94A3B8] uppercase">
                  {selectedIssueDetail.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="text-[#64748B] hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <h4 className="text-sm font-bold text-[#F8FAFC] font-sans">
                {selectedIssueDetail.title}
              </h4>
              <p className="text-xs text-[#94A3B8] font-sans leading-relaxed">
                {selectedIssueDetail.description}
              </p>

              <div className="grid grid-cols-2 gap-2 p-3 rounded bg-[#020617] border border-[#1E293B] text-[11px]">
                <div>
                  <span className="text-[#64748B] block uppercase text-[10px]">Assignee</span>
                  <span className="text-[#F8FAFC]">{selectedIssueDetail.assignee.name}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block uppercase text-[10px]">Priority</span>
                  <span className="text-[#F8FAFC] capitalize">{selectedIssueDetail.priority}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block uppercase text-[10px]">Linked Workflow</span>
                  <span className="text-teal-300">{selectedIssueDetail.linkedSuiteName || 'None'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block uppercase text-[10px]">Coverage</span>
                  <span className="text-emerald-400">{selectedIssueDetail.stepCoverage}% Steps</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-2 font-mono">
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="px-3 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] cursor-pointer"
              >
                Close
              </button>
              {selectedIssueDetail.linkedSuiteId && (
                <button
                  onClick={() => {
                    const sid = selectedIssueDetail.linkedSuiteId;
                    setSelectedIssueDetail(null);
                    onNavigateToBuilder(sid);
                  }}
                  className="px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold cursor-pointer"
                >
                  Open in Visual Builder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
