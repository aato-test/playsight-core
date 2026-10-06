import React, { useState } from 'react';
import { X, Layers, ArrowRight, FolderGit2 } from 'lucide-react';
import { TestSuite } from '../types';
import { BrowserSelector, BrowserEngine } from './BrowserSelector';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkflow: (suite: TestSuite) => void;
  currentRepo?: string;
  currentBranch?: string;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkflow,
  currentRepo = 'aato-test/playsight-core',
  currentBranch = 'main',
}) => {
  const [name, setName] = useState('Checkout Payment Regression');
  const [browser, setBrowser] = useState<BrowserEngine>('chromium');
  const [environment, setEnvironment] = useState<'local' | 'staging' | 'production'>('staging');
  const [startingUrl, setStartingUrl] = useState('https://staging.app.example.com/checkout');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `suite-${Date.now().toString().slice(-4)}`;
    const newSuite: TestSuite = {
      id: newId,
      repositoryFullName: currentRepo,
      branchName: currentBranch,
      name: name.trim(),
      description: `Automated regression sequence on ${environment} for ${browser} (${currentRepo}).`,
      targetBrowser: browser,
      baseUrl: startingUrl.trim(),
      environment,
      status: 'passing',
      averageDuration: '0.00s',
      lastRunTime: 'Never',
      jiraIssue: undefined,
      nodes: [
        {
          id: `node-${Date.now().toString().slice(-4)}`,
          type: 'navigate',
          title: 'Navigate to Application',
          position: { x: 80, y: 140 },
          data: {
            url: startingUrl.trim(),
            timeout: 8000,
            waitUntil: 'networkidle',
          },
          status: 'idle',
          confidence: 100,
          source: 'Route definition',
          lastExecution: 'Ready',
          jiraIssue: undefined,
        },
      ],
      edges: [],
      updatedAt: 'Just now',
    };

    onCreateWorkflow(newSuite);
    onClose();
  };

  return (
    <div
      id="create-workflow-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans select-none"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4 text-xs text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Create New Test Suite
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Repository Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
            <span className="font-sans text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Target Repo
            </span>
            <span className="font-semibold text-indigo-700 flex items-center gap-1.5 font-sans">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentRepo}</span>
              <span className="text-slate-400 font-normal">({currentBranch})</span>
            </span>
          </div>

          {/* Workflow Name */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              Suite Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Checkout Payment Regression"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-medium"
              required
            />
          </div>

          {/* Browser Selection with Logos */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
              Target Browser Engine
            </label>
            <div className="flex">
              <BrowserSelector
                currentBrowser={browser}
                onBrowserChange={setBrowser}
                className="w-full justify-between"
                showLabels={true}
              />
            </div>
          </div>

          {/* Target Environment */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              Environment
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {(['local', 'staging', 'production'] as const).map((env) => (
                <button
                  type="button"
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className={`py-2 px-2 rounded-xl border text-xs capitalize transition-colors cursor-pointer font-medium ${
                    environment === env
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Starting URL */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              Starting URL Target
            </label>
            <input
              type="text"
              value={startingUrl}
              onChange={(e) => setStartingUrl(e.target.value)}
              placeholder="https://staging.app.example.com/checkout"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-indigo-700 font-mono focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-all"
            >
              <span>Start Building</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
