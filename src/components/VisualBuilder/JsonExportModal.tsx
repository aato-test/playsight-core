import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode2,
  Terminal,
  Code2,
} from 'lucide-react';
import { TestNode, ConnectionEdge } from '../../types';
import { generateExecutorJson } from '../../data/mockData';

interface JsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: TestNode[];
  edges: ConnectionEdge[];
  suiteName: string;
  browser: 'chromium' | 'firefox' | 'webkit';
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  suiteName,
  browser,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'python'>('json');

  if (!isOpen) return null;

  const jsonPayload = generateExecutorJson(nodes, edges, suiteName, browser);
  const jsonString = JSON.stringify(jsonPayload, null, 2);

  const pythonSampleScript = `"""
test_executor.py - Automated End-to-End Test Engine
Consumes exported test sequence JSON from PlaySight Visual Builder.
"""

import json
import asyncio
import os
from playwright.async_api import async_playwright

async def execute_test_suite(suite_path: str):
    with open(suite_path, 'r') as f:
        data = json.load(f)

    meta = data.get("suite_metadata", {})
    steps = data.get("steps", [])

    print(f"🚀 Starting Test Sequence: {meta.get('name')}")
    print(f"📦 Total Steps to Execute: {len(steps)}")

    async with async_playwright() as p:
        browser_name = meta.get("browser", "chromium")
        browser = await getattr(p, browser_name).launch(
          headless=meta.get("headless", True), slow_mo=meta.get("slow_mo_ms", 100)
        )
        page = await browser.new_page(viewport=meta.get("viewport", {"width": 1280, "height": 800}))

        for step in steps:
            action = step["action"]
            params = step["parameters"]
            print(f"  ▶ [Step {step['step_number']}] {step['title']} ({action})")

            if action == "navigate":
                await page.goto(params["url"], wait_until=params.get("wait_until", "networkidle"), timeout=params.get("timeout_ms", 10000))
            elif action == "click":
                click_type = params.get("click_type", "single")
                await page.click(
                    params["selector"],
                    click_count=2 if click_type == "double" else 1,
                    button="right" if click_type == "right" else "left",
                    timeout=params.get("timeout_ms", 5000),
                )
            elif action == "input":
                if params.get("mask_input"):
                    secret_name = params.get("secret_env")
                    if not secret_name or secret_name not in os.environ:
                        raise RuntimeError(f"Set the {secret_name or 'secret'} environment variable")
                    text = os.environ[secret_name]
                else:
                    text = params.get("text", "")
                if params.get("clear_first", True):
                    await page.fill(params["selector"], "")
                await page.type(params["selector"], text)
            elif action == "assert":
                kind = params.get("assertion_type", "is_visible")
                selector = params.get("selector")
                expected = params.get("expected_value", "")
                timeout = params.get("timeout_ms", 5000)

                if kind == "is_visible":
                    await page.wait_for_selector(selector, state="visible", timeout=timeout)
                elif kind == "text_equals":
                    element = await page.wait_for_selector(selector, timeout=timeout)
                    assert (await element.inner_text()).strip() == expected

        await browser.close()
        print("✅ Test Sequence Completed Successfully")

if __name__ == "__main__":
    asyncio.run(execute_test_suite("test_suite.json"))
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJsonFile = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${suiteName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    a.click();
  };

  return (
    <div
      id="json-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans select-none"
    >
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <FileCode2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Python <code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">test_executor.py</code> Payload
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {nodes.length} serialized steps & topological DAG flow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close export"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
          <div className="flex gap-4 font-bold">
            <button
              onClick={() => setActiveTab('json')}
              className={`py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'json'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>test_suite.json ({nodes.length} Steps)</span>
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'python'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>test_executor.py Sample Runner</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(activeTab === 'json' ? jsonString : pythonSampleScript)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {activeTab === 'json' && (
              <button
                onClick={downloadJsonFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs bg-slate-900 text-slate-100 flex-1 leading-relaxed">
          {activeTab === 'json' ? (
            <pre className="overflow-x-auto text-emerald-300">
              {jsonString}
            </pre>
          ) : (
            <pre className="overflow-x-auto text-indigo-200">
              {pythonSampleScript}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CLI dispatch: <code className="text-slate-900 font-bold font-mono">python test_executor.py --suite test_suite.json</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
