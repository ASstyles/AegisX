import React, { useState } from 'react';
import { Transaction } from '../types';
import { Radio, Search, Filter, ShieldAlert, ArrowRight } from 'lucide-react';
import { formatISTTime } from '../utils/timezone';

interface LiveFeedProps {
  transactions: Transaction[];
  onSelectTxn: (txn: Transaction) => void;
  isStreaming?: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({
  transactions,
  onSelectTxn,
  isStreaming = true
}) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = transactions.filter((t) => {
    if (filterAction !== 'ALL' && t.decision !== filterAction) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.transaction_id.toLowerCase().includes(q) ||
        t.customer_id.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.merchant_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getBadgeClass = (action: string) => {
    switch (action) {
      case 'BLOCK': return 'soc-badge-block';
      case 'CHALLENGE': return 'soc-badge-challenge';
      case 'MONITOR': return 'soc-badge-monitor';
      default: return 'soc-badge-approve';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'var(--red)';
    if (score >= 60) return 'var(--amber)';
    if (score >= 30) return 'var(--cyan)';
    return 'var(--green)';
  };

  return (
    <div className="soc-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Table Header Controls */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
            LIVE UNLABELED TRANSACTION FEED
          </span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', background: 'rgba(34, 211, 238, 0.1)', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(34, 211, 238, 0.3)' }}>
            {filtered.length} visible
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Action Filter Pills */}
          <div style={{ display: 'flex', gap: 3, background: '#080D18', padding: 2, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            {['ALL', 'BLOCK', 'CHALLENGE', 'MONITOR', 'APPROVE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterAction(f)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 3,
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  background: filterAction === f ? (f === 'BLOCK' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 211, 238, 0.2)') : 'transparent',
                  color: filterAction === f ? (f === 'BLOCK' ? 'var(--red)' : 'var(--cyan)') : 'var(--text-muted)',
                  border: filterAction === f ? (f === 'BLOCK' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(34, 211, 238, 0.4)') : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <input
            type="text"
            placeholder="Search txn / customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: '#070B14',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              width: 140,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="soc-table-container" style={{ maxHeight: 480, overflowY: 'auto' }}>
        <table className="soc-table">
          <thead>
            <tr>
              <th>TIME (IST)</th>
              <th>TXN ID</th>
              <th>CUSTOMER</th>
              <th>AMOUNT</th>
              <th>LOCATION</th>
              <th>DEVICE</th>
              <th style={{ textAlign: 'right' }}>RISK</th>
              <th style={{ textAlign: 'center' }}>ACTION</th>
              <th style={{ textAlign: 'center' }}>INSPECT</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No live transactions matching current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isBlock = t.decision === 'BLOCK';
                const isChallenge = t.decision === 'CHALLENGE';
                const timeStr = formatISTTime(t.timestamp);

                return (
                  <tr
                    key={t.transaction_id}
                    onClick={() => onSelectTxn(t)}
                    className={isBlock ? 'threat-row-block' : isChallenge ? 'threat-row-challenge' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ color: 'var(--text-muted)' }}>{timeStr}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{t.transaction_id}</td>
                    <td style={{ color: 'var(--cyan)' }}>{t.customer_id}</td>
                    <td style={{ fontWeight: 700, color: isBlock ? 'var(--red)' : '#fff' }}>
                      ₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.city}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 10 }}>{t.device_id}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: getRiskColor(t.risk_score) }}>
                      {t.risk_score}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`soc-badge ${getBadgeClass(t.decision)}`}>
                        {t.decision}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTxn(t);
                        }}
                        className="soc-btn-ghost"
                        style={{ padding: '3px 8px', height: 22, fontSize: 9, borderRadius: 3 }}
                      >
                        CASE
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', background: '#080D18', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>Showing latest live transactions in memory</span>
        <span style={{ color: 'var(--cyan)' }}>Click any row to open forensic case file</span>
      </div>
    </div>
  );
};
