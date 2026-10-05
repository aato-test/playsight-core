import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode2,
  Terminal,
  ExternalLink,
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
Consumes exported test sequence JSON from Visual Builder.
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
              message = params.get("failure_message", "Assertion failed")
              timeout = params.get("timeout_ms", 5000)

              if kind == "is_visible":
                await page.wait_for_selector(selector, state="visible", timeout=timeout)
              elif kind == "text_contains":
                assert expected in await page.inner_text(selector, timeout=timeout), message
              elif kind == "text_equals":
                assert (await page.inner_text(selector, timeout=timeout)).strip() == expected, message
              elif kind == "has_value":
                assert await page.input_value(selector, timeout=timeout) == expected, message
              elif kind == "url_contains":
                assert expected in page.url, message
              else:
                raise ValueError(f"Unsupported assertion type: {kind}")

        print("✅ Test Sequence Execution Succeeded!")
        await browser.close()

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
    a.download = `${suiteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-test-suite.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="json-export-modal-backdrop"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="json-export-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Python <code className="font-mono text-amber-400 text-xs">test_executor.py</code> Payload
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {nodes.length} serialized nodes & topological flow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="Close export"
            aria-label="Close export"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('json')}
              className={`py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'json'
                  ? 'border-teal-400 text-teal-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>test_suite.json ({nodes.length} Steps)</span>
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'python'
                  ? 'border-teal-400 text-teal-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>test_executor.py Sample Runner</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(activeTab === 'json' ? jsonString : pythonSampleScript)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {activeTab === 'json' && (
              <button
                onClick={downloadJsonFile}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs bg-slate-950/90 text-slate-300 flex-1">
          {activeTab === 'json' ? (
            <pre className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 leading-relaxed overflow-x-auto selection:bg-teal-500/30">
              {jsonString}
            </pre>
          ) : (
            <pre className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 leading-relaxed overflow-x-auto text-emerald-300 selection:bg-emerald-500/30">
              {pythonSampleScript}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>CLI dispatch: <code className="text-slate-200">python test_executor.py --suite test_suite.json</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
