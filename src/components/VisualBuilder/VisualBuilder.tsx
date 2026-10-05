import React, { useEffect, useState } from 'react';
import { CanvasArea } from './CanvasArea';
import { PropertiesPanel } from './PropertiesPanel';
import { ToolboxPanel } from './ToolboxPanel';
import { orderNodes } from '../../data/mockData';
import { fetchTestCases } from '../../services/api';
import {
  TestNode,
  ConnectionEdge,
  StepType,
  TestSuite,
  TestCase,
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
import {
  Play,
  RotateCw,
  Save,
  Copy,
  Code2,
  GitBranch,
  Radio,
  BookmarkCheck,
} from 'lucide-react';

interface VisualBuilderProps {
  suite: TestSuite;
  onUpdateSuite: (updatedSuite: TestSuite) => void;
  isRunning: boolean;
  onRunTest: () => void;
  onOpenJsonModal: () => void;
  onOpenCopilot: () => void;
  onAutoHealTrigger: (nodeId: string) => void;
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  suite,
  onUpdateSuite,
  isRunning,
  onRunTest,
  onOpenJsonModal,
  onAutoHealTrigger,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    suite.nodes.length > 0 ? suite.nodes[0].id : null
  );
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    fetchTestCases().then((cases) => {
      if (cases && cases.length > 0) setTestCases(cases);
    });
  }, []);

  const selectedNode = suite.nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedNodeIndex = selectedNode
    ? suite.nodes.findIndex((n) => n.id === selectedNode.id) + 1
    : 1;

  // Add a new node
  const handleAddNode = (type: StepType, position?: { x: number; y: number }) => {
    const nextId = `node-${Date.now().toString().slice(-4)}`;
    let defaultData: any = {};
    let defaultTitle = '';

    if (type === 'navigate') {
      defaultTitle = 'Navigate Target';
      defaultData = {
        url: '/checkout',
        timeout: 8000,
        waitUntil: 'load',
      } as NavigateStepData;
    } else if (type === 'scroll') {
      defaultTitle = 'Scroll Viewport';
      defaultData = {
        direction: 'down',
        selector: '',
        distancePx: 800,
        smooth: true,
        timeout: 5000,
      } as ScrollStepData;
    } else if (type === 'wait_for') {
      defaultTitle = 'Wait / Delay';
      defaultData = {
        waitType: 'timeout',
        selector: '',
        durationMs: 2000,
        timeout: 10000,
      } as WaitForStepData;
    } else if (type === 'screenshot') {
      defaultTitle = 'Capture Snapshot';
      defaultData = {
        captureFullPage: true,
        selector: '',
        fileName: 'snapshot.png',
        timeout: 5000,
      } as ScreenshotStepData;
    } else if (type === 'click') {
      defaultTitle = 'Click Element';
      defaultData = {
        selector: '[data-testid="submit"]',
        clickType: 'single',
        waitForSelector: true,
        timeout: 6000,
      } as ClickStepData;
    } else if (type === 'input') {
      defaultTitle = 'Input Field';
      defaultData = {
        selector: '#search-box',
        value: 'Search query',
        clearFirst: true,
        maskInput: false,
        timeout: 5000,
      } as InputStepData;
    } else if (type === 'select_dropdown') {
      defaultTitle = 'Select Dropdown';
      defaultData = {
        selector: 'select#category',
        selectValue: 'electronics',
        selectBy: 'value',
        timeout: 5000,
      } as SelectDropdownStepData;
    } else if (type === 'hover') {
      defaultTitle = 'Hover Element';
      defaultData = {
        selector: '.nav-dropdown-trigger',
        timeout: 5000,
      } as HoverStepData;
    } else if (type === 'press_key') {
      defaultTitle = 'Press Key';
      defaultData = {
        key: 'Enter',
        selector: 'input[type="search"]',
        timeout: 5000,
      } as PressKeyStepData;
    } else if (type === 'extract_text') {
      defaultTitle = 'Extract Text';
      defaultData = {
        selector: '.product-title',
        variableName: 'productTitles',
        extractMultiple: true,
        trimWhitespace: true,
        timeout: 6000,
      } as ExtractTextStepData;
    } else if (type === 'extract_attribute') {
      defaultTitle = 'Extract Attribute';
      defaultData = {
        selector: 'a.product-link',
        attribute: 'href',
        variableName: 'productUrls',
        extractMultiple: true,
        timeout: 6000,
      } as ExtractAttributeStepData;
    } else if (type === 'extract_table') {
      defaultTitle = 'Extract HTML Table';
      defaultData = {
        selector: 'table.data-grid',
        variableName: 'catalogTable',
        parseHeaders: true,
        timeout: 8000,
      } as ExtractTableStepData;
    } else if (type === 'extract_list') {
      defaultTitle = 'Extract List Items';
      defaultData = {
        parentSelector: '.product-grid',
        itemSelector: '.card-body',
        variableName: 'itemsList',
        timeout: 8000,
      } as ExtractListStepData;
    } else if (type === 'extract_html') {
      defaultTitle = 'Extract Raw HTML';
      defaultData = {
        selector: '#main-content',
        htmlType: 'innerHTML',
        variableName: 'rawHtml',
        timeout: 5000,
      } as ExtractHtmlStepData;
    } else if (type === 'pagination') {
      defaultTitle = 'Paginate Results';
      defaultData = {
        nextButtonSelector: 'a.pagination-next, button:has-text("Next")',
        maxPages: 5,
        waitAfterClickMs: 1500,
        timeout: 10000,
      } as PaginationStepData;
    } else if (type === 'loop_elements') {
      defaultTitle = 'Loop Elements';
      defaultData = {
        itemSelector: '.catalog-row',
        maxItems: 25,
        timeout: 10000,
      } as LoopElementsStepData;
    } else if (type === 'export_json') {
      defaultTitle = 'Export to JSON';
      defaultData = {
        datasetVariable: 'scrapedData',
        fileName: 'scraped_dataset.json',
        prettyPrint: true,
        timeout: 1000,
      } as ExportJsonStepData;
    } else if (type === 'export_csv') {
      defaultTitle = 'Export to CSV';
      defaultData = {
        datasetVariable: 'scrapedData',
        fileName: 'scraped_dataset.csv',
        delimiter: ',',
        timeout: 1000,
      } as ExportCsvStepData;
    } else if (type === 'webhook_push') {
      defaultTitle = 'Push Webhook';
      defaultData = {
        endpointUrl: 'https://api.example.com/webhooks/ingest',
        method: 'POST',
        authHeader: '',
        timeout: 10000,
      } as WebhookPushStepData;
    } else if (type === 'cookie_banner') {
      defaultTitle = 'Dismiss Cookie Banner';
      defaultData = {
        acceptSelector: '#onetrust-accept-btn-handler, button:has-text("Accept")',
        dismissSelector: '',
        optional: true,
        timeout: 3000,
      } as CookieBannerStepData;
    } else if (type === 'captcha_detect') {
      defaultTitle = 'Anti-Bot Guard';
      defaultData = {
        alertOnDetect: true,
        actionOnDetect: 'wait_for_user',
        timeout: 5000,
      } as CaptchaDetectStepData;
    } else if (type === 'assert') {
      defaultTitle = 'Assert State';
      defaultData = {
        selector: 'body',
        assertionType: 'is_visible',
        expectedValue: '',
        failureMessage: 'Verification failed',
        timeout: 5000,
      } as AssertStepData;
    }

    let pos = position;
    if (!pos) {
      const maxX = suite.nodes.reduce((max, n) => Math.max(max, n.position.x), 0);
      pos = { x: maxX > 0 ? maxX + 340 : 80, y: 140 };
    }

    const newNode: TestNode = {
      id: nextId,
      type,
      title: defaultTitle,
      position: pos,
      data: defaultData,
      status: 'idle',
      confidence: 98,
      source: 'Manual definition',
      lastExecution: 'Ready',
      jiraIssue: suite.jiraIssue || 'CHK-184',
    };

    const newEdges = [...suite.edges];
    if (suite.nodes.length > 0 && !position) {
      const lastNode = suite.nodes[suite.nodes.length - 1];
      newEdges.push({
        id: `edge-${lastNode.id}-${newNode.id}`,
        sourceId: lastNode.id,
        targetId: newNode.id,
      });
    }

    onUpdateSuite({
      ...suite,
      nodes: [...suite.nodes, newNode],
      edges: newEdges,
      updatedAt: 'Just now',
    });

    setSelectedNodeId(newNode.id);
  };

  // Add reusable test case into suite
  const handleAddTestCase = (tc: TestCase, position?: { x: number; y: number }) => {
    const nextId = `node-${Date.now().toString().slice(-4)}`;
    let pos = position;
    if (!pos) {
      const maxX = suite.nodes.reduce((max, n) => Math.max(max, n.position.x), 0);
      pos = { x: maxX > 0 ? maxX + 340 : 80, y: 140 };
    }

    const newNode: TestNode = {
      id: nextId,
      type: tc.stepType,
      title: tc.title,
      description: tc.description,
      position: pos,
      data: tc.definition?.data || { url: '/', timeout: 5000, waitUntil: 'domcontentloaded' },
      status: 'idle',
      confidence: 99,
      source: `Test Case: ${tc.id}`,
      lastExecution: 'Ready',
      jiraIssue: tc.jiraIssueKey || suite.jiraIssue || 'CHK-184',
    };

    const newEdges = [...suite.edges];
    if (suite.nodes.length > 0 && !position) {
      const lastNode = suite.nodes[suite.nodes.length - 1];
      newEdges.push({
        id: `edge-${lastNode.id}-${newNode.id}`,
        sourceId: lastNode.id,
        targetId: newNode.id,
      });
    }

    onUpdateSuite({
      ...suite,
      nodes: [...suite.nodes, newNode],
      edges: newEdges,
      updatedAt: 'Just now',
    });

    setSelectedNodeId(newNode.id);
  };

  const handleUpdateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    onUpdateSuite({
      ...suite,
      nodes: suite.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
    });
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<TestNode>) => {
    onUpdateSuite({
      ...suite,
      nodes: suite.nodes.map((node) =>
        node.id !== nodeId
          ? node
          : {
              ...node,
              ...updates,
            }
      ),
      updatedAt: 'Just now',
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    const remainingNodes = suite.nodes.filter((n) => n.id !== nodeId);
    const remainingEdges = suite.edges.filter(
      (e) => e.sourceId !== nodeId && e.targetId !== nodeId
    );

    onUpdateSuite({
      ...suite,
      nodes: remainingNodes,
      edges: remainingEdges,
      updatedAt: 'Just now',
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(remainingNodes.length > 0 ? remainingNodes[0].id : null);
    }
  };

  const handleDuplicateNode = (node: TestNode) => {
    const nextId = `node-${Date.now().toString().slice(-4)}`;
    const duplicatedNode: TestNode = {
      ...node,
      id: nextId,
      title: `${node.title} (Copy)`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      status: 'idle',
      errorMessage: undefined,
    };

    onUpdateSuite({
      ...suite,
      nodes: [...suite.nodes, duplicatedNode],
      updatedAt: 'Just now',
    });

    setSelectedNodeId(nextId);
  };

  const handleConnectNodes = (sourceId: string, targetId: string) => {
    const edgeExists = suite.edges.some(
      (e) => e.sourceId === sourceId && e.targetId === targetId
    );
    if (edgeExists) return;

    const newEdge: ConnectionEdge = {
      id: `edge-${sourceId}-${targetId}`,
      sourceId,
      targetId,
    };

    onUpdateSuite({
      ...suite,
      edges: [...suite.edges, newEdge],
      updatedAt: 'Just now',
    });
  };

  const handleDeleteEdge = (edgeId: string) => {
    onUpdateSuite({
      ...suite,
      edges: suite.edges.filter((e) => e.id !== edgeId),
      updatedAt: 'Just now',
    });
  };

  const handleAutoLayout = () => {
    const ordered = orderNodes(suite.nodes, suite.edges);
    const startX = 80;
    const spacingX = 350;
    const fixedY = 140;

    const layoutedNodes = ordered.map((node, index) => ({
      ...node,
      position: { x: startX + index * spacingX, y: fixedY },
    }));

    onUpdateSuite({
      ...suite,
      nodes: layoutedNodes,
      updatedAt: 'Just now',
    });
  };

  const handleLoadPreset = (presetName: string) => {
    if (presetName === 'checkout') {
      const checkoutNodes: TestNode[] = [
        {
          id: 'step-1',
          type: 'navigate',
          title: 'Launch Checkout Portal',
          position: { x: 80, y: 140 },
          data: { url: '/checkout', timeout: 5000, waitUntil: 'load' } as NavigateStepData,
          status: 'idle',
        },
        {
          id: 'step-2',
          type: 'input',
          title: 'Input Customer Email',
          position: { x: 430, y: 140 },
          data: { selector: '#customer-email', value: 'qa-test@playsight.dev', clearFirst: true, maskInput: false, timeout: 5000 } as InputStepData,
          status: 'idle',
        },
        {
          id: 'step-3',
          type: 'click',
          title: 'Submit Order Confirmation',
          position: { x: 780, y: 140 },
          data: { selector: '#submit-order-button', clickType: 'single', waitForSelector: true, timeout: 6000 } as ClickStepData,
          status: 'idle',
        },
        {
          id: 'step-4',
          type: 'assert',
          title: 'Assert Order Confirmation #',
          position: { x: 1130, y: 140 },
          data: { selector: '.order-success-title', assertionType: 'text_contains', expectedValue: 'Order Confirmed', failureMessage: 'Missing header', timeout: 5000 } as AssertStepData,
          status: 'idle',
        },
      ];
      const checkoutEdges: ConnectionEdge[] = [
        { id: 'e-1-2', sourceId: 'step-1', targetId: 'step-2' },
        { id: 'e-2-3', sourceId: 'step-2', targetId: 'step-3' },
        { id: 'e-3-4', sourceId: 'step-3', targetId: 'step-4' },
      ];
      onUpdateSuite({
        ...suite,
        nodes: checkoutNodes,
        edges: checkoutEdges,
        updatedAt: 'Just now',
      });
      setSelectedNodeId('step-1');
    } else if (presetName === 'scraper-catalog') {
      const scraperNodes: TestNode[] = [
        {
          id: 'step-1',
          type: 'navigate',
          title: 'Navigate Product Catalog',
          position: { x: 80, y: 140 },
          data: { url: 'https://news.ycombinator.com', timeout: 8000, waitUntil: 'load' } as NavigateStepData,
          status: 'idle',
        },
        {
          id: 'step-2',
          type: 'cookie_banner',
          title: 'Dismiss Cookie Banner',
          position: { x: 430, y: 140 },
          data: { acceptSelector: 'button:has-text("Accept"), button:has-text("Consent")', dismissSelector: '', optional: true, timeout: 3000 } as CookieBannerStepData,
          status: 'idle',
        },
        {
          id: 'step-3',
          type: 'scroll',
          title: 'Scroll Down Feed',
          position: { x: 780, y: 140 },
          data: { direction: 'down', selector: '', distancePx: 800, smooth: true, timeout: 5000 } as ScrollStepData,
          status: 'idle',
        },
        {
          id: 'step-4',
          type: 'extract_table',
          title: 'Scrape Products / Headlines Table',
          position: { x: 1130, y: 140 },
          data: { selector: 'table.itemlist, table', variableName: 'scrapedTableData', parseHeaders: true, timeout: 8000 } as ExtractTableStepData,
          status: 'idle',
        },
        {
          id: 'step-5',
          type: 'pagination',
          title: 'Paginate to Next Page',
          position: { x: 1480, y: 140 },
          data: { nextButtonSelector: 'a.morelink, a[rel="next"]', maxPages: 3, waitAfterClickMs: 1500, timeout: 8000 } as PaginationStepData,
          status: 'idle',
        },
        {
          id: 'step-6',
          type: 'export_json',
          title: 'Export to Scraped Dataset JSON',
          position: { x: 1830, y: 140 },
          data: { datasetVariable: 'scrapedTableData', fileName: 'catalog_export.json', prettyPrint: true, timeout: 2000 } as ExportJsonStepData,
          status: 'idle',
        },
      ];
      const scraperEdges: ConnectionEdge[] = [
        { id: 'e-1-2', sourceId: 'step-1', targetId: 'step-2' },
        { id: 'e-2-3', sourceId: 'step-2', targetId: 'step-3' },
        { id: 'e-3-4', sourceId: 'step-3', targetId: 'step-4' },
        { id: 'e-4-5', sourceId: 'step-4', targetId: 'step-5' },
        { id: 'e-5-6', sourceId: 'step-5', targetId: 'step-6' },
      ];
      onUpdateSuite({
        ...suite,
        nodes: scraperNodes,
        edges: scraperEdges,
        updatedAt: 'Just now',
      });
      setSelectedNodeId('step-1');
    } else if (presetName === 'scraper-leads') {
      const leadsNodes: TestNode[] = [
        {
          id: 'step-1',
          type: 'navigate',
          title: 'Open Directory Portal',
          position: { x: 80, y: 140 },
          data: { url: 'https://example.com/directory', timeout: 8000, waitUntil: 'load' } as NavigateStepData,
          status: 'idle',
        },
        {
          id: 'step-2',
          type: 'wait_for',
          title: 'Wait for Directory Grid',
          position: { x: 430, y: 140 },
          data: { waitType: 'timeout', selector: '', durationMs: 1500, timeout: 5000 } as WaitForStepData,
          status: 'idle',
        },
        {
          id: 'step-3',
          type: 'extract_list',
          title: 'Extract Member Cards',
          position: { x: 780, y: 140 },
          data: { parentSelector: '.directory-list, .grid', itemSelector: '.member-card, .card', variableName: 'memberList', timeout: 8000 } as ExtractListStepData,
          status: 'idle',
        },
        {
          id: 'step-4',
          type: 'extract_attribute',
          title: 'Extract Profile Hrefs',
          position: { x: 1130, y: 140 },
          data: { selector: 'a.profile-link, a', attribute: 'href', variableName: 'profileUrls', extractMultiple: true, timeout: 6000 } as ExtractAttributeStepData,
          status: 'idle',
        },
        {
          id: 'step-5',
          type: 'export_csv',
          title: 'Export Leads to CSV',
          position: { x: 1480, y: 140 },
          data: { datasetVariable: 'memberList', fileName: 'leads_directory.csv', delimiter: ',', timeout: 2000 } as ExportCsvStepData,
          status: 'idle',
        },
      ];
      const leadsEdges: ConnectionEdge[] = [
        { id: 'e-1-2', sourceId: 'step-1', targetId: 'step-2' },
        { id: 'e-2-3', sourceId: 'step-2', targetId: 'step-3' },
        { id: 'e-3-4', sourceId: 'step-3', targetId: 'step-4' },
        { id: 'e-4-5', sourceId: 'step-4', targetId: 'step-5' },
      ];
      onUpdateSuite({
        ...suite,
        nodes: leadsNodes,
        edges: leadsEdges,
        updatedAt: 'Just now',
      });
      setSelectedNodeId('step-1');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Workflow Editor Header */}
      <div className="h-14 px-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 select-none z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {suite.name}
              {suite.branchName && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1 font-normal">
                  <GitBranch className="w-3 h-3 text-indigo-600" />
                  {suite.branchName}
                </span>
              )}
              {suite.triggerType && suite.triggerType !== 'manual' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1 font-normal">
                  <Radio className="w-2.5 h-2.5" />
                  Auto: {suite.triggerType}
                </span>
              )}
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {suite.nodes.length} test steps · <span className="capitalize">{suite.targetBrowser}</span>
            </div>
          </div>
        </div>

        {/* Right-side Actions */}
        <div className="flex items-center gap-2">
          {/* Run Button */}
          <button
            onClick={onRunTest}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer shadow-xs ${
              isRunning
                ? 'bg-amber-500 text-white cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
            }`}
            title="Execute Workflow Sequence"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>

          {/* Save */}
          <button
            onClick={() => onUpdateSuite({ ...suite, updatedAt: 'Just now' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono transition-colors cursor-pointer shadow-2xs"
            title="Save Workflow (⌘S)"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => {
              if (selectedNode) handleDuplicateNode(selectedNode);
            }}
            disabled={!selectedNode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-mono transition-colors cursor-pointer disabled:opacity-40 shadow-2xs"
            title="Duplicate Selected Node"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Export JSON Modal */}
          <button
            onClick={onOpenJsonModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Export JSON & test_executor.py Payload"
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas with Left Toolbox and Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbox Panel: Element Palette & Reusable Test Cases */}
        <ToolboxPanel
          onAddBlock={handleAddNode}
          onAddTestCase={handleAddTestCase}
          onLoadPreset={handleLoadPreset}
          testCases={testCases}
        />

        {/* Center Canvas Area */}
        <CanvasArea
          nodes={suite.nodes}
          edges={suite.edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNodePosition={handleUpdateNodePosition}
          onAddNode={handleAddNode}
          onAddTestCase={handleAddTestCase}
          onDeleteNode={handleDeleteNode}
          onConnectNodes={handleConnectNodes}
          onDeleteEdge={handleDeleteEdge}
          onAutoLayout={handleAutoLayout}
          isRunning={isRunning}
        />

        {/* Selected Node Inspector */}
        {selectedNode && (
          <PropertiesPanel
            selectedNode={selectedNode}
            stepIndex={selectedNodeIndex}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onClose={() => setSelectedNodeId(null)}
            onAutoHealTrigger={onAutoHealTrigger}
          />
        )}
      </div>
    </div>
  );
};
