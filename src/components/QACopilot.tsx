import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Terminal,
  Layers,
  ArrowRight,
  ExternalLink,
  Shield,
  Check,
  Zap,
  Wand2,
  Search,
} from 'lucide-react';
import { CopilotMessage, TestSuite } from '../types';

interface QACopilotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CopilotMessage[];
  onSendMessage: (text: string, sender?: 'user' | 'ai') => void;
  onHealNode: (nodeId: string, newSelector: string) => void;
  currentSuite?: TestSuite | null;
  currentBranch: string;
}

export const QACopilot: React.FC<QACopilotProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onHealNode,
  currentSuite,
  currentBranch,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedHeals, setAppliedHeals] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  if (!isOpen) return null;

  const handleApplyHeal = (nodeId: string, newSelector: string, key: string) => {
    onHealNode(nodeId, newSelector);
    setAppliedHeals((prev) => ({ ...prev, [key]: true }));
  };

  const executeDiagnosticQuery = (queryText: string) => {
    onSendMessage(queryText, 'user');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const lower = queryText.toLowerCase();

      if (lower.includes('scan') || lower.includes('selector') || lower.includes('instab')) {
        const reply = `**Selector Telemetry Analysis (Playwright Worker):**\n\n• Inspected 3 nodes in \`${currentSuite?.name || 'Active Sequence'}\`.\n• Node \`node-chk-2\` contains DOM divergence with PR #482.\n• Stability index: \`72%\` degraded.\n• Production element available at \`button[data-testid="payment-submit"]\`.`;
        onSendMessage(reply, 'ai');
      } else if (lower.includes('mutation') || lower.includes('diff')) {
        const reply = `**Git PR #482 Mutation Diff Summary:**\n\`\`\`diff\n- <button data-testid="checkout-submit" class="btn-primary">\n+ <button data-testid="payment-submit" class="btn-primary">\n\`\`\`\nReplacement recommended with 97% confidence score.`;
        onSendMessage(reply, 'ai');
      } else if (lower.includes('assert')) {
        const reply = `**Recommended Assertion for Checkout:**\n\`\`\`ts\nawait expect(page.locator("div.confirmation-banner")).toContainText("payment.status === 'success'");\n\`\`\`\nAdded to pipeline suggestions.`;
        onSendMessage(reply, 'ai');
      } else {
        const reply = `Diagnostics verified on branch \`${currentBranch}\`. Sequence \`${currentSuite?.name || 'Active Sequence'}\` loaded. Ready to run automated AST repairs or auto-heal selectors.`;
        onSendMessage(reply, 'ai');
      }
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    executeDiagnosticQuery(inputQuery);
    setInputQuery('');
  };

  return (
    <aside
      id="qa-copilot-drawer"
      className="w-88 md:w-96 bg-[#0F172A] border-l border-[#1E293B] flex flex-col h-full shrink-0 select-none text-[#F8FAFC] font-sans shadow-2xl z-40"
    >
      {/* Section 20 Header: QA Copilot / Engineering Diagnostics */}
      <div className="h-14 px-4 border-b border-[#1E293B] flex items-center justify-between shrink-0 bg-[#020617]/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#111827] border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#F8FAFC] tracking-tight uppercase font-mono">
              QA Copilot
            </h2>
            <div className="text-[10px] text-[#64748B] font-mono">
              Engineering diagnostics · {currentBranch}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded transition-colors cursor-pointer"
          title="Close Copilot (⌘J)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Engineering Quick Actions */}
      <div className="p-2 border-b border-[#1E293B] bg-[#020617]/30 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => executeDiagnosticQuery('Scan for selector instability')}
          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-teal-300 text-[11px] font-mono border border-[#1E293B] whitespace-nowrap cursor-pointer flex items-center gap-1"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Scan Selectors</span>
        </button>
        <button
          onClick={() => executeDiagnosticQuery('Show DOM mutation diff')}
          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-teal-300 text-[11px] font-mono border border-[#1E293B] whitespace-nowrap cursor-pointer flex items-center gap-1"
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>DOM Mutation Diff</span>
        </button>
        <button
          onClick={() => executeDiagnosticQuery('Suggest assertions for checkout')}
          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-teal-300 text-[11px] font-mono border border-[#1E293B] whitespace-nowrap cursor-pointer flex items-center gap-1"
        >
          <Wand2 className="w-3 h-3 text-teal-400" />
          <span>Auto Assertions</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((msg, idx) => {
          const isAI = msg.sender === 'ai';
          const diag = msg.diagnostic;
          const heal = msg.healProposal;
          const healKey = `heal-${msg.id}-${idx}`;
          const isHealed = appliedHeals[healKey] || heal?.applied;

          return (
            <div
              key={msg.id}
              className={`space-y-2 ${isAI ? 'text-[#F8FAFC]' : 'text-teal-300'}`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                <span className="uppercase">{isAI ? 'Diagnostics Engine' : 'Prakash S.'}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`p-3 rounded border text-xs leading-relaxed ${
                  isAI
                    ? 'bg-[#111827] border-[#1E293B] text-[#F8FAFC]'
                    : 'bg-teal-500/10 border-teal-500/30 text-teal-200'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Section 20 Specific Diagnostic Card */}
                {diag && (
                  <div className="mt-3 p-3 rounded bg-[#020617] border border-[#1E293B] space-y-3 font-mono text-xs">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                      <span className="text-amber-400 font-semibold uppercase text-[11px]">
                        Selector instability detected
                      </span>
                      <span className="text-amber-400 font-bold">{diag.confidence}% Confidence</span>
                    </div>

                    {/* Selector & Reason */}
                    <div>
                      <div className="text-[10px] text-[#64748B] uppercase">Target Selector</div>
                      <div className="text-rose-400 font-mono mt-0.5">{diag.targetSelector}</div>
                      <div className="text-[11px] text-[#94A3B8] font-sans mt-1">
                        Reason: {diag.reason}
                      </div>
                    </div>

                    {/* Section 20 Compact DOM Mutation Diff */}
                    <div>
                      <div className="text-[10px] text-[#64748B] uppercase mb-1">DOM Mutation Diff</div>
                      <div className="p-2 rounded bg-[#0A0F1D] border border-[#1E293B] text-[11px] font-mono leading-relaxed">
                        <div className="text-rose-400">{diag.diff.removed}</div>
                        <div className="text-emerald-400">{diag.diff.added}</div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <div className="text-[10px] text-[#64748B] uppercase">Recommendation</div>
                      <div className="text-teal-300 text-[11px] font-sans mt-0.5">
                        {diag.recommendation}
                      </div>
                    </div>

                    {/* Actions: Auto-Heal & Review Change */}
                    <div className="pt-2 border-t border-[#1E293B] flex items-center gap-2">
                      <button
                        onClick={() => handleApplyHeal(diag.affectedStepId, diag.newSelector, healKey)}
                        disabled={isHealed}
                        className={`px-3 py-1.5 rounded text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                          isHealed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-xs'
                        }`}
                      >
                        {isHealed ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Auto-Healed</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-slate-950" />
                            <span>Auto-Heal</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => executeDiagnosticQuery('Show DOM mutation diff')}
                        className="px-2.5 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] text-xs font-mono transition-colors cursor-pointer"
                      >
                        Review Change
                      </button>
                    </div>

                    {isHealed && (
                      <div className="text-[10px] text-emerald-400 font-mono mt-1">
                        ✓ Selector updated · Test re-run queued · CHK-184 updated to Review
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="p-3 rounded bg-[#111827] border border-[#1E293B] flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
            <span>Analyzing Playwright AST and DOM mutations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#1E293B] bg-[#020617]/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask diagnostics or type 'scan selectors'..."
            className="w-full bg-[#020617] border border-[#1E293B] rounded pl-3 pr-10 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-teal-400 focus:outline-none font-sans"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="absolute right-1.5 p-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors disabled:opacity-30 cursor-pointer"
            title="Send Query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
};
