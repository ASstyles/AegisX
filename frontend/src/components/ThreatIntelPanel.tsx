import React from 'react';
import { Transaction } from '../types';
import { ShieldAlert, ShieldCheck, Lock, EyeOff, CheckCircle2, Flame, Search, ChevronRight } from 'lucide-react';

interface ThreatIntelPanelProps {
  latestThreat: Transaction | null;
  onInvestigate: (txn: Transaction) => void;
  onQuickAttack: (attackType: string, target: string) => void;
}

export const ThreatIntelPanel: React.FC<ThreatIntelPanelProps> = ({
  latestThreat,
  onInvestigate,
  onQuickAttack
}) => {
  const attribution = latestThreat?.risk_attribution || {
    'Behavioral Deviation': 38.0,
    'Device Intelligence': 26.0,
    'Location & Travel': 2.0,
    'Transaction Velocity': 1.0,
    'Merchant Trust': 1.0,
    'Graph & Entity Network': 0.0,
    'Unsupervised ML Anomaly': 16.0
  };

  const riskScore = latestThreat?.risk_score ?? 84;
  const decision = latestThreat?.decision ?? 'BLOCK';
  const customerName = latestThreat?.customer_baseline?.synthetic_name || 'Priya Sharma';
  const customerId = latestThreat?.customer_id || 'C001';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 1. Threat Intel Card */}
      <div className="soc-panel" style={{ padding: 14, background: '#0B1220', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert style={{ width: 15, height: 15, color: 'var(--red)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              THREAT INTELLIGENCE
            </span>
          </div>
          <span className="soc-badge soc-badge-block">
            {decision}
          </span>
        </div>

        {/* Case & Target Info */}
        <div style={{ background: '#080D18', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span>ACTIVE INCIDENT</span>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>ACCOUNT TAKEOVER</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginTop: 2 }}>
            {customerId} — {customerName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
            ₹{latestThreat?.amount ? latestThreat.amount.toLocaleString() : '78,000.00'} • {latestThreat?.city || 'Mumbai'} (02:13 AM)
          </div>
        </div>

        {/* Big Radial Risk Display */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.25)', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Assessed Risk Score
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>
              {riskScore} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 700 }}>
              CRITICAL THREAT
            </div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Threshold ≥ 80.0
            </div>
          </div>
        </div>

        {/* Risk Attribution Breakdown Bars */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>7-Layer Risk Attribution</span>
            <span style={{ color: 'var(--cyan)' }}>XAI Engine</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(attribution).map(([layerName, score]) => {
              const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
              const pct = Math.min(100, Math.max(0, (numScore / 40) * 100));

              return (
                <div key={layerName} style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{layerName}</span>
                    <span style={{ color: numScore > 15 ? 'var(--red)' : numScore > 5 ? 'var(--amber)' : 'var(--text-muted)', fontWeight: 700 }}>
                      +{numScore.toFixed(0)}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: '#080D18', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: numScore > 15 ? 'var(--red)' : numScore > 5 ? 'var(--amber)' : 'var(--cyan)',
                        borderRadius: 2,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {latestThreat && (
          <button
            onClick={() => onInvestigate(latestThreat)}
            className="soc-btn soc-btn-ghost"
            style={{ width: '100%', height: 32, fontSize: 10 }}
          >
            <Search style={{ width: 13, height: 13 }} />
            <span>Open Forensic Case File</span>
          </button>
        )}
      </div>

      {/* 2. Critical Unlabeled Indicator Panel */}
      <div className="soc-panel" style={{ padding: 14, background: 'rgba(34, 211, 238, 0.04)', border: '1px solid rgba(34, 211, 238, 0.35)', boxShadow: '0 0 16px rgba(34, 211, 238, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Lock style={{ width: 14, height: 14, color: 'var(--cyan)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: 'var(--cyan)', letterSpacing: 0.5 }}>
            DEFENDER INPUT • UNLABELED STREAM
          </span>
        </div>

        <div style={{ background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>FRAUD LABEL:</span>
            <span style={{ color: 'var(--purple)', fontWeight: 700 }}>HIDDEN (SANITIZED)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>ATTACK TYPE:</span>
            <span style={{ color: 'var(--purple)', fontWeight: 700 }}>HIDDEN</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>GROUND TRUTH:</span>
            <span style={{ color: 'var(--purple)', fontWeight: 700 }}>ISOLATED IN WORLD 3</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          <CheckCircle2 style={{ width: 13, height: 13, flexShrink: 0 }} />
          <span>Blue Team operates strictly without labels</span>
        </div>
      </div>

      {/* 3. Quick Adversary Attack Injector */}
      <div className="soc-panel" style={{ padding: 12, background: '#0B1220' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Flame style={{ width: 13, height: 13 }} />
          <span>Quick Red Team Injections</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button
            onClick={() => onQuickAttack('ACCOUNT_TAKEOVER', 'C001')}
            className="soc-btn soc-btn-danger"
            style={{ fontSize: 9, height: 28, padding: '0 8px' }}
          >
            ATO Surge (C001)
          </button>
          <button
            onClick={() => onQuickAttack('CARD_TESTING', 'C002')}
            className="soc-btn soc-btn-ghost"
            style={{ fontSize: 9, height: 28, padding: '0 8px' }}
          >
            Bot Micro-Charges
          </button>
        </div>
      </div>
    </div>
  );
};
