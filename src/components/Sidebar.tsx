import React from 'react';
import {
  LayoutDashboard,
  Workflow,
  Clock,
  GitPullRequest,
  Database,
  Sparkles,
  Settings,
  Server,
  Layers,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { ActiveTab, TestSuite } from '../types';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  suites: TestSuite[];
  currentSuiteId: string;
  onSelectSuite: (suiteId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  suites,
  currentSuiteId,
  onSelectSuite,
}) => {
  // Section 5 Navigation Spec
  const primaryNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'test-runs', label: 'Test Runs', icon: Clock },
    { id: 'traceability', label: 'Traceability', icon: GitPullRequest },
    { id: 'test-data', label: 'Test Data', icon: Database },
    { id: 'copilot', label: 'QA Copilot', icon: Sparkles },
  ];

  const workspaceNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'settings', label: 'Project Settings', icon: Settings },
    { id: 'environments', label: 'Environments', icon: Server },
    { id: 'integrations', label: 'Integrations', icon: Layers },
  ];

  const isTabActive = (tabId: ActiveTab) => {
    if (activeTab === tabId) return true;
    if (tabId === 'overview' && activeTab === 'dashboard') return true;
    if (tabId === 'workflows' && activeTab === 'builder') return true;
    if (tabId === 'test-runs' && activeTab === 'history') return true;
    if (tabId === 'traceability' && activeTab === 'jira') return true;
    return false;
  };

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-[#0F172A] border-r border-[#1E293B] flex flex-col justify-between select-none h-screen shrink-0 text-slate-300 z-30 font-sans"
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* PlaySight Core Brand Header */}
        <div className="h-14 px-4 border-b border-[#1E293B] flex items-center justify-between shrink-0 bg-[#020617]/50">
          <div className="flex items-center gap-2.5">
            {/* Subtle engineering/automation mark */}
            <div className="w-7 h-7 rounded bg-[#111827] border border-[#1E293B] flex items-center justify-center text-teal-400 shadow-xs">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 stroke-current fill-none stroke-[2.2]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 8l-4 4 4 4" />
                <path d="M17 8l4 4-4 4" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-xs tracking-tight text-[#F8FAFC] flex items-center gap-1.5">
                <span>PlaySight</span>
                <span className="text-teal-400 font-semibold">Core</span>
              </div>
              <div className="text-[10px] text-[#64748B] font-mono tracking-wider uppercase">
                QA Workspace
              </div>
            </div>
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono bg-[#111827] border border-[#1E293B] px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </div>

        {/* Primary Navigation */}
        <div className="p-2 space-y-0.5">
          <div className="px-2 pt-2 pb-1 text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
            Test Engineering
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.id);

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-[#111827] text-teal-300 border border-[#1E293B] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-teal-400' : 'text-[#64748B]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === 'copilot' && (
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded">
                    ⌘J
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Test Sequences Shortcut */}
        <div className="px-2 pt-2 border-t border-[#1E293B]/70 mt-1">
          <div className="px-2 pb-1 flex items-center justify-between text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
            <span>Sequences</span>
            <span className="text-slate-400 tabular-nums">{suites.length}</span>
          </div>
          <div className="space-y-0.5">
            {suites.map((suite) => {
              const isSelected =
                suite.id === currentSuiteId && (activeTab === 'workflows' || activeTab === 'builder');
              return (
                <button
                  key={suite.id}
                  id={`sidebar-suite-${suite.id}`}
                  onClick={() => {
                    onSelectSuite(suite.id);
                    onSelectTab('workflows');
                  }}
                  className={`w-full text-left px-2 py-1.2 rounded text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-[#111827] text-teal-300 border border-teal-500/30 font-medium'
                      : 'text-[#94A3B8] hover:bg-[#111827]/40 hover:text-[#F8FAFC] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-xs shrink-0 ${
                        suite.status === 'needs_attention'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="truncate text-[11px]">{suite.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                    {suite.nodes.length}s
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lower Section: Workspace Settings & Environments */}
        <div className="p-2 pt-3 border-t border-[#1E293B]/70 mt-auto space-y-0.5">
          <div className="px-2 pb-1 text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
            Workspace
          </div>
          {workspaceNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-workspace-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-[#111827] text-teal-300 border border-[#1E293B] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active ? 'text-teal-400' : 'text-[#64748B]'
                    }`}
                  />
                  <span className="truncate text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Area (Section 5 Spec: Prakash S. Senior QA Engineer) */}
      <div className="p-3 border-t border-[#1E293B] bg-[#020617]/70 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar name="Prakash S." size="sm" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                Prakash S.
              </div>
              <div className="text-[10px] text-[#94A3B8] truncate">
                Senior QA Engineer
              </div>
            </div>
          </div>
          <div
            title="Local workspace active"
            className="w-2 h-2 rounded-xs bg-emerald-400"
          />
        </div>
      </div>
    </aside>
  );
};
