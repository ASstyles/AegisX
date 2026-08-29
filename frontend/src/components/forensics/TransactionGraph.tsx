import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  Activity,
  CreditCard,
  Building,
  Smartphone,
  Globe,
  Coins,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { ForensicAccountNode, ForensicTransactionEdge } from '../../types';

interface TransactionGraphProps {
  nodes: ForensicAccountNode[];
  edges: ForensicTransactionEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: ForensicAccountNode | null) => void;
  searchQuery: string;
  minAmount: number;
  riskFilter: string;
  statusFilter: string;
  highlightPathIds: string[];
}

export const TransactionGraph: React.FC<TransactionGraphProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  searchQuery,
  minAmount,
  riskFilter,
  statusFilter,
  highlightPathIds
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<ForensicTransactionEdge | null>(null);

  // Filter nodes based on user filters
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          n.id.toLowerCase().includes(q) ||
          n.accountNumber.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (riskFilter !== 'ALL' && n.riskLevel !== riskFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && n.status !== statusFilter) {
        return false;
      }
      if (minAmount > 0 && n.totalIncomingAmount < minAmount && n.totalOutgoingAmount < minAmount) {
        return false;
      }
      return true;
    });
  }, [nodes, searchQuery, riskFilter, statusFilter, minAmount]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter((e) => visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId));
  }, [edges, visibleNodeIds]);

  // Max depth levels in graph
  const maxDepth = useMemo(() => {
    if (nodes.length === 0) return 0;
    return Math.max(...nodes.map((n) => n.level));
  }, [nodes]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.graph-node') || (e.target as HTMLElement).closest('.graph-controls')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(1.8, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.15));
  const handleResetView = () => {
    setZoom(0.9);
    setPan({ x: 30, y: 30 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.max(0.4, Math.min(1.8, z + delta)));
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)}Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SOURCE': return 'var(--cyan)';
      case 'HIGH_RISK': return 'var(--red)';
      case 'SUSPICIOUS': return 'var(--amber)';
      case 'TERMINUS': return '#c084fc';
      default: return 'var(--text-secondary)';
    }
  };

  const getNodeBorderColor = (node: ForensicAccountNode) => {
    if (selectedNodeId === node.id) return 'var(--cyan)';
    if (hoveredNodeId === node.id) return '#fff';
    if (node.isSource) return 'rgba(34, 211, 238, 0.7)';
    if (node.status === 'CONTAINED') return 'rgba(239, 68, 68, 0.7)';
    if (node.status === 'FLAGGED') return 'rgba(245, 158, 11, 0.7)';
    return 'rgba(255, 255, 255, 0.15)';
  };

  const getNodeBackground = (node: ForensicAccountNode) => {
    if (selectedNodeId === node.id) return 'linear-gradient(135deg, rgba(34, 211, 238, 0.25) 0%, #0c182c 100%)';
    if (node.isSource) return 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, #091220 100%)';
    if (node.riskScore >= 90) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, #0d1222 100%)';
    if (node.riskScore >= 75) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, #0b1120 100%)';
    return '#0a101d';
  };

  return (
    <div
      ref={containerRef}
      className="soc-panel graph-canvas-container"
      style={{
        height: 520,
        position: 'relative',
        overflow: 'hidden',
        background: '#050811',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(13, 22, 41, 0.6) 0%, transparent 80%),
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        border: '1px solid var(--border-medium)'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Dynamic Tier Header Labels Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: pan.x + 20,
          display: 'flex',
          gap: 260 * zoom,
          pointerEvents: 'none',
          zIndex: 10,
          opacity: 0.5,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--text-muted)'
        }}
      >
        {Array.from({ length: maxDepth + 1 }).map((_, idx) => (
          <span key={idx} style={{ width: 190 * zoom, textAlign: 'center' }}>
            {idx === 0 ? 'TIER 0: SOURCE' : `TIER ${idx}: HOP LEVEL ${idx}`}
          </span>
        ))}
      </div>

      {/* Floating Canvas Controls */}
      <div
        className="graph-controls"
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(8, 13, 24, 0.9)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          zIndex: 30,
          backdropFilter: 'blur(8px)'
        }}
      >
        <button
          onClick={handleZoomIn}
          className="soc-btn-ghost"
          style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Zoom In"
        >
          <ZoomIn style={{ width: 14, height: 14 }} />
        </button>

        <button
          onClick={handleZoomOut}
          className="soc-btn-ghost"
          style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Zoom Out"
        >
          <ZoomOut style={{ width: 14, height: 14 }} />
        </button>

        <button
          onClick={handleResetView}
          className="soc-btn-ghost"
          style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Reset View"
        >
          <RotateCcw style={{ width: 13, height: 13 }} />
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 2px' }} />

        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', minWidth: 38, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Graph Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(8, 13, 24, 0.85)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          zIndex: 20,
          backdropFilter: 'blur(4px)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--cyan)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)' }} />
          Source / Origin
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)' }} />
          Contained / High Risk
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)' }} />
          Flagged / Under Review
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#c084fc' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c084fc' }} />
          Terminus
        </span>
      </div>

      {/* Hover Edge Tooltip */}
      {hoveredEdge && (
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            background: 'rgba(8, 13, 24, 0.95)',
            border: '1px solid var(--border-active)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>TXN ID: </span>
            <strong style={{ color: '#fff' }}>{hoveredEdge.id}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>AMOUNT: </span>
            <strong style={{ color: 'var(--cyan)' }}>{formatINR(hoveredEdge.amount)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>FLOW: </span>
            <span style={{ color: '#fff' }}>{hoveredEdge.sourceAccount} → {hoveredEdge.destinationAccount}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>STATUS: </span>
            <span style={{ color: hoveredEdge.status === 'CONTAINED' || hoveredEdge.status === 'BLOCKED' ? 'var(--red)' : 'var(--green)' }}>
              {hoveredEdge.status}
            </span>
          </div>
        </div>
      )}

      {/* SVG Canvas for Connectors & Edges */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        <defs>
          <marker
            id="arrowhead-red"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker
            id="arrowhead-cyan"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
          </marker>
          <marker
            id="arrowhead-amber"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {visibleEdges.map((edge) => {
            const srcNode = nodes.find((n) => n.id === edge.sourceId);
            const tgtNode = nodes.find((n) => n.id === edge.targetId);
            if (!srcNode || !tgtNode) return null;

            const isHighlighted =
              highlightPathIds.includes(edge.id) ||
              selectedNodeId === edge.sourceId ||
              selectedNodeId === edge.targetId ||
              hoveredNodeId === edge.sourceId ||
              hoveredNodeId === edge.targetId;

            // Coordinates
            const sx = srcNode.x + 190;
            const sy = srcNode.y + 40;
            const tx = tgtNode.x;
            const ty = tgtNode.y + 40;

            const dx = Math.max(40, (tx - sx) / 2);
            const pathD = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

            const midX = (sx + tx) / 2;
            const midY = (sy + ty) / 2;

            const edgeColor = edge.status === 'BLOCKED' || edge.status === 'CONTAINED'
              ? '#ef4444'
              : isHighlighted
              ? '#22d3ee'
              : 'rgba(34, 211, 238, 0.45)';

            return (
              <g
                key={edge.id}
                className="graph-edge-group"
                onMouseEnter={() => setHoveredEdge(edge)}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              >
                {/* Glow Path */}
                {isHighlighted && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={edgeColor}
                    strokeWidth={5}
                    strokeOpacity={0.4}
                    filter="blur(3px)"
                  />
                )}

                {/* Main Directional Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={isHighlighted ? 2.5 : 1.8}
                  strokeDasharray={edge.status === 'BLOCKED' ? '4 3' : undefined}
                  markerEnd={`url(#arrowhead-${edge.status === 'BLOCKED' ? 'red' : isHighlighted ? 'cyan' : 'cyan'})`}
                />

                {/* Flow Pulse Particle */}
                <circle r={3} fill={edgeColor}>
                  <animateMotion
                    dur={edge.status === 'BLOCKED' ? '6s' : '2.5s'}
                    repeatCount="indefinite"
                    path={pathD}
                  />
                </circle>

                {/* Edge Amount Badge */}
                <foreignObject
                  x={midX - 55}
                  y={midY - 14}
                  width={110}
                  height={28}
                  style={{ overflow: 'visible', pointerEvents: 'auto' }}
                >
                  <div
                    style={{
                      background: 'rgba(7, 11, 20, 0.95)',
                      border: `1px solid ${isHighlighted ? 'var(--cyan)' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: 10,
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: edge.status === 'BLOCKED' ? 'var(--red)' : '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    title={`${edge.id} • ${edge.rail} • ${edge.timestamp} • ${edge.status}`}
                  >
                    <span>{formatINR(edge.amount)}</span>
                    <span style={{ fontSize: 7, color: 'var(--text-muted)' }}>{edge.rail}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>

      {/* HTML Interactive Node Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          zIndex: 5,
          pointerEvents: 'auto'
        }}
      >
        {visibleNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          return (
            <div
              key={node.id}
              className={`graph-node ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectNode(node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: 190,
                minHeight: 82,
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: getNodeBackground(node),
                border: `1.5px solid ${getNodeBorderColor(node)}`,
                boxShadow: isSelected
                  ? '0 0 20px rgba(34, 211, 238, 0.4), 0 8px 24px rgba(0,0,0,0.8)'
                  : isHovered
                  ? '0 0 16px rgba(255,255,255,0.25), 0 6px 20px rgba(0,0,0,0.8)'
                  : '0 4px 16px rgba(0,0,0,0.6)',
                cursor: 'pointer',
                transition: 'all 0.15s ease-out',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 5
              }}
            >
              {/* Top Row: Account & Risk */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: node.isSource ? 'var(--cyan)' : '#fff'
                  }}
                >
                  {node.accountNumber}
                </span>

                <div
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: node.riskScore >= 75
                      ? 'rgba(239, 68, 68, 0.25)'
                      : node.riskScore >= 50
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(34, 197, 94, 0.25)',
                    color: node.riskScore >= 75 ? 'var(--red)' : node.riskScore >= 50 ? 'var(--amber)' : 'var(--green)',
                    border: `1px solid ${node.riskScore >= 75 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  {node.riskScore}
                </div>
              </div>

              {/* Role Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: getRoleColor(node.nodeRole),
                    textTransform: 'uppercase'
                  }}
                >
                  {node.nodeRole.replace('_', ' ')}
                </span>

                <span
                  style={{
                    fontSize: 8,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)'
                  }}
                >
                  L{node.level} • {node.connectedAccountsCount} Peers
                </span>
              </div>

              {/* Bottom: Money flow summary */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  IN: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{formatINR(node.totalIncomingAmount)}</span>
                </div>
                <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  OUT: <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{formatINR(node.totalOutgoingAmount)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
