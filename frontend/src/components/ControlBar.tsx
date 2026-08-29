import React from 'react';
import { Play, Pause, RotateCcw, Zap, Shield, Flame, Activity, Timer } from 'lucide-react';
import { SimulationStatus } from '../types';
import { formatDurationSeconds } from '../utils/timezone';

interface ControlBarProps {
  status: SimulationStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDemo: () => void;
  onConfigChange: (key: string, value: any) => void;
  isDemoRunning?: boolean;
  demoSecondsRemaining?: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  status,
  onStart,
  onPause,
  onReset,
  onDemo,
  onConfigChange,
  isDemoRunning = false,
  demoSecondsRemaining = 120
}) => {
  return (
    <header className="glass-header sticky top-0 z-50 px-6 py-3 border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.4)]">
            <Shield className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-white">
                AEGIS<span className="text-[var(--accent-cyan)]">X</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-cyan-300 border border-cyan-500/30">
                GFF 2026 Lab
              </span>
              {status.is_running ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-green)] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE STREAM
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  PAUSED
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] hidden md:block">
              Simulate Tomorrow's Payment Fraud. Defend Today.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Play / Pause */}
          {status.is_running ? (
            <button
              onClick={onPause}
              className="btn btn-ghost text-amber-400 hover:text-amber-300 border-amber-500/30 hover:border-amber-500/60"
              title="Pause Live Stream"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="btn btn-primary"
              title="Start Live Stream"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start Stream</span>
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onReset}
            className="btn btn-ghost text-slate-300 hover:text-white"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {/* 2-Min Demo Walkthrough */}
          <button
            onClick={onDemo}
            className="btn btn-purple"
            title={isDemoRunning ? 'Cancel 2-Minute Demo' : 'Run 2-Minute End-to-End Judge Walkthrough'}
          >
            {isDemoRunning ? (
              <>
                <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Demo: {formatDurationSeconds(demoSecondsRemaining)}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span>2-Min Demo Mode</span>
              </>
            )}
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Stream TPS Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>TPS:</span>
            <select
              value={status.tps}
              onChange={(e) => onConfigChange('tps', parseFloat(e.target.value))}
              className="input-select"
            >
              <option value="1">1 txn/s</option>
              <option value="2">2 txn/s</option>
              <option value="5">5 txn/s</option>
              <option value="10">10 txn/s</option>
            </select>
          </div>

          {/* Attack Contamination Rate Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Attack Rate:</span>
            <select
              value={status.contamination_rate}
              onChange={(e) => onConfigChange('contamination_rate', parseFloat(e.target.value))}
              className="input-select"
            >
              <option value="0.005">0.5%</option>
              <option value="0.01">1.0%</option>
              <option value="0.02">2.0% (Def)</option>
              <option value="0.05">5.0%</option>
            </select>
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span>Difficulty:</span>
            <select
              value={status.difficulty}
              onChange={(e) => onConfigChange('difficulty', e.target.value)}
              className="input-select"
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
              <option value="ADVERSARIAL">ADVERSARIAL</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
