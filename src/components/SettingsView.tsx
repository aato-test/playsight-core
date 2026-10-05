import React, { useState } from 'react';
import { Terminal, Save } from 'lucide-react';

interface SettingsViewProps {
  currentBranch: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentBranch }) => {
  const [saved] = useState<Record<string, unknown>>(() => {
    try {
      const value = JSON.parse(localStorage.getItem('playsight.settings') || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch {
      return {};
    }
  });
  const [pythonPort, setPythonPort] = useState(String(saved.pythonPort ?? '5005'));
  const [headlessMode, setHeadlessMode] = useState(saved.headlessMode !== false);
  const [slowMo, setSlowMo] = useState(String(saved.slowMo ?? '150'));
  const [defaultTimeout, setDefaultTimeout] = useState(String(saved.defaultTimeout ?? '10000'));
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const port = Number(pythonPort);
    const delay = Number(slowMo);
    const timeout = Number(defaultTimeout);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setError('Port must be 1-65535');
      return;
    }
    if (!Number.isFinite(delay) || delay < 0 || !Number.isFinite(timeout) || timeout <= 0) {
      setError('Delay must be non-negative and timeout must be positive');
      return;
    }
    setError('');
    localStorage.setItem(
      'playsight.settings',
      JSON.stringify({ pythonPort, headlessMode, slowMo, defaultTimeout })
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Workspace Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure local executor preferences for this browser.
          </p>
        </div>
        {isSaved && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md animate-in fade-in">
            ✓ Settings Applied
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Python Bridge Section */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Terminal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold tracking-tight text-slate-100">
              Python test_executor.py Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Executor RPC Port
              </label>
              <input
                type="text"
                value={pythonPort}
                onChange={(e) => setPythonPort(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/80"
              />
              <span className="text-xs text-slate-400 mt-1 block">Local RPC server binding (default: 5005)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Slow-Mo Delay (ms)
              </label>
              <input
                type="text"
                value={slowMo}
                onChange={(e) => setSlowMo(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/80"
              />
              <span className="text-xs text-slate-400 mt-1 block">Artificial delay for visual step verification</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Default Assertion Timeout (ms)
              </label>
              <input
                type="text"
                value={defaultTimeout}
                onChange={(e) => setDefaultTimeout(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/80"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="headless-toggle"
                checked={headlessMode}
                onChange={(e) => setHeadlessMode(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-white/10 text-teal-500 focus:ring-teal-500/30"
              />
              <label htmlFor="headless-toggle" className="text-xs text-slate-300 select-none cursor-pointer">
                Run browsers in Headless mode on CI
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          {error && <span role="alert" className="mr-4 self-center text-sm text-rose-400">{error}</span>}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold tracking-tight transition-all shadow-sm shadow-teal-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
