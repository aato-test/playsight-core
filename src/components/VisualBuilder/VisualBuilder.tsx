import React, { useState } from 'react';
import { CanvasArea } from './CanvasArea';
import { PropertiesPanel } from './PropertiesPanel';
import { orderNodes } from '../../data/mockData';
import {
  TestNode,
  ConnectionEdge,
  StepType,
  TestSuite,
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
  MoreHorizontal,
  Code2,
  RotateCcw,
  Sparkles,
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
  onOpenCopilot,
  onAutoHealTrigger,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    suite.nodes.length > 0 ? suite.nodes[0].id : null
  );

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
      defaultTitle = 'Navigate';
      defaultData = {
        url: '/checkout',
        timeout: 8000,
        waitUntil: 'networkidle',
      } as NavigateStepData;
    } else if (type === 'click') {
      defaultTitle = 'Click';
      defaultData = {
        selector: '[data-testid="checkout-submit"]',
        clickType: 'single',
        waitForSelector: true,
        timeout: 6000,
      } as ClickStepData;
    } else if (type === 'input') {
      defaultTitle = 'Input';
      defaultData = {
        selector: '#card-number',
        value: '4242 •••• •••• 4242',
        clearFirst: true,
        maskInput: false,
        timeout: 5000,
      } as InputStepData;
    } else if (type === 'assert') {
      defaultTitle = 'Assert';
      defaultData = {
        selector: 'body',
        assertionType: 'expression',
        expectedValue: 'payment.status === "success"',
        failureMessage: 'Payment assertion timed out',
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#020617] font-sans">
      {/* Section 11: Workflow Editor Header */}
      <div className="h-14 px-6 border-b border-[#1E293B] bg-[#020617] flex items-center justify-between shrink-0 select-none z-10">
        <div>
          <h2 className="text-sm font-bold text-[#F8FAFC] tracking-tight">
            {suite.name}
          </h2>
          <div className="text-xs text-[#94A3B8] font-mono mt-0.5">
            {suite.nodes.length} steps · <span className="capitalize">{suite.targetBrowser}</span> · {suite.averageDuration || '1.84s average'}
          </div>
        </div>

        {/* Right-side Actions (Section 11: Run, Save, Duplicate, More) */}
        <div className="flex items-center gap-2">
          {/* Run (Teal Accent) */}
          <button
            onClick={onRunTest}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 text-slate-950 cursor-wait'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-xs active:scale-98'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0F172A] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] text-xs font-mono transition-colors cursor-pointer"
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#0F172A] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] text-xs font-mono transition-colors cursor-pointer disabled:opacity-40"
            title="Duplicate Selected Node"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* More (JSON Schema Export / Executor) */}
          <button
            onClick={onOpenJsonModal}
            className="p-1.5 rounded bg-[#0F172A] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] transition-colors cursor-pointer"
            title="Export JSON & test_executor.py Payload"
          >
            <Code2 className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas & Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        <CanvasArea
          nodes={suite.nodes}
          edges={suite.edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNodePosition={handleUpdateNodePosition}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onConnectNodes={handleConnectNodes}
          onDeleteEdge={handleDeleteEdge}
          onAutoLayout={handleAutoLayout}
          isRunning={isRunning}
        />

        {/* Selected Node Inspector (Section 18) */}
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
