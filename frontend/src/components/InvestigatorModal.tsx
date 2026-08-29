import React from 'react';
import { Transaction } from '../types';
import { X, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, PlayCircle, History, Sparkles, Terminal } from 'lucide-react';
import { formatISTTime, formatISTDateTime } from '../utils/timezone';

interface InvestigatorModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onReplay?: (txn: Transaction) => void;
}

export const InvestigatorModal: React.FC<InvestigatorModalProps> = ({
  transaction,
  onClose,
  onReplay
}) => {
  if (!transaction) return null;

  const baseline = transaction.customer_baseline;
  const isBlock = transaction.decision === 'BLOCK';
  const isChallenge = transaction.decision === 'CHALLENGE';
  const meanAmt = baseline?.mean_amount || 2500;
  const amtMultiple = (transaction.amount / meanAmt).toFixed(1);

  const riskAttribution = transaction.risk_attribution || {
    'Behavioral Deviation': 38.0,
    'Device Intelligence': 26.0,
    'Location & Travel': 2.0,
    'Transaction Velocity': 1.0,
    'Merchant Trust': 1.0,
    'Graph & Entity Network': 0.0,
    'Unsupervised ML Anomaly': 16.0
  };

  const formattedTime = formatISTTime(transaction.timestamp);
  const formattedFull = formatISTDateTime(transaction.timestamp);
  const isOffHours = transaction.layer_details?.behavioral?.is_off_hours;

  const xaiReasons = transaction.xai?.reasons && transaction.xai.reasons.length > 0 ? transaction.xai.reasons : [
    `Transaction amount (₹${transaction.amount.toLocaleString()}) is ${amtMultiple}× higher than customer's historical mean.`,
    `Transaction initiated at ${formattedTime} IST ${isOffHours ? 'outside normal hours' : 'during customer activity window'} (${baseline?.normal_hours ? `${baseline.normal_hours[0]}:00 – ${baseline.normal_hours[1]}:00` : '09:00 – 22:00'}).`,
    `Device '${transaction.device_id}' is completely unverified for account ${transaction.customer_id}.`,
    `Geographic origin (${transaction.city}) deviates from registered home location (${baseline?.home_city || 'Pune'}).`
  ];

  return (
    <div className="soc-modal-backdrop" onClick={onClose}>
      <div className="soc-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080D18' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: isBlock ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', border: isBlock ? '1px solid var(--border-red)' : '1px solid var(--border-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isBlock ? 'var(--red)' : 'var(--amber)' }}>
              <ShieldAlert style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                  FORENSIC CASE FILE: {transaction.transaction_id}
                </span>
                <span className={`soc-badge ${isBlock ? 'soc-badge-block' : isChallenge ? 'soc-badge-challenge' : 'soc-badge-approve'}`}>
                  {transaction.decision}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                Customer: {transaction.customer_id} ({baseline?.synthetic_name || 'Priya Sharma'}) • Assessed Risk: {transaction.risk_score}/100
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

        {/* Modal Content */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Side-by-Side: World 1 Baseline vs World 2 Live Transaction */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Left: Customer Baseline (World 1) */}
            <div className="soc-panel" style={{ padding: 14, background: '#090E1A' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>World 1: Historical Baseline</span>
                <span>Normal Profile</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registered Home:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{baseline?.home_city || 'Pune'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Spending Range:</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>₹{baseline?.spending_range ? `${baseline.spending_range[0]} – ₹${baseline.spending_range[1]}` : '500 – ₹6,000'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Active Hours:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{baseline?.normal_hours ? `${baseline.normal_hours[0]}:00 – ${baseline.normal_hours[1]}:00` : '09:00 – 22:00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Trusted Device:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{baseline?.trusted_devices?.[0] || 'DEV001'}</span>
                </div>
              </div>
            </div>

            {/* Right: Live Transaction (World 2) */}
            <div className="soc-panel" style={{ padding: 14, background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>World 2: Live Injected Payload</span>
                <span>Anomalous</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Attempt Location:</span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>{transaction.city} (Deviation)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Attempt Amount:</span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>₹{transaction.amount.toLocaleString()} ({amtMultiple}× Surge)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>
                  <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{formattedTime} IST {isOffHours ? '(Off-hours)' : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Device Fingerprint:</span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>{transaction.device_id} (Unverified)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Why Blocked? — 7-Layer Risk Attribution Bars */}
          <div className="soc-panel" style={{ padding: 14, background: '#090E1A' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 10 }}>
              Why Was This Transaction Blocked? (Risk Attribution)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(riskAttribution).map(([layerName, score]) => {
                const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
                const pct = Math.min(100, Math.max(0, (numScore / 40) * 100));

                return (
                  <div key={layerName} style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{layerName}</span>
                      <span style={{ color: numScore > 15 ? 'var(--red)' : numScore > 5 ? 'var(--amber)' : 'var(--text-muted)', fontWeight: 700 }}>
                        +{numScore.toFixed(0)} pts
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#070B14', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: numScore > 15 ? 'var(--red)' : numScore > 5 ? 'var(--amber)' : 'var(--cyan)',
                          borderRadius: 2
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Investigator Diagnostic Summary */}
          <div className="soc-panel" style={{ padding: 14, background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', marginBottom: 8 }}>
              <Terminal style={{ width: 14, height: 14 }} />
              <span>Autonomous AI Investigator Narrative</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
              {xaiReasons.map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--red)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>›</span>
                  <span style={{ color: 'var(--text-primary)' }}>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', background: '#080D18', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Evaluated strictly without ground truth labels
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {onReplay && (
              <button
                onClick={() => onReplay(transaction)}
                className="soc-btn soc-btn-demo"
                style={{ height: 32 }}
              >
                <History style={{ width: 14, height: 14 }} />
                <span>Simulate Adaptive Replay</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="soc-btn soc-btn-ghost"
              style={{ height: 32 }}
            >
              Close Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
