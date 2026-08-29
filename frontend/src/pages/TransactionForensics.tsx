import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  Eye,
  X,
  CreditCard,
  Layers,
  Check,
  Send,
  Smartphone,
  Mail,
  Activity,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  FileText,
  Briefcase,
  ShieldCheck,
  Download,
  Copy,
  TrendingUp,
  Network,
  Cpu,
  Play,
  Pause,
  Square,
  Key,
  UserCheck,
  Compass,
  Crosshair,
  GitBranch,
  Target
} from 'lucide-react';

// --- Types ---
export interface ForensicNode {
  id: string;
  accountNumber: string;
  role: 'SOURCE' | 'INTERMEDIATE' | 'DESTINATION';
  level: number;
  incomingAmount: number;
  outgoingAmount: number;
  transactionCount: number;
  connectedCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  status: 'NORMAL' | 'PROTECTED' | 'FLAGGED' | 'UNFROZEN';
  x: number;
  y: number;
}

export interface ForensicEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceAcc: string;
  targetAcc: string;
  amount: number;
  rail: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CRYPTO_OFFRAMP';
  timestamp: string;
  status: 'COMPLETED' | 'CONTAINED' | 'BLOCKED';
  riskScore: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface EvidenceLog {
  id: string;
  title: string;
  category: string;
  time: string;
  details: Record<string, string>;
}

export interface InvestigationCase {
  caseId: string;
  transactionId: string;
  sourceAccount: string;
  totalAmount: number;
  riskScore: number;
  status: 'UNDER_INVESTIGATION' | 'UNFROZEN' | 'CASE_ACTIVE';
  startTime: string;
  evidenceHash: string;
  nodes: ForensicNode[];
  edges: ForensicEdge[];
  riskFactors: {
    pattern: number;
    velocity: number;
    linkage: number;
    behavior: number;
  };
}

type ViewMode = 'ALL' | 'UPSTREAM' | 'DOWNSTREAM' | 'FULL_CHAIN' | 'FOCUS_ACCOUNT';

// --- Automatic Layered Layout Engine (Topological Column Arrangement) ---
function computeLayeredLayout(rawNodes: Omit<ForensicNode, 'x' | 'y'>[], edges: ForensicEdge[]): ForensicNode[] {
  // 1. Calculate in-degrees & graph adjacency
  const inDegreeMap = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  rawNodes.forEach((n) => {
    inDegreeMap.set(n.id, 0);
    adjacency.set(n.id, []);
  });

  edges.forEach((e) => {
    inDegreeMap.set(e.targetId, (inDegreeMap.get(e.targetId) || 0) + 1);
    adjacency.get(e.sourceId)?.push(e.targetId);
  });

  // 2. Identify Root Sources (In-degree 0)
  const roots = rawNodes.filter((n) => (inDegreeMap.get(n.id) || 0) === 0);
  const queue: { id: string; level: number }[] = roots.length > 0
    ? roots.map((r) => ({ id: r.id, level: 0 }))
    : [{ id: rawNodes[0]?.id || '', level: 0 }];

  const levelMap = new Map<string, number>();
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    levelMap.set(id, level);

    const neighbors = adjacency.get(id) || [];
    neighbors.forEach((nbr) => {
      if (!visited.has(nbr)) {
        queue.push({ id: nbr, level: level + 1 });
      }
    });
  }

  // Any unassigned node assigned to level 1
  rawNodes.forEach((n) => {
    if (!levelMap.has(n.id)) levelMap.set(n.id, 1);
  });

  // 3. Group nodes by level
  const levelsGroup = new Map<number, typeof rawNodes>();
  rawNodes.forEach((n) => {
    const lvl = levelMap.get(n.id) || 0;
    if (!levelsGroup.has(lvl)) levelsGroup.set(lvl, []);
    levelsGroup.get(lvl)!.push(n);
  });

  const maxLevel = Math.max(0, ...Array.from(levelsGroup.keys()));
  const columnWidth = 260; // Horizontal distance between layers
  const cardHeight = 86;
  const verticalGap = 24;

  const positionedNodes: ForensicNode[] = [];

  levelsGroup.forEach((nodesInLevel, lvl) => {
    const totalCount = nodesInLevel.length;
    // Center vertically in a 400px canvas height
    const columnTotalHeight = totalCount * cardHeight + (totalCount - 1) * verticalGap;
    const startY = Math.max(50, (400 - columnTotalHeight) / 2);
    const startX = 60 + lvl * columnWidth;

    nodesInLevel.forEach((n, idx) => {
      const isSource = lvl === 0;
      const isDest = lvl === maxLevel || n.role === 'DESTINATION';
      const role: ForensicNode['role'] = isSource ? 'SOURCE' : isDest ? 'DESTINATION' : 'INTERMEDIATE';

      positionedNodes.push({
        ...n,
        level: lvl,
        role,
        x: startX,
        y: startY + idx * (cardHeight + verticalGap)
      });
    });
  });

  return positionedNodes;
}

// --- Procedural Synthetic Data Generator ---
function generateDynamicInvestigation(): InvestigationCase {
  const randomAcc = () => `ACC-${Math.floor(1000 + Math.random() * 9000)}`;
  const randomTxnId = () => `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Varied realistic amounts (never hardcoded to ₹5 lakh)
  const amountChoices = [48500, 74000, 115000, 168000, 245000, 380000, 520000];
  const rootAmount = amountChoices[Math.floor(Math.random() * amountChoices.length)];

  const srcAcc = randomAcc();
  const rootTxn = randomTxnId();
  const caseId = `CASE-${Math.floor(100000 + Math.random() * 900000)}`;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const startTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const topologyType = Math.floor(Math.random() * 3); // 0: Fan-out, 1: Multi-hop layered, 2: Linear
  let rawNodes: Omit<ForensicNode, 'x' | 'y'>[] = [];
  let rawEdges: ForensicEdge[] = [];

  if (topologyType === 0) {
    // 1. Fan-out Tree: Source -> 2 Intermediates -> 4 Destinations
    const m1 = randomAcc();
    const m2 = randomAcc();
    const d1 = randomAcc();
    const d2 = randomAcc();
    const d3 = randomAcc();
    const d4 = randomAcc();

    const amtM1 = Math.round(rootAmount * 0.55);
    const amtM2 = rootAmount - amtM1;
    const amtD1 = Math.round(amtM1 * 0.52);
    const amtD2 = amtM1 - amtD1;
    const amtD3 = Math.round(amtM2 * 0.48);
    const amtD4 = amtM2 - amtD3;

    rawNodes = [
      { id: srcAcc, accountNumber: srcAcc, role: 'SOURCE', level: 0, incomingAmount: 0, outgoingAmount: rootAmount, transactionCount: 16, connectedCount: 2, riskLevel: 'CRITICAL', riskScore: 92, status: 'PROTECTED' },
      { id: m1, accountNumber: m1, role: 'INTERMEDIATE', level: 1, incomingAmount: amtM1, outgoingAmount: amtD1 + amtD2, transactionCount: 12, connectedCount: 3, riskLevel: 'HIGH', riskScore: 84, status: 'PROTECTED' },
      { id: m2, accountNumber: m2, role: 'INTERMEDIATE', level: 1, incomingAmount: amtM2, outgoingAmount: amtD3 + amtD4, transactionCount: 10, connectedCount: 3, riskLevel: 'HIGH', riskScore: 80, status: 'PROTECTED' },
      { id: d1, accountNumber: d1, role: 'DESTINATION', level: 2, incomingAmount: amtD1, outgoingAmount: 0, transactionCount: 20, connectedCount: 5, riskLevel: 'CRITICAL', riskScore: 96, status: 'PROTECTED' },
      { id: d2, accountNumber: d2, role: 'DESTINATION', level: 2, incomingAmount: amtD2, outgoingAmount: 0, transactionCount: 14, connectedCount: 4, riskLevel: 'HIGH', riskScore: 88, status: 'PROTECTED' },
      { id: d3, accountNumber: d3, role: 'DESTINATION', level: 2, incomingAmount: amtD3, outgoingAmount: 0, transactionCount: 18, connectedCount: 4, riskLevel: 'CRITICAL', riskScore: 94, status: 'PROTECTED' },
      { id: d4, accountNumber: d4, role: 'DESTINATION', level: 2, incomingAmount: amtD4, outgoingAmount: 0, transactionCount: 12, connectedCount: 3, riskLevel: 'HIGH', riskScore: 86, status: 'PROTECTED' }
    ];

    rawEdges = [
      { id: randomTxnId(), sourceId: srcAcc, targetId: m1, sourceAcc: srcAcc, targetAcc: m1, amount: amtM1, rail: 'IMPS', timestamp: startTime, status: 'CONTAINED', riskScore: 89 },
      { id: randomTxnId(), sourceId: srcAcc, targetId: m2, sourceAcc: srcAcc, targetAcc: m2, amount: amtM2, rail: 'UPI', timestamp: startTime, status: 'CONTAINED', riskScore: 85 },
      { id: randomTxnId(), sourceId: m1, targetId: d1, sourceAcc: m1, targetAcc: d1, amount: amtD1, rail: 'NEFT', timestamp: startTime, status: 'CONTAINED', riskScore: 96 },
      { id: randomTxnId(), sourceId: m1, targetId: d2, sourceAcc: m1, targetAcc: d2, amount: amtD2, rail: 'UPI', timestamp: startTime, status: 'CONTAINED', riskScore: 88 },
      { id: randomTxnId(), sourceId: m2, targetId: d3, sourceAcc: m2, targetAcc: d3, amount: amtD3, rail: 'CRYPTO_OFFRAMP', timestamp: startTime, status: 'CONTAINED', riskScore: 94 },
      { id: randomTxnId(), sourceId: m2, targetId: d4, sourceAcc: m2, targetAcc: d4, amount: amtD4, rail: 'IMPS', timestamp: startTime, status: 'CONTAINED', riskScore: 86 }
    ];
  } else if (topologyType === 1) {
    // 2. 4-Layer Network: Source -> 2 Mules -> 2 Intermediate Aggregators -> 2 Destinations
    const m1 = randomAcc();
    const m2 = randomAcc();
    const ag1 = randomAcc();
    const ag2 = randomAcc();
    const d1 = randomAcc();
    const d2 = randomAcc();

    const amtM1 = Math.round(rootAmount * 0.6);
    const amtM2 = rootAmount - amtM1;
    const amtAg1 = Math.round(amtM1 * 0.9);
    const amtAg2 = Math.round(amtM2 * 0.9);
    const amtD1 = Math.round(amtAg1 * 0.85);
    const amtD2 = Math.round(amtAg2 * 0.85);

    rawNodes = [
      { id: srcAcc, accountNumber: srcAcc, role: 'SOURCE', level: 0, incomingAmount: 0, outgoingAmount: rootAmount, transactionCount: 18, connectedCount: 2, riskLevel: 'CRITICAL', riskScore: 94, status: 'PROTECTED' },
      { id: m1, accountNumber: m1, role: 'INTERMEDIATE', level: 1, incomingAmount: amtM1, outgoingAmount: amtAg1, transactionCount: 14, connectedCount: 2, riskLevel: 'HIGH', riskScore: 86, status: 'PROTECTED' },
      { id: m2, accountNumber: m2, role: 'INTERMEDIATE', level: 1, incomingAmount: amtM2, outgoingAmount: amtAg2, transactionCount: 11, connectedCount: 2, riskLevel: 'HIGH', riskScore: 81, status: 'PROTECTED' },
      { id: ag1, accountNumber: ag1, role: 'INTERMEDIATE', level: 2, incomingAmount: amtAg1, outgoingAmount: amtD1, transactionCount: 15, connectedCount: 2, riskLevel: 'HIGH', riskScore: 89, status: 'PROTECTED' },
      { id: ag2, accountNumber: ag2, role: 'INTERMEDIATE', level: 2, incomingAmount: amtAg2, outgoingAmount: amtD2, transactionCount: 13, connectedCount: 2, riskLevel: 'HIGH', riskScore: 83, status: 'PROTECTED' },
      { id: d1, accountNumber: d1, role: 'DESTINATION', level: 3, incomingAmount: amtD1, outgoingAmount: 0, transactionCount: 24, connectedCount: 4, riskLevel: 'CRITICAL', riskScore: 97, status: 'PROTECTED' },
      { id: d2, accountNumber: d2, role: 'DESTINATION', level: 3, incomingAmount: amtD2, outgoingAmount: 0, transactionCount: 19, connectedCount: 3, riskLevel: 'CRITICAL', riskScore: 93, status: 'PROTECTED' }
    ];

    rawEdges = [
      { id: randomTxnId(), sourceId: srcAcc, targetId: m1, sourceAcc: srcAcc, targetAcc: m1, amount: amtM1, rail: 'IMPS', timestamp: startTime, status: 'CONTAINED', riskScore: 91 },
      { id: randomTxnId(), sourceId: srcAcc, targetId: m2, sourceAcc: srcAcc, targetAcc: m2, amount: amtM2, rail: 'UPI', timestamp: startTime, status: 'CONTAINED', riskScore: 84 },
      { id: randomTxnId(), sourceId: m1, targetId: ag1, sourceAcc: m1, targetAcc: ag1, amount: amtAg1, rail: 'IMPS', timestamp: startTime, status: 'CONTAINED', riskScore: 89 },
      { id: randomTxnId(), sourceId: m2, targetId: ag2, sourceAcc: m2, targetAcc: ag2, amount: amtAg2, rail: 'NEFT', timestamp: startTime, status: 'CONTAINED', riskScore: 83 },
      { id: randomTxnId(), sourceId: ag1, targetId: d1, sourceAcc: ag1, targetAcc: d1, amount: amtD1, rail: 'CRYPTO_OFFRAMP', timestamp: startTime, status: 'CONTAINED', riskScore: 97 },
      { id: randomTxnId(), sourceId: ag2, targetId: d2, sourceAcc: ag2, targetAcc: d2, amount: amtD2, rail: 'RTGS', timestamp: startTime, status: 'CONTAINED', riskScore: 93 }
    ];
  } else {
    // 3. Multi-hop Linear: Source -> Mule 1 -> Intermediate 2 -> Destination
    const m1 = randomAcc();
    const m2 = randomAcc();
    const dst = randomAcc();

    const amt1 = rootAmount;
    const amt2 = Math.round(rootAmount * 0.85);
    const amt3 = Math.round(amt2 * 0.9);

    rawNodes = [
      { id: srcAcc, accountNumber: srcAcc, role: 'SOURCE', level: 0, incomingAmount: 0, outgoingAmount: amt1, transactionCount: 14, connectedCount: 1, riskLevel: 'CRITICAL', riskScore: 90, status: 'PROTECTED' },
      { id: m1, accountNumber: m1, role: 'INTERMEDIATE', level: 1, incomingAmount: amt1, outgoingAmount: amt2, transactionCount: 11, connectedCount: 2, riskLevel: 'HIGH', riskScore: 83, status: 'PROTECTED' },
      { id: m2, accountNumber: m2, role: 'INTERMEDIATE', level: 2, incomingAmount: amt2, outgoingAmount: amt3, transactionCount: 9, connectedCount: 2, riskLevel: 'HIGH', riskScore: 78, status: 'PROTECTED' },
      { id: dst, accountNumber: dst, role: 'DESTINATION', level: 3, incomingAmount: amt3, outgoingAmount: 0, transactionCount: 21, connectedCount: 3, riskLevel: 'CRITICAL', riskScore: 95, status: 'PROTECTED' }
    ];

    rawEdges = [
      { id: randomTxnId(), sourceId: srcAcc, targetId: m1, sourceAcc: srcAcc, targetAcc: m1, amount: amt1, rail: 'IMPS', timestamp: startTime, status: 'CONTAINED', riskScore: 90 },
      { id: randomTxnId(), sourceId: m1, targetId: m2, sourceAcc: m1, targetAcc: m2, amount: amt2, rail: 'UPI', timestamp: startTime, status: 'CONTAINED', riskScore: 83 },
      { id: randomTxnId(), sourceId: m2, targetId: dst, sourceAcc: m2, targetAcc: dst, amount: amt3, rail: 'NEFT', timestamp: startTime, status: 'CONTAINED', riskScore: 95 }
    ];
  }

  const nodes = computeLayeredLayout(rawNodes, rawEdges);
  const hashHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')).join('');

  return {
    caseId,
    transactionId: rootTxn,
    sourceAccount: srcAcc,
    totalAmount: rootAmount,
    riskScore: 87,
    status: 'UNDER_INVESTIGATION',
    startTime,
    evidenceHash: `SHA-256: ${hashHex}8a9e0123456789abcdef`,
    nodes,
    edges: rawEdges,
    riskFactors: {
      pattern: 82,
      velocity: 71,
      linkage: 91,
      behavior: 84
    }
  };
}

export const TransactionForensics: React.FC = () => {
  // 1. Core State
  const [investigation, setInvestigation] = useState<InvestigationCase>(() => generateDynamicInvestigation());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('ALL');

  // Highlight Sets
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<string[]>([]);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);

  // Telemetry & Tickers
  const [lastSyncSeconds, setLastSyncSeconds] = useState<number>(2);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(85338); // 23h 42m 18s

  // Live Stream Simulation
  const [isLiveSimulating, setIsLiveSimulating] = useState<boolean>(false);
  const [liveTxnCount, setLiveTxnCount] = useState<number>(14);

  // Pan & Zoom Graph State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 15 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Sync Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds((prev) => (prev >= 10 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 24H Countdown Ticker
  useEffect(() => {
    if (investigation.status === 'UNFROZEN') return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [investigation.status]);

  // Live Stream Simulation (Continuous & Unbounded)
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setLiveTxnCount((prev) => prev + 1);
      setLastSyncSeconds(1);

      // Procedurally extend downstream transaction
      setInvestigation((prev) => {
        const randNode = prev.nodes[Math.floor(Math.random() * prev.nodes.length)];
        const newAcc = `ACC-${Math.floor(1000 + Math.random() * 9000)}`;
        const amt = Math.round(5000 + Math.random() * 25000);

        const rawNodes = [
          ...prev.nodes.map((n) => ({
            id: n.id,
            accountNumber: n.accountNumber,
            role: n.role,
            level: n.level,
            incomingAmount: n.incomingAmount,
            outgoingAmount: n.outgoingAmount,
            transactionCount: n.transactionCount,
            connectedCount: n.connectedCount,
            riskLevel: n.riskLevel,
            riskScore: n.riskScore,
            status: n.status
          })),
          {
            id: newAcc,
            accountNumber: newAcc,
            role: 'DESTINATION' as const,
            level: randNode.level + 1,
            incomingAmount: amt,
            outgoingAmount: 0,
            transactionCount: 2,
            connectedCount: 1,
            riskLevel: 'MEDIUM' as const,
            riskScore: 68,
            status: 'PROTECTED' as const
          }
        ];

        const newEdge: ForensicEdge = {
          id: `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          sourceId: randNode.id,
          targetId: newAcc,
          sourceAcc: randNode.accountNumber,
          targetAcc: newAcc,
          amount: amt,
          rail: 'UPI',
          timestamp: new Date().toLocaleTimeString('en-GB'),
          status: 'CONTAINED',
          riskScore: 68
        };

        const newEdges = [...prev.edges, newEdge];
        const recomputedNodes = computeLayeredLayout(rawNodes, newEdges);

        return {
          ...prev,
          nodes: recomputedNodes,
          edges: newEdges
        };
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Selected Node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return investigation.nodes[0] || null;
    return investigation.nodes.find((n) => n.id === selectedNodeId) || investigation.nodes[0] || null;
  }, [selectedNodeId, investigation.nodes]);

  // Format currency
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleNewInvestigation = () => {
    const fresh = generateDynamicInvestigation();
    setInvestigation(fresh);
    setSelectedNodeId(null);
    setHighlightedEdgeIds([]);
    setHighlightedNodeIds([]);
    setViewMode('ALL');
    setCountdownSeconds(85338);
    setLiveTxnCount(14);
    setIsLiveSimulating(false);
    setZoom(1);
    setPan({ x: 30, y: 15 });
  };

  const handleUnfreeze = () => {
    setInvestigation((prev) => ({
      ...prev,
      status: 'UNFROZEN',
      nodes: prev.nodes.map((n) => ({ ...n, status: 'UNFROZEN' }))
    }));
  };

  const handleContinueCase = () => {
    setInvestigation((prev) => ({
      ...prev,
      status: 'CASE_ACTIVE'
    }));
  };

  // Tracing Operations (Affects Graph Visualization Directly)
  const handleTraceUpstream = () => {
    const targetNodeId = selectedNode?.id || investigation.nodes[investigation.nodes.length - 1]?.id;
    if (!targetNodeId) return;

    const upstreamEdges: string[] = [];
    const upstreamNodes = new Set<string>([targetNodeId]);
    const queue = [targetNodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);

      const inEdges = investigation.edges.filter((e) => e.targetId === cur);
      inEdges.forEach((e) => {
        upstreamEdges.push(e.id);
        upstreamNodes.add(e.sourceId);
        queue.push(e.sourceId);
      });
    }

    setHighlightedEdgeIds(upstreamEdges);
    setHighlightedNodeIds(Array.from(upstreamNodes));
    setViewMode('UPSTREAM');
  };

  const handleTraceDownstream = () => {
    const sourceNodeId = selectedNode?.id || investigation.nodes[0]?.id;
    if (!sourceNodeId) return;

    const downstreamEdges: string[] = [];
    const downstreamNodes = new Set<string>([sourceNodeId]);
    const queue = [sourceNodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);

      const outEdges = investigation.edges.filter((e) => e.sourceId === cur);
      outEdges.forEach((e) => {
        downstreamEdges.push(e.id);
        downstreamNodes.add(e.targetId);
        queue.push(e.targetId);
      });
    }

    setHighlightedEdgeIds(downstreamEdges);
    setHighlightedNodeIds(Array.from(downstreamNodes));
    setViewMode('DOWNSTREAM');
  };

  const handleTraceFullChain = () => {
    setHighlightedEdgeIds(investigation.edges.map((e) => e.id));
    setHighlightedNodeIds(investigation.nodes.map((n) => n.id));
    setViewMode('FULL_CHAIN');
  };

  const handleFocusAccount = (node: ForensicNode) => {
    setSelectedNodeId(node.id);
    const connectedEdges = investigation.edges.filter((e) => e.sourceId === node.id || e.targetId === node.id);
    const connectedNodes = new Set<string>([node.id]);
    connectedEdges.forEach((e) => {
      connectedNodes.add(e.sourceId);
      connectedNodes.add(e.targetId);
    });

    setHighlightedEdgeIds(connectedEdges.map((e) => e.id));
    setHighlightedNodeIds(Array.from(connectedNodes));
    setViewMode('FOCUS_ACCOUNT');

    // Pan to center the account
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const targetPanX = rect.width / 2 - node.x * zoom - 85 * zoom;
      const targetPanY = rect.height / 2 - node.y * zoom - 43 * zoom;
      setPan({ x: targetPanX, y: targetPanY });
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 30, y: 15 });
    setSelectedNodeId(null);
    setHighlightedEdgeIds([]);
    setHighlightedNodeIds([]);
    setViewMode('ALL');
  };

  const handleFitToChain = () => {
    if (investigation.nodes.length === 0 || !canvasRef.current) return;
    const minX = Math.min(...investigation.nodes.map((n) => n.x));
    const maxX = Math.max(...investigation.nodes.map((n) => n.x + 170));
    const minY = Math.min(...investigation.nodes.map((n) => n.y));
    const maxY = Math.max(...investigation.nodes.map((n) => n.y + 86));

    const boxW = maxX - minX + 60;
    const boxH = maxY - minY + 60;
    const rect = canvasRef.current.getBoundingClientRect();

    const scaleX = rect.width / boxW;
    const scaleY = rect.height / boxH;
    const newZoom = Math.max(0.65, Math.min(1.2, Math.min(scaleX, scaleY) * 0.92));

    setZoom(newZoom);
    setPan({
      x: (rect.width - boxW * newZoom) / 2 - minX * newZoom + 30,
      y: (rect.height - boxH * newZoom) / 2 - minY * newZoom + 30
    });
  };

  // Drag Canvas Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-card') || (e.target as HTMLElement).closest('.canvas-control-btn')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Maximum Depth in current graph
  const maxDepthLevel = useMemo(() => {
    return Math.max(0, ...investigation.nodes.map((n) => n.level));
  }, [investigation.nodes]);

  // Dynamic Timeline Events
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    const t = investigation.startTime;
    const [h, m, s] = t.split(':').map((v) => parseInt(v, 10) || 0);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const getTime = (offsetSec: number) => {
      const totalSec = h * 3600 + m * 60 + s + offsetSec;
      const hh = Math.floor((totalSec / 3600) % 24);
      const mm = Math.floor((totalSec % 3600) / 60);
      const ss = totalSec % 60;
      return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
    };

    return [
      { id: '1', time: getTime(0), title: 'Suspicious transaction detected', description: `Flagged transfer ${investigation.transactionId} from ${investigation.sourceAccount}.`, completed: true },
      { id: '2', time: getTime(1), title: 'Risk engine triggered', description: `Composite risk score calculated at ${investigation.riskScore}/100.`, completed: true },
      { id: '3', time: getTime(3), title: 'Connected accounts identified', description: `Identified ${investigation.nodes.length} downstream transfer accounts in routing network.`, completed: true },
      { id: '4', time: getTime(5), title: 'Transaction chain reconstructed', description: `Multi-hop money distribution graph mapped across payment rails.`, completed: true },
      { id: '5', time: getTime(7), title: 'Temporary protection activated', description: `Simulated 24-hour temporary chain freeze engaged across payout endpoints.`, completed: investigation.status !== 'UNFROZEN' },
      { id: '6', time: getTime(9), title: 'Customer notified', description: `Protection notice dispatched across SMS, Email, and In-App channels.`, completed: true },
      { id: '7', time: getTime(12), title: 'Investigation case created', description: `Case file ${investigation.caseId} registered for investigator review.`, completed: true }
    ];
  }, [investigation]);

  // Evidence Items
  const evidenceList: EvidenceLog[] = useMemo(() => [
    {
      id: 'EV-1',
      title: 'Authentication & Session Log',
      category: 'AUTH_EVENT',
      time: `${investigation.startTime}.120`,
      details: {
        'Source Account': investigation.sourceAccount,
        'Auth Status': 'Biometric/Passcode Anomaly Flagged',
        'Device': 'Android VM / Proxy Node 103.21.84.12',
        'Session Integrity': 'Elevated Risk Signature'
      }
    },
    {
      id: 'EV-2',
      title: 'Transaction Payload Record',
      category: 'TRANSACTION_LOG',
      time: `${investigation.startTime}.340`,
      details: {
        'Transaction ID': investigation.transactionId,
        'Amount': formatINR(investigation.totalAmount),
        'Payment Rail': 'IMPS / UPI Routing',
        'Payload Digest': 'Verified SHA-256 Envelope'
      }
    },
    {
      id: 'EV-3',
      title: 'Connected Account Relationships',
      category: 'NETWORK_GRAPH',
      time: `${investigation.startTime}.680`,
      details: {
        'Nodes Linked': `${investigation.nodes.length} Anonymized Entities`,
        'Active Hops': `${investigation.edges.length} Wire Transfers`,
        'Mule Ring Status': 'Contained (Simulated 24H)'
      }
    }
  ], [investigation]);

  const isUnfrozen = investigation.status === 'UNFROZEN';
  const isCaseActive = investigation.status === 'CASE_ACTIVE';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '16px 20px',
        minHeight: '100%',
        background: 'var(--bg-app)',
        maxWidth: 1440,
        margin: '0 auto'
      }}
    >
      {/* 1. Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: 0.8, color: '#fff', margin: 0 }}>
              TRANSACTION FORENSICS
            </h1>
            <span
              className="soc-badge"
              style={{
                background: 'rgba(34, 211, 238, 0.15)',
                color: 'var(--cyan)',
                border: '1px solid rgba(34, 211, 238, 0.4)',
                fontSize: 10,
                fontWeight: 800
              }}
            >
              FINANCIAL FRAUD COMMAND CENTER
            </span>
          </div>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            Real-time transaction chain investigation & fraud response
          </p>
        </div>

        {/* Top-Right Telemetry & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Live Monitoring Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#070B14',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10
            }}
          >
            <span
              className={isLiveSimulating ? 'pulse-dot' : ''}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isLiveSimulating ? 'var(--green)' : 'var(--cyan)'
              }}
            />
            <strong style={{ color: isLiveSimulating ? 'var(--green)' : '#fff' }}>
              {isLiveSimulating ? 'LIVE MONITORING ACTIVE' : 'LIVE MONITORING'}
            </strong>
          </div>

          {/* System Operational */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#070B14',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10
            }}
          >
            <Activity style={{ width: 12, height: 12, color: 'var(--cyan)' }} />
            <span style={{ color: 'var(--text-muted)' }}>SYSTEM:</span>
            <strong style={{ color: 'var(--green)' }}>OPERATIONAL</strong>
          </div>

          {/* Last Sync */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#070B14',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10
            }}
          >
            <Clock style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Last Sync:</span>
            <strong style={{ color: 'var(--cyan)' }}>{lastSyncSeconds}s ago</strong>
          </div>

          {/* Live Simulation Controls */}
          {isLiveSimulating ? (
            <button
              onClick={() => setIsLiveSimulating(false)}
              className="soc-btn soc-btn-amber"
              style={{ height: 28, padding: '0 10px', fontSize: 10 }}
              title="Pause Live Stream"
            >
              <Pause style={{ width: 11, height: 11 }} />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLiveSimulating(true)}
              className="soc-btn soc-btn-ghost"
              style={{ height: 28, padding: '0 10px', fontSize: 10, color: 'var(--green)', borderColor: 'rgba(34,197,94,0.4)' }}
              title="Start Live Monitoring Stream"
            >
              <Play style={{ width: 11, height: 11, fill: 'currentColor' }} />
              <span>START LIVE MONITORING</span>
            </button>
          )}

          {/* New Investigation Randomizer */}
          <button
            onClick={handleNewInvestigation}
            className="soc-btn soc-btn-primary"
            style={{ height: 28, padding: '0 12px', fontSize: 10 }}
            title="Generate fresh synthetic transaction investigation"
          >
            <Sparkles style={{ width: 12, height: 12 }} />
            <span>NEW INVESTIGATION</span>
          </button>
        </div>
      </div>

      {/* 2. Active Incident Alert Banner */}
      <div
        className="soc-panel"
        style={{
          padding: '14px 18px',
          background: isUnfrozen
            ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.14) 0%, #08121E 100%)'
            : 'linear-gradient(90deg, rgba(239, 68, 68, 0.18) 0%, rgba(245, 158, 11, 0.1) 60%, #080D18 100%)',
          border: isUnfrozen ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(239, 68, 68, 0.5)',
          boxShadow: isUnfrozen ? '0 0 20px rgba(34, 197, 94, 0.15)' : '0 0 24px rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: isUnfrozen
                ? 'linear-gradient(135deg, #16a34a 0%, #059669 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: isUnfrozen ? '0 0 14px rgba(34, 197, 94, 0.4)' : '0 0 14px rgba(239, 68, 68, 0.4)',
              flexShrink: 0
            }}
          >
            {isUnfrozen ? <CheckCircle2 style={{ width: 22, height: 22 }} /> : <ShieldAlert style={{ width: 22, height: 22 }} />}
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: isUnfrozen ? 'var(--green)' : '#ff4d4f', letterSpacing: 0.5 }}>
              {isUnfrozen ? 'CHAIN UNFROZEN • TRANSACTION VERIFIED' : '⚠ SUSPICIOUS TRANSACTION DETECTED'}
            </div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 2 }}>
              INCIDENT ID: <strong style={{ color: '#fff' }}>{investigation.transactionId}</strong> • CASE: <strong style={{ color: 'var(--cyan)' }}>{investigation.caseId}</strong>
            </div>
          </div>
        </div>

        {/* Incident Telemetry Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ background: '#070B14', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TRANSACTION ID</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff' }}>
              {investigation.transactionId}
            </div>
          </div>

          <div style={{ background: '#070B14', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SOURCE ACCOUNT</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--cyan)' }}>
              {investigation.sourceAccount}
            </div>
          </div>

          <div style={{ background: '#070B14', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>AMOUNT</div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 900, color: isUnfrozen ? '#fff' : 'var(--red)' }}>
              {formatINR(investigation.totalAmount)}
            </div>
          </div>

          <div style={{ background: '#070B14', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RISK SCORE</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isUnfrozen ? 'var(--green)' : 'var(--red)' }}>
              {investigation.riskScore} / 100
            </div>
          </div>

          <div style={{ background: '#070B14', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: isUnfrozen ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>STATUS</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isUnfrozen ? 'var(--green)' : 'var(--amber)' }}>
              {isUnfrozen ? 'UNFROZEN' : isCaseActive ? 'CASE ACTIVE' : 'UNDER INVESTIGATION'}
            </div>
          </div>

          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="soc-btn soc-btn-primary"
            style={{ height: 28, fontSize: 10, padding: '0 10px' }}
          >
            <Eye style={{ width: 11, height: 11 }} />
            <span>VIEW INCIDENT</span>
          </button>
        </div>
      </div>

      {/* 3 & 4. Main Section: Redesigned Hero Transaction Flow Graph + Account Details Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 14 }}>
        {/* Left: Interactive Canvas & Toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 6. Trace Controls Toolbar with Active View Mode Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#090E1A',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Network style={{ width: 13, height: 13, color: 'var(--cyan)' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                MONEY TRAIL GRAPH
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: 'var(--cyan)',
                  background: 'rgba(34, 211, 238, 0.12)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  padding: '1px 6px',
                  borderRadius: 3
                }}
              >
                VIEW: {viewMode === 'ALL' ? 'COMPLETE GRAPH' : viewMode === 'UPSTREAM' ? 'UPSTREAM TRACE' : viewMode === 'DOWNSTREAM' ? 'DOWNSTREAM TRACE' : viewMode === 'FULL_CHAIN' ? 'FULL CHAIN HIGHLIGHT' : `FOCUS (${selectedNode?.accountNumber || 'ACCOUNT'})`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={handleTraceUpstream}
                className={viewMode === 'UPSTREAM' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
                style={{ height: 24, padding: '0 8px', fontSize: 9 }}
                title="Find where the funds originated"
              >
                <ArrowUpRight style={{ width: 11, height: 11, color: 'var(--cyan)' }} />
                <span>TRACE UPSTREAM</span>
              </button>

              <button
                onClick={handleTraceDownstream}
                className={viewMode === 'DOWNSTREAM' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
                style={{ height: 24, padding: '0 8px', fontSize: 9 }}
                title="Find where the funds were transferred"
              >
                <ArrowDownRight style={{ width: 11, height: 11, color: 'var(--red)' }} />
                <span>TRACE DOWNSTREAM</span>
              </button>

              <button
                onClick={handleTraceFullChain}
                className={viewMode === 'FULL_CHAIN' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
                style={{ height: 24, padding: '0 8px', fontSize: 9, color: '#c084fc', borderColor: 'rgba(139,92,246,0.4)' }}
                title="Show complete connected transaction path"
              >
                <Layers style={{ width: 11, height: 11 }} />
                <span>TRACE FULL CHAIN</span>
              </button>

              <button
                onClick={handleResetView}
                className="soc-btn-ghost"
                style={{ height: 24, padding: '0 8px', fontSize: 9 }}
                title="Return to original graph"
              >
                <RotateCcw style={{ width: 10, height: 10 }} />
                <span>RESET VIEW</span>
              </button>
            </div>
          </div>

          {/* Interactive Graph Canvas */}
          <div
            ref={canvasRef}
            className="soc-panel"
            style={{
              height: 420,
              position: 'relative',
              overflow: 'hidden',
              background: '#040711',
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(13, 24, 48, 0.7) 0%, transparent 80%),
                linear-gradient(to right, rgba(34, 211, 238, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(34, 211, 238, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 32px 32px, 32px 32px',
              border: '1px solid var(--border-medium)',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Column / Layer Guides in Background */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: pan.x,
                display: 'flex',
                gap: 260 * zoom,
                pointerEvents: 'none',
                zIndex: 4,
                opacity: 0.45,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}
            >
              {Array.from({ length: maxDepthLevel + 1 }).map((_, idx) => (
                <div key={idx} style={{ width: 170 * zoom, textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: 3 }}>
                  {idx === 0 ? 'LEVEL 0: SOURCE' : idx === maxDepthLevel ? `LEVEL ${idx}: DESTINATION` : `LEVEL ${idx}: INTERMEDIATE`}
                </div>
              ))}
            </div>

            {/* Top-Left Inside Graph Status Strip */}
            <div
              style={{
                position: 'absolute',
                top: 36,
                left: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(7, 12, 22, 0.92)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                zIndex: 12,
                backdropFilter: 'blur(6px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
              }}
            >
              <strong style={{ color: 'var(--cyan)' }}>CHAIN STATUS:</strong>
              <span style={{ color: '#fff' }}>{investigation.nodes.length} ACCOUNTS</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: '#fff' }}>{investigation.edges.length + liveTxnCount} TRANSACTIONS</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: '#c084fc' }}>{maxDepthLevel + 1} LEVELS</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--red)' }}>{investigation.nodes.filter((n) => n.riskScore >= 75).length} HIGH-RISK</span>
            </div>

            {/* Top-Right Inside Graph Legend */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(7, 12, 22, 0.88)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: 8,
                fontFamily: 'var(--font-mono)',
                zIndex: 12,
                backdropFilter: 'blur(6px)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--cyan)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)' }} />
                NORMAL
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--amber)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }} />
                SUSPICIOUS
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--red)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} />
                HIGH RISK
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--green)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                RELEASED
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 6 }}>
                <span style={{ color: 'var(--cyan)' }}>→</span> MONEY FLOW
              </span>
            </div>

            {/* Bottom-Right Zoom & Fit Controls */}
            <div
              className="canvas-control-btn"
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(8, 13, 24, 0.92)',
                padding: '3px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                zIndex: 20,
                backdropFilter: 'blur(6px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
              }}
            >
              <button
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                className="soc-btn-ghost"
                style={{ width: 24, height: 24, padding: 0 }}
                title="Zoom In (+)"
              >
                <ZoomIn style={{ width: 12, height: 12 }} />
              </button>

              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                className="soc-btn-ghost"
                style={{ width: 24, height: 24, padding: 0 }}
                title="Zoom Out (-)"
              >
                <ZoomOut style={{ width: 12, height: 12 }} />
              </button>

              <button
                onClick={handleFitToChain}
                className="soc-btn-ghost"
                style={{ height: 24, padding: '0 6px', fontSize: 9, fontWeight: 700 }}
                title="Fit and Center Entire Chain"
              >
                <Crosshair style={{ width: 11, height: 11, color: 'var(--cyan)' }} />
                <span>FIT</span>
              </button>

              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', minWidth: 34, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* SVG Canvas for Smooth Curved Directional Flow Connections */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
              <defs>
                <marker id="arrow-head-cyan" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#22d3ee" />
                </marker>
                <marker id="arrow-head-red" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#ef4444" />
                </marker>
                <marker id="arrow-head-amber" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#f59e0b" />
                </marker>
                <marker id="arrow-head-green" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#22c55e" />
                </marker>

                <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {investigation.edges.map((edge) => {
                  const src = investigation.nodes.find((n) => n.id === edge.sourceId);
                  const tgt = investigation.nodes.find((n) => n.id === edge.targetId);
                  if (!src || !tgt) return null;

                  // Clean start and end points from card edges
                  const sx = src.x + 170;
                  const sy = src.y + 43;
                  const tx = tgt.x;
                  const ty = tgt.y + 43;

                  // Smooth cubic bezier curvature
                  const dx = Math.max(40, (tx - sx) * 0.55);
                  const pathD = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

                  // Midpoint for chip
                  const midX = (sx + tx) / 2;
                  const midY = (sy + ty) / 2;

                  // Dynamic Highlight / Dimming logic
                  const isHovered = hoveredEdgeId === edge.id;
                  const isHighlighted =
                    viewMode === 'ALL' ||
                    highlightedEdgeIds.includes(edge.id) ||
                    (viewMode === 'FOCUS_ACCOUNT' && (selectedNodeId === edge.sourceId || selectedNodeId === edge.targetId));

                  const opacity = isHighlighted ? 1 : 0.25;

                  // Dynamic color & thickness based on amount & status
                  const edgeColor = isUnfrozen
                    ? '#22c55e'
                    : edge.riskScore >= 90
                    ? '#ef4444'
                    : isHovered || highlightedEdgeIds.includes(edge.id)
                    ? '#22d3ee'
                    : '#f59e0b';

                  const markerColor = isUnfrozen
                    ? 'green'
                    : edge.riskScore >= 90
                    ? 'red'
                    : isHovered || highlightedEdgeIds.includes(edge.id)
                    ? 'cyan'
                    : 'amber';

                  const strokeWidth = Math.min(4.5, Math.max(2, 2 + (edge.amount / 150000) * 1.2));

                  return (
                    <g
                      key={edge.id}
                      style={{ pointerEvents: 'auto', cursor: 'pointer', opacity, transition: 'opacity 0.2s ease' }}
                      onMouseEnter={() => setHoveredEdgeId(edge.id)}
                      onMouseLeave={() => setHoveredEdgeId(null)}
                      onClick={() => {
                        setHighlightedEdgeIds([edge.id]);
                        setHighlightedNodeIds([edge.sourceId, edge.targetId]);
                      }}
                    >
                      {/* Glow Shadow on active / hovered */}
                      {(isHovered || isHighlighted) && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke={edgeColor}
                          strokeWidth={strokeWidth + 4}
                          strokeOpacity={0.4}
                          filter="url(#path-glow)"
                        />
                      )}

                      {/* Main Directional Path */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={edgeColor}
                        strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
                        markerEnd={`url(#arrow-head-${markerColor})`}
                      />

                      {/* Animated Glowing Money Flow Particle */}
                      <circle r={3.2} fill="#fff" filter="url(#path-glow)">
                        <animateMotion dur={edge.amount > 100000 ? '2.4s' : '3.2s'} repeatCount="indefinite" path={pathD} />
                      </circle>

                      {/* Transaction Amount Chip along the Curve */}
                      <foreignObject
                        x={midX - (isHovered ? 65 : 45)}
                        y={midY - (isHovered ? 20 : 12)}
                        width={isHovered ? 130 : 90}
                        height={isHovered ? 42 : 24}
                        style={{ overflow: 'visible' }}
                      >
                        <div
                          style={{
                            background: isHovered ? '#0B1220' : '#040711',
                            border: `1px solid ${isHovered ? 'var(--cyan)' : 'rgba(34, 211, 238, 0.4)'}`,
                            borderRadius: isHovered ? 6 : 10,
                            padding: isHovered ? '3px 6px' : '1px 6px',
                            fontSize: 8,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            color: isUnfrozen ? 'var(--green)' : '#fff',
                            textAlign: 'center',
                            boxShadow: isHovered ? '0 0 16px rgba(34, 211, 238, 0.4), 0 4px 12px rgba(0,0,0,0.9)' : '0 2px 8px rgba(0,0,0,0.8)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ color: 'var(--cyan)' }}>{formatINR(edge.amount)}</div>
                          {isHovered && (
                            <div style={{ fontSize: 7, color: 'var(--text-muted)', marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{edge.id}</span>
                              <span>{edge.rail}</span>
                            </div>
                          )}
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* HTML Account Node Cards (Redesigned with Professional Layout) */}
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
              {investigation.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isSource = node.role === 'SOURCE';
                const isDest = node.role === 'DESTINATION';

                // Highlighting & Dimming logic
                const isHighlighted =
                  viewMode === 'ALL' ||
                  highlightedNodeIds.length === 0 ||
                  highlightedNodeIds.includes(node.id);

                const opacity = isHighlighted ? 1 : 0.25;

                // Border Color according to Section 5
                const borderColor = isSelected
                  ? 'var(--cyan)'
                  : isUnfrozen
                  ? 'rgba(34, 197, 94, 0.7)'
                  : node.riskScore >= 90
                  ? 'rgba(239, 68, 68, 0.8)'
                  : node.riskScore >= 75
                  ? 'rgba(245, 158, 11, 0.8)'
                  : 'rgba(34, 211, 238, 0.6)';

                return (
                  <div
                    key={node.id}
                    className="node-card"
                    onClick={() => handleFocusAccount(node)}
                    style={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: 170,
                      height: 86,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.25) 0%, #0d1a2d 100%)'
                        : isSource
                        ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.14) 0%, #08101d 100%)'
                        : isDest
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, #0d1222 100%)'
                        : '#090F1C',
                      border: `1.5px solid ${borderColor}`,
                      boxShadow: isSelected
                        ? '0 0 20px rgba(34, 211, 238, 0.5), 0 6px 18px rgba(0,0,0,0.9)'
                        : isSource
                        ? '0 0 14px rgba(34, 211, 238, 0.2), 0 4px 12px rgba(0,0,0,0.7)'
                        : '0 4px 12px rgba(0,0,0,0.7)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Header Row: Dot Indicator + Account ID + Risk Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: isSource ? 'var(--cyan)' : isDest ? 'var(--red)' : 'var(--amber)'
                          }}
                        />
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isSource ? 'var(--cyan)' : '#fff' }}>
                          {node.accountNumber}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: 8,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: node.riskScore >= 85 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)',
                          color: node.riskScore >= 85 ? 'var(--red)' : 'var(--amber)',
                          border: `1px solid ${node.riskScore >= 85 ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`
                        }}
                      >
                        {node.riskScore}
                      </span>
                    </div>

                    {/* Role Label */}
                    <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', fontWeight: 700, color: isSource ? 'var(--cyan)' : isDest ? '#c084fc' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {node.role}
                    </div>

                    {/* Transferred Amount */}
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isSource ? 'var(--cyan)' : '#fff' }}>
                      {formatINR(node.outgoingAmount > 0 ? node.outgoingAmount : node.incomingAmount)}
                    </div>

                    {/* Risk Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 7, fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: node.riskScore >= 80 ? 'var(--red)' : 'var(--amber)', fontWeight: 700 }}>
                        {node.riskScore >= 80 ? '⚠ HIGH RISK' : 'FLAGGED PATTERN'}
                      </span>
                      <span style={{ color: isUnfrozen ? 'var(--green)' : 'var(--text-muted)' }}>
                        {isUnfrozen ? 'RELEASED' : 'PROTECTED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: 4. Account Details Side Panel */}
        <div
          className="soc-panel"
          style={{
            padding: 14,
            background: '#0B1220',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CreditCard style={{ width: 14, height: 14, color: 'var(--cyan)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                  ACCOUNT DETAILS
                </span>
              </div>

              <span
                className="soc-badge"
                style={{
                  background: 'rgba(34, 211, 238, 0.15)',
                  color: 'var(--cyan)',
                  fontSize: 8
                }}
              >
                ANONYMIZED
              </span>
            </div>

            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {/* Account ID & Role */}
                <div style={{ background: '#060A14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ACCOUNT:</div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 800, color: selectedNode.role === 'SOURCE' ? 'var(--cyan)' : '#fff' }}>
                      {selectedNode.accountNumber}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RISK:</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: selectedNode.riskScore >= 85 ? 'var(--red)' : 'var(--amber)' }}>
                      {selectedNode.riskLevel} ({selectedNode.riskScore}/100)
                    </div>
                  </div>
                </div>

                {/* Incoming vs Outgoing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontFamily: 'var(--font-mono)' }}>
                  <div style={{ background: '#070B14', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>INCOMING:</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', marginTop: 1 }}>
                      {formatINR(selectedNode.incomingAmount)}
                    </div>
                  </div>

                  <div style={{ background: '#070B14', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>OUTGOING:</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginTop: 1 }}>
                      {formatINR(selectedNode.outgoingAmount)}
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div style={{ background: '#060A14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: 9, fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>TRANSACTIONS:</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{selectedNode.transactionCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>CONNECTED ACCOUNTS:</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{selectedNode.connectedCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>STATUS:</span>
                    <span style={{ color: isUnfrozen ? 'var(--green)' : 'var(--amber)', fontWeight: 800 }}>
                      {isUnfrozen ? 'UNFROZEN' : 'TEMPORARILY PROTECTED'}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => selectedNode && handleFocusAccount(selectedNode)}
              className="soc-btn soc-btn-ghost"
              style={{ height: 28, fontSize: 10, fontWeight: 700, justifyContent: 'center' }}
            >
              <Target style={{ width: 12, height: 12, color: 'var(--cyan)' }} />
              <span>FOCUS ACCOUNT</span>
            </button>

            <button
              onClick={handleTraceDownstream}
              className="soc-btn soc-btn-primary"
              style={{ height: 30, fontSize: 10, fontWeight: 700, justifyContent: 'center' }}
            >
              <ArrowDownRight style={{ width: 12, height: 12 }} />
              <span>TRACE FROM HERE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Investigation Summary (6 Statistics KPI Cards below the graph) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        <div className="soc-kpi-card" style={{ borderLeft: '3px solid var(--cyan)', padding: '10px 12px' }}>
          <div className="soc-kpi-label" style={{ fontSize: 9 }}>TRANSACTIONS TRACED</div>
          <div className="soc-kpi-val" style={{ fontSize: 18, color: '#fff', marginTop: 2 }}>
            {investigation.edges.length + liveTxnCount}
          </div>
          <div className="soc-kpi-sub" style={{ fontSize: 8 }}>CONNECTED HOPS</div>
        </div>

        <div className="soc-kpi-card" style={{ borderLeft: '3px solid var(--blue)', padding: '10px 12px' }}>
          <div className="soc-kpi-label" style={{ fontSize: 9 }}>ACCOUNTS CONNECTED</div>
          <div className="soc-kpi-val" style={{ fontSize: 18, color: '#fff', marginTop: 2 }}>
            {investigation.nodes.length}
          </div>
          <div className="soc-kpi-sub" style={{ fontSize: 8 }}>ANONYMIZED NODES</div>
        </div>

        <div className="soc-kpi-card" style={{ borderLeft: '3px solid #c084fc', padding: '10px 12px' }}>
          <div className="soc-kpi-label" style={{ fontSize: 9 }}>CHAIN DEPTH</div>
          <div className="soc-kpi-val" style={{ fontSize: 18, color: '#c084fc', marginTop: 2 }}>
            {maxDepthLevel + 1}
          </div>
          <div className="soc-kpi-sub" style={{ fontSize: 8 }}>ROUTING TIERS</div>
        </div>

        <div className="soc-kpi-card" style={{ borderLeft: '3px solid var(--red)', padding: '10px 12px' }}>
          <div className="soc-kpi-label" style={{ fontSize: 9 }}>SUSPICIOUS NODES</div>
          <div className="soc-kpi-val" style={{ fontSize: 18, color: 'var(--red)', marginTop: 2 }}>
            {investigation.nodes.filter((n) => n.riskScore >= 75).length}
          </div>
          <div className="soc-kpi-sub" style={{ fontSize: 8 }}>FLAGGED ENTITIES</div>
        </div>

        <div className="soc-kpi-card" style={{ borderLeft: '3px solid var(--cyan)', padding: '10px 12px' }}>
          <div className="soc-kpi-label" style={{ fontSize: 9 }}>FUNDS UNDER REVIEW</div>
          <div className="soc-kpi-val" style={{ fontSize: 18, color: 'var(--cyan)', marginTop: 2 }}>
            {formatINR(investigation.totalAmount)}
          </div>
          <div className="soc-kpi-sub" style={{ fontSize: 8 }}>SIMULATED HOLD VOLUME</div>
        </div>

        <div className="soc-kpi-card" style={{ borderLeft: '3px solid var(--amber)', padding: '10px 12px' }}>
          <div className="soc-kpi-label" style={{ fontSize: 9 }}>RISK SCORE</div>
          <div className="soc-kpi-val" style={{ fontSize: 18, color: isUnfrozen ? 'var(--green)' : 'var(--amber)', marginTop: 2 }}>
            {isUnfrozen ? '12 / 100' : `${investigation.riskScore} / 100`}
          </div>
          <div className="soc-kpi-sub" style={{ fontSize: 8 }}>COMPOSITE EVALUATION</div>
        </div>
      </div>

      {/* 7 & 8. Middle Row: Risk Analysis (Left) & Automatic Protection (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        {/* 7. Risk Analysis Card */}
        <div
          className="soc-panel"
          style={{
            padding: 16,
            background: '#0B1220',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu style={{ width: 14, height: 14, color: 'var(--red)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                RISK ANALYSIS
              </span>
            </div>

            <span
              className="soc-badge"
              style={{
                background: isUnfrozen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isUnfrozen ? 'var(--green)' : 'var(--red)',
                border: isUnfrozen ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: 9,
                fontWeight: 800
              }}
            >
              {isUnfrozen ? 'VERIFIED SAFE' : 'HIGH RISK — REVIEW REQUIRED'}
            </span>
          </div>

          {/* 4 Factor Bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)' }}>
            {[
              { label: 'Transaction Pattern', val: isUnfrozen ? 12 : investigation.riskFactors.pattern },
              { label: 'Transaction Velocity', val: isUnfrozen ? 10 : investigation.riskFactors.velocity },
              { label: 'Account Linkage', val: isUnfrozen ? 15 : investigation.riskFactors.linkage },
              { label: 'Behavior Anomaly', val: isUnfrozen ? 14 : investigation.riskFactors.behavior }
            ].map((factor, idx) => (
              <div key={idx} style={{ background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{factor.label}</span>
                  <span style={{ fontWeight: 800, color: factor.val >= 75 ? 'var(--red)' : factor.val >= 50 ? 'var(--amber)' : 'var(--green)' }}>
                    {factor.val}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${factor.val}%`,
                      height: '100%',
                      background: factor.val >= 75 ? 'var(--red)' : factor.val >= 50 ? 'var(--amber)' : 'var(--green)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#070B14', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>OVERALL RISK:</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 900, color: isUnfrozen ? 'var(--green)' : 'var(--red)' }}>
              {isUnfrozen ? '12 / 100' : `${investigation.riskScore} / 100`}
            </span>
          </div>
        </div>

        {/* 8. Automatic Protection Panel */}
        <div
          className="soc-panel"
          style={{
            padding: 16,
            background: '#0B1220',
            border: isUnfrozen ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock style={{ width: 14, height: 14, color: isUnfrozen ? 'var(--green)' : 'var(--amber)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: isUnfrozen ? 'var(--green)' : '#ff4d4f', letterSpacing: 0.5 }}>
                  {isUnfrozen ? 'CHAIN UNFROZEN' : '⚠ AUTOMATIC PROTECTION'}
                </span>
              </div>
              <span
                className="soc-badge"
                style={{
                  background: isUnfrozen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: isUnfrozen ? 'var(--green)' : 'var(--amber)',
                  fontSize: 8
                }}
              >
                SIMULATED CONTAINMENT
              </span>
            </div>

            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff', marginTop: 6 }}>
              24-HOUR TEMPORARY CHAIN FREEZE
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <Clock style={{ width: 16, height: 16, color: isUnfrozen ? 'var(--green)' : 'var(--amber)' }} />
              <div>
                <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {isUnfrozen ? 'STATUS' : 'TIME REMAINING'}
                </div>
                <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 900, color: isUnfrozen ? 'var(--green)' : '#fff' }}>
                  {isUnfrozen ? 'PROTECTION RELEASED' : formatCountdown(countdownSeconds)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: 8 }}>
              <span>Accounts Protected: <strong style={{ color: 'var(--cyan)' }}>{isUnfrozen ? 0 : investigation.nodes.length}</strong></span>
              <span>Transactions Contained: <strong style={{ color: isUnfrozen ? 'var(--green)' : 'var(--red)' }}>{isUnfrozen ? 0 : investigation.edges.length}</strong></span>
              <span>Evidence Preserved: <strong style={{ color: 'var(--green)' }}>YES</strong></span>
            </div>
          </div>

          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            * Prototype simulation only (no actual banking freezes performed).
          </div>
        </div>
      </div>

      {/* 9 & 10. Lower Row: Customer Notification (Left) & Investigation Timeline (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        {/* 9. Customer Notification Card */}
        <div
          className="soc-panel"
          style={{
            padding: 16,
            background: '#0B1220',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell style={{ width: 14, height: 14, color: 'var(--cyan)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                  CUSTOMER PROTECTION
                </span>
              </div>

              <span
                className="soc-badge"
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: 'var(--green)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  fontSize: 9,
                  fontWeight: 800
                }}
              >
                ✓ CUSTOMER NOTIFIED
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
              <span>SMS ✓</span>
              <span>EMAIL ✓</span>
              <span>IN-APP ✓</span>
            </div>

            <div
              style={{
                background: '#070B14',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                borderLeft: '3px solid var(--cyan)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                lineHeight: 1.4,
                marginTop: 10
              }}
            >
              “Suspicious activity has been detected on your account. Temporary protective measures have been applied while the transaction is reviewed.”
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="soc-btn soc-btn-primary"
              style={{ flex: 1, height: 30, fontSize: 10, fontWeight: 700, justifyContent: 'center' }}
            >
              <Eye style={{ width: 12, height: 12 }} />
              <span>VIEW NOTICE</span>
            </button>

            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="soc-btn-ghost"
              style={{ height: 30, fontSize: 10, padding: '0 12px' }}
            >
              <RefreshCw style={{ width: 11, height: 11 }} />
              <span>RESEND</span>
            </button>
          </div>
        </div>

        {/* 10. Investigation Timeline */}
        <div
          className="soc-panel"
          style={{
            padding: 16,
            background: '#0B1220',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock style={{ width: 14, height: 14, color: 'var(--cyan)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                INVESTIGATION TIMELINE
              </span>
            </div>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              REAL-TIME EVENT LOG
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
            {timelineEvents.map((evt, idx) => (
              <div key={evt.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 700, minWidth: 48 }}>
                  {evt.time}
                </span>
                <span style={{ color: evt.completed ? 'var(--green)' : 'var(--text-muted)', fontSize: 9 }}>
                  {evt.completed ? '✓' : '↓'}
                </span>
                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  <strong>{evt.title}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 11, 12, 13. Bottom Section: Case Status, Evidence & Final Decision Outcome */}
      <div
        className="soc-panel"
        style={{
          padding: 16,
          background: '#070B14',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
          {/* 11. Case Management */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INVESTIGATION CASE</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--cyan)' }}>
                {investigation.caseId}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>STATUS</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isUnfrozen ? 'var(--green)' : 'var(--amber)' }}>
                {isUnfrozen ? 'UNFROZEN' : 'ACTIVE'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INVESTIGATOR</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                UNASSIGNED
              </div>
            </div>

            {/* 12. Evidence Status */}
            <div>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>EVIDENCE</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--green)' }}>
                12 ITEMS (✓ PRESERVED)
              </div>
            </div>
          </div>

          {/* Tools: Open Case, View Evidence, Export Report */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="soc-btn-ghost"
              style={{ height: 28, fontSize: 9, padding: '0 8px' }}
            >
              <Briefcase style={{ width: 11, height: 11, color: 'var(--cyan)' }} />
              <span>OPEN CASE</span>
            </button>

            <button
              onClick={() => setIsEvidenceModalOpen(true)}
              className="soc-btn-ghost"
              style={{ height: 28, fontSize: 9, padding: '0 8px' }}
            >
              <FileText style={{ width: 11, height: 11, color: 'var(--green)' }} />
              <span>VIEW EVIDENCE</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="soc-btn-ghost"
              style={{ height: 28, fontSize: 9, padding: '0 8px', color: '#c084fc', borderColor: 'rgba(139,92,246,0.3)' }}
            >
              <Download style={{ width: 11, height: 11 }} />
              <span>EXPORT REPORT</span>
            </button>
          </div>
        </div>

        {/* 13. Final Decision: Investigation Outcome */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff' }}>
              INVESTIGATION OUTCOME
            </div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 1 }}>
              {isUnfrozen
                ? 'CHAIN RELEASED • NORMAL PROCESS RESTORED'
                : isCaseActive
                ? 'CASE REMAINS ACTIVE'
                : 'Choose action for the connected transaction chain'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleUnfreeze}
              className="soc-btn soc-btn-green"
              style={{ height: 34, padding: '0 16px', fontSize: 11, fontWeight: 800, opacity: isUnfrozen ? 0.7 : 1 }}
            >
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              <span>✓ RELEASE & UNFREEZE</span>
            </button>

            <button
              onClick={handleContinueCase}
              className="soc-btn soc-btn-red"
              style={{ height: 34, padding: '0 16px', fontSize: 11, fontWeight: 800, opacity: isCaseActive ? 0.7 : 1 }}
            >
              <AlertTriangle style={{ width: 13, height: 13 }} />
              <span>⚠ CONTINUE INVESTIGATION</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Customer Notice Modal */}
      {isNoticeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 6, 15, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setIsNoticeModalOpen(false)}>
          <div style={{ width: '100%', maxWidth: 520, background: '#0B1220', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.2)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080D18' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell style={{ width: 15, height: 15, color: 'var(--cyan)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff' }}>CUSTOMER NOTIFICATION ADVISORY</span>
              </div>
              <button onClick={() => setIsNoticeModalOpen(false)} className="soc-btn-ghost" style={{ width: 24, height: 24, padding: 0 }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18, background: '#070B14', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>✓ DISPATCHED VIA SMS, EMAIL & IN-APP PUSH</div>
              <div style={{ background: '#040711', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', lineHeight: 1.5 }}>
                “Suspicious activity has been detected on your account ({investigation.sourceAccount}) for transaction {investigation.transactionId} ({formatINR(investigation.totalAmount)}). Temporary protective measures have been applied while the transaction is reviewed.”
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button onClick={() => setIsNoticeModalOpen(false)} className="soc-btn soc-btn-primary" style={{ height: 28, fontSize: 10 }}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {isEvidenceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 6, 15, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setIsEvidenceModalOpen(false)}>
          <div style={{ width: '100%', maxWidth: 640, background: '#0B1220', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.2)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080D18' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck style={{ width: 16, height: 16, color: 'var(--green)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff' }}>FORENSIC EVIDENCE ENVELOPE</span>
              </div>
              <button onClick={() => setIsEvidenceModalOpen(false)} className="soc-btn-ghost" style={{ width: 24, height: 24, padding: 0 }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18, background: '#070B14', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#040711', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)' }}>
                {investigation.evidenceHash}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {evidenceList.map((item) => (
                  <div key={item.id} style={{ background: '#060A14', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 800, marginBottom: 4 }}>
                      <span>{item.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                    </div>
                    {Object.entries(item.details).map(([k, v], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>{k}:</span>
                        <span style={{ color: '#fff' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button onClick={() => setIsEvidenceModalOpen(false)} className="soc-btn soc-btn-primary" style={{ height: 28, fontSize: 10 }}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {isCaseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 6, 15, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setIsCaseModalOpen(false)}>
          <div style={{ width: '100%', maxWidth: 580, background: '#0B1220', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.2)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080D18' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase style={{ width: 15, height: 15, color: 'var(--cyan)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff' }}>CASE {investigation.caseId} DETAILS</span>
              </div>
              <button onClick={() => setIsCaseModalOpen(false)} className="soc-btn-ghost" style={{ width: 24, height: 24, padding: 0 }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18, background: '#070B14', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: '#060A14', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>PRIMARY TXN</div>
                  <div style={{ fontWeight: 800, color: '#fff' }}>{investigation.transactionId}</div>
                </div>
                <div style={{ background: '#060A14', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>FLAGGED AMOUNT</div>
                  <div style={{ fontWeight: 800, color: 'var(--red)' }}>{formatINR(investigation.totalAmount)}</div>
                </div>
              </div>
              <div style={{ background: '#060A14', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>INVESTIGATION SCOPE</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                  Automated DFIR chain containment simulated across {investigation.nodes.length} downstream transfer accounts. Evidence envelope verified with SHA-256 seal.
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button onClick={() => setIsCaseModalOpen(false)} className="soc-btn soc-btn-primary" style={{ height: 28, fontSize: 10 }}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {isExportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 6, 15, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setIsExportModalOpen(false)}>
          <div style={{ width: '100%', maxWidth: 680, background: '#0B1220', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.2)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080D18' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText style={{ width: 15, height: 15, color: '#c084fc' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff' }}>EXPORT FORENSIC REPORT</span>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="soc-btn-ghost" style={{ width: 24, height: 24, padding: 0 }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18, background: '#070B14', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <pre style={{ margin: 0, background: '#040711', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-primary)', maxHeight: 220, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
{`================================================================================
AEGISX CYBER FORENSICS REPORT - CASE: ${investigation.caseId}
================================================================================
INCIDENT: ${investigation.transactionId}
SOURCE: ${investigation.sourceAccount}
FLAGGED AMOUNT: ${formatINR(investigation.totalAmount)}
RISK SCORE: ${investigation.riskScore}/100
CONNECTED ACCOUNTS: ${investigation.nodes.length}
STATUS: ${investigation.status}
EVIDENCE HASH: ${investigation.evidenceHash}

ROUTING HOPS:
${investigation.edges.map((e, idx) => `[HOP ${idx + 1}] ${e.sourceAcc} --> ${e.targetAcc} : ${formatINR(e.amount)} (${e.rail})`).join('\n')}
================================================================================`}
              </pre>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(`CASE: ${investigation.caseId}`); }} className="soc-btn soc-btn-ghost" style={{ height: 28, fontSize: 10 }}>
                  <Copy style={{ width: 11, height: 11 }} />
                  <span>COPY</span>
                </button>
                <button onClick={() => setIsExportModalOpen(false)} className="soc-btn soc-btn-primary" style={{ height: 28, fontSize: 10 }}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
