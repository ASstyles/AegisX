import React from 'react';
import { Activity, ShieldAlert, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';
import { SimulationStatus } from '../types';

interface MetricCardsProps {
  status: SimulationStatus;
  detectionRate?: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ status, detectionRate = 60.7 }) => {
  const formatINR = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const cards = [
    {
      label: 'LIVE TRANSACTIONS',
      value: status.total_transactions.toLocaleString(),
      subtext: `${status.tps} TPS • ${status.is_running ? 'STREAMING' : 'PAUSED'}`,
      icon: Activity,
      color: 'var(--cyan)',
      borderColor: 'rgba(34, 211, 238, 0.3)'
    },
    {
      label: 'THREATS FLAGGED',
      value: status.threat_count.toString(),
      subtext: `${status.blocked_count} HARD BLOCKED`,
      icon: ShieldAlert,
      color: 'var(--red)',
      borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    {
      label: 'FRAUD BLOCKED',
      value: formatINR(status.total_blocked_inr),
      subtext: 'PREVENTED FINANCIAL LOSS',
      icon: ShieldCheck,
      color: 'var(--green)',
      borderColor: 'rgba(34, 197, 94, 0.3)'
    },
    {
      label: 'DETECTION RATE',
      value: `${detectionRate.toFixed(1)}%`,
      subtext: 'ON UNLABELED STREAM',
      icon: CheckCircle2,
      color: 'var(--cyan)',
      borderColor: 'rgba(34, 211, 238, 0.3)'
    },
    {
      label: 'DEFENSE VERSION',
      value: status.defense_version.split(' ')[0],
      subtext: status.defense_version.includes('Adaptive') ? 'ADAPTIVE-TUNED' : 'STANDARD BASELINE',
      icon: Cpu,
      color: 'var(--purple)',
      borderColor: 'rgba(139, 92, 246, 0.3)'
    }
  ];

  return (
    <div className="soc-kpi-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="soc-kpi-card"
            style={{ borderLeft: `3px solid ${card.color}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="soc-kpi-label">{card.label}</span>
              <Icon style={{ width: 16, height: 16, color: card.color }} />
            </div>

            <div className="soc-kpi-val" style={{ color: idx === 1 ? 'var(--red)' : '#fff' }}>
              {card.value}
            </div>

            <div className="soc-kpi-sub">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
