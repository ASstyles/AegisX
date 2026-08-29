import React from 'react';
import { Database, Radio, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const ThreeWorldVisualizer: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      {/* World 1: Historical Baseline */}
      <div className="soc-panel" style={{ padding: '10px 14px', background: '#090E1A', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', flexShrink: 0 }}>
          <Database style={{ width: 14, height: 14 }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            WORLD 1 • BASELINE
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
            120 Customer Baselines
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            60 days normal financial activity
          </div>
        </div>
      </div>

      <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-dim)', flexShrink: 0 }} />

      {/* World 2: Live Unlabeled Stream */}
      <div className="soc-panel" style={{ padding: '10px 14px', background: '#090E1A', border: '1px solid rgba(34, 211, 238, 0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(34, 211, 238, 0.15)', border: '1px solid rgba(34, 211, 238, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', flexShrink: 0 }}>
          <Radio style={{ width: 14, height: 14 }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            WORLD 2 • UNLABELED STREAM
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
            Real-Time Payment Payloads
          </div>
          <div style={{ fontSize: 10, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
            Ground truth strictly sanitized
          </div>
        </div>
      </div>

      <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-dim)', flexShrink: 0 }} />

      {/* World 3: Hidden Ground Truth */}
      <div className="soc-panel" style={{ padding: '10px 14px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.35)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
          <Lock style={{ width: 14, height: 14 }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            WORLD 3 • HIDDEN GROUND TRUTH
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
            Attack Ledger (Locked)
          </div>
          <div style={{ fontSize: 10, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
            Inaccessible during Blue Team inference
          </div>
        </div>
      </div>
    </div>
  );
};
