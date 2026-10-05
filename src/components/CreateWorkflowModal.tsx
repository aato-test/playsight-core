import React, { useState } from 'react';
import { X, Globe, Layers, ArrowRight, Play } from 'lucide-react';
import { TestSuite } from '../types';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkflow: (suite: TestSuite) => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkflow,
}) => {
  const [name, setName] = useState('Checkout Payment Regression');
  const [browser, setBrowser] = useState<'chromium' | 'firefox' | 'webkit'>('chromium');
  const [environment, setEnvironment] = useState<'local' | 'staging' | 'production'>('staging');
  const [startingUrl, setStartingUrl] = useState('https://staging.app.example.com/checkout');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `suite-${Date.now().toString().slice(-4)}`;
    const newSuite: TestSuite = {
      id: newId,
      name: name.trim(),
      description: `Automated regression sequence on ${environment} for ${browser}.`,
      targetBrowser: browser,
      baseUrl: startingUrl.trim(),
      environment,
      status: 'passing',
      averageDuration: '0.00s',
      lastRunTime: 'Never',
      jiraIssue: 'CHK-184',
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
          jiraIssue: 'CHK-184',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-xs font-sans select-none"
    >
      <div className="w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded shadow-2xl p-5 space-y-4 text-xs text-[#F8FAFC]">
        {/* Header (Section 26) */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-[#F8FAFC] font-mono">
              Create New Workflow
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#F8FAFC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workflow Name */}
          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Checkout Payment Regression"
              className="w-full bg-[#020617] border border-[#1E293B] rounded px-3 py-2 text-xs text-[#F8FAFC] focus:border-teal-400 focus:outline-none font-medium"
              required
            />
          </div>

          {/* Browser Selection */}
          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
              Target Browser
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {(['chromium', 'firefox', 'webkit'] as const).map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBrowser(b)}
                  className={`py-1.5 px-2 rounded border text-xs capitalize transition-colors cursor-pointer ${
                    browser === b
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-semibold'
                      : 'bg-[#020617] text-[#94A3B8] border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Target Environment */}
          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
              Environment
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {(['local', 'staging', 'production'] as const).map((env) => (
                <button
                  type="button"
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className={`py-1.5 px-2 rounded border text-xs capitalize transition-colors cursor-pointer ${
                    environment === env
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-semibold'
                      : 'bg-[#020617] text-[#94A3B8] border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Starting URL */}
          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
              Starting URL Target
            </label>
            <input
              type="text"
              value={startingUrl}
              onChange={(e) => setStartingUrl(e.target.value)}
              placeholder="https://staging.app.example.com/checkout"
              className="w-full bg-[#020617] border border-[#1E293B] rounded px-3 py-2 text-xs text-cyan-300 font-mono focus:border-teal-400 focus:outline-none"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-2 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
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
