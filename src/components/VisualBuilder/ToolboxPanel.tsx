import React from 'react';
import {
  Globe,
  MousePointerClick,
  Type,
  CheckCircle2,
  GripVertical,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';
import { StepType } from '../../types';
import { motion } from 'motion/react';

interface ToolboxBlock {
  type: StepType;
  label: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  borderColor: string;
  accentBg: string;
}

const TOOLBOX_BLOCKS: ToolboxBlock[] = [
  {
    type: 'navigate',
    label: 'Navigate URL',
    category: 'Navigation',
    description: 'Direct browser to target URL with wait condition',
    icon: Globe,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    borderColor: 'hover:border-cyan-500/40',
    accentBg: 'group-hover:bg-cyan-500/10',
  },
  {
    type: 'click',
    label: 'Click Element',
    category: 'Interaction',
    description: 'Dispatch click event to CSS or XPath selector',
    icon: MousePointerClick,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    borderColor: 'hover:border-emerald-500/40',
    accentBg: 'group-hover:bg-emerald-500/10',
  },
  {
    type: 'input',
    label: 'Input Text',
    category: 'Interaction',
    description: 'Fill form inputs or send simulated keystrokes',
    icon: Type,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    borderColor: 'hover:border-amber-500/40',
    accentBg: 'group-hover:bg-amber-500/10',
  },
  {
    type: 'assert',
    label: 'Assert Value',
    category: 'Verification',
    description: 'Verify element state, text content, or URL',
    icon: CheckCircle2,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    borderColor: 'hover:border-purple-500/40',
    accentBg: 'group-hover:bg-purple-500/10',
  },
];

interface ToolboxPanelProps {
  onAddBlock: (type: StepType) => void;
  onLoadPreset: (presetName: string) => void;
}

export const ToolboxPanel: React.FC<ToolboxPanelProps> = ({ onAddBlock, onLoadPreset }) => {
  const handleDragStart = (e: React.DragEvent, type: StepType) => {
    e.dataTransfer.setData('application/testflow-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      id="builder-toolbox-panel"
      className="w-72 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 flex flex-col h-full shrink-0 select-none text-slate-300"
    >
      {/* Toolbox Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Toolbox
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-teal-400">
            Drag to Canvas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Drag blocks into the workspace or click <span className="text-teal-400">+</span> to append to your test pipeline.
        </p>
      </div>

      {/* Draggable Blocks List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        <div className="text-xs uppercase text-slate-400 tracking-wider">
          Step Blocks
        </div>

        {TOOLBOX_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <motion.div
              key={block.type}
              id={`toolbox-item-${block.type}`}
              draggable
              onDragStart={(e) => handleDragStart(e, block.type)}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`group relative p-3 bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 ${block.borderColor} rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-[0_8px_20px_-4px_rgba(20,184,166,0.12)] flex flex-col gap-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${block.badgeColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 block tracking-tight">
                      {block.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {block.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddBlock(block.type)}
                    title={`Add ${block.label} to canvas`}
                    className="p-2 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-teal-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-slate-600 group-hover:text-slate-400 cursor-grab p-1">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-snug">
                {block.description}
              </p>
            </motion.div>
          );
        })}

        {/* Quick Templates */}
        <div className="pt-4 mt-2 border-t border-slate-800">
          <div className="text-xs uppercase text-slate-400 tracking-wider mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Templates
            </span>
            <span className="text-xs text-slate-400">Presets</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => onLoadPreset('login')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-xs text-slate-300 hover:text-teal-300 transition-all"
            >
              <div className="font-semibold text-slate-200">E2E Login & Auth Flow</div>
              <div className="text-xs text-slate-400">5 steps: Form, Cookie, Dashboard</div>
            </button>
            <button
              onClick={() => onLoadPreset('checkout')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-xs text-slate-300 hover:text-teal-300 transition-all"
            >
              <div className="font-semibold text-slate-200">Cart & Checkout E2E</div>
              <div className="text-xs text-slate-400">3 steps: Add item, badge count</div>
            </button>
            <button
              onClick={() => onLoadPreset('search')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-xs text-slate-300 hover:text-teal-300 transition-all"
            >
              <div className="font-semibold text-slate-200">Search Debounce Filter</div>
              <div className="text-xs text-slate-400">4 steps: Query input, facet assertion</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
