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
        waitUntil: 'networkidle',
      } as NavigateStepData;
    } else if (type === 'click') {
      defaultTitle = 'Click Submit';
      defaultData = {
        selector: '[data-testid="checkout-submit"]',
        clickType: 'single',
        waitForSelector: true,
        timeout: 6000,
      } as ClickStepData;
    } else if (type === 'input') {
      defaultTitle = 'Input Field';
      defaultData = {
        selector: '#card-number',
        value: '4242 •••• •••• 4242',
        clearFirst: true,
        maskInput: false,
        timeout: 5000,
      } as InputStepData;
    } else if (type === 'assert') {
      defaultTitle = 'Assert State';
      defaultData = {
        selector: 'body',
        assertionType: 'expression',
        expectedValue: 'order.status === "confirmed"',
        failureMessage: 'Confirmation state check failed',
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
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Workflow Editor Header */}
      <div className="h-14 px-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              {suite.name}
              {suite.branchName && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 flex items-center gap-1 font-normal">
                  <GitBranch className="w-3 h-3 text-indigo-400" />
                  {suite.branchName}
                </span>
              )}
              {suite.triggerType && suite.triggerType !== 'manual' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 font-normal">
                  <Radio className="w-2.5 h-2.5" />
                  Auto: {suite.triggerType}
                </span>
              )}
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {suite.nodes.length} steps · <span className="capitalize">{suite.targetBrowser}</span> · {suite.averageDuration || '1.84s average'}
            </div>
          </div>
        </div>

        {/* Right-side Actions */}
        <div className="flex items-center gap-2">
          {/* Run Button */}
          <button
            onClick={onRunTest}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer shadow-sm ${
              isRunning
                ? 'bg-amber-500 text-slate-950 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-98'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
            title="Save Workflow (⌘S)"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>Save</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => {
              if (selectedNode) handleDuplicateNode(selectedNode);
            }}
            disabled={!selectedNode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono transition-colors cursor-pointer disabled:opacity-40"
            title="Duplicate Selected Node"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Export JSON Modal */}
          <button
            onClick={onOpenJsonModal}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Export JSON & test_executor.py Payload"
          >
            <Code2 className="w-4 h-4 text-amber-400" />
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
