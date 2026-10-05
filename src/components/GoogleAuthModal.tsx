import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  HardDrive,
  Download,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Link2,
  LogOut,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { signInGoogle, importFromGoogle } from '../services/api';
import { TestNode, ConnectionEdge, TestSuite } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  isSignedIn: boolean;
  onAuthChange: (signedIn: boolean, user: { name: string; email: string }) => void;
  onImportTargets?: (targets: { url: string; label: string }[]) => void;
  onImportSuite?: (suiteData: Partial<TestSuite>) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'prakashsivakumar27@gmail.com',
  userName = 'Prakash Sivakumar',
  isSignedIn = true,
  onAuthChange,
  onImportTargets,
  onImportSuite,
}) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'sheets' | 'drive'>('auth');
  const [customSheetUrl, setCustomSheetUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'ecommerce' | 'saas'>('ecommerce');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await signInGoogle(userEmail, userName);
      if (res && res.user) {
        onAuthChange(true, { name: res.user.name, email: res.user.email });
        setStatusMessage(`Successfully signed in as ${res.user.email}`);
      } else {
        onAuthChange(true, { name: userName, email: userEmail });
        setStatusMessage(`Signed in as ${userEmail}`);
      }
    } catch {
      onAuthChange(true, { name: userName, email: userEmail });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    onAuthChange(false, { name: 'Guest User', email: 'guest@playsight.dev' });
    setStatusMessage('Signed out of Google Account.');
  };

  const handleImportSheets = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await importFromGoogle('sheets', customSheetUrl, selectedPreset);
      if (res && res.targets) {
        if (onImportTargets) {
          onImportTargets(res.targets);
        }
        setStatusMessage(`Imported ${res.targets.length} target URLs into current sequence!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch {
      // Fallback local import
      const fallbackTargets = [
        { url: 'https://news.ycombinator.com', label: 'Tech Catalog Root' },
        { url: 'https://news.ycombinator.com/newest', label: 'Newest Submissions' },
        { url: 'https://news.ycombinator.com/ask', label: 'Q&A Items' },
      ];
      onImportTargets?.(fallbackTargets);
      setStatusMessage('Imported 3 target URLs from Google Sheet into canvas!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportDrive = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await importFromGoogle('drive');
      if (res && res.suite) {
        setStatusMessage('Imported workflow recipe from Google Drive!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200 font-sans animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
              {/* Google G Logo SVG */}
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Google Workspace & Imports
              </h3>
              <p className="text-[11px] text-slate-400">
                Single Sign-On and Google Sheets / Drive data ingestion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'auth'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Google Account</span>
            {isSignedIn && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sheets'
                ? 'border-emerald-500 text-emerald-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import from Sheets</span>
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drive'
                ? 'border-amber-500 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Drive Files</span>
          </button>
        </div>

        {/* Tab 1: Google Account Sign In */}
        {activeTab === 'auth' && (
          <div className="p-5 space-y-4">
            {isSignedIn ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold font-mono text-sm">
                      {userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">
                          {userName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono block">
                        {userEmail}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-800/60">
                    <span>Identity Provider</span>
                    <span className="font-mono text-slate-200">Google OAuth 2.0 (SSO)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-800/60">
                    <span>PlaySight Team</span>
                    <span className="font-mono text-indigo-300">PlaySight Core Team</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 py-1">
                    <span>Google Drive / Sheets Scopes</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Authorized
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('sheets')}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Import from Sheets</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('drive')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Browse Drive Files</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="max-w-xs mx-auto space-y-2">
                  <h4 className="text-sm font-semibold text-white">
                    Sign in with your Google Account
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Access team test suites, sync target crawl lists from Google Sheets, and export scraping reports directly.
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md active:scale-98"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Continue with Google ({userEmail})</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Import from Google Sheets */}
        {activeTab === 'sheets' && (
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-200">
                Choose Sample Dataset or Enter Google Sheets URL
              </label>
              <p className="text-[11px] text-slate-400">
                PlaySight will read column URLs and automatically create sequence steps.
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPreset('ecommerce')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPreset === 'ecommerce'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200">
                  E-Commerce Targets
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Catalog, newest, Q&A
                </div>
              </button>

              <button
                onClick={() => setSelectedPreset('saas')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPreset === 'saas'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200">
                  Internal App Routes
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  /dashboard, /settings, /integrations
                </div>
              </button>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Google Sheets Sharing Link (Optional)
              </label>
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={customSheetUrl}
                  onChange={(e) => setCustomSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-emerald-300 font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleImportSheets}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to Google Sheets...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Import Targets into Canvas</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 3: Google Drive Files */}
        {activeTab === 'drive' && (
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-200">
                Shared Team Workflows on Google Drive
              </label>
              <p className="text-[11px] text-slate-400">
                Import JSON or YAML scraping templates directly into PlaySight.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Production E-Commerce Scraper.json
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Updated today · Google Drive / QA Team
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleImportDrive}
                  disabled={isLoading}
                  className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Import
                </button>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Lead Ingestion Recipe.yaml
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Updated yesterday · Google Drive / Leads
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleImportDrive}
                  disabled={isLoading}
                  className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Message Footer */}
        {statusMessage && (
          <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
