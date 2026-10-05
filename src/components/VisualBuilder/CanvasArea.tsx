import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Globe,
  MousePointerClick,
  Type,
  CheckCircle2,
  Trash2,
  Plus,
  GitCommit,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  TestNode,
  ConnectionEdge,
  StepType,
  NavigateStepData,
  ClickStepData,
  InputStepData,
  AssertStepData,
} from '../../types';

interface CanvasAreaProps {
  nodes: TestNode[];
  edges: ConnectionEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onAddNode: (type: StepType, position?: { x: number; y: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onAutoLayout: () => void;
  isRunning: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onAddNode,
  onDeleteNode,
  onConnectNodes,
  onDeleteEdge,
  onAutoLayout,
  isRunning,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Quick Add Menu
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Dragging node
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connection wire dragging
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Hovered edge for interaction
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Node dimensions matching Section 13 (280-320px width)
  const NODE_WIDTH = 290;
  const NODE_HEIGHT = 140;

  // Canvas Panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === containerRef.current ||
      (e.target as HTMLElement).tagName === 'svg' ||
      (e.target as HTMLElement).id === 'canvas-grid-bg'
    ) {
      onSelectNode(null);
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  // Node Dragging Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: TestNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - node.position.x * scale - pan.x,
      y: e.clientY - node.position.y * scale - pan.y,
    });
  };

  // Connection Start (Output port)
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingSourceId(nodeId);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - pan.x) / scale,
        y: (e.clientY - rect.top - pan.y) / scale,
      });
    }
  };

  // Connection Complete (Input port)
  const handlePortMouseUp = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (connectingSourceId && connectingSourceId !== targetNodeId) {
      onConnectNodes(connectingSourceId, targetNodeId);
    }
    setConnectingSourceId(null);
    setConnectingMousePos(null);
  };

  // Mouse Listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggingNodeId && containerRef.current) {
        const newX = (e.clientX - dragOffset.x - pan.x) / scale;
        const newY = (e.clientY - dragOffset.y - pan.y) / scale;
        onUpdateNodePosition(draggingNodeId, {
          x: Math.round(newX),
          y: Math.round(newY),
        });
      } else if (connectingSourceId && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setConnectingMousePos({
          x: (e.clientX - rect.left - pan.x) / scale,
          y: (e.clientY - rect.top - pan.y) / scale,
        });
      }
    };

    const handleMouseUp = () => {
      if (isPanning) setIsPanning(false);
      if (draggingNodeId) setDraggingNodeId(null);
      if (connectingSourceId) {
        setConnectingSourceId(null);
        setConnectingMousePos(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart, draggingNodeId, dragOffset, connectingSourceId, pan, scale, onUpdateNodePosition]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.4, Number((prev + delta).toFixed(1))), 2.0));
  };

  const handleCenterCanvas = () => {
    setScale(1);
    setPan({ x: 60, y: 80 });
  };

  const handleFitToView = () => {
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_HEIGHT));

    const contentWidth = maxX - minX + 160;
    const containerWidth = containerRef.current?.clientWidth || 1000;
    const newScale = Math.min(Math.max(containerWidth / contentWidth, 0.5), 1.2);

    setScale(Number(newScale.toFixed(2)));
    setPan({
      x: 40 - minX * newScale,
      y: 60 - minY * newScale,
    });
  };

  // Node Map
  const nodeMap = useMemo(() => {
    const map = new Map<string, TestNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Node Type Config matching Section 12
  const getNodeTypeConfig = (type: StepType) => {
    switch (type) {
      case 'navigate':
        return {
          icon: Globe,
          label: 'Navigate',
          badgeText: 'NAV',
          color: 'text-cyan-400',
          border: 'border-cyan-500/30',
        };
      case 'click':
        return {
          icon: MousePointerClick,
          label: 'Click',
          badgeText: 'CLK',
          color: 'text-emerald-400',
          border: 'border-emerald-500/30',
        };
      case 'input':
        return {
          icon: Type,
          label: 'Input',
          badgeText: 'INP',
          color: 'text-amber-400',
          border: 'border-amber-500/30',
        };
      case 'assert':
        return {
          icon: CheckCircle2,
          label: 'Assert',
          badgeText: 'AST',
          color: 'text-teal-400',
          border: 'border-teal-500/30',
        };
    }
  };

  const handleQuickAdd = (type: StepType) => {
    const lastNode = nodes[nodes.length - 1];
    const newPos = lastNode
      ? { x: lastNode.position.x + NODE_WIDTH + 60, y: lastNode.position.y }
      : { x: 80, y: 140 };
    onAddNode(type, newPos);
    setIsQuickAddOpen(false);
  };

  return (
    <div
      ref={containerRef}
      id="builder-canvas-viewport"
      onMouseDown={handleCanvasMouseDown}
      className="flex-1 h-full relative overflow-hidden bg-[#020617] select-none cursor-default"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, 0.09) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Scaled and Panned Workspace Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        {/* SVG Bezier Connection Edges Layer (Section 14) */}
        <svg
          className="w-[6000px] h-[6000px] absolute inset-0 pointer-events-auto"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="edge-arrow-default"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
            </marker>
            <marker
              id="edge-arrow-running"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#14b8a6" />
            </marker>
            <marker
              id="edge-arrow-passed"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
            <marker
              id="edge-arrow-failed"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Render Persistent Edges */}
          {edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.sourceId);
            const targetNode = nodeMap.get(edge.targetId);
            if (!sourceNode || !targetNode) return null;

            // Connection math: Output port (right side) to Input port (left side)
            const x1 = sourceNode.position.x + NODE_WIDTH;
            const y1 = sourceNode.position.y + 44;
            const x2 = targetNode.position.x;
            const y2 = targetNode.position.y + 44;

            const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
            const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const isHovered = hoveredEdgeId === edge.id;

            // Connection state resolution
            let edgeColor = '#475569';
            let markerId = 'url(#edge-arrow-default)';
            let isAnimated = false;

            if (sourceNode.status === 'running' || isRunning) {
              edgeColor = '#14b8a6';
              markerId = 'url(#edge-arrow-running)';
              isAnimated = true;
            } else if (sourceNode.status === 'success' && targetNode.status === 'success') {
              edgeColor = '#10b981';
              markerId = 'url(#edge-arrow-passed)';
            } else if (sourceNode.status === 'failed' || targetNode.status === 'failed') {
              edgeColor = '#ef4444';
              markerId = 'url(#edge-arrow-failed)';
            }

            return (
              <g
                key={edge.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
                onClick={() => onDeleteEdge(edge.id)}
              >
                {/* Invisible hit target */}
                <path d={pathData} fill="none" stroke="transparent" strokeWidth={18} />

                {/* Visible Connection Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHovered ? '#f43f5e' : edgeColor}
                  strokeWidth={isHovered ? 2.5 : 1.75}
                  strokeDasharray={isAnimated ? '6,4' : 'none'}
                  className={isAnimated ? 'animate-dash' : ''}
                  markerEnd={markerId}
                />

                {isHovered && (
                  <circle
                    cx={(x1 + x2) / 2}
                    cy={(y1 + y2) / 2}
                    r={8}
                    fill="#ef4444"
                    className="shadow-md"
                  />
                )}
              </g>
            );
          })}

          {/* Dynamic Drag Wire */}
          {connectingSourceId && connectingMousePos && (
            (() => {
              const src = nodeMap.get(connectingSourceId);
              if (!src) return null;
              const x1 = src.position.x + NODE_WIDTH;
              const y1 = src.position.y + 44;
              const x2 = connectingMousePos.x;
              const y2 = connectingMousePos.y;
              const dx = Math.abs(x2 - x1) * 0.5;
              const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                  markerEnd="url(#edge-arrow-running)"
                />
              );
            })()
          )}
        </svg>

        {/* Nodes Layer (Sections 12, 13, 15) */}
        {nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const config = getNodeTypeConfig(node.type);
          const Icon = config.icon;

          return (
            <div
              key={node.id}
              id={`canvas-node-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id);
              }}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: `${NODE_WIDTH}px`,
              }}
              className={`absolute pointer-events-auto rounded bg-[#0F172A] border transition-all cursor-move select-none ${
                isSelected
                  ? 'border-teal-400 ring-1 ring-teal-500/30 shadow-lg shadow-teal-500/10'
                  : 'border-[#1E293B] hover:border-[#334155]'
              } ${
                node.status === 'running'
                  ? 'border-teal-400 ring-1 ring-teal-400'
                  : node.status === 'success'
                  ? 'border-emerald-500/50'
                  : node.status === 'failed'
                  ? 'border-rose-500/60'
                  : ''
              }`}
            >
              {/* Input Port (Left side) */}
              <div
                onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                title="Input Port (drop connection here)"
                className="absolute -left-2 top-[38px] w-4 h-4 rounded-xs bg-[#020617] border border-[#475569] hover:border-teal-400 hover:bg-teal-500/20 flex items-center justify-center transition-all cursor-crosshair z-30"
              >
                <div className="w-1 h-1 rounded-xs bg-[#64748B]" />
              </div>

              {/* Output Port (Right side) */}
              <div
                onMouseDown={(e) => handlePortMouseDown(e, node.id)}
                title="Output Port (drag to next step)"
                className="absolute -right-2 top-[38px] w-4 h-4 rounded-xs bg-[#020617] border border-teal-500 hover:border-teal-300 hover:bg-teal-500/30 flex items-center justify-center transition-all cursor-crosshair z-30"
              >
                <div className="w-1 h-1 rounded-xs bg-teal-400" />
              </div>

              {/* Node Header */}
              <div className="px-3 py-2 border-b border-[#1E293B] flex items-center justify-between bg-[#111827]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1 rounded bg-[#020617] border border-[#1E293B] ${config.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#F8FAFC] truncate block">
                      {node.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-[#64748B] bg-[#020617] border border-[#1E293B] px-1 py-0.2 rounded">
                    STEP 0{index + 1}
                  </span>
                </div>
              </div>

              {/* Node Body: Technical Parameter Preview */}
              <div className="p-3 space-y-1.5 text-xs font-mono">
                {node.type === 'navigate' && (
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase tracking-wider">URL Target</div>
                    <div className="text-cyan-300 truncate font-mono text-xs mt-0.5">
                      {(node.data as NavigateStepData).url || '/checkout'}
                    </div>
                  </div>
                )}

                {node.type === 'click' && (
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Selector</div>
                    <div className="text-emerald-300 truncate font-mono text-xs mt-0.5">
                      {(node.data as ClickStepData).selector || '[data-testid="checkout-submit"]'}
                    </div>
                  </div>
                )}

                {node.type === 'input' && (
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Input Target & Value</div>
                    <div className="text-amber-300 truncate font-mono text-xs mt-0.5">
                      {(node.data as InputStepData).selector || '#card-number'}
                    </div>
                    <div className="text-[#94A3B8] text-[11px] truncate">
                      Value: {(node.data as InputStepData).maskInput ? '4242 •••• •••• 4242' : `"${(node.data as InputStepData).value}"`}
                    </div>
                  </div>
                )}

                {node.type === 'assert' && (
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Condition</div>
                    <div className="text-teal-300 truncate font-mono text-xs mt-0.5">
                      {(node.data as AssertStepData).expectedValue || 'payment.status === "success"'}
                    </div>
                  </div>
                )}
              </div>

              {/* Node Footer: Execution State & Metadata */}
              <div className="px-3 py-1.5 border-t border-[#1E293B] bg-[#020617]/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#64748B] text-[10px]">{node.id}</span>

                {node.status === 'running' && (
                  <span className="text-teal-400 flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-xs bg-teal-400 animate-pulse" />
                    Running
                  </span>
                )}
                {node.status === 'success' && (
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <Check className="w-3 h-3" />
                    Passed
                  </span>
                )}
                {node.status === 'failed' && (
                  <span className="text-rose-400 flex items-center gap-1 text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    Failed
                  </span>
                )}
                {(!node.status || node.status === 'idle') && (
                  <span className="text-[#64748B]">Ready</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Floating Button (Section 17) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        {isQuickAddOpen && (
          <div className="mb-2 p-1.5 bg-[#0F172A] border border-[#1E293B] rounded shadow-2xl flex items-center gap-1 text-xs">
            <button
              onClick={() => handleQuickAdd('navigate')}
              className="px-2.5 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#F8FAFC] hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>Navigate</span>
            </button>
            <button
              onClick={() => handleQuickAdd('click')}
              className="px-2.5 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#F8FAFC] hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <MousePointerClick className="w-3 h-3 text-emerald-400" />
              <span>Click</span>
            </button>
            <button
              onClick={() => handleQuickAdd('input')}
              className="px-2.5 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#F8FAFC] hover:text-amber-300 flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <Type className="w-3 h-3 text-amber-400" />
              <span>Input</span>
            </button>
            <button
              onClick={() => handleQuickAdd('assert')}
              className="px-2.5 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-[#F8FAFC] hover:text-teal-300 flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              <span>Assert</span>
            </button>
          </div>
        )}

        <button
          id="btn-canvas-quick-add"
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          className={`px-3 py-1.5 rounded bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] text-teal-300 text-xs font-mono flex items-center gap-1.5 shadow-lg cursor-pointer ${
            isQuickAddOpen ? 'border-teal-500' : ''
          }`}
          title="Add Step (Quick Add)"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>Add Step</span>
        </button>
      </div>

      {/* Floating Canvas Controls (Section 16: Bottom-Right Cluster) */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 bg-[#0F172A] border border-[#1E293B] rounded p-1 text-xs text-[#94A3B8] shadow-lg">
        {/* Zoom Controls */}
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-1.5 hover:bg-[#1E293B] hover:text-[#F8FAFC] rounded cursor-pointer"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-1.5 text-xs font-mono text-[#F8FAFC] min-w-[42px] text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(0.1)}
          className="p-1.5 hover:bg-[#1E293B] hover:text-[#F8FAFC] rounded cursor-pointer"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-[#1E293B] mx-0.5" />

        {/* Fit to View */}
        <button
          onClick={handleFitToView}
          className="flex items-center gap-1 px-2 py-1 hover:bg-[#1E293B] hover:text-[#F8FAFC] rounded cursor-pointer text-xs font-mono"
          title="Fit to View (F)"
        >
          <Maximize2 className="w-3 h-3 text-teal-400" />
          <span>Fit</span>
        </button>

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          className="flex items-center gap-1 px-2 py-1 hover:bg-[#1E293B] hover:text-[#F8FAFC] rounded cursor-pointer text-xs font-mono"
          title="Auto Layout Nodes"
        >
          <GitCommit className="w-3 h-3 text-cyan-400" />
          <span>Layout</span>
        </button>

        {/* Center Canvas */}
        <button
          onClick={handleCenterCanvas}
          className="p-1.5 hover:bg-[#1E293B] hover:text-[#F8FAFC] rounded cursor-pointer"
          title="Center Canvas"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
