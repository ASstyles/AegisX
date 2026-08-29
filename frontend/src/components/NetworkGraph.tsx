import React, { useRef, useEffect, useState } from 'react';
import { fetchNetworkGraph } from '../api/client';
import { GraphData, GraphNode } from '../types';
import { Network, ShieldAlert, Users, Smartphone, Store, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export const NetworkGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    fetchNetworkGraph()
      .then((data) => setGraphData(data))
      .catch((err) => console.error('Graph fetch error:', err));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter nodes
    const nodes = graphData.nodes.filter((n) => {
      if (filterType === 'ALL') return true;
      if (filterType === 'CUST') return n.type === 'customer';
      if (filterType === 'DEV') return n.type === 'device';
      if (filterType === 'RINGS') return n.is_suspicious || n.degree >= 2;
      return true;
    });

    const nodeMap = new Map<string, { x: number; y: number; node: GraphNode }>();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.38;

    nodes.forEach((n, idx) => {
      const angle = (idx / Math.max(1, nodes.length)) * 2 * Math.PI;
      const r = n.type === 'customer' ? radius * 0.85 : radius * 0.55;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      nodeMap.set(n.id, { x, y, node: n });
    });

    // Draw edges
    ctx.lineWidth = 1;
    graphData.edges.forEach((e) => {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (src && tgt) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodeMap.forEach(({ x, y, node }) => {
      ctx.beginPath();
      const nodeR = node.is_suspicious ? 7 : 5;
      ctx.arc(x, y, nodeR, 0, 2 * Math.PI);

      if (node.is_suspicious) {
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 10;
      } else if (node.type === 'customer') {
        ctx.fillStyle = '#22D3EE';
        ctx.shadowColor = '#22D3EE';
        ctx.shadowBlur = 6;
      } else if (node.type === 'device') {
        ctx.fillStyle = '#8B5CF6';
        ctx.shadowColor = '#8B5CF6';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = '#3B82F6';
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;

      // Small label
      ctx.fillStyle = '#8D9AAF';
      ctx.font = '8px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(node.id.substring(0, 7), x, y + 14);
    });
  }, [graphData, filterType]);

  return (
    <div className="soc-panel" style={{ padding: 12, background: '#0B1220' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Network style={{ width: 14, height: 14, color: 'var(--cyan)' }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
            Entity Fraud Graph (NetworkX)
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 3 }}>
          {['ALL', 'CUST', 'DEV', 'RINGS'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: filterType === f ? 'rgba(34, 211, 238, 0.2)' : '#080D18',
                color: filterType === f ? 'var(--cyan)' : 'var(--text-muted)',
                border: filterType === f ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 200, position: 'relative', background: '#070B14', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>● Cyan: Customers | ● Purple: Devices | ● Red: Fraud Rings</span>
        <span>{graphData?.nodes?.length || 0} nodes indexed</span>
      </div>
    </div>
  );
};
