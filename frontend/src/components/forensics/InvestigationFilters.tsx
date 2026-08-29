import React from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Play,
  Pause,
  Square,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  UploadCloud,
  Layers,
  Database
} from 'lucide-react';

interface InvestigationFiltersProps {
  dataSource: 'LIVE_API' | 'UPLOAD_DATASET' | 'DEMO_DATA';
  onDataSourceChange: (ds: 'LIVE_API' | 'UPLOAD_DATASET' | 'DEMO_DATA') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  riskFilter: string;
  onRiskFilterChange: (risk: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  minAmount: number;
  onMinAmountChange: (amt: number) => void;
  onTraceUpstream: () => void;
  onTraceDownstream: () => void;
  onTraceFullChain: () => void;
  onResetGraph: () => void;
  onStartNewInvestigation: () => void;
  onOpenUploadModal: () => void;
  isLiveSimulating: boolean;
  onToggleLiveSimulation: () => void;
  onStopLiveSimulation: () => void;
}

export const InvestigationFilters: React.FC<InvestigationFiltersProps> = ({
  dataSource,
  onDataSourceChange,
  searchQuery,
  onSearchChange,
  riskFilter,
  onRiskFilterChange,
  statusFilter,
  onStatusFilterChange,
  minAmount,
  onMinAmountChange,
  onTraceUpstream,
  onTraceDownstream,
  onTraceFullChain,
  onResetGraph,
  onStartNewInvestigation,
  onOpenUploadModal,
  isLiveSimulating,
  onToggleLiveSimulation,
  onStopLiveSimulation
}) => {
  return (
    <div
      className="soc-panel"
      style={{
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#090E1A',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* Top Row: Data Source Selector & Generation Triggers */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Data Source Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <Database style={{ width: 12, height: 12, color: 'var(--cyan)' }} />
            <span>DATA SOURCE:</span>
          </div>

          <div style={{ display: 'flex', gap: 3, background: '#060A14', padding: 2, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            {(['DEMO_DATA', 'UPLOAD_DATASET', 'LIVE_API'] as const).map((ds) => (
              <button
                key={ds}
                onClick={() => {
                  onDataSourceChange(ds);
                  if (ds === 'UPLOAD_DATASET') onOpenUploadModal();
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: 3,
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  background: dataSource === ds ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                  color: dataSource === ds ? 'var(--cyan)' : 'var(--text-muted)',
                  border: dataSource === ds ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {ds === 'DEMO_DATA' ? 'SYNTHETIC DEMO' : ds === 'UPLOAD_DATASET' ? 'UPLOAD DATASET' : 'LIVE API'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Upload Button */}
          <button
            onClick={onOpenUploadModal}
            className="soc-btn-ghost"
            style={{ height: 26, padding: '0 8px', fontSize: 10, borderRadius: 3 }}
            title="Upload Custom JSON or CSV Transaction Dataset"
          >
            <UploadCloud style={{ width: 12, height: 12 }} />
            <span>UPLOAD DATASET</span>
          </button>

          {/* Start New Investigation (Randomize) */}
          <button
            onClick={onStartNewInvestigation}
            className="soc-btn soc-btn-primary"
            style={{ height: 26, padding: '0 10px', fontSize: 10 }}
            title="Generate a completely new randomized investigation dataset"
          >
            <Sparkles style={{ width: 12, height: 12 }} />
            <span>START NEW INVESTIGATION</span>
          </button>

          {/* Live Simulation Stream Controls */}
          <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 2px' }} />

          {isLiveSimulating ? (
            <button
              onClick={onToggleLiveSimulation}
              className="soc-btn soc-btn-amber"
              style={{ height: 26, padding: '0 10px', fontSize: 10 }}
              title="Pause Live Stream"
            >
              <Pause style={{ width: 12, height: 12 }} />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={onToggleLiveSimulation}
              className="soc-btn soc-btn-ghost"
              style={{ height: 26, padding: '0 10px', fontSize: 10, color: 'var(--green)', borderColor: 'rgba(34,197,94,0.4)' }}
              title="Start Live Monitoring Stream"
            >
              <Play style={{ width: 12, height: 12, fill: 'currentColor' }} />
              <span>START LIVE MONITORING</span>
            </button>
          )}

          {isLiveSimulating && (
            <button
              onClick={onStopLiveSimulation}
              className="soc-btn-ghost"
              style={{ height: 26, padding: '0 8px', fontSize: 10, color: 'var(--red)', borderColor: 'rgba(239,68,68,0.4)' }}
              title="Stop Live Stream"
            >
              <Square style={{ width: 11, height: 11, fill: 'currentColor' }} />
              <span>STOP</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Search, Filters & Graph Tracing Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        {/* Left: Search & Filter Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search style={{ width: 13, height: 13, position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Account / Txn..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                background: '#060A14',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px 4px 26px',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                width: 170,
                outline: 'none'
              }}
            />
          </div>

          {/* Risk Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>RISK:</span>
            <select
              value={riskFilter}
              onChange={(e) => onRiskFilterChange(e.target.value)}
              className="soc-select"
              style={{ height: 26, fontSize: 10 }}
            >
              <option value="ALL">ALL LEVELS</option>
              <option value="CRITICAL">CRITICAL (90+)</option>
              <option value="HIGH">HIGH (75+)</option>
              <option value="MEDIUM">MEDIUM (50+)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="soc-select"
              style={{ height: 26, fontSize: 10 }}
            >
              <option value="ALL">ALL STATUS</option>
              <option value="CONTAINED">CONTAINED</option>
              <option value="FLAGGED">FLAGGED</option>
              <option value="NORMAL">NORMAL</option>
            </select>
          </div>

          {/* Min Amount Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>MIN ₹:</span>
            <select
              value={minAmount}
              onChange={(e) => onMinAmountChange(parseInt(e.target.value, 10))}
              className="soc-select"
              style={{ height: 26, fontSize: 10 }}
            >
              <option value="0">ALL AMOUNTS</option>
              <option value="10000">₹10,000+</option>
              <option value="50000">₹50,000+</option>
              <option value="100000">₹1,00,000+</option>
              <option value="250000">₹2,50,000+</option>
            </select>
          </div>
        </div>

        {/* Right: Path Tracing Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={onTraceUpstream}
            className="soc-btn-ghost"
            style={{ height: 26, padding: '0 8px', fontSize: 10, borderRadius: 3 }}
            title="Trace funds upstream towards root source accounts"
          >
            <ArrowUpRight style={{ width: 12, height: 12, color: 'var(--cyan)' }} />
            <span>TRACE UPSTREAM</span>
          </button>

          <button
            onClick={onTraceDownstream}
            className="soc-btn-ghost"
            style={{ height: 26, padding: '0 8px', fontSize: 10, borderRadius: 3 }}
            title="Trace funds downstream to recipient endpoints"
          >
            <ArrowDownRight style={{ width: 12, height: 12, color: 'var(--red)' }} />
            <span>TRACE DOWNSTREAM</span>
          </button>

          <button
            onClick={onTraceFullChain}
            className="soc-btn-ghost"
            style={{ height: 26, padding: '0 8px', fontSize: 10, borderRadius: 3, color: '#c084fc', borderColor: 'rgba(139,92,246,0.3)' }}
            title="Highlight entire interconnected distribution chain"
          >
            <Layers style={{ width: 12, height: 12 }} />
            <span>TRACE FULL CHAIN</span>
          </button>

          <button
            onClick={onResetGraph}
            className="soc-btn-ghost"
            style={{ height: 26, padding: '0 8px', fontSize: 10, borderRadius: 3 }}
            title="Reset Graph Zoom and Filters"
          >
            <RotateCcw style={{ width: 12, height: 12 }} />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
