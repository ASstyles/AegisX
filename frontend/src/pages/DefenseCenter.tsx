import React, { useState } from 'react';
import { Shield, Sliders, Cpu, Activity, Sparkles, Check, Layers, Radio, Lock } from 'lucide-react';
import { SimulationStatus } from '../types';
import { updateConfig, adaptDefense } from '../api/client';

interface DefenseCenterProps {
  status: SimulationStatus;
  onConfigUpdated: () => void;
}

const LAYERS = [
  {
    num: '01',
    key: 'behavioral',
    name: 'BEHAVIORAL DEVIATION',
    category: 'Statistical Profiling',
    desc: 'Analyzes amount z-scores, spending multipliers ($28\\times$ surge), off-hours night anomalies ($02:13\\text{ AM}$).',
    status: 'ACTIVE'
  },
  {
    num: '02',
    key: 'device',
    name: 'DEVICE INTELLIGENCE',
    category: 'Hardware Fingerprinting',
    desc: 'Flags unverified hardware IDs, synthetic emulators, and cross-customer device collisions.',
    status: 'ACTIVE'
  },
  {
    num: '03',
    key: 'location',
    name: 'LOCATION & IMPOSSIBLE TRAVEL',
    category: 'Geo-Spatial Velocity',
    desc: 'Haversine distance & travel velocity speed ($v > 850\\text{ km/h}$) between consecutive transactions.',
    status: 'ACTIVE'
  },
  {
    num: '04',
    key: 'velocity',
    name: 'VELOCITY & BURST ANALYSIS',
    category: 'Sliding-Window Frequency',
    desc: 'Sub-minute micro-charge bursts (card testing) and rapid merchant hopping before cardholder alerts trigger.',
    status: 'ACTIVE'
  },
  {
    num: '05',
    key: 'merchant',
    name: 'MERCHANT REPUTATION',
    category: 'Entity Trust Scoring',
    desc: 'Merchant trust score ($0-100$), account age, and dormant high-ticket shell merchant spikes.',
    status: 'ACTIVE'
  },
  {
    num: '06',
    key: 'graph',
    name: 'GRAPH & ENTITY NETWORK',
    category: 'NetworkX Bipartite Graph',
    desc: 'Shared hardware clusters ($3+$ customers on $1$ device) and multi-account fraud syndicate rings.',
    status: 'ACTIVE'
  },
  {
    num: '07',
    key: 'anomaly',
    name: 'UNSUPERVISED ML ANOMALY',
    category: 'Scikit-Learn Isolation Forest',
    desc: 'Unsupervised decision function identifying multi-dimensional statistical outliers with zero fraud labels.',
    status: 'ACTIVE'
  }
];

export const DefenseCenter: React.FC<DefenseCenterProps> = ({ status, onConfigUpdated }) => {
  const [weights, setWeights] = useState<Record<string, number>>({ ...status.active_weights });
  const [blockThresh, setBlockThresh] = useState<number>(status.block_threshold);
  const [challengeThresh, setChallengeThresh] = useState<number>(status.challenge_threshold);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleWeightChange = (key: string, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      await updateConfig({
        defense_weights: weights,
        block_threshold: blockThresh,
        challenge_threshold: challengeThresh
      });
      setSaveSuccess('Defense parameters and threshold weights updated successfully!');
      onConfigUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdaptiveTuning = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const res = await adaptDefense();
      setSaveSuccess(`Continuous Adaptation complete! Upgraded to ${res.adaptation.version}`);
      onConfigUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Banner */}
      <div className="soc-panel" style={{ padding: '16px 20px', border: '1px solid rgba(34, 211, 238, 0.35)', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, #0B1220 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--cyan) 0%, var(--blue) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <Shield style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                BLUE TEAM: DEFENSE CENTER
              </span>
              <span className="soc-badge soc-badge-monitor">
                {status.defense_version}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Layered real-time defense operating strictly on unlabeled transaction payloads.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleAdaptiveTuning}
            disabled={isSaving}
            className="soc-btn soc-btn-demo"
            style={{ height: 34 }}
          >
            <Sparkles style={{ width: 14, height: 14, fill: '#FFD700', color: '#FFD700' }} />
            <span>Trigger Continuous Learning</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="soc-btn soc-btn-primary"
            style={{ height: 34 }}
          >
            <Sliders style={{ width: 14, height: 14 }} />
            <span>{isSaving ? 'Saving...' : 'Apply Layer Weights'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: 'var(--green)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check style={{ width: 14, height: 14 }} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Autonomous Decision Threshold Sliders */}
      <div className="soc-panel" style={{ padding: 16, background: '#0B1220' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity style={{ width: 15, height: 15, color: 'var(--cyan)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
              Autonomous Decision Thresholds
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            &lt;30 Approve | 30–59 Monitor | 60–{blockThresh - 1} Challenge | ≥{blockThresh} Block
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <div style={{ background: '#080D18', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--amber)', fontWeight: 700 }}>Challenge Threshold (Step-Up Verification):</span>
              <span style={{ color: '#fff', fontWeight: 800, background: 'rgba(245, 158, 11, 0.2)', padding: '1px 6px', borderRadius: 3, border: '1px solid rgba(245, 158, 11, 0.4)' }}>{challengeThresh} pts</span>
            </div>
            <input
              type="range"
              min="40"
              max="80"
              step="1"
              value={challengeThresh}
              onChange={(e) => setChallengeThresh(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--amber)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ background: '#080D18', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>Block Threshold (Autonomous Mitigation):</span>
              <span style={{ color: '#fff', fontWeight: 800, background: 'rgba(239, 68, 68, 0.2)', padding: '1px 6px', borderRadius: 3, border: '1px solid rgba(239, 68, 68, 0.4)' }}>{blockThresh} pts</span>
            </div>
            <input
              type="range"
              min="65"
              max="95"
              step="1"
              value={blockThresh}
              onChange={(e) => setBlockThresh(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--red)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* 7 Defense Intelligence Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          <span>7 Defense Intelligence Modules (Unlabeled Input)</span>
          <span style={{ color: 'var(--text-muted)' }}>
            Weight Sum: {Object.values(weights).reduce((a, b) => a + b, 0).toFixed(0)} pts
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {LAYERS.map((layer) => {
            const currentWeight = weights[layer.key] || 15.0;
            return (
              <div
                key={layer.key}
                className="soc-card"
                style={{ background: '#0B1220', display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 800, fontSize: 12 }}>{layer.num}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                      {layer.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="soc-badge soc-badge-approve">
                      ● {layer.status}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--cyan)', background: '#070B14', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>
                      {currentWeight.toFixed(0)} pts
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', lineHeight: 1.4 }}>
                  {layer.desc}
                </p>

                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'var(--font-mono)' }}>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={currentWeight}
                    onChange={(e) => handleWeightChange(layer.key, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--cyan)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)' }}>
                    <span>Low (5)</span>
                    <span>Standard (20)</span>
                    <span>High (50)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
