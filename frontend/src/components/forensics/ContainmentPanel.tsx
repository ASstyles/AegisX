import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { ForensicIncident } from '../../types';

interface ContainmentPanelProps {
  incident: ForensicIncident;
  onToggleContainment: () => void;
}

export const ContainmentPanel: React.FC<ContainmentPanelProps> = ({
  incident,
  onToggleContainment
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(incident.countdownSeconds || 85940);
  const isReleased = incident.status === 'FALSE_POSITIVE_RELEASED';

  useEffect(() => {
    if (isReleased) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isReleased]);

  const formatHoursMinSec = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div
      className="soc-panel"
      style={{
        padding: 16,
        background: '#0B1220',
        border: isReleased ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-sm)',
              background: isReleased ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isReleased ? 'var(--green)' : 'var(--amber)'
            }}
          >
            {isReleased ? <Unlock style={{ width: 14, height: 14 }} /> : <Lock style={{ width: 14, height: 14 }} />}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              TEMPORARY CHAIN CONTAINMENT
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              SIMULATED PRECAUTIONARY 24-HOUR CONTAINMENT
            </div>
          </div>
        </div>

        <span
          className="soc-badge"
          style={{
            background: isReleased ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isReleased ? 'var(--green)' : 'var(--red)',
            border: isReleased ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            fontSize: 9,
            fontWeight: 800
          }}
        >
          {isReleased ? 'RELEASED / ACTIVE' : 'SIMULATED HOLD'}
        </span>
      </div>

      {/* Ticking 24H Countdown Banner */}
      <div
        style={{
          background: isReleased
            ? 'rgba(34, 197, 94, 0.1)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          border: isReleased ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock style={{ width: 22, height: 22, color: isReleased ? 'var(--green)' : 'var(--amber)' }} />
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isReleased ? 'CONTAINMENT STATUS' : 'TIME REMAINING'}
            </div>
            <div
              style={{
                fontSize: 20,
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                color: isReleased ? 'var(--green)' : '#fff',
                letterSpacing: 1
              }}
            >
              {isReleased ? 'ALL HOLDS RELEASED' : formatHoursMinSec(timeLeft)}
            </div>
          </div>
        </div>

        <button
          onClick={onToggleContainment}
          className={isReleased ? 'soc-btn soc-btn-amber' : 'soc-btn soc-btn-ghost'}
          style={{ height: 30, fontSize: 10, padding: '0 12px' }}
        >
          {isReleased ? (
            <>
              <Lock style={{ width: 12, height: 12 }} />
              <span>RE-ENGAGE 24H HOLD</span>
            </>
          ) : (
            <>
              <Unlock style={{ width: 12, height: 12 }} />
              <span>RELEASE CONTAINMENT</span>
            </>
          )}
        </button>
      </div>

      {/* Telemetry Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, fontFamily: 'var(--font-mono)' }}>
        <div style={{ background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>ACCOUNTS AFFECTED</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cyan)', marginTop: 2 }}>
            {isReleased ? 0 : incident.accountsInvolved}
          </div>
        </div>

        <div style={{ background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>TRANSACTIONS CONTAINED</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: isReleased ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
            {isReleased ? 0 : incident.transactionsTraced}
          </div>
        </div>

        <div style={{ background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>EVIDENCE PRESERVED</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>
            YES
          </div>
        </div>
      </div>

      {/* Safety Demo Disclaimer Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
        <Info style={{ width: 12, height: 12, color: 'var(--cyan)', flexShrink: 0 }} />
        <span>SIMULATED CONTAINMENT — DEMO ENVIRONMENT (No real banking actions executed)</span>
      </div>
    </div>
  );
};
