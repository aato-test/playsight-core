import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  LogOut,
  FolderOpen,
  Download,
  Link2,
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  isSignedIn: boolean;
  onAuthChange: (signedIn: boolean, user: { name: string; email: string }) => void;
  onImportTargets: (targets: Array<{ name: string; url: string; selector?: string }>) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
  isSignedIn,
  onAuthChange,
  onImportTargets,
}) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'sheets' | 'drive'>('auth');
  const [selectedPreset, setSelectedPreset] = useState<string>('ecommerce');
  const [customSheetUrl, setCustomSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthChange(true, {
        name: userName || 'Prakash S.',
        email: userEmail || 'prakash@example.com',
      });
      setStatusMessage('Signed in with Google Workspace');
      setTimeout(() => setStatusMessage(null), 3000);
    }, 600);
  };

  const handleSignOut = () => {
    onAuthChange(false, { name: 'Local User', email: 'guest@localhost' });
    setStatusMessage('Signed out');
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const handleImportSheets = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const targets =
        selectedPreset === 'ecommerce'
          ? [
              { name: 'Storefront Catalog', url: 'https://demo.playwright.dev/todomvc', selector: '.new-todo' },
              { name: 'Shopping Cart', url: 'https://demo.playwright.dev/todomvc/#/active', selector: '.todo-list' },
            ]
          : [
              { name: 'App Home', url: 'http://localhost:3000', selector: 'header' },
              { name: 'Account Settings', url: 'http://localhost:3000/settings', selector: 'form' },
            ];

      onImportTargets(targets);
      setStatusMessage(`Imported ${targets.length} targets into Visual Builder canvas`);
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1200);
    }, 800);
  };

  const handleImportDrive = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onImportTargets([
        { name: 'Drive Scrape Job A', url: 'https://example.com/products/item-101', selector: '.btn-cart' },
        { name: 'Drive Scrape Job B', url: 'https://example.com/checkout', selector: '#place-order' },
      ]);
      setStatusMessage('Imported workflow configuration from Google Drive');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Google Workspace & Imports
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Single Sign-On and Google Sheets / Drive data ingestion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'auth'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Google Account</span>
            {isSignedIn && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sheets'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import from Sheets</span>
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drive'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
            <span>Google Drive Files</span>
          </button>
        </div>

        {/* Tab 1: Google Account Sign In */}
        {activeTab === 'auth' && (
          <div className="p-6 space-y-4">
            {isSignedIn ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold font-sans text-sm">
                      {userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {userName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium block">
                        {userEmail}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Identity Provider</span>
                    <span className="font-medium text-slate-900">Google OAuth 2.0 (SSO)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Connected Team</span>
                    <span className="font-bold text-indigo-700">PlaySight Core Pod</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 py-1.5">
                    <span className="font-semibold text-slate-500">Drive / Sheets Scope</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Authorized
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('sheets')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Import Sheets</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('drive')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Browse Drive</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="max-w-xs mx-auto space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    Sign in with your Google Account
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Access team test suites, sync target crawl lists from Google Sheets, and export scraping reports directly.
                  </p>
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-3 shadow-sm hover:border-slate-300"
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
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Choose Sample Dataset or Enter Google Sheets URL
              </label>
              <p className="text-xs text-slate-500 font-medium">
                PlaySight will read column URLs and automatically create sequence steps.
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPreset('ecommerce')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedPreset === 'ecommerce'
                    ? 'border-indigo-400 bg-indigo-50/60 text-indigo-950 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">
                  E-Commerce Targets
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Catalog, newest, Q&A
                </div>
              </button>

              <button
                onClick={() => setSelectedPreset('saas')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedPreset === 'saas'
                    ? 'border-indigo-400 bg-indigo-50/60 text-indigo-950 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">
                  Internal App Routes
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  /dashboard, /settings, /pages
                </div>
              </button>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Google Sheets Sharing Link (Optional)
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customSheetUrl}
                  onChange={(e) => setCustomSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              onClick={handleImportSheets}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Google Sheets...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Import Targets into Canvas</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 3: Google Drive Files */}
        {activeTab === 'drive' && (
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Shared Team Workflows on Google Drive
              </label>
              <p className="text-xs text-slate-500 font-medium">
                Import JSON or YAML scraping templates directly into PlaySight.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Production E-Commerce Scraper.json
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Updated today · Google Drive / QA Team
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleImportDrive}
                  disabled={isLoading}
                  className="py-1.5 px-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Import
                </button>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Lead Ingestion Recipe.yaml
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Updated yesterday · Google Drive / Leads
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleImportDrive}
                  disabled={isLoading}
                  className="py-1.5 px-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Message Footer */}
        {statusMessage && (
          <div className="px-6 py-3 bg-emerald-50 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
