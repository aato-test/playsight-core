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
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-800"
    >
      {/* Header: Jira Traceability */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <GitPullRequest className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Jira Requirement Traceability
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium mt-1.5">
            Link test cases with Jira issues · Automated Playwright test suites & release gates on branch <span className="text-indigo-700 font-bold">{currentBranch}</span>
          </p>
        </div>

        {/* View Mode Toggle: Matrix vs Kanban */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-xl p-1 text-sm font-bold">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Traceability Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Sync Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-slate-200 text-sm shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-[260px] max-w-md">
          <Search className="w-4.5 h-4.5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Search Jira key, summary, or linked sequence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 font-medium">Integration Status:</span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center gap-1.5 shadow-2xs">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Atlassian Cloud REST API Connected</span>
          </span>
        </div>
      </div>

      {/* View 1: Traceability Matrix Table */}
      {viewMode === 'matrix' ? (
        <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-100/90 text-slate-700 font-sans text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-4.5 font-bold">Issue Key</th>
                  <th className="py-4 px-4.5 font-bold">Story Title</th>
                  <th className="py-4 px-4.5 font-bold">Workflow Sequence</th>
                  <th className="py-4 px-4.5 font-bold">Step Coverage</th>
                  <th className="py-4 px-4.5 font-bold">Status</th>
                  <th className="py-4 px-4.5 font-bold">Last Execution</th>
                  <th className="py-4 px-4.5 font-bold">Sync Status</th>
                  <th className="py-4 px-4.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredIssues.map((issue) => {
                  const isConflict = issue.syncStatus === 'conflict';
                  const isAutoHealed = issue.syncStatus === 'auto_healed';

                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedIssueDetail(issue)}
                    >
                      {/* Jira Key */}
                      <td className="py-4 px-4.5 font-bold text-indigo-700 font-mono text-sm">
                        {issue.key}
                      </td>

                      {/* Title & Assignee */}
                      <td className="py-4 px-4.5">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base">
                          {issue.title}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                          <span className="font-semibold text-slate-700">{issue.assignee.name}</span>
                          <span>·</span>
                          <span className="capitalize">{issue.priority} Priority</span>
                        </div>
                      </td>

                      {/* Workflow */}
                      <td className="py-4 px-4.5 font-sans text-sm text-slate-700">
                        {issue.linkedSuiteName ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToBuilder(issue.linkedSuiteId);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <Workflow className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="truncate max-w-xs">{issue.linkedSuiteName}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-medium">Unlinked</span>
                        )}
                      </td>

                      {/* Step Coverage */}
                      <td className="py-4 px-4.5 text-sm">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-slate-900 tabular-nums">{issue.stepCoverage ?? 0}%</span>
                          <div className="w-20 bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-green-700 h-2.5 rounded-full"
                              style={{ width: `${issue.stepCoverage ?? 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4.5 text-xs">
                        <span className="capitalize px-3 py-1.5 rounded-full font-bold bg-slate-100 border border-slate-300 text-slate-800">
                          {issue.status}
                        </span>
                      </td>

                      {/* Last Execution */}
                      <td className="py-4 px-4.5 text-sm">
                        <span
                          className={`font-bold ${
                            issue.lastExecution?.includes('Needs attention') || issue.lastExecution?.includes('Failed')
                              ? 'text-rose-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {issue.lastExecution || 'Passed · 1.84s'}
                        </span>
                      </td>

                      {/* Sync Status */}
                      <td className="py-4 px-4.5 text-xs">
                        {isConflict ? (
                          <div className="text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 shadow-2xs">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Conflict with test state</span>
                          </div>
                        ) : isAutoHealed ? (
                          <div className="text-indigo-800 bg-indigo-50 border border-indigo-300 px-3 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 shadow-2xs">
                            <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
                            <span>Auto-healed</span>
                          </div>
                        ) : (
                          <div className="text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 shadow-2xs">
                            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>Synced {issue.lastSyncedAt || 'Just now'}</span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isConflict ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssueForConflict(issue);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            Resolve
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToBuilder(issue.linkedSuiteId);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
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
        /* View 2: Kanban Board View */
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
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 flex flex-col shadow-2xs"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs font-bold">
                  <span className="text-slate-800">{statusLabel}</span>
                  <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold tabular-nums">
                    {statusIssues.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {statusIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueDetail(issue)}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs space-y-2.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-indigo-600 font-mono">{issue.key}</span>
                        <span className="text-slate-400 font-medium">{issue.storyPoints} pts</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 leading-snug">
                        {issue.title}
                      </div>
                      {issue.linkedSuiteName && (
                        <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 p-1.5 rounded-lg flex items-center gap-1.5 font-medium truncate">
                          <Workflow className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{issue.linkedSuiteName}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>{issue.assignee.name}</span>
                        <span className="text-emerald-700 font-bold">{issue.stepCoverage ?? 0}% covered</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Conflict Modal */}
      {selectedIssueForConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Resolve Jira State Conflict
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssueForConflict(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-900 font-bold">
                {selectedIssueForConflict.key}: {selectedIssueForConflict.title}
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong className="text-amber-800 block mb-1">Conflict Diagnostic:</strong>
                {selectedIssueForConflict.conflictReason || 'Jira status differs from current test workflow state.'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedIssueForConflict(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveConflict(selectedIssueForConflict)}
                className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold cursor-pointer shadow-xs"
              >
                Sync with Workflow State
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssueDetail && !selectedIssueForConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600 text-sm font-mono">
                  {selectedIssueDetail.key}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 uppercase">
                  {selectedIssueDetail.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900">
                {selectedIssueDetail.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedIssueDetail.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Assignee</span>
                  <span className="text-slate-900 font-semibold">{selectedIssueDetail.assignee.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Priority</span>
                  <span className="text-slate-900 capitalize font-semibold">{selectedIssueDetail.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Linked Workflow</span>
                  <span className="text-indigo-600 font-semibold">{selectedIssueDetail.linkedSuiteName || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Coverage</span>
                  <span className="text-emerald-700 font-semibold">{selectedIssueDetail.stepCoverage}% Steps</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold cursor-pointer shadow-xs"
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
