import React from 'react';
import {
  Activity,
  Users,
  ShieldAlert,
  Search,
  AlertTriangle,
  GitFork,
  Coins
} from 'lucide-react';
import { DynamicInvestigationMetrics } from '../../types';

interface InvestigationSummaryCardsProps {
  metrics: DynamicInvestigationMetrics;
}

export const InvestigationSummaryCards: React.FC<InvestigationSummaryCardsProps> = ({ metrics }) => {
  const formatINR = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const cards = [
    {
      label: 'TOTAL TRANSACTIONS',
      value: metrics.totalTransactions.toLocaleString(),
      subtext: 'INGESTED IN DATASET',
      icon: Activity,
      color: 'var(--cyan)',
      valueColor: '#fff'
    },
    {
      label: 'ACCOUNTS ANALYZED',
      value: metrics.accountsAnalyzed.toLocaleString(),
      subtext: 'UNIQUE ANONYMIZED NODES',
      icon: Users,
      color: 'var(--blue)',
      valueColor: '#fff'
    },
    {
      label: 'SUSPICIOUS TRANSACTIONS',
      value: metrics.suspiciousTransactions.toLocaleString(),
      subtext: 'RISK SCORE ≥ 60/100',
      icon: ShieldAlert,
      color: 'var(--red)',
      valueColor: 'var(--red)'
    },
    {
      label: 'ACTIVE INVESTIGATIONS',
      value: metrics.activeInvestigations.toString(),
      subtext: 'ORIGIN TREES FLAGGED',
      icon: Search,
      color: 'var(--amber)',
      valueColor: 'var(--amber)'
    },
    {
      label: 'HIGH-RISK ACCOUNTS',
      value: metrics.highRiskAccounts.toString(),
      subtext: 'REQUIRES REVIEW',
      icon: AlertTriangle,
      color: 'var(--red)',
      valueColor: 'var(--red)'
    },
    {
      label: 'CHAINS IDENTIFIED',
      value: metrics.chainsIdentified.toString(),
      subtext: 'DISTRIBUTION TREES',
      icon: GitFork,
      color: 'var(--purple)',
      valueColor: '#c084fc'
    },
    {
      label: 'FUNDS UNDER REVIEW',
      value: formatINR(metrics.fundsUnderReview),
      subtext: 'FLAGGED TRANSACTION VOLUME',
      icon: Coins,
      color: 'var(--cyan)',
      valueColor: 'var(--cyan)'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 10
      }}
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="soc-kpi-card"
            style={{
              borderLeft: `3px solid ${card.color}`,
              minHeight: 92,
              padding: '10px 12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="soc-kpi-label" style={{ fontSize: 9 }}>{card.label}</span>
              <Icon style={{ width: 13, height: 13, color: card.color }} />
            </div>

            <div
              className="soc-kpi-val"
              style={{
                color: card.valueColor,
                fontSize: 18,
                marginTop: 2
              }}
            >
              {card.value}
            </div>

            <div className="soc-kpi-sub" style={{ fontSize: 8 }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
