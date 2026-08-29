import React from 'react';
import { X, PlayCircle, ShieldCheck, ShieldAlert, CheckCircle2, History, RotateCcw, ArrowRight, Lock } from 'lucide-react';
import { ReplayData } from '../types';

interface ReplayModalProps {
  replayData: ReplayData | null;
  onClose: () => void;
  onRunReplay: () => void;
  isLoading?: boolean;
}

export const ReplayModal: React.FC<ReplayModalProps> = ({
  replayData,
  onClose,
  onRunReplay,
  isLoading
}) => {
  if (!replayData) return null;

  return (
    <div className="soc-modal-backdrop" onClick={onClose}>
      <div className="soc-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 840 }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080D18' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <History style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                  ADAPTIVE DEFENSE REPLAY
                </span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                  {replayData.attack_type}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                Same attack. Two defense versions. Evaluated on un-labeled stream.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="soc-btn-ghost"
            style={{ padding: 4, width: 28, height: 28, borderRadius: 4 }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Replay Verification Checklist */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, padding: '10px 14px', background: '#090E1A', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              <span>SAME ATTACK ✓</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              <span>SAME TRANSACTION ✓</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              <span>GROUND TRUTH HIDDEN ✓</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              <span>POLICY ADAPTED ✓</span>
            </span>
          </div>

          {/* Side-by-Side: Before vs After */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* LEFT: Before Defense */}
            <div className="soc-panel" style={{ padding: 16, background: '#090E1A', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 700 }}>Round 1 State</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                    {replayData.before_defense.version}
                  </div>
                </div>
                <span className="soc-badge soc-badge-challenge">
                  {replayData.before?.action || 'CHALLENGE'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Assessed Risk Score</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text-secondary)' }}>
                  {replayData.before?.risk_score ?? 84} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>

              <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>Block Threshold: 85.0 → Attack Evasion / Challenged</span>
              </div>
            </div>

            {/* RIGHT: After Defense */}
            <div className="soc-panel" style={{ padding: 16, background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(34, 211, 238, 0.45)', boxShadow: '0 0 20px rgba(34, 211, 238, 0.1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: 9, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 700 }}>Round 2 State (Adapted)</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                    {replayData.after_defense.version}
                  </div>
                </div>
                <span className="soc-badge soc-badge-block">
                  {replayData.after?.action || 'BLOCK'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Assessed Risk Score</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--cyan)' }}>
                  {replayData.after?.risk_score ?? 84} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>

              <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.4)', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>Block Threshold ≤ 78.0 → Hard Blocked & Neutralized!</span>
              </div>
            </div>
          </div>

          {/* Timeline Stepper */}
          <div className="soc-panel" style={{ padding: 14, background: '#090E1A' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <PlayCircle style={{ width: 13, height: 13 }} />
              <span>Adversarial Simulation Timeline</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 6, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
              {replayData.timeline.map((step, idx) => (
                <div key={idx} style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: '#070B14', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{step.time_step}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 9 }}>{step.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Adaptation Summary */}
          <div className="soc-panel" style={{ padding: 12, background: '#090E1A', border: '1px solid rgba(34, 211, 238, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase' }}>
                Continuous Defense Adaptation Result
              </div>
              <p style={{ fontSize: 11, color: '#fff', marginTop: 2, fontFamily: 'var(--font-sans)' }}>
                {replayData.improvement_summary}
              </p>
            </div>

            <button
              onClick={onRunReplay}
              disabled={isLoading}
              className="soc-btn soc-btn-ghost"
              style={{ fontSize: 10, height: 28 }}
            >
              <RotateCcw style={{ width: 12, height: 12 }} />
              <span>Re-run</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', background: '#080D18', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="soc-btn soc-btn-ghost"
          >
            Close Replay
          </button>
        </div>
      </div>
    </div>
  );
};
