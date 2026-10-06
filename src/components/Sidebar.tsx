import React from 'react';
import {
  LayoutDashboard,
  Workflow,
  PlayCircle,
  Database,
  Settings,
  Plug,
  FolderTree,
  Layers,
  Users,
  PlusCircle,
} from 'lucide-react';
import { ActiveTab, TestSuite } from '../types';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  suites: TestSuite[];
  currentSuiteId: string;
  onSelectSuite: (suiteId: string) => void;
  userName?: string;
  userRole?: string;
  onOpenUserSessionModal?: () => void;
  onCreateNewSuite?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  suites,
  currentSuiteId,
  onSelectSuite,
  userName = 'Prakash Sivakumar',
  userRole = 'Lead QA Engineer',
  onOpenUserSessionModal,
  onCreateNewSuite,
}) => {
  const primaryNavItems: {
    id: ActiveTab;
    label: string;
    subtitle: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      subtitle: 'Dashboard & telemetry',
      icon: LayoutDashboard,
    },
    {
      id: 'repo-pages',
      label: 'Repo Files & Pages',
      subtitle: 'Explore application pages',
      icon: FolderTree,
    },
    {
      id: 'workflows',
      label: 'Workflows',
      subtitle: 'Build automated test flows',
      icon: Workflow,
    },
    {
      id: 'test-runs',
      label: 'Test Runs',
      subtitle: 'Run and monitor your tests',
      icon: PlayCircle,
    },
    {
      id: 'test-data',
      label: 'Test Data',
      subtitle: 'Manage test inputs',
      icon: Database,
    },
  ];

  const workspaceNavItems: {
    id: ActiveTab;
    label: string;
    subtitle: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'integrations',
      label: 'Integrations',
      subtitle: 'Connect GitHub & Jira',
      icon: Plug,
    },
    {
      id: 'settings',
      label: 'Project Settings',
      subtitle: 'Team and runner configs',
      icon: Settings,
    },
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
      className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between select-none h-screen shrink-0 text-slate-800 z-30 font-sans shadow-xs"
    >
      {/* Top Navigation Stream */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* PlaySight Core Brand */}
        <div className="h-20 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center shadow-md shadow-green-700/20">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-current fill-none stroke-[2.4]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 8l-4 4 4 4" />
                <path d="M17 8l4 4-4 4" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>PlaySight</span>
                <span className="text-indigo-600 font-bold">Core</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                Team Automation Hub
              </div>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="p-3.5 space-y-1.5">
          <div className="px-3 pt-3 pb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left ${
                  active
                    ? 'bg-green-700 text-white shadow-md shadow-green-700/20 font-bold'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-indigo-600 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] leading-tight truncate font-bold">
                      {item.label}
                    </div>
                    <div
                      className={`text-xs truncate font-medium mt-0.5 ${
                        active ? 'text-indigo-100' : 'text-slate-500'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Test Suites Section */}
        <div className="px-3.5 pt-4 border-t border-slate-200 mt-2">
          <div className="px-3 pb-2 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Test Suites</span>
            </span>
            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
              {suites.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {suites.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200 my-1">
                <p className="text-xs text-slate-600 font-medium">No test suites for active project</p>
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
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-300 font-bold shadow-xs'
                        : 'text-slate-800 hover:bg-slate-100 border border-transparent font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          suite.status === 'needs_attention'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500 ring-2 ring-emerald-100'
                        }`}
                      />
                      <span className="truncate text-sm font-semibold">{suite.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-bold shrink-0">
                      {suite.nodes.length} steps
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Workspace & Integrations Nav */}
        <div className="p-3.5 pt-4 border-t border-slate-200 mt-auto space-y-1.5">
          <div className="px-3 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Workspace & Settings
          </div>
          {workspaceNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-workspace-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-green-700 text-white font-bold shadow-xs'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active ? 'text-white' : 'text-slate-600'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-bold truncate">{item.label}</div>
                    <div className={`text-xs truncate ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Area */}
      <div
        onClick={onOpenUserSessionModal}
        className="p-4 border-t border-slate-200 bg-slate-50 hover:bg-slate-100/90 transition-colors cursor-pointer shrink-0 select-none"
        title="Manage user profile and company workspace"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar name={userName} size="md" />
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                {userName}
              </div>
              <div className="text-xs text-indigo-700 font-semibold truncate">
                {userRole}
              </div>
            </div>
          </div>
          <div
            title="Online / Team Workspace Active"
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0"
          />
        </div>
      </div>
    </aside>
  );
};
