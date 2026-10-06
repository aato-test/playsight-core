import React, { useState } from 'react';
import {
  Users,
  Database,
  Key,
  Shield,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Check,
  Copy,
  Trash2,
  CreditCard,
  Sparkles,
  Search,
  UserCheck,
  HelpCircle,
  FileText,
  Variable,
  AlertCircle,
} from 'lucide-react';

interface TestAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Customer' | 'QA Lead' | 'Guest' | 'Invalid';
  mfaStatus: 'Bypassed' | 'Enabled' | 'None';
  notes: string;
}

interface CustomerPersona {
  id: string;
  personaName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  testCard: string;
  cardExp: string;
  cardCvc: string;
}

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  category: string;
  isSecret: boolean;
  updated: string;
}

interface TestDataViewProps {
  currentBranch: string;
}

const DEFAULT_ACCOUNTS: TestAccount[] = [
  {
    id: 'acc-1',
    name: 'Admin Supervisor',
    username: 'super_admin_qa',
    email: 'admin.qa@playsight-test.io',
    password: 'Adm!nPassw0rd#2026',
    role: 'Admin',
    mfaStatus: 'Bypassed',
    notes: 'Full access to user management, billing, and settings portal.',
  },
  {
    id: 'acc-2',
    name: 'Standard Customer (Active Cart)',
    username: 'sarah_shopper',
    email: 'sarah.shopper@customer-test.com',
    password: 'CustomerShopp3r!99',
    role: 'Customer',
    mfaStatus: 'None',
    notes: 'Pre-populated with 2 items in cart and 1 saved shipping address.',
  },
  {
    id: 'acc-3',
    name: 'Automation QA Lead Persona',
    username: 'automation_lead',
    email: 'prakash.qa@playsight-test.io',
    password: 'PlaySight!Lead2026#',
    role: 'QA Lead',
    mfaStatus: 'Bypassed',
    notes: 'Target account for automated regression suites and GitHub webhooks.',
  },
  {
    id: 'acc-4',
    name: 'Invalid Credentials (Negative Test)',
    username: 'locked_out_user',
    email: 'locked.user@invalid-test.com',
    password: 'WrongPassword_XYZ123',
    role: 'Invalid',
    mfaStatus: 'None',
    notes: 'Used to verify 401 error alerts and password reset toast messaging.',
  },
];

const DEFAULT_PERSONAS: CustomerPersona[] = [
  {
    id: 'per-1',
    personaName: 'Sarah Jenkins (US Domestic Checkout)',
    fullName: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.org',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    postalCode: '97477',
    country: 'United States',
    testCard: '4242 •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '842',
  },
  {
    id: 'per-2',
    personaName: 'Liam Schmidt (EU International Checkout)',
    fullName: 'Liam Schmidt',
    email: 'liam.schmidt@berlin-qa.de',
    phone: '+49 170 1234567',
    address: 'Friedrichstraße 43',
    city: 'Berlin',
    postalCode: '10117',
    country: 'Germany',
    testCard: '5555 •••• •••• 4444',
    cardExp: '09/29',
    cardCvc: '312',
  },
];

const DEFAULT_ENV_VARS: EnvVariable[] = [
  {
    id: 'var-1',
    key: 'BASE_PORTAL_URL',
    value: 'https://staging.app.example.com',
    category: 'Environment',
    isSecret: false,
    updated: 'Just now',
  },
  {
    id: 'var-2',
    key: 'PAYMENT_GATEWAY_TEST_KEY',
    value: 'pk_test_51Mz9XYZ9876543210',
    category: 'Payments',
    isSecret: true,
    updated: '2d ago',
  },
  {
    id: 'var-3',
    key: 'PLAYWRIGHT_TIMEOUT_MS',
    value: '10000',
    category: 'Runner Pipeline',
    isSecret: false,
    updated: '1w ago',
  },
];

export const TestDataView: React.FC<TestDataViewProps> = ({ currentBranch }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'personas' | 'generators' | 'env'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [accounts, setAccounts] = useState<TestAccount[]>(() => {
    const saved = localStorage.getItem('playsight_test_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_ACCOUNTS;
  });
  const [personas, setPersonas] = useState<CustomerPersona[]>(() => {
    const saved = localStorage.getItem('playsight_test_personas');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_PERSONAS;
  });
  const [envVars, setEnvVars] = useState<EnvVariable[]>(() => {
    const saved = localStorage.getItem('playsight_test_env_vars');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_ENV_VARS;
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New account form state
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccUser, setNewAccUser] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPass, setNewAccPass] = useState('');
  const [newAccRole, setNewAccRole] = useState<'Admin' | 'Customer' | 'QA Lead' | 'Guest' | 'Invalid'>('Customer');
  const [newAccNotes, setNewAccNotes] = useState('');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleTogglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccUser || !newAccEmail || !newAccPass) return;
    const newAcc: TestAccount = {
      id: `acc-${Date.now()}`,
      name: newAccName || newAccUser,
      username: newAccUser,
      email: newAccEmail,
      password: newAccPass,
      role: newAccRole,
      mfaStatus: 'None',
      notes: newAccNotes || 'Created via Test Data Hub',
    };
    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    localStorage.setItem('playsight_test_accounts', JSON.stringify(updated));
    setIsAddingAccount(false);
    setNewAccName('');
    setNewAccUser('');
    setNewAccEmail('');
    setNewAccPass('');
    setNewAccNotes('');
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    localStorage.setItem('playsight_test_accounts', JSON.stringify(updated));
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="test-data-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-slate-800"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-600" />
            <span>Test Data & Fixtures Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage test accounts, usernames, credentials, checkout profiles, and dynamic data for automated test suites on{' '}
            <span className="text-indigo-600 font-semibold">{currentBranch}</span>
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'accounts' && (
          <button
            onClick={() => setIsAddingAccount(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Test Account</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts & Passwords ({accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('personas')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'personas'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Form Personas & Checkout Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab('generators')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'generators'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Dynamic Token Generators</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'env'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Environment Secrets</span>
          </button>
        </div>

        {/* Quick Search */}
        {activeTab === 'accounts' && (
          <div className="relative mb-2 sm:mb-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter accounts by role, email, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-64 shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* Tab 1: User Accounts & Passwords */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Add Account Modal / Card */}
          {isAddingAccount && (
            <form
              onSubmit={handleCreateAccount}
              className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-4 animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Create New Test Credential
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingAccount(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Subscriber"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. premium_user_qa"
                    value={newAccUser}
                    onChange={(e) => setNewAccUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@test.example.com"
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SecretPass123!"
                    value={newAccPass}
                    onChange={(e) => setNewAccPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / Persona Type</label>
                  <select
                    value={newAccRole}
                    onChange={(e) => setNewAccRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Customer">Standard Customer</option>
                    <option value="Admin">Administrator</option>
                    <option value="QA Lead">QA Lead</option>
                    <option value="Guest">Guest User</option>
                    <option value="Invalid">Invalid / Locked Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Usage Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. For checkout step verification"
                    value={newAccNotes}
                    onChange={(e) => setNewAccNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAccount(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-green-700 hover:bg-green-800 text-white cursor-pointer shadow-xs"
                >
                  Save Credential
                </button>
              </div>
            </form>
          )}

          {/* Accounts Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-sans text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Account Persona</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredAccounts.map((acc) => {
                    const isRevealed = showPasswords[acc.id];
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>{acc.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              acc.role === 'Admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : acc.role === 'Customer'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : acc.role === 'QA Lead'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : acc.role === 'Invalid'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{acc.username}</span>
                            <button
                              onClick={() => handleCopy(`user-${acc.id}`, acc.username)}
                              className="text-slate-400 hover:text-slate-700 transition-colors"
                              title="Copy username"
                            >
                              {copiedKey === `user-${acc.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{acc.email}</span>
                            <button
                              onClick={() => handleCopy(`email-${acc.id}`, acc.email)}
                              className="text-slate-400 hover:text-slate-700 transition-colors"
                              title="Copy email"
                            >
                              {copiedKey === `email-${acc.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              {isRevealed ? acc.password : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => handleTogglePassword(acc.id)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title={isRevealed ? 'Mask password' : 'Show password'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(`pass-${acc.id}`, acc.password)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy password"
                            >
                              {copiedKey === `pass-${acc.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-[11px] font-medium">
                          {acc.notes}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete credential"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Form Personas & Checkout Profiles */}
      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-900">{persona.personaName}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                  {persona.country}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Full Name</span>
                  <div className="flex items-center justify-between mt-0.5 font-bold text-slate-900">
                    <span>{persona.fullName}</span>
                    <button
                      onClick={() => handleCopy(`name-${persona.id}`, persona.fullName)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedKey === `name-${persona.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Email</span>
                  <div className="flex items-center justify-between mt-0.5 font-bold text-slate-900 truncate">
                    <span className="truncate">{persona.email}</span>
                    <button
                      onClick={() => handleCopy(`pemail-${persona.id}`, persona.email)}
                      className="text-slate-400 hover:text-slate-700 ml-1 shrink-0"
                    >
                      {copiedKey === `pemail-${persona.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Phone Number</span>
                  <div className="flex items-center justify-between mt-0.5 font-medium text-slate-800">
                    <span>{persona.phone}</span>
                    <button
                      onClick={() => handleCopy(`phone-${persona.id}`, persona.phone)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedKey === `phone-${persona.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Street & City</span>
                  <div className="flex items-center justify-between mt-0.5 font-medium text-slate-800">
                    <span className="truncate">{persona.address}, {persona.city}</span>
                    <button
                      onClick={() => handleCopy(`addr-${persona.id}`, `${persona.address}, ${persona.city}`)}
                      className="text-slate-400 hover:text-slate-700 ml-1 shrink-0"
                    >
                      {copiedKey === `addr-${persona.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Card Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Test Payment Card
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 mt-0.5 block">
                    {persona.testCard}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                    Exp: {persona.cardExp} · CVC: {persona.cardCvc}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(`card-${persona.id}`, '4242424242424242')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedKey === `card-${persona.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Card #</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Dynamic Token Generators */}
      {activeTab === 'generators' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Dynamic Email Token</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <code className="block p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900">
              {'{{$randomEmail}}'}
            </code>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Injects a guaranteed unique email e.g. <span className="font-mono text-[11px] font-bold text-indigo-700">test.user+17281@example.com</span> into registration forms during each runner execution to prevent duplicate email conflicts.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Unique Order UUID</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <code className="block p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900">
              {'{{$guid}}'}
            </code>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Generates an RFC4122 standard unique identifier for idempotency keys, invoice IDs, and order tracking numbers.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Timestamp Seed</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <code className="block p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900">
              {'{{$timestamp}}'}
            </code>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Inserts the current execution Unix epoch in milliseconds for dynamic username and order labeling.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Environment Secrets */}
      {activeTab === 'env' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-sans text-xs uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Variable Key</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {envVars.map((v) => {
                  const isRevealed = showPasswords[v.id];
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        ${v.key}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{v.category}</td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {v.isSecret && !isRevealed ? '••••••••••••••••' : v.value}
                          </span>
                          {v.isSecret && (
                            <button
                              onClick={() => handleTogglePassword(v.id)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title={isRevealed ? 'Mask secret' : 'Show secret'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{v.updated}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleCopy(`var-${v.id}`, v.value)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `var-${v.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
