import React from 'react';
import { Transaction, SimulationStatus, ScoreboardData } from '../types';
import { MissionBanner } from '../components/MissionBanner';
import { ThreeWorldVisualizer } from '../components/ThreeWorldVisualizer';
import { MetricCards } from '../components/MetricCards';
import { LiveFeed } from '../components/LiveFeed';
import { ThreatIntelPanel } from '../components/ThreatIntelPanel';
import { NetworkGraph } from '../components/NetworkGraph';

interface DashboardProps {
  status: SimulationStatus;
  transactions: Transaction[];
  scoreboard: ScoreboardData | null;
  onInvestigate: (txn: Transaction) => void;
  onQuickAttack: (attackType: string, target: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  status,
  transactions,
  scoreboard,
  onInvestigate,
  onQuickAttack,
  onNavigateTab
}) => {
  const latestThreat = transactions.find((t) => t.decision === 'BLOCK' || t.decision === 'CHALLENGE') || transactions[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Hero Mission Banner (Section 8) */}
      <MissionBanner />

      {/* 2. Three-World Architecture Strip (Section 11) */}
      <ThreeWorldVisualizer />

      {/* 3. KPI 5-Card Row (Section 9) */}
      <MetricCards
        status={status}
        detectionRate={scoreboard?.rounds?.[scoreboard.rounds.length - 1]?.blue_team?.detection_rate || 60.7}
      />

      {/* 4. Main 2-Column Dashboard Grid (Section 10) */}
      <div className="soc-dash-grid">
        {/* Left Column: Live Unlabeled Transaction Stream Feed */}
        <div>
          <LiveFeed
            transactions={transactions}
            onSelectTxn={onInvestigate}
            isStreaming={status.is_running}
          />
        </div>

        {/* Right Column: Threat Intelligence & Entity Network */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ThreatIntelPanel
            latestThreat={latestThreat}
            onInvestigate={onInvestigate}
            onQuickAttack={onQuickAttack}
          />

          <NetworkGraph />
        </div>
      </div>
    </div>
  );
};
