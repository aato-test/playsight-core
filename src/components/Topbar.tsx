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
import { BrowserSelector, BrowserEngine } from './BrowserSelector';

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
  onOpenGoogleAuth?: () => void;
  isGoogleSignedIn?: boolean;
  userEmail?: string;
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
  onOpenGoogleAuth,
  isGoogleSignedIn = true,
  userEmail = 'prakashsivakumar27@gmail.com',
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
      className="h-13 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shrink-0 select-none text-slate-800 font-sans shadow-2xs"
    >
      {/* Left: Workspace / Repository / Branch Selectors */}
      <div className="flex items-center gap-3">
        {/* Workspace Brand / Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold tracking-tight">PlaySight</span>
          <span className="text-slate-300">/</span>
        </div>

        {/* GitHub Repository Dropdown */}
        <div ref={repoRef} className="relative">
          <button
            onClick={() => setIsRepoMenuOpen(!isRepoMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs transition-colors cursor-pointer text-slate-800 font-medium shadow-2xs"
            title="Active GitHub Repository"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-mono text-xs font-semibold text-slate-800 truncate max-w-[150px] md:max-w-[200px]">
              {currentRepo}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRepoMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-76 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Connected Repositories</span>
                <span className="text-indigo-600 font-semibold">GitHub App</span>
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
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      r.fullName === currentRepo ? 'bg-indigo-50/70 text-indigo-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-mono text-xs">{r.fullName}</div>
                      <div className="text-[10px] text-slate-500">Default: {r.defaultBranch}</div>
                    </div>
                    {r.fullName === currentRepo && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                <button
                  onClick={() => {
                    setIsRepoMenuOpen(false);
                    onNavigateToTab?.('integrations');
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Connect / Manage GitHub</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Branch Dropdown */}
        <div ref={branchRef} className="relative">
          <button
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs transition-colors cursor-pointer shadow-2xs"
            title="Switch Git Branch"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-mono text-xs text-indigo-700 font-semibold truncate max-w-[120px] md:max-w-[160px]">
              {currentBranch}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-100">
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
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      b.name === currentBranch
                        ? 'bg-indigo-50/70 text-indigo-700 font-mono font-semibold'
                        : 'text-slate-700 font-mono'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{b.name}</div>
                      <div className="text-[10px] text-slate-500">{b.commit} · {b.lastUpdated}</div>
                    </div>
                    {b.name === currentBranch && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GitHub Integration Badge */}
        <button
          onClick={() => onNavigateToTab?.('integrations')}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono select-none cursor-pointer bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          title="View GitHub Integration Status"
        >
          <Github className="w-3 h-3 text-slate-600" />
          <span>GitHub:</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              githubConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className={githubConnected ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
            {githubConnected ? 'Connected' : 'Setup'}
          </span>
        </button>

        {/* Backend API Connection status badge */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono select-none ${
            isBackendConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title={
            isBackendConnected
              ? `Full-stack API Live (${backendMode === 'postgres' ? 'PostgreSQL' : 'In-Memory Store'})`
              : 'Running in Standalone Client Mode'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs text-slate-700 transition-colors cursor-pointer shadow-2xs font-medium"
            title="Active Environment"
          >
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <span className="capitalize text-xs font-mono text-slate-800">{currentEnvironment}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isEnvMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs font-mono">
              <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Target Environment
              </div>
              {(['local', 'staging', 'production'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    onEnvironmentChange(env);
                    setIsEnvMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    currentEnvironment === env ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="capitalize">{env}</span>
                  {currentEnvironment === env && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3 Browser Engines Logo Selector (Chromium / Firefox / WebKit) */}
        <BrowserSelector
          currentBrowser={currentSuite.targetBrowser as BrowserEngine}
          onBrowserChange={onBrowserChange}
          showLabels={false}
        />

        {/* Global Search Shortcut (⌘K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-2xs"
          title="Open Command Palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs">Search...</span>
          <kbd className="font-mono text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer relative shadow-2xs"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {hasFailure && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-76 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 z-50 text-xs">
              <div className="px-2 py-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Recent Executions
              </div>
              <div className="space-y-1.5 pt-2 max-h-64 overflow-y-auto">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">
                        {run.suiteName}
                      </span>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          run.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          title="Open QA Copilot Diagnostics (⌘J)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Copilot</span>
          <kbd className="font-mono text-[10px] bg-white px-1 py-0.2 rounded border border-indigo-200 text-indigo-700 shadow-2xs">
            ⌘J
          </kbd>
        </button>

        {/* Topbar Run Button */}
        <button
          onClick={onRunTest}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer shadow-xs ${
            isRunning
              ? 'bg-amber-500 text-white cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
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

        {/* Google Account & Import Button */}
        <button
          onClick={onOpenGoogleAuth}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          title="Google Workspace & Sheets Import"
        >
          {/* Google G SVG */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="hidden md:inline font-mono text-[11px] text-slate-700">
            {isGoogleSignedIn ? 'Google' : 'Sign in'}
          </span>
          {isGoogleSignedIn && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </button>

        {/* User Avatar */}
        <div
          className="pl-1 border-l border-slate-200 cursor-pointer"
          onClick={onOpenGoogleAuth}
          title="User Profile & Google Settings"
        >
          <UserAvatar name="Prakash S." size="sm" />
        </div>
      </div>
    </header>
  );
};
