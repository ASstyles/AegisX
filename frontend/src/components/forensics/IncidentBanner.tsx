import React from 'react';
import { AlertOctagon, ShieldAlert, Clock, AlertTriangle, CheckCircle2, Lock, Radio, Sparkles } from 'lucide-react';
import { ForensicIncident } from '../../types';

interface IncidentBannerProps {
  incident: ForensicIncident;
  onOpenVictimModal: () => void;
  onOpenEvidence: () => void;
  onStartNewInvestigation?: () => void;
}

export const IncidentBanner: React.FC<IncidentBannerProps> = ({
  incident,
  onOpenVictimModal,
  onOpenEvidence,
  onStartNewInvestigation
}) => {
  const isNoIncident = incident.status === 'NO_ACTIVE_INCIDENT';
  const isReleased = incident.status === 'FALSE_POSITIVE_RELEASED';
  const isFraud = incident.status === 'FRAUD_CONFIRMED';

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  if (isNoIncident) {
    return (
      <div
        className="soc-panel"
        style={{
          padding: '20px 24px',
          background: '#090E1A',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <CheckCircle2 style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#fff' }}>
              NO ACTIVE SUSPICIOUS INCIDENT
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Load a transaction dataset or click "Start New Investigation" to generate a dynamic synthetic investigation.
            </p>
          </div>
        </div>

        {onStartNewInvestigation && (
          <button
            onClick={onStartNewInvestigation}
            className="soc-btn soc-btn-primary"
            style={{ height: 34, padding: '0 14px' }}
          >
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>START NEW INVESTIGATION</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="soc-panel incident-banner-root"
      style={{
        padding: '16px 20px',
        background: isReleased
          ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, #08141F 100%)'
          : isFraud
          ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.22) 0%, rgba(139, 92, 246, 0.12) 60%, #080D18 100%)'
          : 'linear-gradient(90deg, rgba(239, 68, 68, 0.18) 0%, rgba(245, 158, 11, 0.12) 50%, #080D18 100%)',
        border: isReleased
          ? '1px solid rgba(34, 197, 94, 0.5)'
          : '1px solid rgba(239, 68, 68, 0.5)',
        boxShadow: isReleased
          ? '0 0 20px rgba(34, 197, 94, 0.15)'
          : '0 0 24px rgba(239, 68, 68, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {/* Left: Dynamic Incident Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: isReleased
                ? 'linear-gradient(135deg, #16a34a 0%, #059669 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: isReleased
                ? '0 0 16px rgba(34, 197, 94, 0.5)'
                : '0 0 16px rgba(239, 68, 68, 0.5)',
              flexShrink: 0
            }}
          >
            {isReleased ? (
              <CheckCircle2 style={{ width: 24, height: 24 }} />
            ) : (
              <ShieldAlert style={{ width: 24, height: 24 }} />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 900,
                  color: isReleased ? 'var(--green)' : '#ff4d4f',
                  letterSpacing: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {!isReleased && <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f' }} />}
                {isReleased
                  ? 'VERIFIED LEGITIMATE TRANSACTION (UNFROZEN)'
                  : isFraud
                  ? 'CONFIRMED SUSPICIOUS TRANSACTION'
                  : '⚠ SUSPICIOUS TRANSACTION DETECTED'}
              </span>

              <span
                className="soc-badge"
                style={{
                  background: isReleased ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: isReleased ? 'var(--green)' : '#ff7875',
                  border: isReleased ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: 10,
                  fontWeight: 800
                }}
              >
                {incident.incidentId}
              </span>

              <span
                className="soc-badge"
                style={{
                  background: 'rgba(34, 211, 238, 0.12)',
                  color: 'var(--cyan)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  fontSize: 10
                }}
              >
                CASE: {incident.caseId}
              </span>
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
              Source: <strong style={{ color: 'var(--cyan)' }}>{incident.sourceAccount}</strong> • Automated DFIR chain containment simulated across downstream flow
            </p>
          </div>
        </div>

        {/* Right: Key Telemetry Cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Source Account */}
          <div style={{ background: '#070B14', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              SOURCE
            </div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>
              {incident.sourceAccount}
            </div>
          </div>

          {/* Amount */}
          <div style={{ background: '#070B14', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              AMOUNT
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 800, color: isReleased ? '#fff' : 'var(--red)' }}>
              {formatINR(incident.amount)}
            </div>
          </div>

          {/* Risk Score */}
          <div style={{ background: '#070B14', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              RISK SCORE
            </div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isReleased ? 'var(--green)' : 'var(--red)' }}>
              {incident.riskScore} / 100
            </div>
          </div>

          {/* Status Badge */}
          <div style={{ background: '#070B14', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: isReleased ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              STATUS
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: isReleased ? 'var(--green)' : 'var(--amber)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Lock style={{ width: 12, height: 12 }} />
              <span>{isReleased ? 'RELEASED' : isFraud ? 'FRAUD CONFIRMED' : 'UNDER INVESTIGATION'}</span>
            </div>
          </div>

          {/* Detection Time */}
          <div style={{ background: '#070B14', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TIME
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 12, height: 12 }} />
              <span>{incident.detectionTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

