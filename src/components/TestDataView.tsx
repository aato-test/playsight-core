import React, { useState } from 'react';
import { Database, Key, Shield, Plus, Lock, Eye, EyeOff, Check, Copy } from 'lucide-react';

interface TestDataViewProps {
  currentBranch: string;
}

export const TestDataView: React.FC<TestDataViewProps> = ({ currentBranch }) => {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const variables = [
    {
      key: 'AUTH_TEST_EMAIL',
      value: 'qa.lead@playsight.io',
      isSecret: false,
      category: 'Authentication',
      updated: '2h ago',
    },
    {
      key: 'AUTH_TEST_PASSWORD',
      value: 'Secur3Pass!99_Staging#',
      isSecret: true,
      category: 'Authentication',
      updated: '1d ago',
    },
    {
      key: 'STRIPE_TEST_CARD_NUMBER',
      value: '4242 4242 4242 4242',
      isSecret: false,
      category: 'Payment Gateway',
      updated: '3d ago',
    },
    {
      key: 'STRIPE_TEST_CVC',
      value: '842',
      isSecret: true,
      category: 'Payment Gateway',
      updated: '3d ago',
    },
    {
      key: 'DEFAULT_STAGING_TIMEOUT_MS',
      value: '8000',
      isSecret: false,
      category: 'Execution Pipeline',
      updated: '1w ago',
    },
  ];

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div
      id="test-data-container"
      className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans text-[#F8FAFC]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Test Data & Variables
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Parameterized test values & masked credentials · <span className="text-teal-400">{currentBranch}</span>
          </p>
        </div>
      </div>

      <div className="rounded border border-[#1E293B] bg-[#0F172A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#020617]/50 text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-medium">Variable Key</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium">Value Preview</th>
                <th className="py-2.5 px-4 font-medium">Type</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70 font-sans">
              {variables.map((item) => {
                const isRevealed = showSecrets[item.key];
                return (
                  <tr key={item.key} className="hover:bg-[#111827]/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-teal-300">
                      ${item.key}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{item.category}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {item.isSecret && !isRevealed ? (
                        <span className="text-[#64748B]">••••••••••••••••</span>
                      ) : (
                        <span className="text-[#F8FAFC]">{item.value}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {item.isSecret ? (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                          <Lock className="w-3 h-3" />
                          <span>Masked</span>
                        </span>
                      ) : (
                        <span className="text-cyan-400 text-[11px]">Plaintext</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-mono">
                        {item.isSecret && (
                          <button
                            onClick={() =>
                              setShowSecrets((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                            }
                            className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                            title={isRevealed ? 'Hide' : 'Reveal'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(item.key, item.value)}
                          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] text-[11px] cursor-pointer"
                        >
                          {copiedKey === item.key ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
