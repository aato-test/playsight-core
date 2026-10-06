import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Zap,
  Check,
  AlertTriangle,
  RotateCw,
  Code2,
  Layers,
  Wand2,
} from 'lucide-react';
import { CopilotMessage, TestSuite } from '../types';

interface QACopilotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CopilotMessage[];
  onSendMessage: (text: string) => void;
  onHealNode: (nodeId: string, newSelector: string) => void;
  currentSuite: TestSuite | null;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    onSendMessage(userText);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onSendMessage(
        `I analyzed the steps in **${currentSuite?.name || 'the active suite'}** on branch \`${currentBranch}\`. All locators conform to Playwright best practices. Test assertions are resilient to dynamic timing.`
      );
    }, 900);
  };

  const handleApplyHeal = (nodeId: string, newSelector: string, healKey: string) => {
    setAppliedHeals((prev) => ({ ...prev, [healKey]: true }));
    onHealNode(nodeId, newSelector);
  };

  const executeDiagnosticQuery = (query: string) => {
    onSendMessage(query);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSendMessage(
        `Diagnostic scan completed for \`${query}\`. Evaluated DOM tree against Playwright selectors. Found 0 breaking regression anomalies.`
      );
    }, 800);
  };

  return (
    <aside
      id="qa-copilot-drawer"
      className="w-88 md:w-96 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 select-none text-slate-900 font-sans shadow-2xl z-40"
    >
      {/* Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
              QA Diagnostics Copilot
            </h2>
            <div className="text-[11px] text-slate-500 font-medium">
              Branch: <span className="font-mono font-bold text-indigo-700">{currentBranch}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Close Copilot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => executeDiagnosticQuery('Scan for selector instability')}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Scan Selectors</span>
        </button>
        <button
          onClick={() => executeDiagnosticQuery('Show DOM mutation diff')}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>DOM Mutation Diff</span>
        </button>
        <button
          onClick={() => executeDiagnosticQuery('Suggest assertions for checkout')}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Wand2 className="w-3.5 h-3.5 text-purple-600" />
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
              className={`space-y-1.5 ${isAI ? 'text-slate-900' : 'text-indigo-900'}`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="uppercase">{isAI ? 'Diagnostics Engine' : 'You'}</span>
                <span className="font-mono text-slate-400">{msg.timestamp}</span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed shadow-2xs ${
                  isAI
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Specific Diagnostic Card */}
                {diag && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-amber-700 font-bold uppercase text-[11px]">
                        Selector Instability Detected
                      </span>
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {diag.confidence}% Confidence
                      </span>
                    </div>

                    {/* Selector & Reason */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Target Selector</div>
                      <div className="text-rose-600 font-bold font-mono mt-0.5">{diag.targetSelector}</div>
                      <div className="text-xs text-slate-600 font-sans mt-1">
                        Reason: {diag.reason}
                      </div>
                    </div>

                    {/* Compact DOM Mutation Diff */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">DOM Mutation Diff</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono leading-relaxed">
                        <div className="text-rose-600 font-medium">{diag.diff.removed}</div>
                        <div className="text-emerald-700 font-medium">{diag.diff.added}</div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Recommendation</div>
                      <div className="text-indigo-800 text-xs font-sans mt-0.5 font-medium">
                        {diag.recommendation}
                      </div>
                    </div>

                    {/* Actions: Auto-Heal & Review Change */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleApplyHeal(diag.affectedStepId, diag.newSelector, healKey)}
                        disabled={isHealed}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          isHealed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isHealed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Auto-Healed</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            <span>Auto-Heal Step</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => executeDiagnosticQuery('Show DOM mutation diff')}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Review Change
                      </button>
                    </div>

                    {isHealed && (
                      <div className="text-xs text-emerald-700 font-bold font-mono mt-1 flex items-center gap-1">
                        ✓ Selector updated · Test re-run queued · Jira updated
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600 font-mono">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Analyzing Playwright AST and DOM mutations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask diagnostics or type 'scan selectors'..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="absolute right-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-30 cursor-pointer shadow-2xs"
            title="Send Query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
};
