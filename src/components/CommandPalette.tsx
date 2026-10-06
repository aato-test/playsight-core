import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Workflow,
  Play,
  Clock,
  GitPullRequest,
  Sparkles,
  Server,
  Layers,
  Maximize2,
  GitCommit,
  Plus,
  X,
  Command,
} from 'lucide-react';
import { ActiveTab, TestSuite } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onRunCurrentWorkflow: () => void;
  onCreateNewWorkflow: () => void;
  onAutoLayout: () => void;
  onFitCanvas: () => void;
  onEnvironmentChange: (env: 'local' | 'staging' | 'production') => void;
  suites: TestSuite[];
  onSelectSuite: (suiteId: string) => void;
}

interface CommandItem {
  id: string;
  category: 'Actions' | 'Navigation' | 'Canvas' | 'Environments';
  title: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onRunCurrentWorkflow,
  onCreateNewWorkflow,
  onAutoLayout,
  onFitCanvas,
  onEnvironmentChange,
  suites,
  onSelectSuite,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'cmd-create-workflow',
      category: 'Actions',
      title: 'Create new workflow sequence',
      shortcut: '⌘N',
      icon: Plus,
      action: () => {
        onCreateNewWorkflow();
        onClose();
      },
    },
    {
      id: 'cmd-run-workflow',
      category: 'Actions',
      title: 'Run active test workflow',
      shortcut: '⌘Enter',
      icon: Play,
      action: () => {
        onRunCurrentWorkflow();
        onClose();
      },
    },
    {
      id: 'cmd-open-copilot',
      category: 'Actions',
      title: 'Open QA Copilot diagnostics',
      shortcut: '⌘J',
      icon: Sparkles,
      action: () => {
        onSelectTab('copilot');
        onClose();
      },
    },
    {
      id: 'cmd-nav-overview',
      category: 'Navigation',
      title: 'Go to Overview Dashboard',
      icon: Workflow,
      action: () => {
        onSelectTab('overview');
        onClose();
      },
    },
    {
      id: 'cmd-nav-workflows',
      category: 'Navigation',
      title: 'Go to Visual Workflow Editor',
      icon: Workflow,
      action: () => {
        onSelectTab('workflows');
        onClose();
      },
    },
    {
      id: 'cmd-nav-test-runs',
      category: 'Navigation',
      title: 'Open Test Runs and Playwright Traces',
      icon: Clock,
      action: () => {
        onSelectTab('test-runs');
        onClose();
      },
    },
    {
      id: 'cmd-nav-traceability',
      category: 'Navigation',
      title: 'Open Jira Traceability Matrix',
      icon: GitPullRequest,
      action: () => {
        onSelectTab('traceability');
        onClose();
      },
    },
    {
      id: 'cmd-canvas-layout',
      category: 'Canvas',
      title: 'Auto Layout canvas nodes horizontally',
      icon: GitCommit,
      action: () => {
        onAutoLayout();
        onClose();
      },
    },
    {
      id: 'cmd-canvas-fit',
      category: 'Canvas',
      title: 'Fit workflow sequence to view',
      shortcut: 'F',
      icon: Maximize2,
      action: () => {
        onFitCanvas();
        onClose();
      },
    },
    {
      id: 'cmd-env-staging',
      category: 'Environments',
      title: 'Switch target environment to Staging',
      icon: Server,
      action: () => {
        onEnvironmentChange('staging');
        onClose();
      },
    },
    {
      id: 'cmd-env-production',
      category: 'Environments',
      title: 'Switch target environment to Production',
      icon: Server,
      action: () => {
        onEnvironmentChange('production');
        onClose();
      },
    },
    {
      id: 'cmd-env-local',
      category: 'Environments',
      title: 'Switch target environment to Local',
      icon: Server,
      action: () => {
        onEnvironmentChange('local');
        onClose();
      },
    },
    ...suites.map((s) => ({
      id: `suite-${s.id}`,
      category: 'Navigation' as const,
      title: `Open sequence: ${s.name}`,
      icon: Workflow,
      action: () => {
        onSelectSuite(s.id);
        onSelectTab('workflows');
        onClose();
      },
    })),
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-xs font-sans select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Input Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50/80">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, navigate views, or jump to suites..."
            className="w-full bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          <kbd className="text-[10px] font-sans font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-medium text-xs">
              No matching commands or suites found.
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-2xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
