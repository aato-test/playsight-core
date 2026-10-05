import React, { useRef, useState } from 'react';
import {
  GitBranch,
  ChevronDown,
  Search,
  Bell,
  Sparkles,
  Play,
  RotateCw,
  ExternalLink,
  Check,
  Server,
  Globe,
  Sliders,
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
  onOpenCopilot: () => void;
  onOpenCommandPalette: () => void;
  currentEnvironment: 'local' | 'staging' | 'production';
  onEnvironmentChange: (env: 'local' | 'staging' | 'production') => void;
  hasFailure?: boolean;
  isBackendConnected?: boolean;
  backendMode?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  currentSuite,
  testRuns,
  isRunning,
  onRunTest,
  onBrowserChange,
  branches,
  currentBranch,
  onSelectBranch,
  onOpenCopilot,
  onOpenCommandPalette,
  currentEnvironment,
  onEnvironmentChange,
  hasFailure = false,
  isBackendConnected = false,
  backendMode = 'in-memory',
}) => {
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isEnvMenuOpen, setIsEnvMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useClickOutside(branchRef, () => setIsBranchMenuOpen(false));
  useClickOutside(envRef, () => setIsEnvMenuOpen(false));
  useClickOutside(notifRef, () => setIsNotificationsOpen(false));

  const recentRuns = testRuns.slice(0, 4);

  return (
    <header
      id="app-topbar"
      className="h-12 bg-[#020617] border-b border-[#1E293B] px-4 flex items-center justify-between z-20 shrink-0 select-none text-[#F8FAFC] font-sans"
    >
      {/* Left: Workspace / Project Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#94A3B8] font-medium">PlaySight Core</span>
          <span className="text-[#64748B]">/</span>
          <span className="text-[#F8FAFC] font-semibold">Checkout</span>
        </div>

        {/* Current Branch (Center or contextual area: JetBrains Mono) */}
        <div ref={branchRef} className="relative">
          <button
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] text-xs transition-colors cursor-pointer"
            title="Switch Git Branch"
          >
            <GitBranch className="w-3 h-3 text-teal-400 shrink-0" />
            <span className="font-mono text-xs text-teal-300 font-medium">
              {currentBranch}
            </span>
            <ChevronDown className="w-3 h-3 text-[#64748B]" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-[#0F172A] border border-[#1E293B] rounded shadow-xl py-1 z-50 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-mono text-[#64748B] uppercase tracking-wider border-b border-[#1E293B]">
                Active Branches
              </div>
              {branches.map((b) => (
                <button
                  key={b.name}
                  onClick={() => {
                    onSelectBranch(b.name);
                    setIsBranchMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-[#111827] transition-colors cursor-pointer ${
                    b.name === currentBranch
                      ? 'bg-teal-500/10 text-teal-300 font-mono font-medium'
                      : 'text-[#94A3B8] font-mono'
                  }`}
                >
                  <div className="truncate">
                    <div>{b.name}</div>
                    <div className="text-[10px] text-[#64748B]">{b.commit} · {b.lastUpdated}</div>
                  </div>
                  {b.name === currentBranch && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Backend API Connection status badge */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono select-none ${
            isBackendConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800/60 text-[#94A3B8] border-slate-700'
          }`}
          title={
            isBackendConnected
              ? `Full-stack API Live (${backendMode === 'postgres' ? 'PostgreSQL' : 'In-Memory Store'})`
              : 'Running in Standalone Client Mode'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
            }`}
          />
          <span>{isBackendConnected ? `API: ${backendMode.toUpperCase()}` : 'MODE: CLIENT'}</span>
        </div>
      </div>

      {/* Right Controls: Environment, Browser, Search, Notifications, Copilot, User */}
      <div className="flex items-center gap-2">
        {/* Environment Selector (Local / Staging / Production) */}
        <div ref={envRef} className="relative">
          <button
            onClick={() => setIsEnvMenuOpen(!isEnvMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] text-xs text-[#94A3B8] transition-colors cursor-pointer"
            title="Active Environment"
          >
            <Server className="w-3 h-3 text-cyan-400" />
            <span className="capitalize text-xs font-mono text-[#F8FAFC]">{currentEnvironment}</span>
            <ChevronDown className="w-3 h-3 text-[#64748B]" />
          </button>

          {isEnvMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#0F172A] border border-[#1E293B] rounded shadow-xl py-1 z-50 text-xs font-mono">
              <div className="px-2.5 py-1 text-[10px] text-[#64748B] uppercase tracking-wider border-b border-[#1E293B]">
                Target Environment
              </div>
              {(['local', 'staging', 'production'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    onEnvironmentChange(env);
                    setIsEnvMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-[#111827] cursor-pointer ${
                    currentEnvironment === env ? 'text-teal-300 font-medium' : 'text-[#94A3B8]'
                  }`}
                >
                  <span className="capitalize">{env}</span>
                  {currentEnvironment === env && <Check className="w-3 h-3 text-teal-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Browser Selector Indicator (Chromium / Firefox / WebKit) */}
        <div className="flex items-center bg-[#0F172A] border border-[#1E293B] rounded p-0.5 text-xs font-mono">
          {(['chromium', 'firefox', 'webkit'] as const).map((b) => (
            <button
              key={b}
              onClick={() => onBrowserChange(b)}
              className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors cursor-pointer ${
                currentSuite.targetBrowser === b
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-medium'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
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
          className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-pointer"
          title="Open Command Palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="hidden md:inline text-xs">Search...</span>
          <kbd className="font-mono text-[10px] bg-[#111827] text-[#94A3B8] px-1 py-0.2 rounded border border-[#1E293B]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 rounded bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {hasFailure && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-[#0F172A] border border-[#1E293B] rounded shadow-xl p-2 z-50 text-xs">
              <div className="px-1.5 py-1 text-[10px] font-mono text-[#64748B] uppercase tracking-wider border-b border-[#1E293B]">
                Recent Executions
              </div>
              <div className="space-y-1.5 pt-2">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-2 rounded bg-[#020617] border border-[#1E293B] text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F8FAFC] truncate">
                        {run.suiteName}
                      </span>
                      <span
                        className={`font-mono text-[10px] ${
                          run.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {run.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[#64748B] font-mono text-[10px] mt-0.5">
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
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium transition-colors cursor-pointer"
          title="Open QA Copilot Diagnostics (⌘J)"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden sm:inline">Copilot</span>
          <kbd className="font-mono text-[10px] bg-[#020617] px-1 py-0.2 rounded border border-teal-500/30 text-teal-300">
            ⌘J
          </kbd>
        </button>

        {/* Topbar Run Button when in builder or overview */}
        <button
          onClick={onRunTest}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer ${
            isRunning
              ? 'bg-amber-500 text-slate-950 cursor-wait'
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-xs'
          }`}
          title="Run Sequence (⌘Enter)"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-3 h-3 animate-spin" />
              <span>Running</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Prakash S. Avatar */}
        <div className="pl-1 border-l border-[#1E293B]">
          <UserAvatar name="Prakash S." size="sm" />
        </div>
      </div>
    </header>
  );
};
