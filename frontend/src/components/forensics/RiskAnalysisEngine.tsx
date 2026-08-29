import React from 'react';
import {
  Cpu,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Compass,
  Smartphone,
  Network,
  Activity
} from 'lucide-react';
import { ForensicIncident } from '../../types';

interface RiskAnalysisEngineProps {
  incident: ForensicIncident;
}

export const RiskAnalysisEngine: React.FC<RiskAnalysisEngineProps> = ({ incident }) => {
  const isReleased = incident.status === 'FALSE_POSITIVE_RELEASED';
  const factors = incident.anomalyFactors || {
    velocityAnomaly: 88,
    unusualBehavior: 91,
    accountLinkage: 84,
    deviceAnomaly: 80,
    locationAnomaly: 75,
    chainComplexity: 82
  };

  const riskFactors = [
    { label: 'TRANSACTION VELOCITY', value: isReleased ? 10 : factors.velocityAnomaly, isPct: true, color: 'var(--red)', icon: Activity },
    { label: 'UNUSUAL BEHAVIOR', value: isReleased ? 12 : factors.unusualBehavior, isPct: true, color: 'var(--red)', icon: TrendingUp },
    { label: 'ACCOUNT LINKAGE', value: isReleased ? 15 : factors.accountLinkage, isPct: true, color: 'var(--amber)', icon: Network },
    { label: 'DEVICE ANOMALY', value: isReleased ? 5 : factors.deviceAnomaly, isPct: true, color: isReleased ? 'var(--green)' : 'var(--red)', icon: Smartphone },
    { label: 'LOCATION ANOMALY', value: isReleased ? 8 : factors.locationAnomaly, isPct: true, color: isReleased ? 'var(--green)' : 'var(--red)', icon: Compass },
    { label: 'CHAIN COMPLEXITY', value: isReleased ? 12 : factors.chainComplexity, isPct: true, color: '#c084fc', icon: Cpu }
  ];

  return (
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
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red)'
            }}
          >
            <Cpu style={{ width: 14, height: 14 }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              RISK ANALYSIS ENGINE
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              DYNAMIC MULTI-FACTOR HEURISTIC & STATISTICAL EVALUATION
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>OVERALL RISK:</span>
          <span
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: isReleased ? 'var(--green)' : incident.riskScore >= 75 ? 'var(--red)' : 'var(--amber)'
            }}
          >
            {isReleased ? '12 / 100' : `${incident.riskScore} / 100`}
          </span>
        </div>
      </div>

      {/* AI Assessment Banner Box */}
      <div
        style={{
          background: isReleased
            ? 'rgba(34, 197, 94, 0.08)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          border: isReleased ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isReleased ? 'var(--green)' : 'var(--red)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            <Sparkles style={{ width: 13, height: 13 }} />
            <span>ASSESSMENT:</span>
          </div>

          <span
            className="soc-badge"
            style={{
              background: isReleased ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.25)',
              color: isReleased ? 'var(--green)' : 'var(--red)',
              fontSize: 9,
              fontWeight: 800
            }}
          >
            {isReleased ? 'BENIGN ACTIVITY VERIFIED' : 'SUSPICIOUS / REQUIRES REVIEW'}
          </span>
        </div>

        <p style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', lineHeight: 1.4 }}>
          {isReleased
            ? 'Transaction evaluated as consistent with normal banking baseline. All precautionary alerts cleared.'
            : 'Decision generated from transaction behavior, account history, device/session signals, and connected transaction patterns.'}
        </p>
      </div>

      {/* 6 Factor Progress Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)' }}>
        {riskFactors.map((rf, idx) => {
          const Icon = rf.icon;
          const valNum = Number(rf.value);
          return (
            <div
              key={idx}
              style={{
                background: '#070B14',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 8, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon style={{ width: 10, height: 10, color: 'var(--cyan)' }} />
                  {rf.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, color: valNum >= 75 ? 'var(--red)' : valNum >= 50 ? 'var(--amber)' : 'var(--green)' }}>
                  {valNum}%
                </span>
              </div>

              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${valNum}%`,
                    height: '100%',
                    background: valNum >= 75 ? 'var(--red)' : valNum >= 50 ? 'var(--amber)' : 'var(--green)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
