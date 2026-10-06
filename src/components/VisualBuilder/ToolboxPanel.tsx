import React, { useState, useMemo } from 'react';
import {
  Globe,
  ArrowDownUp,
  Clock,
  Camera,
  MousePointerClick,
  Type,
  ListFilter,
  Move,
  KeyRound,
  FileText,
  Tag,
  Table,
  Layers,
  Code2,
  FastForward,
  Repeat,
  Braces,
  FileSpreadsheet,
  Send,
  CheckCircle2,
  Cookie,
  ShieldAlert,
  GripVertical,
  Plus,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  BookmarkCheck,
} from 'lucide-react';
import { StepType, TestCase } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export type CategoryId =
  | 'all'
  | 'navigation'
  | 'interaction'
  | 'extraction'
  | 'pagination'
  | 'export'
  | 'validation';

interface ToolboxBlock {
  type: StepType;
  label: string;
  category: string;
  categoryId: CategoryId;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  borderColor: string;
}

const CATEGORIES: { id: CategoryId; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Elements', icon: Layers },
  { id: 'navigation', label: 'Navigation', icon: Globe },
  { id: 'interaction', label: 'Interaction', icon: MousePointerClick },
  { id: 'extraction', label: 'Web Scraping', icon: FileText },
  { id: 'pagination', label: 'Pagination & Flow', icon: FastForward },
  { id: 'export', label: 'Export & Push', icon: FileSpreadsheet },
  { id: 'validation', label: 'Validation & Anti-Bot', icon: ShieldAlert },
];

const TOOLBOX_BLOCKS: ToolboxBlock[] = [
  // ==========================================
  // Category 1: Navigation & Browsing
  // ==========================================
  {
    type: 'navigate',
    label: 'Navigate URL',
    category: 'Navigation',
    categoryId: 'navigation',
    description: 'Direct browser to target URL with wait condition',
    icon: Globe,
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    borderColor: 'hover:border-blue-400',
  },
  {
    type: 'scroll',
    label: 'Scroll Page',
    category: 'Navigation',
    categoryId: 'navigation',
    description: 'Scroll viewport down, up, or into element view',
    icon: ArrowDownUp,
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
    borderColor: 'hover:border-sky-400',
  },
  {
    type: 'wait_for',
    label: 'Wait / Delay',
    category: 'Navigation',
    categoryId: 'navigation',
    description: 'Pause for DOM selector, network idle, or timeout',
    icon: Clock,
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    borderColor: 'hover:border-blue-400',
  },
  {
    type: 'screenshot',
    label: 'Screenshot',
    category: 'Navigation',
    categoryId: 'navigation',
    description: 'Capture full page or element visual snapshot',
    icon: Camera,
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    borderColor: 'hover:border-indigo-400',
  },

  // ==========================================
  // Category 2: Element Interactions
  // ==========================================
  {
    type: 'click',
    label: 'Click Element',
    category: 'Interaction',
    categoryId: 'interaction',
    description: 'Dispatch click event to CSS or XPath selector',
    icon: MousePointerClick,
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    borderColor: 'hover:border-indigo-400',
  },
  {
    type: 'input',
    label: 'Input Text',
    category: 'Interaction',
    categoryId: 'interaction',
    description: 'Fill form inputs or simulated keystrokes',
    icon: Type,
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    borderColor: 'hover:border-amber-400',
  },
  {
    type: 'select_dropdown',
    label: 'Select Dropdown',
    category: 'Interaction',
    categoryId: 'interaction',
    description: 'Choose option by value, label, or index',
    icon: ListFilter,
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    borderColor: 'hover:border-indigo-400',
  },
  {
    type: 'hover',
    label: 'Hover Element',
    category: 'Interaction',
    categoryId: 'interaction',
    description: 'Trigger mouse hover state or dynamic menu',
    icon: Move,
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    borderColor: 'hover:border-purple-400',
  },
  {
    type: 'press_key',
    label: 'Press Key',
    category: 'Interaction',
    categoryId: 'interaction',
    description: 'Send keyboard key (Enter, Escape, Tab, Arrows)',
    icon: KeyRound,
    badgeColor: 'text-slate-700 bg-slate-100 border-slate-200',
    borderColor: 'hover:border-slate-400',
  },

  // ==========================================
  // Category 3: Data Extraction & Web Scraping
  // ==========================================
  {
    type: 'extract_text',
    label: 'Extract Text',
    category: 'Web Scraping',
    categoryId: 'extraction',
    description: 'Scrape inner text from single or multiple elements',
    icon: FileText,
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    borderColor: 'hover:border-emerald-400',
  },
  {
    type: 'extract_attribute',
    label: 'Extract Attribute',
    category: 'Web Scraping',
    categoryId: 'extraction',
    description: 'Extract href, src, data-*, or alt attributes',
    icon: Tag,
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    borderColor: 'hover:border-blue-400',
  },
  {
    type: 'extract_table',
    label: 'Extract HTML Table',
    category: 'Web Scraping',
    categoryId: 'extraction',
    description: 'Parse HTML table rows into structured JSON rows',
    icon: Table,
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    borderColor: 'hover:border-blue-400',
  },
  {
    type: 'extract_list',
    label: 'Extract List Items',
    category: 'Web Scraping',
    categoryId: 'extraction',
    description: 'Extract repeated card, catalog, or search items',
    icon: Layers,
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    borderColor: 'hover:border-indigo-400',
  },
  {
    type: 'extract_html',
    label: 'Extract Raw HTML',
    category: 'Web Scraping',
    categoryId: 'extraction',
    description: 'Scrape raw innerHTML or outerHTML snippet',
    icon: Code2,
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    borderColor: 'hover:border-purple-400',
  },

  // ==========================================
  // Category 4: Pagination & Loops
  // ==========================================
  {
    type: 'pagination',
    label: 'Paginate Next',
    category: 'Pagination & Flow',
    categoryId: 'pagination',
    description: 'Follow next page link or button up to N pages',
    icon: FastForward,
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    borderColor: 'hover:border-blue-400',
  },
  {
    type: 'loop_elements',
    label: 'Loop Elements',
    category: 'Pagination & Flow',
    categoryId: 'pagination',
    description: 'Iterate over matched elements with step child loop',
    icon: Repeat,
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    borderColor: 'hover:border-indigo-400',
  },

  // ==========================================
  // Category 5: Export & Output
  // ==========================================
  {
    type: 'export_json',
    label: 'Export to JSON',
    category: 'Export & Push',
    categoryId: 'export',
    description: 'Save extracted dataset to structured JSON file',
    icon: Braces,
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    borderColor: 'hover:border-amber-400',
  },
  {
    type: 'export_csv',
    label: 'Export to CSV',
    category: 'Export & Push',
    categoryId: 'export',
    description: 'Format extracted items into tabular CSV spreadsheet',
    icon: FileSpreadsheet,
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    borderColor: 'hover:border-emerald-400',
  },
  {
    type: 'webhook_push',
    label: 'Push via Webhook',
    category: 'Export & Push',
    categoryId: 'export',
    description: 'POST extracted payload to external HTTP endpoint',
    icon: Send,
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    borderColor: 'hover:border-rose-400',
  },

  // ==========================================
  // Category 6: Validation & Anti-Bot
  // ==========================================
  {
    type: 'assert',
    label: 'Assert Value',
    category: 'Validation & Anti-Bot',
    categoryId: 'validation',
    description: 'Verify element state, text content, or URL',
    icon: CheckCircle2,
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    borderColor: 'hover:border-emerald-400',
  },
  {
    type: 'cookie_banner',
    label: 'Dismiss Cookie Banner',
    category: 'Validation & Anti-Bot',
    categoryId: 'validation',
    description: 'Automatically find & click accept/dismiss banner',
    icon: Cookie,
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    borderColor: 'hover:border-amber-400',
  },
  {
    type: 'captcha_detect',
    label: 'Detect Anti-Bot / CAPTCHA',
    category: 'Validation & Anti-Bot',
    categoryId: 'validation',
    description: 'Detect Cloudflare challenge or captcha barrier',
    icon: ShieldAlert,
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    borderColor: 'hover:border-rose-400',
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleDragStartBlock = (e: React.DragEvent, type: StepType) => {
    e.dataTransfer.setData('application/testflow-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartTestCase = (e: React.DragEvent, tc: TestCase) => {
    e.dataTransfer.setData('application/playsight-test-case', JSON.stringify(tc));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredBlocks = useMemo(() => {
    return TOOLBOX_BLOCKS.filter((b) => {
      const matchesSearch =
        b.label.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || b.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const filteredTestCases = useMemo(() => {
    return testCases.filter(
      (tc) =>
        tc.title.toLowerCase().includes(search.toLowerCase()) ||
        tc.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [testCases, search]);

  // Group blocks by category for clean section display
  const groupedBlocks = useMemo(() => {
    const map = new Map<string, ToolboxBlock[]>();
    for (const b of filteredBlocks) {
      const list = map.get(b.category) || [];
      list.push(b);
      map.set(b.category, list);
    }
    return Array.from(map.entries());
  }, [filteredBlocks]);

  return (
    <div
      id="builder-toolbox-panel"
      className="w-84 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none text-slate-700 font-sans shadow-2xs"
    >
      {/* Toolbox Header */}
      <div className="p-4 border-b border-slate-200 space-y-3.5 bg-slate-50/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                Actions & Elements
              </span>
              <span className="text-xs text-slate-500 font-medium">Workflow component library</span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
            Drag to Canvas
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions & elements..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 border border-slate-300 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'elements'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Elements ({TOOLBOX_BLOCKS.length})
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'cases'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <span>Modules</span>
            {testCases.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                {testCases.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Recipes
          </button>
        </div>

        {/* Category Horizontal Filter Pills */}
        {activeTab === 'elements' && (
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-[11px]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Tab 1: Element Blocks Categorized */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            {groupedBlocks.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                No elements found matching "{search}".
              </div>
            ) : (
              groupedBlocks.map(([catName, blocks]) => {
                const isCollapsed = collapsedCategories[catName];
                return (
                  <div key={catName} className="space-y-2">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleCategoryCollapse(catName)}
                      className="w-full flex items-center justify-between text-xs font-sans font-bold text-slate-700 uppercase tracking-wider px-1 py-1 hover:text-slate-950 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5">
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                        )}
                        <span>{catName}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                        {blocks.length}
                      </span>
                    </button>

                    {/* Section Blocks */}
                    {!isCollapsed && (
                      <div className="space-y-2">
                        {blocks.map((block) => {
                          const Icon = block.icon;
                          return (
                            <motion.div
                              key={block.type}
                              id={`toolbox-item-${block.type}`}
                              draggable
                              onDragStart={(e) =>
                                handleDragStartBlock(e as unknown as React.DragEvent, block.type)
                              }
                              whileHover={{ y: -1, transition: { duration: 0.12 } }}
                              className={`group relative p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 rounded-2xl cursor-grab active:cursor-grabbing transition-all shadow-xs flex flex-col gap-2`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${block.badgeColor}`}
                                  >
                                    <Icon className="w-5 h-5 stroke-[2.2]" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[14px] font-bold text-slate-900 block tracking-tight truncate">
                                      {block.label}
                                    </span>
                                    <span className="text-xs text-indigo-700 font-mono font-semibold">
                                      {block.type}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => onAddBlock(block.type)}
                                    title={`Add ${block.label} to sequence`}
                                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white transition-colors cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-4 h-4 stroke-[2.5]" />
                                  </button>
                                  <div className="text-slate-400 group-hover:text-slate-700 p-1 cursor-grab">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {block.description}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Reusable Test Cases */}
        {activeTab === 'cases' && (
          <div className="space-y-2.5">
            <div className="text-xs font-sans font-bold text-slate-700 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Reusable Modules</span>
              <span className="text-indigo-600 font-semibold">{filteredTestCases.length} available</span>
            </div>

            {filteredTestCases.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                No reusable test cases found matching query.
              </div>
            ) : (
              filteredTestCases.map((tc) => (
                <motion.div
                  key={tc.id}
                  draggable
                  onDragStart={(e) => handleDragStartTestCase(e as unknown as React.DragEvent, tc)}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="group relative p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-2xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">
                          {tc.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {tc.stepType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {onAddTestCase && (
                      <button
                        onClick={() => onAddTestCase(tc)}
                        className="p-1 rounded-md bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white transition-colors cursor-pointer"
                        title="Add to canvas"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {tc.description && (
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {tc.description}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Preset Templates */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <div className="text-xs font-sans font-bold text-slate-700 uppercase tracking-wider px-1">
              Workflow Recipes
            </div>

            {/* Template 1: E-Commerce Checkout */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  E-Commerce Regression
                </span>
                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-medium">
                  4 steps
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Checkout flow: navigate to cart, fill customer details, submit order, assert confirmation.
              </p>
              <button
                onClick={() => onLoadPreset('checkout')}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Checkout Recipe</span>
              </button>
            </div>

            {/* Template 2: Web Scraper Product Catalog */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Web Scraper: Catalog & Prices
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                  6 steps
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Web scraping recipe: navigate catalog, dismiss cookies, scroll, extract product table, paginate, export to JSON.
              </p>
              <button
                onClick={() => onLoadPreset('scraper-catalog')}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <FileText className="w-3 h-3" />
                <span>Load Scraper Recipe</span>
              </button>
            </div>

            {/* Template 3: Lead Directory Scraper */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Lead & Directory Scraper
                </span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                  5 steps
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Extract repeated cards, extract link hrefs, paginate, and format into CSV spreadsheet output.
              </p>
              <button
                onClick={() => onLoadPreset('scraper-leads')}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Load Leads Recipe</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
