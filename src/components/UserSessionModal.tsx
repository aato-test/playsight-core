import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Building2,
  Shield,
  Clock,
  Check,
  CheckCircle2,
  Briefcase,
  History,
  KeyRound,
  Users,
  UserPlus,
  Copy,
  RefreshCw,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  workspaceName: string;
  avatarUrl?: string;
}

export interface AuditAction {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'info';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Test Engineer' | 'Viewer';
  joinedAt: string;
  status: 'active' | 'invited';
}

interface UserSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onUpdateSession: (newSession: UserSession) => void;
  auditLogs: AuditAction[];
  onOpenLoginModal?: () => void;
}

const AVAILABLE_WORKSPACES = [
  { id: 'ws-playsight-core-01', name: 'PlaySight Core Engineering Workspace', role: 'Admin' },
  { id: 'ws-qa-staging-02', name: 'Acme QA Automation Workspace', role: 'Test Engineer' },
  { id: 'ws-release-gate-03', name: 'Staging Pre-Release Hub', role: 'Viewer' },
];

export const UserSessionModal: React.FC<UserSessionModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onUpdateSession,
  auditLogs,
  onOpenLoginModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'invitations' | 'audit'>('profile');
  const [name, setName] = useState(currentSession.name);
  const [email, setEmail] = useState(currentSession.email);
  const [role, setRole] = useState(currentSession.role);
  const [organization, setOrganization] = useState(currentSession.organization);
  const [workspaceName, setWorkspaceName] = useState(currentSession.workspaceName);
  const [isSaved, setIsSaved] = useState(false);

  // Invitation tab state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Test Engineer' | 'Viewer'>('Test Engineer');
  const [inviteCode, setInviteCode] = useState('PLAY-CORP-9481-INVITE');
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  // Team members
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'tm-1',
      name: currentSession.name,
      email: currentSession.email,
      role: 'Admin',
      joinedAt: 'Aug 2024',
      status: 'active',
    },
    {
      id: 'tm-2',
      name: 'Daniel Jones',
      email: 'daniel.j@company.com',
      role: 'Test Engineer',
      joinedAt: 'Sep 2024',
      status: 'active',
    },
    {
      id: 'tm-3',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@company.com',
      role: 'Test Engineer',
      joinedAt: 'Sep 2024',
      status: 'active',
    },
    {
      id: 'tm-4',
      name: 'Mike Thomas',
      email: 'mike.t@company.com',
      role: 'Viewer',
      joinedAt: 'Oct 2024',
      status: 'active',
    },
  ]);

  useEffect(() => {
    // Fetch team members from backend if available
    fetch('/api/auth/team')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.members) {
          setMembers(data.members);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSession = {
      ...currentSession,
      name: name.trim() || 'Prakash Sivakumar',
      email: email.trim() || 'prakash@company.com',
      role: role.trim() || 'Admin',
      organization: organization.trim() || 'Company Workspace',
      workspaceName: workspaceName.trim() || 'PlaySight Core Engineering Workspace',
    };
    onUpdateSession(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleSelectWorkspace = (ws: { name: string; role: string }) => {
    setWorkspaceName(ws.name);
    setRole(ws.role);
    const updated = { ...currentSession, workspaceName: ws.name, role: ws.role };
    onUpdateSession(updated);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    fetch('/api/auth/workspaces/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setInviteFeedback(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
          setMembers((prev) => [
            ...prev,
            {
              id: `tm-${Date.now()}`,
              name: inviteEmail.split('@')[0],
              email: inviteEmail,
              role: inviteRole,
              joinedAt: 'Invited just now',
              status: 'invited',
            },
          ]);
          setInviteEmail('');
        }
      })
      .catch(() => {
        setInviteFeedback(`Invitation dispatched for ${inviteEmail}`);
      });
  };

  const handleGenerateNewCode = () => {
    fetch('/api/auth/workspaces/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: inviteRole }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.inviteCode) {
          setInviteCode(data.inviteCode);
        } else {
          setInviteCode(`PLAY-CORP-${Math.floor(1000 + Math.random() * 9000)}-INVITE`);
        }
        setInviteFeedback('Generated new workspace invitation code');
      })
      .catch(() => {
        setInviteCode(`PLAY-CORP-${Math.floor(1000 + Math.random() * 9000)}-INVITE`);
      });
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-slate-800">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3.5">
            <UserAvatar name={currentSession.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {currentSession.name}
                </h3>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {currentSession.role}
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium mt-0.5">
                {currentSession.workspaceName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-7 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile & Account</span>
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'workspace'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4.5 h-4.5" />
            <span>Company Workspaces</span>
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'invitations'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Team & Invitations</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4.5 h-4.5" />
            <span>Activity Trail</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-7 overflow-y-auto flex-1">
          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-semibold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-medium text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Team Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-semibold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Lead QA Engineer">Lead QA Engineer</option>
                    <option value="Test Engineer">Test Engineer</option>
                    <option value="Viewer">Viewer (Read-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-medium text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                {onOpenLoginModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLoginModal();
                    }}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Switch Account or Sign Out →
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 cursor-pointer ml-auto flex items-center gap-2"
                >
                  {isSaved && <Check className="w-4 h-4" />}
                  <span>{isSaved ? 'Changes Saved!' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Company Workspaces */}
          {activeTab === 'workspace' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-slate-900">Switch Company Workspace</h4>
                <p className="text-sm text-slate-600 mt-0.5">
                  Your account belongs to the following team workspaces. Select one to collaborate on its tests and telemetry.
                </p>
              </div>

              <div className="space-y-3">
                {AVAILABLE_WORKSPACES.map((ws) => {
                  const isActive = ws.name === workspaceName;
                  return (
                    <div
                      key={ws.id}
                      onClick={() => handleSelectWorkspace(ws)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-base text-slate-900">{ws.name}</div>
                          <div className="text-xs text-slate-500 font-medium">
                            Workspace ID: <span className="font-mono">{ws.id}</span> · Your Role: <span className="font-bold text-indigo-700">{ws.role}</span>
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Team Members & Company Invitations */}
          {activeTab === 'invitations' && (
            <div className="space-y-6">
              {inviteFeedback && (
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm font-medium flex items-center justify-between">
                  <span>{inviteFeedback}</span>
                  <button onClick={() => setInviteFeedback(null)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Company Workspace Token Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4.5 h-4.5 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-900">
                      Company / Workspace Invite Code
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateNewCode}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Code</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Share this secure token with team members to let them join this company workspace.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-sm font-bold text-slate-900 tracking-wider">
                    {inviteCode}
                  </div>
                  <button
                    onClick={copyCodeToClipboard}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Invite Member by Email */}
              <form onSubmit={handleSendInvite} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>Invite New Team Member</span>
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-indigo-600"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Test Engineer">Test Engineer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold cursor-pointer"
                  >
                    Send Invite
                  </button>
                </div>
              </form>

              {/* Team Members Roster */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Active Team Members ({members.length})
                </h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {members.map((m) => (
                    <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={m.name} size="sm" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">{m.name}</div>
                          <div className="text-xs text-slate-500 font-medium">{m.email} · Joined {m.joinedAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            m.role === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : m.role === 'Test Engineer'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {m.role}
                        </span>
                        {m.status === 'invited' && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending Invite
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Activity Audit Trail */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Workspace Activity Audit Trail</h4>
                <p className="text-sm text-slate-600 mt-0.5">
                  Complete audit log of test executions, suite changes, and integration updates.
                </p>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex items-start justify-between text-sm">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.userName}</span>
                        <span className="text-xs font-medium text-slate-500">({log.userRole})</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-indigo-700">{log.action}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">{log.target}</div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
