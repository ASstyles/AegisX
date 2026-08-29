import React, { useState } from 'react';
import { Eye, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, RefreshCw, BarChart2, Lock } from 'lucide-react';
import { EvaluationResult } from '../types';
import { evaluateSimulation } from '../api/client';

interface EvaluationViewProps {
  initialEvaluation?: EvaluationResult | null;
  onAdaptDefense?: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  initialEvaluation,
  onAdaptDefense
}) => {
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(initialEvaluation || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEvaluate = async () => {
    setIsLoading(true);
    try {
      const data = await evaluateSimulation();
      setEvalResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const cm = evalResult?.confusion_matrix;
  const metrics = evalResult?.metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Banner */}
      <div className="soc-panel" style={{ padding: '16px 20px', border: '1px solid rgba(139, 92, 246, 0.4)', background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, #0B1220 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Lock style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                WORLD 3: HIDDEN GROUND TRUTH & AUDIT
              </span>
              <span className="soc-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                Zero-Leakage Audit
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              "Ground truth is inaccessible to the Blue Team during inference." — Unlocks exact confusion matrix.
            </p>
          </div>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={isLoading}
          className="soc-btn soc-btn-primary"
          style={{ height: 34 }}
        >
          <RefreshCw style={{ width: 14, height: 14 }} className={isLoading ? 'pulse-dot' : ''} />
          <span>{isLoading ? 'Revealing Ground Truth...' : 'Reveal Ground Truth & Audit'}</span>
        </button>
      </div>

      {!evalResult ? (
        <div className="soc-panel" style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: '#0B1220' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
            <Lock style={{ width: 24, height: 24 }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#fff' }}>
            🔐 Ground Truth Remains Strictly Isolated in World 3
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', maxWidth: 480, lineHeight: 1.5 }}>
            The Blue Team defense pipeline operates on real-time transactions with zero access to attack labels. Click "Reveal Ground Truth & Audit" to evaluate predictions against the isolated Attack Ledger.
          </p>
          <button
            onClick={handleEvaluate}
            className="soc-btn soc-btn-demo"
            style={{ marginTop: 8 }}
          >
            Reveal Ground Truth Now
          </button>
        </div>
      ) : (
        <>
          {/* Key Evaluation Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div className="soc-kpi-card" style={{ height: 105, borderLeft: '3px solid var(--cyan)' }}>
              <span className="soc-kpi-label">DETECTION RATE (RECALL)</span>
              <div className="soc-kpi-val" style={{ color: 'var(--cyan)' }}>
                {metrics?.detection_rate_pct}%
              </div>
              <div className="soc-kpi-sub">
                {metrics?.total_attacks_detected} of {metrics?.total_attacks_injected} attacks
              </div>
            </div>

            <div className="soc-kpi-card" style={{ height: 105, borderLeft: '3px solid var(--green)' }}>
              <span className="soc-kpi-label">PRECISION</span>
              <div className="soc-kpi-val" style={{ color: 'var(--green)' }}>
                {(metrics?.precision! * 100).toFixed(1)}%
              </div>
              <div className="soc-kpi-sub">
                Positive predictive value
              </div>
            </div>

            <div className="soc-kpi-card" style={{ height: 105, borderLeft: '3px solid var(--purple)' }}>
              <span className="soc-kpi-label">F1 SCORE</span>
              <div className="soc-kpi-val" style={{ color: '#c084fc' }}>
                {metrics?.f1_score.toFixed(3)}
              </div>
              <div className="soc-kpi-sub">
                Harmonic mean
              </div>
            </div>

            <div className="soc-kpi-card" style={{ height: 105, borderLeft: '3px solid var(--text-secondary)' }}>
              <span className="soc-kpi-label">FALSE POSITIVE RATE</span>
              <div className="soc-kpi-val" style={{ color: 'var(--text-primary)' }}>
                {metrics?.false_positive_rate_pct}%
              </div>
              <div className="soc-kpi-sub">
                Benign customer friction
              </div>
            </div>

            <div className="soc-kpi-card" style={{ height: 105, borderLeft: '3px solid var(--red)' }}>
              <span className="soc-kpi-label">ATTACKER EVASION RATE</span>
              <div className="soc-kpi-val" style={{ color: 'var(--red)' }}>
                {metrics?.attack_success_rate_pct}%
              </div>
              <div className="soc-kpi-sub">
                {metrics?.total_attacks_missed} missed attacks
              </div>
            </div>

            <div className="soc-kpi-card" style={{ height: 105, borderLeft: '3px solid var(--blue)' }}>
              <span className="soc-kpi-label">TOTAL EVALUATED</span>
              <div className="soc-kpi-val">
                {cm?.total_transactions.toLocaleString()}
              </div>
              <div className="soc-kpi-sub">
                Live stream volume
              </div>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          <div className="soc-panel" style={{ padding: 16, background: '#0B1220' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', marginBottom: 12 }}>
              <BarChart2 style={{ width: 15, height: 15, color: 'var(--cyan)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                Calculated Confusion Matrix (Ground Truth vs Blue Team Inferences)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontFamily: 'var(--font-mono)' }}>
              {/* True Positives */}
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.35)', padding: 14, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'var(--green)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                    <span>True Positives (TP)</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>
                    Injected attacks correctly blocked/challenged by Blue Team.
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--green)' }}>
                  {cm?.true_positives}
                </div>
              </div>

              {/* False Positives */}
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: 14, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle style={{ width: 14, height: 14 }} />
                    <span>False Positives (FP)</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>
                    Benign customer transactions erroneously challenged.
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--amber)' }}>
                  {cm?.false_positives}
                </div>
              </div>

              {/* False Negatives */}
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: 14, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'var(--red)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle style={{ width: 14, height: 14 }} />
                    <span>False Negatives (FN - Evasions)</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>
                    Injected attacks that slipped past the current defense version.
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--red)' }}>
                  {cm?.false_negatives}
                </div>
              </div>

              {/* True Negatives */}
              <div style={{ background: '#090E1A', border: '1px solid var(--border-subtle)', padding: 14, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck style={{ width: 14, height: 14 }} />
                    <span>True Negatives (TN)</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>
                    Benign customer transactions correctly approved without friction.
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--cyan)' }}>
                  {cm?.true_negatives}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
