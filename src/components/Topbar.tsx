import React, { useRef, useState } from 'react';
import {
  GitBranch,
  ChevronDown,
  Search,
  Bell,
  Play,
  RotateCw,
  Check,
  FolderGit2,
  Github,
  Building2,
  Users,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, TestSuite, BranchInfo, TestRunResult } from '../types';
import { UserAvatar } from './UserAvatar';
import { useClickOutside } from '../utils/useClickOutside';
import { BrowserSelector } from './BrowserSelector';

interface TopbarProps {
  activeTab: ActiveTab;
  currentSuite?: TestSuite | null;
  suites: TestSuite[];
  testRuns: TestRunResult[];
  isRunning: boolean;
  onRunTest: () => void;
  onBrowserChange: (browser: 'chromium' | 'firefox' | 'webkit') => void;
  selectedBrowser?: 'chromium' | 'firefox' | 'webkit';
  branches: BranchInfo[];
  currentBranch: string;
  onSelectBranch: (branch: string) => void;
  currentRepo?: string;
  onSelectRepo?: (repoFullName: string) => void;
  repositories?: Array<{ id: string; fullName: string; defaultBranch: string }>;
  githubConnected?: boolean;
  onOpenCopilot?: () => void;
  onOpenCommandPalette: () => void;
  currentEnvironment?: 'local' | 'staging' | 'production';
  onEnvironmentChange?: (env: 'local' | 'staging' | 'production') => void;
  hasFailure?: boolean;
  isBackendConnected?: boolean;
  backendMode?: string;
  onNavigateToTab?: (tab: ActiveTab) => void;
  onOpenGoogleAuth?: () => void;
  onOpenUploadGithub?: () => void;
  onOpenUserSessionModal?: () => void;
  onOpenLoginModal?: () => void;
  workspaceName?: string;
  onSelectWorkspace?: (wsName: string) => void;
  userName?: string;
  userRole?: string;
  isGoogleSignedIn?: boolean;
  userEmail?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentSuite,
  testRuns,
  isRunning,
  onRunTest,
  onBrowserChange,
  selectedBrowser = 'chromium',
  branches,
  currentBranch,
  onSelectBranch,
  currentRepo = 'aato-test/playsight-core',
  onSelectRepo,
  repositories = [],
  onOpenCommandPalette,
  hasFailure = false,
  onNavigateToTab,
  onOpenUploadGithub,
  onOpenUserSessionModal,
  onOpenLoginModal,
  workspaceName = 'PlaySight Core Engineering Workspace',
  onSelectWorkspace,
  userName = 'Prakash Sivakumar',
  userRole = 'Lead QA Engineer',
}) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isRepoMenuOpen, setIsRepoMenuOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const wsRef = useRef<HTMLDivElement>(null);
  const repoRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useClickOutside(wsRef, () => setIsWorkspaceMenuOpen(false));
  useClickOutside(repoRef, () => setIsRepoMenuOpen(false));
  useClickOutside(branchRef, () => setIsBranchMenuOpen(false));
  useClickOutside(notifRef, () => setIsNotificationsOpen(false));

  const recentRuns = testRuns.slice(0, 4);

  const availableWorkspaces = [
    'PlaySight Core Engineering Workspace',
    'Acme QA Automation Workspace',
    'Staging Pre-Release Hub',
  ];

  return (
    <header
      id="app-topbar"
      className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0 select-none text-slate-800 font-sans shadow-xs"
    >
      {/* Left: Brand & Hierarchy Selectors: [ Workspace ▼ ] [ Project ▼ ] [ Branch ▼ ] */}
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Brand Name */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-current fill-none stroke-[2.4]"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 8l-4 4 4 4" />
              <path d="M17 8l4 4-4 4" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight hidden md:inline">
            PlaySight <span className="text-indigo-600">Core</span>
          </span>
        </div>

        {/* 1. Company / Workspace Selector [ Company / Workspace ▼ ] */}
        <div ref={wsRef} className="relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-sm transition-all cursor-pointer shadow-2xs hover:border-slate-400"
            title="Switch Company Workspace"
          >
            <Building2 className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
            <span className="truncate max-w-[160px] lg:max-w-[200px]">
              {workspaceName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-300 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Company Workspaces</span>
                <span className="text-indigo-600 font-semibold">Active Hub</span>
              </div>
              <div className="py-1">
                {availableWorkspaces.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      onSelectWorkspace?.(ws);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-sm ${
                      ws === workspaceName
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{ws}</div>
                      <div className="text-xs text-slate-500">Shared QA Pod</div>
                    </div>
                    {ws === workspaceName && <Check className="w-4.5 h-4.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50/70">
                <button
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onOpenUserSessionModal?.();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Manage Members & Tokens</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Project / Repository Selector [ Project ▼ ] */}
        <div ref={repoRef} className="relative">
          <button
            onClick={() => setIsRepoMenuOpen(!isRepoMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-sm transition-all cursor-pointer shadow-2xs hover:border-slate-400"
            title="Active GitHub Project Repository"
          >
            <FolderGit2 className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
            <span className="truncate max-w-[160px] lg:max-w-[210px]">
              {currentRepo}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {isRepoMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-84 bg-white border border-slate-300 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Projects (GitHub Repos)</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {(repositories.length > 0
                  ? repositories
                  : [{ id: 'default', fullName: currentRepo, defaultBranch: 'main' }]
                ).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRepo?.(r.fullName);
                      setIsRepoMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-sm ${
                      r.fullName === currentRepo
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-semibold">{r.fullName}</div>
                      <div className="text-xs text-slate-500">Default branch: {r.defaultBranch}</div>
                    </div>
                    {r.fullName === currentRepo && <Check className="w-4.5 h-4.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50/70">
                <button
                  onClick={() => {
                    setIsRepoMenuOpen(false);
                    onNavigateToTab?.('integrations');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Github className="w-4 h-4 text-indigo-600" />
                  <span>Configure Repositories</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Branch Selector [ Branch ▼ ] */}
        <div ref={branchRef} className="relative">
          <button
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-sm transition-all cursor-pointer shadow-2xs hover:border-slate-400"
            title="Switch Git Branch"
          >
            <GitBranch className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
            <span className="text-indigo-700 font-bold truncate max-w-[120px] lg:max-w-[150px]">
              {currentBranch}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-300 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Active Repository Branches
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {branches.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      onSelectBranch(b.name);
                      setIsBranchMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-sm ${
                      b.name === currentBranch
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-semibold">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.commit} · {b.lastUpdated}</div>
                    </div>
                    {b.name === currentBranch && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Push to GitHub */}
        <button
          onClick={onOpenUploadGithub}
          className="hidden xl:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-400"
          title="Push Test Suites to GitHub"
        >
          <Github className="w-4.5 h-4.5 text-slate-700" />
          <span>Push to GitHub</span>
        </button>
      </div>

      {/* Right Controls: Browser, Search, Notifications, Run Button, User Session */}
      <div className="flex items-center gap-3">
        {/* Browser Selector */}
        <BrowserSelector
          currentBrowser={selectedBrowser || 'chromium'}
          onBrowserChange={onBrowserChange}
          showLabels={true}
        />

        {/* Global Search Shortcut (⌘K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-950 text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
          title="Open Command Palette (⌘K)"
        >
          <Search className="w-4.5 h-4.5 text-slate-500" />
          <span>Search...</span>
          <kbd className="font-mono text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-300 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer relative shadow-2xs"
            title="Recent Executions & Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasFailure && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-300 rounded-2xl shadow-xl p-4 z-50 text-sm">
              <div className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Recent Test Runs
              </div>
              <div className="space-y-2.5 pt-2 max-h-72 overflow-y-auto">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">
                        {run.suiteName}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          run.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {run.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-600 text-xs mt-1 font-medium">
                      {run.passedSteps}/{run.totalSteps} steps · {(run.durationMs / 1000).toFixed(2)}s · {run.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Run Test Button */}
        <button
          onClick={onRunTest}
          disabled={isRunning || !currentSuite}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all cursor-pointer shadow-md ${
            isRunning
              ? 'bg-amber-500 text-white cursor-wait'
              : !currentSuite
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98 shadow-indigo-600/25'
          }`}
          title={!currentSuite ? 'No test suite selected' : 'Run Suite Execution (⌘Enter)'}
        >
          {isRunning ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Run Suite</span>
            </>
          )}
        </button>

        {/* User Identity & Company Workspace Session */}
        <button
          onClick={onOpenUserSessionModal}
          className="pl-3 border-l border-slate-200 cursor-pointer flex items-center gap-3 hover:opacity-85 transition-opacity"
          title="Manage User Profile & Company Workspace"
        >
          <div className="relative">
            <UserAvatar name={userName} size="md" />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
              title="Active user presence"
            />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[130px]">
              {userName}
            </span>
            <span className="text-xs font-semibold text-indigo-700 truncate max-w-[130px]">
              {userRole}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
