import React from 'react';
import { Play, Pause, RotateCcw, Zap, Activity, Flame, Shield, Radio } from 'lucide-react';
import { SimulationStatus } from '../types';

interface TopCommandBarProps {
  status: SimulationStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDemo: () => void;
  onConfigChange: (key: string, value: any) => void;
  isDemoRunning?: boolean;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  status,
  onStart,
  onPause,
  onReset,
  onDemo,
  onConfigChange,
  isDemoRunning
}) => {
  return (
    <header className="soc-topbar">
      {/* Left: Page Title */}
      <div className="soc-topbar-left">
        <div className="soc-page-title">
          SOC DASHBOARD
        </div>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: 8, borderLeft: '1px solid var(--border-subtle)' }}>
          AI VS AI PAYMENT DEFENSE LAB
        </div>
      </div>

      {/* Center: Live Simulation Status Pulse */}
      <div className="soc-topbar-center">
        {status.is_running ? (
          <div className="soc-live-badge">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} className="pulse-dot" />
            <Radio style={{ width: 13, height: 13 }} />
            <span>LIVE SIMULATION</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: '#101827', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span>SIMULATION PAUSED</span>
          </div>
        )}
      </div>

      {/* Right: Controls & Parameters */}
      <div className="soc-topbar-right">
        {/* Stream Parameters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 12, borderRight: '1px solid var(--border-subtle)' }}>
          {/* TPS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>TPS:</span>
            <select
              value={status.tps}
              onChange={(e) => onConfigChange('tps', parseFloat(e.target.value))}
              className="soc-select"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>

          {/* Attack Rate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>RATE:</span>
            <select
              value={status.contamination_rate}
              onChange={(e) => onConfigChange('contamination_rate', parseFloat(e.target.value))}
              className="soc-select"
            >
              <option value="0.005">0.5%</option>
              <option value="0.01">1.0%</option>
              <option value="0.02">2.0%</option>
              <option value="0.05">5.0%</option>
            </select>
          </div>

          {/* Difficulty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>DIFF:</span>
            <select
              value={status.difficulty}
              onChange={(e) => onConfigChange('difficulty', e.target.value)}
              className="soc-select"
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MED</option>
              <option value="HARD">HARD</option>
              <option value="ADVERSARIAL">ADV</option>
            </select>
          </div>
        </div>

        {/* Command Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {status.is_running ? (
            <button
              onClick={onPause}
              className="soc-btn soc-btn-amber"
              title="Pause Simulation"
            >
              <Pause style={{ width: 14, height: 14 }} />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="soc-btn soc-btn-primary"
              title="Start Simulation Stream"
            >
              <Play style={{ width: 14, height: 14, fill: '#000' }} />
              <span>START</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="soc-btn soc-btn-ghost"
            title="Reset Simulation State"
          >
            <RotateCcw style={{ width: 13, height: 13 }} />
            <span>RESET</span>
          </button>

          <button
            onClick={onDemo}
            disabled={isDemoRunning}
            className="soc-btn soc-btn-demo"
            title="Run 2-Minute Deterministic Judge Walkthrough"
          >
            <Zap style={{ width: 14, height: 14, fill: '#FFD700', color: '#FFD700' }} />
            <span>{isDemoRunning ? 'RUNNING...' : '2-MIN DEMO'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
