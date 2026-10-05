import React, { useRef, useState } from 'react';
import {
  GitBranch,
  ChevronDown,
  Search,
  Bell,
  Sparkles,
  Play,
  RotateCw,
  Check,
  Server,
  FolderGit2,
  Github,
} from 'lucide-react';
import { ActiveTab, TestSuite, BranchInfo, TestRunResult } from '../types';
import { UserAvatar } from './UserAvatar';
import { useClickOutside } from '../utils/useClickOutside';

interface TopbarProps {
  activeTab: ActiveTab;
  currentSuite: TestSuite;
  suites: TestSuite[];
  testRuns: TestRunResult[];
  isRunning: boolean;
  onRunTest: () => void;
  onBrowserChange: (browser: 'chromium' | 'firefox' | 'webkit') => void;
  branches: BranchInfo[];
  currentBranch: string;
  onSelectBranch: (branch: string) => void;
  currentRepo?: string;
  onSelectRepo?: (repoFullName: string) => void;
  repositories?: Array<{ id: string; fullName: string; defaultBranch: string }>;
  githubConnected?: boolean;
  onOpenCopilot: () => void;
  onOpenCommandPalette: () => void;
  currentEnvironment: 'local' | 'staging' | 'production';
  onEnvironmentChange: (env: 'local' | 'staging' | 'production') => void;
  hasFailure?: boolean;
  isBackendConnected?: boolean;
  backendMode?: string;
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentSuite,
  testRuns,
  isRunning,
  onRunTest,
  onBrowserChange,
  branches,
  currentBranch,
  onSelectBranch,
  currentRepo = 'aato-test/playsight-core',
  onSelectRepo,
  repositories = [],
  githubConnected = true,
  onOpenCopilot,
  onOpenCommandPalette,
  currentEnvironment,
  onEnvironmentChange,
  hasFailure = false,
  isBackendConnected = false,
  backendMode = 'in-memory',
  onNavigateToTab,
}) => {
  const [isRepoMenuOpen, setIsRepoMenuOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isEnvMenuOpen, setIsEnvMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const repoRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useClickOutside(repoRef, () => setIsRepoMenuOpen(false));
  useClickOutside(branchRef, () => setIsBranchMenuOpen(false));
  useClickOutside(envRef, () => setIsEnvMenuOpen(false));
  useClickOutside(notifRef, () => setIsNotificationsOpen(false));

  const recentRuns = testRuns.slice(0, 4);

  return (
    <header
      id="app-topbar"
      className="h-13 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0 select-none text-slate-100 font-sans"
    >
      {/* Left: Workspace / Repository / Branch Selectors */}
      <div className="flex items-center gap-3">
        {/* Workspace Brand / Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">PlaySight</span>
          <span className="text-slate-600">/</span>
        </div>

        {/* GitHub Repository Dropdown */}
        <div ref={repoRef} className="relative">
          <button
            onClick={() => setIsRepoMenuOpen(!isRepoMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition-colors cursor-pointer text-slate-200"
            title="Switch GitHub Repository"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-mono text-xs font-medium text-slate-200 truncate max-w-[140px] md:max-w-[180px]">
              {currentRepo}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isRepoMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                <span>Connected Repositories</span>
                <span className="text-indigo-400 font-medium">GitHub App</span>
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
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
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/70 transition-colors cursor-pointer ${
                      r.fullName === currentRepo ? 'bg-indigo-950/40 text-indigo-300 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-mono text-xs">{r.fullName}</div>
                      <div className="text-[10px] text-slate-500">Default: {r.defaultBranch}</div>
                    </div>
                    {r.fullName === currentRepo && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Branch Dropdown */}
        <div ref={branchRef} className="relative">
          <button
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition-colors cursor-pointer"
            title="Switch Git Branch"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-mono text-xs text-indigo-300 font-medium truncate max-w-[120px] md:max-w-[160px]">
              {currentBranch}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Discovered Branches
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {branches.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      onSelectBranch(b.name);
                      setIsBranchMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/70 transition-colors cursor-pointer ${
                      b.name === currentBranch
                        ? 'bg-indigo-950/40 text-indigo-300 font-mono font-medium'
                        : 'text-slate-300 font-mono'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{b.name}</div>
                      <div className="text-[10px] text-slate-500">{b.commit} · {b.lastUpdated}</div>
                    </div>
                    {b.name === currentBranch && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GitHub Integration Badge */}
        <button
          onClick={() => onNavigateToTab?.('integrations')}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono select-none cursor-pointer bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
          title="View GitHub Integration Status"
        >
          <Github className="w-3 h-3 text-slate-400" />
          <span>GitHub:</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              githubConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className={githubConnected ? 'text-emerald-400' : 'text-amber-400'}>
            {githubConnected ? 'Connected' : 'Setup'}
          </span>
        </button>

        {/* Backend API Connection status badge */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono select-none ${
            isBackendConnected
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title={
            isBackendConnected
              ? `Full-stack API Live (${backendMode === 'postgres' ? 'PostgreSQL' : 'In-Memory Store'})`
              : 'Running in Standalone Client Mode'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span>{isBackendConnected ? `API: ${backendMode.toUpperCase()}` : 'STANDALONE'}</span>
        </div>
      </div>

      {/* Right Controls: Environment, Browser, Search, Notifications, Copilot, Run */}
      <div className="flex items-center gap-2">
        {/* Environment Selector (Local / Staging / Production) */}
        <div ref={envRef} className="relative">
          <button
            onClick={() => setIsEnvMenuOpen(!isEnvMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            title="Active Environment"
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span className="capitalize text-xs font-mono text-slate-200">{currentEnvironment}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isEnvMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
              <div className="px-3 py-1.5 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Target Environment
              </div>
              {(['local', 'staging', 'production'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    onEnvironmentChange(env);
                    setIsEnvMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/70 cursor-pointer ${
                    currentEnvironment === env ? 'text-indigo-300 font-medium' : 'text-slate-300'
                  }`}
                >
                  <span className="capitalize">{env}</span>
                  {currentEnvironment === env && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Browser Selector Indicator (Chromium / Firefox / WebKit) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
          {(['chromium', 'firefox', 'webkit'] as const).map((b) => (
            <button
              key={b}
              onClick={() => onBrowserChange(b)}
              className={`px-2 py-1 rounded-md text-[11px] capitalize transition-colors cursor-pointer ${
                currentSuite.targetBrowser === b
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Switch test runner to ${b}`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Global Search Shortcut (⌘K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Open Command Palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs">Search...</span>
          <kbd className="font-mono text-[10px] bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {hasFailure && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-slate-950" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-76 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 text-xs">
              <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Recent Executions
              </div>
              <div className="space-y-1.5 pt-2 max-h-64 overflow-y-auto">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 truncate">
                        {run.suiteName}
                      </span>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                          run.status === 'passed'
                            ? 'bg-emerald-950/50 text-emerald-400'
                            : 'bg-rose-950/50 text-rose-400'
                        }`}
                      >
                        {run.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono text-[10px] mt-1">
                      {run.passedSteps}/{run.totalSteps} steps · {(run.durationMs / 1000).toFixed(2)}s · {run.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QA Copilot Shortcut Button (⌘J) */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
          title="Open QA Copilot Diagnostics (⌘J)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Copilot</span>
          <kbd className="font-mono text-[10px] bg-slate-950 px-1 py-0.2 rounded border border-indigo-500/30 text-indigo-300">
            ⌘J
          </kbd>
        </button>

        {/* Topbar Run Button */}
        <button
          onClick={onRunTest}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer shadow-sm ${
            isRunning
              ? 'bg-amber-500 text-slate-950 cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-98'
          }`}
          title="Run Sequence (⌘Enter)"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Running</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* User Avatar */}
        <div className="pl-1 border-l border-slate-800">
          <UserAvatar name="Prakash S." size="sm" />
        </div>
      </div>
    </header>
  );
};
