import React from 'react';
import {
  Activity,
  Flame,
  Shield,
  Search,
  Eye,
  Swords,
  Database,
  ChevronLeft,
  ChevronRight,
  Lock,
  Wifi,
  Radio,
  GitFork
} from 'lucide-react';
import { SimulationStatus } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  status: SimulationStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  status
}) => {
  const navItems = [
    { id: 'DASHBOARD', label: 'DASHBOARD', icon: Activity, accent: 'var(--cyan)' },
    { id: 'ATTACK_LAB', label: 'RED TEAM LAB', icon: Flame, accent: 'var(--red)' },
    { id: 'DEFENSE_CENTER', label: 'BLUE TEAM DEFENSE', icon: Shield, accent: 'var(--blue)' },
    { id: 'INVESTIGATION', label: 'INVESTIGATION', icon: Search, accent: 'var(--green)' },
    { id: 'TRANSACTION_FORENSICS', label: 'TRANSACTION FORENSICS', icon: GitFork, accent: 'var(--cyan)' },
    { id: 'EVALUATION', label: 'EVALUATION', icon: Eye, accent: 'var(--purple)' },
    { id: 'SCOREBOARD', label: 'AI vs AI BATTLE', icon: Swords, accent: 'var(--amber)' },
    { id: 'BENCHMARKS', label: 'BENCHMARKS', icon: Database, accent: 'var(--text-secondary)' }
  ];

  return (
    <aside className={`soc-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Top Branding */}
      <div>
        <div className="soc-sidebar-header">
          {!isCollapsed ? (
            <div className="soc-brand-box">
              <div className="soc-logo-icon">
                <Shield style={{ width: 18, height: 18, strokeWidth: 2.5 }} />
              </div>
              <div>
                <div className="soc-brand-title">
                  AEGIS<span>X</span>
                </div>
                <div className="soc-brand-subtitle">
                  AI Defense Lab
                </div>
              </div>
            </div>
          ) : (
            <div className="soc-logo-icon" style={{ margin: '0 auto' }}>
              <Shield style={{ width: 18, height: 18, strokeWidth: 2.5 }} />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="soc-btn-ghost"
            style={{ padding: 4, borderRadius: 4, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
          </button>
        </div>

        {/* Sub-label banner */}
        {!isCollapsed && (
          <div style={{ padding: '8px 16px 4px 16px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Payment Security • GFF 2026
          </div>
        )}

        {/* Navigation Items */}
        <nav className="soc-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`soc-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
                style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              >
                <Icon
                  style={{
                    width: 17,
                    height: 17,
                    flexShrink: 0,
                    color: isActive ? item.accent : 'var(--text-secondary)'
                  }}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Box */}
      <div className="soc-sidebar-footer">
        {!isCollapsed ? (
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              System Status
            </div>

            <div className="soc-status-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wifi style={{ width: 12, height: 12, color: 'var(--green)' }} />
                <span>BACKEND</span>
              </span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>ONLINE</span>
            </div>

            <div className="soc-status-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Radio style={{ width: 12, height: 12, color: status.is_running ? 'var(--cyan)' : 'var(--text-muted)' }} />
                <span>STREAM</span>
              </span>
              <span style={{ color: status.is_running ? 'var(--cyan)' : 'var(--text-muted)', fontWeight: 700 }}>
                {status.is_running ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>

            <div className="soc-status-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock style={{ width: 12, height: 12, color: 'var(--purple)' }} />
                <span>GROUND TRUTH</span>
              </span>
              <span style={{ color: 'var(--purple)', fontWeight: 700 }}>ISOLATED</span>
            </div>

            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>DEFENSE</span>
              <span style={{ color: 'var(--purple)', fontWeight: 700 }}>{status.defense_version.split(' ')[0]}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} title="Backend Online" />
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: status.is_running ? 'var(--cyan)' : 'var(--text-muted)'
              }}
              className={status.is_running ? 'pulse-dot' : ''}
              title={status.is_running ? 'Stream Active' : 'Stream Idle'}
            />
            <Lock style={{ width: 14, height: 14, color: 'var(--purple)' }} />
          </div>
        )}
      </div>
    </aside>
  );
};
