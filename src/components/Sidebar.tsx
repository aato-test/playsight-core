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
      className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between select-none h-screen shrink-0 text-slate-700 z-30 font-sans shadow-xs"
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* PlaySight Core Brand Header */}
        <div className="h-18 px-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 stroke-current fill-none stroke-[2.2]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 8l-4 4 4 4" />
                <path d="M17 8l4 4-4 4" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>PlaySight</span>
                <span className="text-indigo-600 font-bold">Core</span>
              </div>
              <div className="text-xs text-slate-400 font-sans font-medium">
                Team Automation Hub
              </div>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="p-3 space-y-1">
          <div className="px-2 pt-2 pb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === 'copilot' && (
                  <span
                    className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-md ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    ⌘J
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Test Sequences Shortcut */}
        <div className="px-2.5 pt-3 border-t border-slate-200 mt-1">
          <div className="px-2 pb-1 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Suites</span>
            <span className="text-slate-500 tabular-nums">{suites.length}</span>
          </div>
          <div className="space-y-1">
            {suites.length === 0 ? (
              <div className="px-2 py-3 text-center rounded-lg bg-slate-50 border border-slate-100 my-1">
                <p className="text-[11px] text-slate-400 font-sans">No suites for this repo</p>
              </div>
            ) : (
              suites.map((suite) => {
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
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        suite.status === 'needs_attention'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="truncate text-xs">{suite.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {suite.nodes.length}s
                  </span>
                </button>
              );
            })
          )}
        </div>
        </div>

        {/* Lower Section: Workspace Settings & Environments */}
        <div className="p-2.5 pt-3 border-t border-slate-200 mt-auto space-y-1">
          <div className="px-2 pb-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Area */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar name="Prakash S." size="sm" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                Prakash S.
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Senior QA Engineer
              </div>
            </div>
          </div>
          <div
            title="Workspace synchronized"
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
        </div>
      </div>
    </aside>
  );
};
