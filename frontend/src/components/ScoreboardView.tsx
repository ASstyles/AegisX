import React from 'react';
import { Trophy, Swords, Flame, Shield, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { ScoreboardData } from '../types';

interface ScoreboardViewProps {
  scoreboard: ScoreboardData | null;
  onAdaptDefense: () => void;
  isAdapting?: boolean;
}

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
  scoreboard,
  onAdaptDefense,
  isAdapting
}) => {
  if (!scoreboard) return null;

  const latestRound = scoreboard.rounds[scoreboard.rounds.length - 1];
  const overallDetection = latestRound?.blue_team.detection_rate || 61.0;
  const overallEvasion = latestRound?.red_team.attack_success_rate || 39.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Banner */}
      <div className="soc-panel" style={{ padding: '16px 20px', border: '1px solid var(--border-amber)', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, #0B1220 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--amber) 0%, var(--red) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <Swords style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                AI VS. AI ADVERSARIAL SCOREBOARD
              </span>
              <span className="soc-badge soc-badge-challenge">
                Round {scoreboard.current_round} Active
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Autonomous Red Team AI (Attack Synthesis) vs. Layered Blue Team AI (Unlabeled Detection)
            </p>
          </div>
        </div>

        <button
          onClick={onAdaptDefense}
          disabled={isAdapting}
          className="soc-btn soc-btn-primary"
          style={{ height: 34 }}
        >
          <Sparkles style={{ width: 14, height: 14, fill: '#000' }} />
          <span>{isAdapting ? 'Upgrading Defense...' : 'Trigger Adaptive Learning Round'}</span>
        </button>
      </div>

      {/* Large Center Battle Visual */}
      <div className="soc-panel" style={{ padding: 24, background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, #0B1220 50%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', textAlign: 'center' }}>
          {/* Red Team Evasion */}
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: 18, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase' }}>
              <Flame style={{ width: 15, height: 15 }} />
              <span>Red Team Evasion Rate</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--red)', marginTop: 4 }}>
              {overallEvasion.toFixed(1)}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Unmitigated Adversarial Evasions
            </div>
          </div>

          {/* Center VS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#080D18', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
              <Swords style={{ width: 22, height: 22 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
              BATTLE LEAD: BLUE TEAM
            </span>
          </div>

          {/* Blue Team Detection */}
          <div style={{ background: 'rgba(34, 211, 238, 0.12)', border: '1px solid rgba(34, 211, 238, 0.35)', padding: 18, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase' }}>
              <Shield style={{ width: 15, height: 15 }} />
              <span>Blue Team Detection Rate</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--cyan)', marginTop: 4 }}>
              {overallDetection.toFixed(1)}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Strictly Unlabeled Stream Inference
            </div>
          </div>
        </div>

        {/* Progress Duel Bar */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            <span style={{ color: 'var(--red)' }}>Red Team Evasion ({overallEvasion.toFixed(1)}%)</span>
            <span style={{ color: 'var(--cyan)' }}>Blue Team Detection ({overallDetection.toFixed(1)}%)</span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#080D18', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${overallEvasion}%`, background: 'var(--red)', transition: 'width 0.6s ease' }} />
            <div style={{ width: `${overallDetection}%`, background: 'linear-gradient(90deg, var(--cyan) 0%, var(--blue) 100%)', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

      {/* Round Timeline Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Round History ({scoreboard.rounds.length} Rounds)
        </div>

        {scoreboard.rounds.map((round) => (
          <div key={round.round_number} className="soc-panel" style={{ padding: 14, background: '#0B1220' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 800, background: '#080D18', color: 'var(--cyan)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>
                  R{round.round_number}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {round.title}
                </span>
              </div>
              <span className="soc-badge soc-badge-approve">
                <Trophy style={{ width: 12, height: 12 }} />
                BLUE TEAM VICTORY
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: '#080D18', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Red Team Injections:</span> <span style={{ color: '#fff', fontWeight: 700 }}>{round.red_team.attacks_generated}</span> (Evasions: <span style={{ color: 'var(--red)', fontWeight: 700 }}>{round.red_team.evasions}</span>)
              </div>
              <div style={{ background: '#080D18', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Blue Team Mitigations:</span> <span style={{ color: 'var(--green)', fontWeight: 700 }}>{round.blue_team.attacks_detected}</span> ({round.blue_team.defense_version.split(' ')[0]})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
