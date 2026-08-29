import React, { useState } from 'react';
import { ShieldCheck, Key, Copy, Check, Terminal, FileCode, Database, Eye, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { ForensicEvidenceItem, ForensicIncident } from '../../types';

interface ForensicEvidencePanelProps {
  incident: ForensicIncident;
  evidenceItems: ForensicEvidenceItem[];
}

export const ForensicEvidencePanel: React.FC<ForensicEvidencePanelProps> = ({
  incident,
  evidenceItems
}) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(evidenceItems[0]?.id || null);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(incident.evidenceHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 3000);
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
        gap: 12
      }}
    >
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--green)'
            }}
          >
            <ShieldCheck style={{ width: 14, height: 14 }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              FORENSIC EVIDENCE & AUDIT LOGS
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              AUTHORIZED BANKING API LOG ENVELOPE • ZERO PII LEAKAGE
            </div>
          </div>
        </div>

        <span
          className="soc-badge"
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            color: 'var(--green)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            fontSize: 10,
            fontWeight: 800
          }}
        >
          ✓ EVIDENCE PRESERVED
        </span>
      </div>

      {/* Cryptographic Hash Verification Box */}
      <div
        style={{
          background: '#070B14',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Key style={{ width: 14, height: 14, color: 'var(--cyan)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              INTEGRITY HASH (SHA-256 SEAL)
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--cyan)',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {incident.evidenceHash}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            COLLECTED: {incident.evidenceCollectedAt}
          </span>
          <button
            onClick={handleCopyHash}
            className="soc-btn-ghost"
            style={{ padding: '2px 6px', height: 22, fontSize: 9, borderRadius: 3 }}
            title="Copy SHA-256 Hash"
          >
            {copiedHash ? <Check style={{ width: 11, height: 11, color: 'var(--green)' }} /> : <Copy style={{ width: 11, height: 11 }} />}
            <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* Evidence Items Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
        {evidenceItems.map((item) => {
          const isExp = expandedId === item.id;
          return (
            <div
              key={item.id}
              style={{
                background: '#080D18',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setExpandedId(isExp ? null : item.id)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isExp ? <ChevronDown style={{ width: 12, height: 12, color: 'var(--cyan)' }} /> : <ChevronRight style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />}
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', background: 'rgba(34, 211, 238, 0.1)', padding: '1px 5px', borderRadius: 3 }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#fff' }}>
                    {item.title}
                  </span>
                </div>

                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {item.timestamp}
                </span>
              </button>

              {isExp && (
                <div
                  style={{
                    padding: '8px 12px 10px 12px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: '#050811',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(item.details).map(([key, val], idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ color: 'var(--text-muted)', padding: '3px 0', width: '35%' }}>{key}</td>
                          <td style={{ color: '#fff', padding: '3px 0', fontWeight: 600 }}>{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
