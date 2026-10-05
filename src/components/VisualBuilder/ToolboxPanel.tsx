import React, { useState } from 'react';
import {
  Globe,
  MousePointerClick,
  Type,
  CheckCircle2,
  GripVertical,
  Plus,
  Sparkles,
  Layers,
  Search,
  BookmarkCheck,
} from 'lucide-react';
import { StepType, TestCase } from '../../types';
import { motion } from 'motion/react';

interface ToolboxBlock {
  type: StepType;
  label: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  borderColor: string;
}

const TOOLBOX_BLOCKS: ToolboxBlock[] = [
  {
    type: 'navigate',
    label: 'Navigate URL',
    category: 'Navigation',
    description: 'Direct browser to target URL with wait condition',
    icon: Globe,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    borderColor: 'hover:border-blue-500/40',
  },
  {
    type: 'click',
    label: 'Click Element',
    category: 'Interaction',
    description: 'Dispatch click event to CSS or XPath selector',
    icon: MousePointerClick,
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    borderColor: 'hover:border-indigo-500/40',
  },
  {
    type: 'input',
    label: 'Input Text',
    category: 'Interaction',
    description: 'Fill form inputs or simulated keystrokes',
    icon: Type,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    borderColor: 'hover:border-amber-500/40',
  },
  {
    type: 'assert',
    label: 'Assert Value',
    category: 'Verification',
    description: 'Verify element state, text content, or URL',
    icon: CheckCircle2,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    borderColor: 'hover:border-emerald-500/40',
  },
];

interface ToolboxPanelProps {
  onAddBlock: (type: StepType) => void;
  onAddTestCase?: (testCase: TestCase) => void;
  onLoadPreset: (presetName: string) => void;
  testCases?: TestCase[];
}

export const ToolboxPanel: React.FC<ToolboxPanelProps> = ({
  onAddBlock,
  onAddTestCase,
  onLoadPreset,
  testCases = [],
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'elements' | 'cases' | 'templates'>('elements');

  const handleDragStartBlock = (e: React.DragEvent, type: StepType) => {
    e.dataTransfer.setData('application/testflow-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartTestCase = (e: React.DragEvent, tc: TestCase) => {
    e.dataTransfer.setData('application/playsight-test-case', JSON.stringify(tc));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredBlocks = TOOLBOX_BLOCKS.filter(
    (b) =>
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTestCases = testCases.filter(
    (tc) =>
      tc.title.toLowerCase().includes(search.toLowerCase()) ||
      tc.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      id="builder-toolbox-panel"
      className="w-80 bg-slate-950/90 backdrop-blur-xl border-r border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-300 font-sans"
    >
      {/* Toolbox Header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Element Palette
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 font-mono">
            Drag to Canvas
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elements & cases..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'elements'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Elements
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'cases'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Test Cases</span>
            {testCases.length > 0 && (
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {testCases.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {/* Tab 1: Element Blocks */}
        {activeTab === 'elements' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-1">
              Basic Actions ({filteredBlocks.length})
            </div>

            {filteredBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <motion.div
                  key={block.type}
                  id={`toolbox-item-${block.type}`}
                  draggable
                  onDragStart={(e) => handleDragStartBlock(e as unknown as React.DragEvent, block.type)}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className={`group relative p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 ${block.borderColor} rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm flex flex-col gap-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${block.badgeColor}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-100 block tracking-tight">
                          {block.label}
                        </span>
                        <span className="text-[11px] text-slate-400">{block.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onAddBlock(block.type)}
                        title={`Add ${block.label} to sequence`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-slate-600 group-hover:text-slate-400 p-1 cursor-grab">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-snug">{block.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Reusable Test Cases */}
        {activeTab === 'cases' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Reusable Test Cases</span>
              <span className="text-indigo-400">{filteredTestCases.length} available</span>
            </div>

            {filteredTestCases.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-xs text-slate-400">
                No reusable test cases found matching query.
              </div>
            ) : (
              filteredTestCases.map((tc) => (
                <motion.div
                  key={tc.id}
                  draggable
                  onDragStart={(e) => handleDragStartTestCase(e as unknown as React.DragEvent, tc)}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="group relative p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate max-w-[160px]">
                        <span className="text-xs font-semibold text-slate-100 block truncate">
                          {tc.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tc.jiraIssueKey ? `Jira: ${tc.jiraIssueKey}` : tc.stepType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {onAddTestCase && (
                        <button
                          onClick={() => onAddTestCase(tc)}
                          title={`Add ${tc.title} to suite`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="text-slate-600 group-hover:text-slate-400 p-1 cursor-grab">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {tc.description && (
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                      {tc.description}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Presets & Templates */}
        {activeTab === 'templates' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Pre-built Flow Templates
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onLoadPreset('login')}
                className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs transition-all cursor-pointer"
              >
                <div className="font-semibold text-slate-200">E2E Login & Auth Flow</div>
                <div className="text-[11px] text-slate-400 mt-0.5">5 steps: Form, Cookie, Dashboard state</div>
              </button>

              <button
                onClick={() => onLoadPreset('checkout')}
                className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs transition-all cursor-pointer"
              >
                <div className="font-semibold text-slate-200">Cart & Checkout Flow</div>
                <div className="text-[11px] text-slate-400 mt-0.5">5 steps: Portal, Email, Stripe, Order verify</div>
              </button>

              <button
                onClick={() => onLoadPreset('search')}
                className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs transition-all cursor-pointer"
              >
                <div className="font-semibold text-slate-200">Search & Filter Automation</div>
                <div className="text-[11px] text-slate-400 mt-0.5">4 steps: Query input, facet assertion</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
