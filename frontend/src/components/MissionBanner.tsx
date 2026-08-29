import React from 'react';
import { Flame, Shield, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const MissionBanner: React.FC = () => {
  return (
    <div className="soc-mission-banner">
      {/* Left: Mission & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)', border: '1px solid rgba(34, 211, 238, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
          <Sparkles style={{ width: 17, height: 17 }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              AI VS AI PAYMENT SECURITY
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(34, 211, 238, 0.12)', color: 'var(--cyan)', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
              CHALLENGE LAB
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1, fontFamily: 'var(--font-sans)' }}>
            "Simulate Tomorrow's Payment Fraud. Defend Today." — 10 GenAI vectors, 7-layer defense & continuous learning.
          </p>
        </div>
      </div>

      {/* Right: Flow Badges (Red Team -> Unlabeled Stream -> Blue Team) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: 'var(--red)', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          <Flame style={{ width: 12, height: 12 }} />
          <span>RED TEAM ACTIVE</span>
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>VS</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.35)', color: 'var(--cyan)', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          <Shield style={{ width: 12, height: 12 }} />
          <span>BLUE TEAM DEFENSE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.35)', color: '#c084fc', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          <Lock style={{ width: 12, height: 12 }} />
          <span>UNLABELED STREAM</span>
        </div>
      </div>
    </div>
  );
};
