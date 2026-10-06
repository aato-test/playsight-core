import React, { useState } from 'react';
import { Terminal, Save, CheckCircle2, Settings, ShieldCheck, Clock, Monitor } from 'lucide-react';

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
      setError('Port must be between 1 and 65535');
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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-900 max-w-5xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Workspace & Execution Settings
            </h2>
          </div>
          <p className="text-sm md:text-base font-medium text-slate-600 mt-1.5">
            Team and runner configs · Local runner preferences, Playwright timeouts, and RPC bindings on branch <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">{currentBranch}</span>
          </p>
        </div>
        {isSaved && (
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            Settings Applied
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Playwright Python RPC Section */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6.5 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Playwright RPC Executor Configuration
              </h3>
              <p className="text-sm text-slate-600">
                Local runner communication bridge (<code className="text-slate-800 font-bold font-mono">test_executor.py</code>)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Executor RPC Port
              </label>
              <input
                type="text"
                value={pythonPort}
                onChange={(e) => setPythonPort(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                placeholder="5005"
              />
              <span className="text-xs text-slate-500 mt-1.5 block">
                Local RPC server port binding (default: 5005)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Slow-Mo Verification Delay (ms)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slowMo}
                  onChange={(e) => setSlowMo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                  placeholder="150"
                />
                <Clock className="w-4.5 h-4.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-xs text-slate-500 mt-1.5 block">
                Artificial delay between actions for visual step verification
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Default Assertion Timeout (ms)
              </label>
              <input
                type="text"
                value={defaultTimeout}
                onChange={(e) => setDefaultTimeout(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                placeholder="10000"
              />
              <span className="text-xs text-slate-500 mt-1.5 block">
                Maximum wait duration before asserting an element fails
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Execution Mode
              </label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  id="headless-toggle"
                  checked={headlessMode}
                  onChange={(e) => setHeadlessMode(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500/30 border-slate-300 cursor-pointer"
                />
                <label htmlFor="headless-toggle" className="text-sm font-semibold text-slate-800 select-none cursor-pointer flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-500" />
                  Run headless in automated CI/CD pipelines
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          {error ? (
            <span role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3.5 py-2 rounded-xl">
              {error}
            </span>
          ) : (
            <div />
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Save className="w-4.5 h-4.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
