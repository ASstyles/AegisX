import React, { useState } from 'react';
import { Flame, ShieldAlert, Target, Zap, Cpu, Sparkles, Check, Layers, AlertOctagon, Terminal } from 'lucide-react';
import { CustomerProfile } from '../types';
import { launchAttack } from '../api/client';

interface AttackLabProps {
  customers: CustomerProfile[];
  onAttackLaunched: (attackType: string, targetName: string) => void;
}

const ATTACK_CARDS = [
  {
    id: 'ACCOUNT_TAKEOVER',
    name: 'Account Takeover (ATO)',
    category: 'Credential / Device Spoofing',
    phase: 'Phase 1 MVP',
    desc: 'Unverified device + off-hours (02:13 AM) + 28x baseline amount surge.',
    difficulty: 'MEDIUM',
    impact: 'Critical'
  },
  {
    id: 'CARD_TESTING',
    name: 'Card Testing Bot Flood',
    category: 'Automated Micro-charges',
    phase: 'Phase 1 MVP',
    desc: 'Sub-second bursts of ₹1.00–₹5.00 validation charges across diverse gateways.',
    difficulty: 'EASY',
    impact: 'High'
  },
  {
    id: 'FAKE_MERCHANT',
    name: 'Fake Merchant / Shell Entity',
    category: 'Merchant Collusion',
    phase: 'Phase 1 MVP',
    desc: 'Dormant shell merchant with zero trust suddenly receiving high-ticket sums.',
    difficulty: 'MEDIUM',
    impact: 'Critical'
  },
  {
    id: 'VELOCITY_ATTACK',
    name: 'Transaction Velocity Drain',
    category: 'Rapid Hopping',
    phase: 'Phase 1 MVP',
    desc: 'Rapid sequence of 5 purchases within 30s before cardholder alerts trigger.',
    difficulty: 'EASY',
    impact: 'High'
  },
  {
    id: 'BEHAVIOR_MIMICRY',
    name: 'Behavior Mimicry Evasion',
    category: 'Adversarial Statistical Evasion',
    phase: 'Phase 2',
    desc: 'Red Team AI crafts exploit staying precisely at 94th percentile normal spending.',
    difficulty: 'ADVERSARIAL',
    impact: 'Severe'
  },
  {
    id: 'FRAUD_RING',
    name: 'Multi-Account Syndicate Ring',
    category: 'Hardware Cluster Reuse',
    phase: 'Phase 2',
    desc: 'Syndicate coordinates 3 distinct customer accounts using one pooled emulator device.',
    difficulty: 'HARD',
    impact: 'Critical'
  },
  {
    id: 'SYNTHETIC_IDENTITY',
    name: 'Synthetic Identity Creation',
    category: 'Profile Inconsistency',
    phase: 'Phase 2',
    desc: 'Newly provisioned synthetic identity with inconsistent geo/device telemetry.',
    difficulty: 'MEDIUM',
    impact: 'High'
  },
  {
    id: 'SOCIAL_ENGINEERING',
    name: 'AI Social Engineering Scam',
    category: 'GenAI Impersonation',
    phase: 'Phase 3 Safe Sim',
    desc: 'Simulated high-urgency push authorization to fraudulent mule account.',
    difficulty: 'HARD',
    impact: 'Severe'
  },
  {
    id: 'VOICE_CLONE',
    name: 'Voice Clone Authorization',
    category: 'Deepfake Audio Simulation',
    phase: 'Phase 3 Safe Sim',
    desc: 'Simulated acoustic biometrics spoofing high-value payment confirmation.',
    difficulty: 'ADVERSARIAL',
    impact: 'Severe'
  },
  {
    id: 'DEEPFAKE_KYC',
    name: 'Deepfake KYC Biometrics',
    category: 'Identity Verification Bypass',
    phase: 'Phase 3 Safe Sim',
    desc: 'Synthetic video manipulation session onboarding high-risk checkout profile.',
    difficulty: 'HARD',
    impact: 'Critical'
  }
];

export const AttackLab: React.FC<AttackLabProps> = ({ customers, onAttackLaunched }) => {
  const [selectedAttack, setSelectedAttack] = useState<string>('ACCOUNT_TAKEOVER');
  const [targetCustomer, setTargetCustomer] = useState<string>('C001');
  const [difficulty, setDifficulty] = useState<string>('MEDIUM');
  const [intensity, setIntensity] = useState<string>('MEDIUM');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [launchSuccess, setLaunchSuccess] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<string[]>([
    'Red Team scenario generator initialized with 10 attack classes.',
    'World 3 Hidden Attack Ledger active in isolated backend memory.',
    'Target customer catalog loaded (120 synthetic customer profiles).'
  ]);

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchSuccess(null);
    try {
      const res = await launchAttack(selectedAttack, targetCustomer, difficulty, intensity);
      const cust = customers.find((c) => c.customer_id === targetCustomer);
      const targetName = cust?.synthetic_name || targetCustomer;
      const msg = `Injected '${selectedAttack}' against ${targetName} (${targetCustomer}) [${difficulty}]`;
      setLaunchSuccess(msg);
      setActivityLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Red Team: Synthesized & injected '${selectedAttack}' targeting ${targetName}`,
        ...prev.slice(0, 8)
      ]);
      onAttackLaunched(selectedAttack, targetName);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLaunching(false);
    }
  };

  const selectedAttackObj = ATTACK_CARDS.find((a) => a.id === selectedAttack) || ATTACK_CARDS[0];
  const currentCustomer = customers.find((c) => c.customer_id === targetCustomer);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Banner */}
      <div className="soc-panel" style={{ padding: '16px 20px', border: '1px solid var(--border-red)', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, #0B1220 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--red) 0%, #f97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <Flame style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                RED TEAM: ADVERSARIAL ATTACK LAB
              </span>
              <span className="soc-badge soc-badge-block">
                10 Vectors Active
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              "Can the attacker bypass the defense?" — Autonomous GenAI scenario synthesis.
            </p>
          </div>
        </div>

        {launchSuccess && (
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: 'var(--green)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check style={{ width: 14, height: 14 }} />
            <span>{launchSuccess}</span>
          </div>
        )}
      </div>

      {/* Main Grid: 10 Attack Cards + Execution Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: 14 }}>
        {/* Left: 10 Attack Cards (2 columns) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Adversarial Attack Library ({ATTACK_CARDS.length} Vectors)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ATTACK_CARDS.map((atk) => {
              const isSelected = selectedAttack === atk.id;
              return (
                <div
                  key={atk.id}
                  onClick={() => {
                    setSelectedAttack(atk.id);
                    setDifficulty(atk.difficulty);
                  }}
                  className="soc-card"
                  style={{
                    background: isSelected ? 'rgba(239, 68, 68, 0.12)' : '#0B1220',
                    border: isSelected ? '1px solid var(--red)' : '1px solid var(--border-subtle)',
                    boxShadow: isSelected ? '0 0 16px rgba(239, 68, 68, 0.25)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: '#080D18', padding: '2px 6px', borderRadius: 3 }}>
                        {atk.category}
                      </span>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: atk.difficulty === 'ADVERSARIAL' ? 'rgba(139, 92, 246, 0.2)' : atk.difficulty === 'HARD' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: atk.difficulty === 'ADVERSARIAL' ? '#c084fc' : atk.difficulty === 'HARD' ? 'var(--red)' : 'var(--amber)' }}>
                        {atk.difficulty}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                      {atk.name}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', marginTop: 4, lineHeight: 1.4 }}>
                      {atk.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--cyan)' }}>{atk.phase}</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>Impact: {atk.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity Terminal Log */}
          <div className="soc-panel" style={{ padding: 12, background: '#080D18' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Terminal style={{ width: 13, height: 13 }} />
              <span>Red Team Campaign Log</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', maxHeight: 90, overflowY: 'auto' }}>
              {activityLogs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--red)' }}>›</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Execution Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="soc-panel" style={{ padding: 16, background: '#0B1220', border: '1px solid var(--border-red)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
              <Target style={{ width: 16, height: 16, color: 'var(--red)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                ATTACK EXECUTION PANEL
              </span>
            </div>

            {/* Target Customer Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Target Customer (World 1 Baseline):
              </label>
              <select
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                className="soc-select"
                style={{ width: '100%', height: 34 }}
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.customer_id} — {c.synthetic_name} (Home: {c.home_city})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Profile Summary */}
            {currentCustomer && (
              <div style={{ background: '#070B14', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: 10, fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Target Baseline:</div>
                <div style={{ color: '#fff', fontWeight: 600 }}>{currentCustomer.synthetic_name} ({currentCustomer.home_city})</div>
                <div style={{ color: 'var(--text-secondary)' }}>Normal Range: ₹{currentCustomer.spending_range[0]} – ₹{currentCustomer.spending_range[1]}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Trusted Device: {currentCustomer.trusted_devices[0]}</div>
              </div>
            )}

            {/* Difficulty Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Adversarial Difficulty:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {['EASY', 'MEDIUM', 'HARD', 'ADVERSARIAL'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    style={{
                      padding: '6px 0',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: difficulty === lvl ? 'var(--red)' : '#070B14',
                      color: difficulty === lvl ? '#000' : 'var(--text-secondary)',
                      border: difficulty === lvl ? '1px solid var(--red)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {lvl.substring(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Attack Intensity:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {['LOW', 'MEDIUM', 'HIGH'].map((int) => (
                  <button
                    key={int}
                    onClick={() => setIntensity(int)}
                    style={{
                      padding: '6px 0',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: intensity === int ? 'var(--purple)' : '#070B14',
                      color: intensity === int ? '#fff' : 'var(--text-secondary)',
                      border: intensity === int ? '1px solid var(--purple)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleLaunch}
              disabled={isLaunching}
              className="soc-btn soc-btn-danger"
              style={{ width: '100%', height: 38, fontSize: 12 }}
            >
              <Flame style={{ width: 16, height: 16, fill: '#fff' }} />
              <span>{isLaunching ? 'Synthesizing...' : 'Launch Attack Injection'}</span>
            </button>

            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', lineHeight: 1.4 }}>
              Injects unlabeled modified payloads into World 2 stream & records ground truth in World 3 ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
