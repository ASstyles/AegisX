import React, { useState } from 'react';
import {
  Clock,
  ShieldAlert,
  Lock,
  Mail,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Filter
} from 'lucide-react';
import { ForensicTimelineEvent } from '../../types';

interface InvestigationTimelineProps {
  events: ForensicTimelineEvent[];
}

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  const getEventIcon = (type: string, severity: string) => {
    switch (type) {
      case 'ALERT': return <ShieldAlert style={{ width: 12, height: 12, color: severity === 'CRITICAL' ? 'var(--red)' : 'var(--amber)' }} />;
      case 'CONTAINMENT': return <Lock style={{ width: 12, height: 12, color: 'var(--cyan)' }} />;
      case 'NOTIFICATION': return <Mail style={{ width: 12, height: 12, color: '#c084fc' }} />;
      case 'EVIDENCE': return <FileCheck style={{ width: 12, height: 12, color: 'var(--green)' }} />;
      case 'CASE': return <CheckCircle2 style={{ width: 12, height: 12, color: '#3b82f6' }} />;
      default: return <Activity style={{ width: 12, height: 12, color: 'var(--cyan)' }} />;
    }
  };

  const getSeverityBadgeColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return { bg: 'rgba(239, 68, 68, 0.25)', text: 'var(--red)', border: 'rgba(239, 68, 68, 0.4)' };
      case 'HIGH': return { bg: 'rgba(245, 158, 11, 0.2)', text: 'var(--amber)', border: 'rgba(245, 158, 11, 0.4)' };
      case 'SUCCESS': return { bg: 'rgba(34, 197, 94, 0.2)', text: 'var(--green)', border: 'rgba(34, 197, 94, 0.4)' };
      default: return { bg: 'rgba(34, 211, 238, 0.15)', text: 'var(--cyan)', border: 'rgba(34, 211, 238, 0.3)' };
    }
  };

  return (
    <div
      className="soc-panel"
      style={{
        padding: 16,
        background: '#0B1220',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%'
      }}
    >
      {/* Header with Type Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock style={{ width: 15, height: 15, color: 'var(--cyan)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
            INVESTIGATION TIMELINE & EVENT LOG
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 3, background: '#070B14', padding: 2, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {['ALL', 'ALERT', 'CONTAINMENT', 'NOTIFICATION', 'EVIDENCE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 8,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: filterType === f ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                color: filterType === f ? 'var(--cyan)' : 'var(--text-muted)',
                border: filterType === f ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline Items List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxHeight: 460,
          overflowY: 'auto',
          paddingRight: 4
        }}
      >
        {filtered.map((item, idx) => {
          const sevStyle = getSeverityBadgeColor(item.severity);
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: 10,
                position: 'relative',
                animation: item.isNew ? 'fadeInSlide 0.3s ease-out' : undefined
              }}
            >
              {/* Left Time Column */}
              <div
                style={{
                  minWidth: 54,
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  paddingTop: 2
                }}
              >
                {item.time}
              </div>

              {/* Vertical Step Connector Line & Dot */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#070B14',
                    border: `1px solid ${sevStyle.text}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    flexShrink: 0
                  }}
                >
                  {getEventIcon(item.type, item.severity)}
                </div>

                {idx < filtered.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      margin: '3px 0'
                    }}
                  />
                )}
              </div>

              {/* Right Event Content Box */}
              <div
                style={{
                  flex: 1,
                  background: '#070B14',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 10px',
                  marginBottom: 2
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff' }}>
                    {item.title}
                  </span>

                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: sevStyle.bg,
                      color: sevStyle.text,
                      border: `1px solid ${sevStyle.border}`
                    }}
                  >
                    {item.type}
                  </span>
                </div>

                <p style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', marginTop: 2, lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
