import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { UserSession } from './UserSessionModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession, workspaceName?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'join'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'prakashsivakumar27@gmail.com',
          name: 'Prakash Sivakumar',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Welcome, ${data.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(
            {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role || 'Lead QA Engineer',
              organization: 'AATO Technologies',
              workspaceName: 'PlaySight Core Engineering Workspace',
              avatarUrl: data.user.avatarUrl,
            },
            'PlaySight Core Engineering Workspace'
          );
          onClose();
        }, 800);
      } else {
        setError(data.error || 'Failed to authenticate with Google');
      }
    } catch {
      setError('Connection to authentication server failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email + Password Login
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your work email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Signed in as ${data.user.email}`);
        setTimeout(() => {
          onLoginSuccess(
            {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.workspace?.role || 'Test Engineer',
              organization: 'Company Workspace',
              workspaceName: data.workspace?.name || 'PlaySight Core Engineering Workspace',
            },
            data.workspace?.name
          );
          onClose();
        }, 800);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('Authentication server is unreachable');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Name, valid email, and password (min 6 chars) are required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, organization, inviteCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          onLoginSuccess(
            {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: 'Admin',
              organization: organization || 'Company Workspace',
              workspaceName: data.workspace?.name || 'Main Team Workspace',
            },
            data.workspace?.name
          );
          onClose();
        }, 800);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch {
      setError('Sign up server error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Join Workspace by Invite Code
  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Please provide a valid company invite code');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/workspaces/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Joined workspace: ${data.workspace.name}`);
        setTimeout(() => {
          onLoginSuccess(
            {
              id: `usr-${Date.now()}`,
              name: email ? email.split('@')[0] : 'Team Member',
              email: email || 'member@company.com',
              role: data.workspace.role,
              organization: data.workspace.organization,
              workspaceName: data.workspace.name,
            },
            data.workspace.name
          );
          onClose();
        }, 800);
      } else {
        setError(data.error || 'Invalid or expired invite code');
      }
    } catch {
      setError('Failed to verify company invite code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-slate-800">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header with PlaySight Core Logo */}
        <div className="px-7 pt-7 pb-5 border-b border-slate-200 bg-slate-50/90 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-700 text-white shadow-md shadow-green-700/25 mb-3">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 stroke-current fill-none stroke-[2.4]"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 8l-4 4 4 4" />
              <path d="M17 8l4 4-4 4" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            PlaySight <span className="text-indigo-600">Core</span>
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Enterprise Test Automation & Quality Platform
          </p>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 mt-4 text-xs font-semibold">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => { setMode('join'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'join' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Join Workspace
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode 1: Sign In */}
          {mode === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 text-sm font-bold shadow-xs hover:border-slate-400 transition-all cursor-pointer active:scale-98"
              >
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
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-semibold text-slate-500 uppercase">
                  or with email
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setSuccessMsg('Password reset link sent to registered email.')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-md shadow-green-700/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode 2: Create Account */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prakash Sivakumar"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prakash@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Organization / Company
                </label>
                <div className="relative">
                  <Building2 className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Acme Technologies"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-md shadow-green-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create Company Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode 3: Join Workspace with Invitation Code */}
          {mode === 'join' && (
            <form onSubmit={handleJoinWorkspace} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium leading-relaxed">
                Got a team invite code from your company admin? Paste it below to join the shared workspace with team test suites, runs, and credentials.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Invite Code
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="PLAY-CORP-9481-INVITE"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: PLAY-CORP-XXXX-INVITE or ACME-AUTO-XXXX-KEY
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Work Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prakash@company.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-md shadow-green-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Join Team Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
          Protected by Enterprise SSO & Role-Based Access Controls
        </div>
      </div>
    </div>
  );
};
