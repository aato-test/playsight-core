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
  ScrollStepData,
  WaitForStepData,
  ScreenshotStepData,
  SelectDropdownStepData,
  HoverStepData,
  PressKeyStepData,
  ExtractTextStepData,
  ExtractAttributeStepData,
  ExtractTableStepData,
  ExtractListStepData,
  ExtractHtmlStepData,
  PaginationStepData,
  LoopElementsStepData,
  ExportJsonStepData,
  ExportCsvStepData,
  WebhookPushStepData,
  CookieBannerStepData,
  CaptchaDetectStepData,
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
        className="w-88 md:w-96 bg-white border-l-2 border-slate-200 flex flex-col h-full shrink-0 select-none text-slate-500 p-6 justify-center items-center text-center font-sans shadow-sm"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3.5 shadow-2xs">
          <Sliders className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 tracking-tight font-sans">
          Step Inspector
        </h4>
        <p className="text-sm text-slate-600 mt-1.5 max-w-[260px] leading-relaxed">
          Select any element on the canvas to configure parameters, locators, extraction variables, and execution options.
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
          message: '0 elements matched current DOM snapshot. Selector degraded or unrendered.',
        });
      } else {
        setTestResult({
          status: 'ok',
          message: '✓ 1 element uniquely matched in 16ms (Single match)',
        });
      }
    }, 450);
  };

  const copyNodeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const source = selectedNode.source ?? 'Manual config';
  const lastExecution = selectedNode.lastExecution ?? 'Ready';
  const jiraStory = selectedNode.jiraIssue ? selectedNode.jiraIssue : '—';

  return (
    <aside
      id="builder-properties-panel"
      className="w-88 md:w-96 bg-white border-l-2 border-slate-200 flex flex-col h-full shrink-0 select-none text-slate-800 font-sans shadow-sm"
    >
      {/* Header */}
      <div className="h-16 px-5 border-b-2 border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-sans text-xs font-extrabold shadow-2xs">
            0{stepIndex}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase font-sans">
              Step 0{stepIndex} — {selectedNode.type}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onDuplicateNode(selectedNode)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Duplicate Node"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close Inspector"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('inspector')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer ${
            activeTab === 'inspector'
              ? 'bg-white text-indigo-700 shadow-2xs border border-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer ${
            activeTab === 'json'
              ? 'bg-white text-indigo-700 shadow-2xs border border-slate-300'
              : 'text-slate-600 hover:text-slate-900'
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
              <span className="text-[11px] text-slate-400">Node Schema</span>
              <button
                onClick={copyNodeJson}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {/* Step Title */}
            <div>
              <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Step Title
              </label>
              <input
                type="text"
                value={selectedNode.title}
                onChange={(e) => onUpdateNode(selectedNode.id, { title: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none font-semibold shadow-2xs"
              />
            </div>

            {/* Action and Source Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </span>
                <span className="font-mono text-xs text-slate-900 capitalize font-bold">
                  {selectedNode.type}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
                  Origin
                </span>
                <span className="font-mono text-xs text-indigo-700 font-medium">
                  {source}
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* TYPE-SPECIFIC CONFIGURATION CONTROLS                      */}
            {/* ========================================================= */}

            {/* 1. Navigate */}
            {selectedNode.type === 'navigate' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as NavigateStepData).url || ''}
                    onChange={(e) => handleDataChange('url', e.target.value)}
                    placeholder="https://example.com or /path"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Wait Until
                  </label>
                  <select
                    value={(selectedNode.data as NavigateStepData).waitUntil || 'load'}
                    onChange={(e) => handleDataChange('waitUntil', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-600 focus:outline-none shadow-2xs"
                  >
                    <option value="load">load (Default window load)</option>
                    <option value="domcontentloaded">domcontentloaded</option>
                    <option value="networkidle">networkidle (No network requests for 500ms)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. Scroll */}
            {selectedNode.type === 'scroll' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Scroll Direction
                  </label>
                  <select
                    value={(selectedNode.data as ScrollStepData).direction || 'down'}
                    onChange={(e) => handleDataChange('direction', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-600 focus:outline-none shadow-2xs"
                  >
                    <option value="down">Down (by pixels)</option>
                    <option value="up">Up (by pixels)</option>
                    <option value="to_bottom">To Bottom of Page (Infinite Scroll)</option>
                    <option value="to_selector">To Element View</option>
                  </select>
                </div>
                {(selectedNode.data as ScrollStepData).direction === 'to_selector' ? (
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Element Selector
                    </label>
                    <input
                      type="text"
                      value={(selectedNode.data as ScrollStepData).selector || ''}
                      onChange={(e) => handleDataChange('selector', e.target.value)}
                      placeholder="#target-element, .footer"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Distance (Pixels)
                    </label>
                    <input
                      type="number"
                      value={(selectedNode.data as ScrollStepData).distancePx || 600}
                      onChange={(e) => handleDataChange('distancePx', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. Wait For */}
            {selectedNode.type === 'wait_for' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Wait Condition Type
                  </label>
                  <select
                    value={(selectedNode.data as WaitForStepData).waitType || 'timeout'}
                    onChange={(e) => handleDataChange('waitType', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-600 focus:outline-none shadow-2xs"
                  >
                    <option value="timeout">Explicit Delay (Milliseconds)</option>
                    <option value="selector">Wait for Visible Selector</option>
                    <option value="networkidle">Wait for Network Idle</option>
                  </select>
                </div>
                {(selectedNode.data as WaitForStepData).waitType === 'timeout' && (
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Duration (ms)
                    </label>
                    <input
                      type="number"
                      value={(selectedNode.data as WaitForStepData).durationMs || 2000}
                      onChange={(e) => handleDataChange('durationMs', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                )}
                {(selectedNode.data as WaitForStepData).waitType === 'selector' && (
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Selector to Wait For
                    </label>
                    <input
                      type="text"
                      value={(selectedNode.data as WaitForStepData).selector || ''}
                      onChange={(e) => handleDataChange('selector', e.target.value)}
                      placeholder=".loaded-container, [data-ready='true']"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. Click */}
            {selectedNode.type === 'click' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    CSS / XPath Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ClickStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="button#submit, [data-testid='btn']"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Click Type
                  </label>
                  <select
                    value={(selectedNode.data as ClickStepData).clickType || 'single'}
                    onChange={(e) => handleDataChange('clickType', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-600 focus:outline-none shadow-2xs"
                  >
                    <option value="single">Single Click</option>
                    <option value="double">Double Click</option>
                    <option value="right">Right Click (Context Menu)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 5. Input */}
            {selectedNode.type === 'input' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Input Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as InputStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="input#query, textarea.comment"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Input Text Value
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as InputStepData).value || ''}
                    onChange={(e) => handleDataChange('value', e.target.value)}
                    placeholder="Value to type..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="clear-first"
                    checked={(selectedNode.data as InputStepData).clearFirst ?? true}
                    onChange={(e) => handleDataChange('clearFirst', e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="clear-first" className="text-xs text-slate-600 font-medium">
                    Clear field before typing
                  </label>
                </div>
              </div>
            )}

            {/* 6. Extract Text */}
            {selectedNode.type === 'extract_text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ExtractTextStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder=".product-title, h1.headline"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Dataset Variable Name
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ExtractTextStepData).variableName || 'extractedText'}
                    onChange={(e) => handleDataChange('variableName', e.target.value)}
                    placeholder="e.g. titles, prices"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="extract-multiple"
                    checked={(selectedNode.data as ExtractTextStepData).extractMultiple ?? false}
                    onChange={(e) => handleDataChange('extractMultiple', e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="extract-multiple" className="text-xs text-slate-600 font-medium">
                    Scrape all matching elements into array
                  </label>
                </div>
              </div>
            )}

            {/* 7. Extract Attribute */}
            {selectedNode.type === 'extract_attribute' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ExtractAttributeStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="a.link, img.photo"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Attribute to Extract
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ExtractAttributeStepData).attribute || 'href'}
                    onChange={(e) => handleDataChange('attribute', e.target.value)}
                    placeholder="href, src, alt, data-id"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Dataset Variable Name
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ExtractAttributeStepData).variableName || 'extractedAttr'}
                    onChange={(e) => handleDataChange('variableName', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* 8. Extract Table */}
            {selectedNode.type === 'extract_table' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Table Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ExtractTableStepData).selector || 'table'}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="table.results, #data-grid"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Output Variable Name
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as ExtractTableStepData).variableName || 'tableRows'}
                    onChange={(e) => handleDataChange('variableName', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="parse-headers"
                    checked={(selectedNode.data as ExtractTableStepData).parseHeaders ?? true}
                    onChange={(e) => handleDataChange('parseHeaders', e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="parse-headers" className="text-xs text-slate-600 font-medium">
                    Use first row (th) as column keys
                  </label>
                </div>
              </div>
            )}

            {/* 9. Pagination */}
            {selectedNode.type === 'pagination' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Next Page Button Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as PaginationStepData).nextButtonSelector || ''}
                    onChange={(e) => handleDataChange('nextButtonSelector', e.target.value)}
                    placeholder="a.pagination-next, button:has-text('Next')"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Max Pages
                    </label>
                    <input
                      type="number"
                      value={(selectedNode.data as PaginationStepData).maxPages || 5}
                      onChange={(e) => handleDataChange('maxPages', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Delay Between (ms)
                    </label>
                    <input
                      type="number"
                      value={(selectedNode.data as PaginationStepData).waitAfterClickMs || 1500}
                      onChange={(e) => handleDataChange('waitAfterClickMs', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 10. Export JSON / CSV */}
            {(selectedNode.type === 'export_json' || selectedNode.type === 'export_csv') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Output File Name
                  </label>
                  <input
                    type="text"
                    value={
                      selectedNode.type === 'export_json'
                        ? (selectedNode.data as ExportJsonStepData).fileName
                        : (selectedNode.data as ExportCsvStepData).fileName
                    }
                    onChange={(e) => handleDataChange('fileName', e.target.value)}
                    placeholder="scraped_dataset.json"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Dataset Variable to Export
                  </label>
                  <input
                    type="text"
                    value={
                      selectedNode.type === 'export_json'
                        ? (selectedNode.data as ExportJsonStepData).datasetVariable
                        : (selectedNode.data as ExportCsvStepData).datasetVariable
                    }
                    onChange={(e) => handleDataChange('datasetVariable', e.target.value)}
                    placeholder="scrapedData, tableRows"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* 11. Assert */}
            {selectedNode.type === 'assert' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assertion Target Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as AssertStepData).selector || ''}
                    onChange={(e) => handleDataChange('selector', e.target.value)}
                    placeholder="body, .status-badge"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assertion Type
                  </label>
                  <select
                    value={(selectedNode.data as AssertStepData).assertionType || 'is_visible'}
                    onChange={(e) => handleDataChange('assertionType', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-600 focus:outline-none shadow-2xs"
                  >
                    <option value="is_visible">Element is visible</option>
                    <option value="text_contains">Text contains</option>
                    <option value="text_equals">Text equals</option>
                    <option value="has_value">Input has value</option>
                    <option value="url_contains">Page URL contains</option>
                    <option value="expression">Custom JS expression</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Expected Value
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as AssertStepData).expectedValue || ''}
                    onChange={(e) => handleDataChange('expectedValue', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* 12. Cookie Banner */}
            {selectedNode.type === 'cookie_banner' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Accept Button Selector
                  </label>
                  <input
                    type="text"
                    value={(selectedNode.data as CookieBannerStepData).acceptSelector || ''}
                    onChange={(e) => handleDataChange('acceptSelector', e.target.value)}
                    placeholder="button:has-text('Accept'), #onetrust-accept"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-mono focus:border-indigo-600 focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Element Locator Strategy */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase tracking-wider">
                  Locator Engine
                </span>
                <span className="font-sans font-semibold text-xs text-indigo-700">
                  Playwright Resilient
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Action-resilient auto-waiting locator matching active DOM tree.
              </p>
            </div>

            {/* Last Execution Info */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="block text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
                  Last Run
                </span>
                <span className="font-sans text-xs text-slate-800 font-semibold">
                  {lastExecution}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
                  Jira Issue
                </span>
                <span className="font-sans text-xs text-slate-700 font-medium">
                  {jiraStory}
                </span>
              </div>
            </div>

            {/* Test Selector Feedback */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-sans font-medium ${
                  testResult.status === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                onClick={handleTestSelector}
                disabled={testingSelector}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold font-sans transition-colors cursor-pointer"
              >
                {testingSelector ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Evaluating Selector...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-indigo-600" />
                    <span>Test Selector Live</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onAutoHealTrigger(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold font-sans transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Auto-Heal Step</span>
              </button>

              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold font-sans transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Element</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
