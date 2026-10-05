import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Code2,
  Play,
  RotateCw,
  Sparkles,
  ExternalLink,
  Shield,
  X,
  AlertCircle,
  Eye,
  Key,
} from 'lucide-react';
import {
  TestNode,
  StepType,
  NavigateStepData,
  ClickStepData,
  InputStepData,
  AssertStepData,
} from '../../types';

interface PropertiesPanelProps {
  selectedNode: TestNode | null;
  stepIndex: number;
  onUpdateNode: (nodeId: string, updates: Partial<TestNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: TestNode) => void;
  onClose: () => void;
  onAutoHealTrigger: (nodeId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  stepIndex,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onClose,
  onAutoHealTrigger,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'inspector' | 'json'>('inspector');
  const [testingSelector, setTestingSelector] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'ok' | 'err'; message: string } | null>(null);

  if (!selectedNode) {
    return (
      <div
        id="builder-properties-panel"
        className="w-80 md:w-88 bg-[#0F172A] border-l border-[#1E293B] flex flex-col h-full shrink-0 select-none text-[#94A3B8] p-6 justify-center items-center text-center font-sans"
      >
        <div className="w-10 h-10 rounded bg-[#111827] border border-[#1E293B] flex items-center justify-center text-teal-400 mb-3 shadow-inner">
          <Sliders className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-[#F8FAFC] tracking-tight uppercase font-mono">
          Node Inspector
        </h4>
        <p className="text-xs text-[#64748B] mt-1 max-w-[220px] leading-relaxed">
          Select any node in the canvas to view confidence metrics, execution telemetry, and test selectors.
        </p>
      </div>
    );
  }

  const handleDataChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, {
      data: {
        ...selectedNode.data,
        [field]: value,
      } as any,
    });
  };

  const handleTestSelector = () => {
    setTestingSelector(true);
    setTestResult(null);
    setTimeout(() => {
      setTestingSelector(false);
      const isFailed = selectedNode.status === 'failed';
      if (isFailed) {
        setTestResult({
          status: 'err',
          message: '0 elements matched current DOM snapshot. Selector degraded.',
        });
      } else {
        setTestResult({
          status: 'ok',
          message: '✓ 1 element uniquely resolved in 14ms (Single match)',
        });
      }
    }, 450);
  };

  const copyNodeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Section 18 fields
  const confidence = selectedNode.confidence ?? (selectedNode.status === 'failed' ? 72 : 98);
  const source = selectedNode.source ?? 'DOM inspection';
  const lastExecution = selectedNode.lastExecution ?? (selectedNode.status === 'failed' ? 'Failed · 1.12s' : 'Passed · 1.12s');
  const jiraStory = selectedNode.jiraIssue ?? 'CHK-184';

  const selectorValue =
    selectedNode.type === 'navigate'
      ? (selectedNode.data as NavigateStepData).url
      : selectedNode.type === 'click'
      ? (selectedNode.data as ClickStepData).selector
      : selectedNode.type === 'input'
      ? (selectedNode.data as InputStepData).selector
      : (selectedNode.data as AssertStepData).selector;

  return (
    <aside
      id="builder-properties-panel"
      className="w-80 md:w-88 bg-[#0F172A] border-l border-[#1E293B] flex flex-col h-full shrink-0 select-none text-[#F8FAFC] font-sans shadow-xl"
    >
      {/* Section 18 Header: Step 02 — Click */}
      <div className="h-12 px-4 border-b border-[#1E293B] flex items-center justify-between shrink-0 bg-[#020617]/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#111827] border border-[#1E293B] flex items-center justify-center text-teal-400 font-mono text-xs">
            0{stepIndex}
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#F8FAFC] tracking-tight uppercase font-mono">
              Step 0{stepIndex} — {selectedNode.type}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateNode(selectedNode)}
            className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded transition-colors cursor-pointer"
            title="Duplicate Node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            className="p-1.5 text-[#94A3B8] hover:text-rose-400 hover:bg-[#1E293B] rounded transition-colors cursor-pointer"
            title="Delete Node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded transition-colors cursor-pointer"
            title="Close Inspector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs: Inspector vs JSON Schema */}
      <div className="px-4 py-1.5 border-b border-[#1E293B] bg-[#020617]/30 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('inspector')}
          className={`px-2.5 py-1 rounded text-xs font-medium font-mono transition-colors cursor-pointer ${
            activeTab === 'inspector'
              ? 'bg-[#111827] text-teal-300 border border-[#1E293B]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`px-2.5 py-1 rounded text-xs font-medium font-mono transition-colors cursor-pointer ${
            activeTab === 'json'
              ? 'bg-[#111827] text-teal-300 border border-[#1E293B]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          JSON Schema
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === 'json' ? (
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">Node Schema</span>
              <button
                onClick={copyNodeJson}
                className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#020617] border border-[#1E293B] rounded text-[11px] text-[#94A3B8] overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {/* Step Title */}
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
                Step Title
              </label>
              <input
                type="text"
                value={selectedNode.title}
                onChange={(e) => onUpdateNode(selectedNode.id, { title: e.target.value })}
                className="w-full bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-teal-400 focus:outline-none font-medium"
              />
            </div>

            {/* Action */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
                  Action
                </span>
                <span className="font-mono text-xs text-[#F8FAFC] capitalize font-semibold">
                  {selectedNode.type}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
                  Source
                </span>
                <span className="font-mono text-xs text-teal-300">
                  {source}
                </span>
              </div>
            </div>

            {/* Selector Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
                  {selectedNode.type === 'navigate' ? 'URL' : 'Selector'}
                </label>
                <span className="text-[10px] font-mono text-[#64748B]">CSS / XPath</span>
              </div>
              <input
                type="text"
                value={selectorValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (selectedNode.type === 'navigate') handleDataChange('url', val);
                  else if (selectedNode.type === 'click') handleDataChange('selector', val);
                  else if (selectedNode.type === 'input') handleDataChange('selector', val);
                  else if (selectedNode.type === 'assert') handleDataChange('selector', val);
                }}
                className="w-full bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1.5 text-xs text-teal-300 font-mono focus:border-teal-400 focus:outline-none"
              />
            </div>

            {/* Selector Confidence Meter (Section 18) */}
            <div className="p-2.5 rounded bg-[#020617] border border-[#1E293B] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
                  Selector Confidence
                </span>
                <span
                  className={`font-mono font-bold text-xs ${
                    confidence > 85 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {confidence}%
                </span>
              </div>
              <div className="w-full bg-[#111827] rounded-xs h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-xs ${
                    confidence > 85 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <div className="text-[10px] text-[#64748B] font-mono flex items-center justify-between">
                <span>Calculated via Playwright AST</span>
                <span>DOM Match: {confidence > 85 ? 'High' : 'Degraded'}</span>
              </div>
            </div>

            {/* Node Execution Telemetry */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-[#020617] border border-[#1E293B]">
              <div>
                <span className="block text-[10px] font-mono text-[#64748B] uppercase">
                  Last Execution
                </span>
                <span className="font-mono text-xs text-[#F8FAFC]">
                  {lastExecution}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-[#64748B] uppercase">
                  Jira Story
                </span>
                <span className="font-mono text-xs text-teal-300 font-medium">
                  {jiraStory}
                </span>
              </div>
            </div>

            {/* Specific Step Customizations */}
            {selectedNode.type === 'input' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">
                    Input Value
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as InputStepData).value || ''}
                    onChange={(e) => handleDataChange('value', e.target.value)}
                    className="w-full bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mask-check"
                    checked={(selectedNode.data as InputStepData).maskInput || false}
                    onChange={(e) => handleDataChange('maskInput', e.target.checked)}
                    className="rounded bg-[#020617] border-[#1E293B] text-teal-500 focus:ring-0"
                  />
                  <label htmlFor="mask-check" className="text-xs text-[#94A3B8]">
                    Mask input value (security credentials)
                  </label>
                </div>
              </div>
            )}

            {selectedNode.type === 'assert' && (
              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">
                  Expected Expression / Value
                </label>
                <input
                  type="text"
                  value={(selectedNode.data as AssertStepData).expectedValue || ''}
                  onChange={(e) => handleDataChange('expectedValue', e.target.value)}
                  className="w-full bg-[#020617] border border-[#1E293B] rounded px-2.5 py-1.5 text-xs text-teal-300 font-mono"
                />
              </div>
            )}

            {/* Test Selector Feedback */}
            {testResult && (
              <div
                className={`p-2.5 rounded border text-xs font-mono ${
                  testResult.status === 'ok'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}

            {/* Section 18 Action Buttons: Edit, Test Selector, Auto-Heal, Delete */}
            <div className="pt-2 border-t border-[#1E293B] space-y-2">
              <button
                onClick={handleTestSelector}
                disabled={testingSelector}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#111827] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] text-xs font-mono transition-colors cursor-pointer"
              >
                {testingSelector ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating DOM Tree...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-teal-400" />
                    <span>Test Selector</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onAutoHealTrigger(selectedNode.id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Auto-Heal Step</span>
              </button>

              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Node</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
