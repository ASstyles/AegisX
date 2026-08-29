import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Lock,
  Unlock,
  CreditCard,
  Building,
  Smartphone,
  Globe,
  Coins,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Gauge
} from 'lucide-react';
import { ForensicAccountNode } from '../../types';

interface AccountDetailDrawerProps {
  node: ForensicAccountNode | null;
  onClose: () => void;
  onToggleNodeContainment: (nodeId: string) => void;
}

export const AccountDetailDrawer: React.FC<AccountDetailDrawerProps> = ({
  node,
  onClose,
  onToggleNodeContainment
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!node) return null;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(node.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isContained = node.status === 'CONTAINED' || node.status === 'FLAGGED';

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SOURCE': return { text: 'ORIGIN / SOURCE', color: 'var(--cyan)', bg: 'rgba(34, 211, 238, 0.15)' };
      case 'HIGH_RISK': return { text: 'HIGH RISK / REQUIRES REVIEW', color: 'var(--red)', bg: 'rgba(239, 68, 68, 0.2)' };
      case 'SUSPICIOUS': return { text: 'SUSPICIOUS PATTERN', color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.2)' };
      case 'TERMINUS': return { text: 'FINAL DESTINATION / CASHOUT', color: '#c084fc', bg: 'rgba(139, 92, 246, 0.2)' };
      default: return { text: 'INTERMEDIATE NODE', color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.06)' };
    }
  };

  const roleStyle = getRoleBadge(node.nodeRole);

  return (
    <div
      className="soc-panel"
      style={{
        padding: 16,
        background: '#090E1A',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Drawer Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: node.isSource
                ? 'rgba(34, 211, 238, 0.2)'
                : isContained
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: node.isSource ? 'var(--cyan)' : isContained ? 'var(--red)' : 'var(--amber)'
            }}
          >
            {node.isSource ? <CreditCard style={{ width: 15, height: 15 }} /> : <ShieldAlert style={{ width: 15, height: 15 }} />}
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff' }}>
              ACCOUNT DETAILS
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              TYPE: {node.accountType || 'ANONYMIZED'} • DEPTH LEVEL {node.level}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="soc-btn-ghost"
          style={{ width: 24, height: 24, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Account Number & Role Banner */}
      <div
        style={{
          background: '#060A14',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 800, color: node.isSource ? 'var(--cyan)' : '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{node.accountNumber}</span>
            <button
              onClick={handleCopy}
              className="soc-btn-ghost"
              style={{ padding: '2px 4px', height: 18, fontSize: 8 }}
              title="Copy Account ID"
            >
              {copied ? <Check style={{ width: 10, height: 10, color: 'var(--green)' }} /> : <Copy style={{ width: 10, height: 10 }} />}
            </button>
          </div>

          <div
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: roleStyle.color,
              background: roleStyle.bg,
              padding: '2px 6px',
              borderRadius: 3,
              display: 'inline-block',
              marginTop: 4
            }}
          >
            {roleStyle.text}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: node.riskScore >= 75 ? 'var(--red)' : node.riskScore >= 50 ? 'var(--amber)' : 'var(--green)'
            }}
          >
            {node.riskScore} / 100
          </div>
          <span
            className="soc-badge"
            style={{
              fontSize: 8,
              fontWeight: 800,
              background: isContained ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 211, 238, 0.2)',
              color: isContained ? 'var(--red)' : 'var(--cyan)'
            }}
          >
            {node.status}
          </span>
        </div>
      </div>

      {/* Inbound vs Outbound Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontFamily: 'var(--font-mono)' }}>
        <div style={{ background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 8, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowDownLeft style={{ width: 10, height: 10, color: 'var(--cyan)' }} />
            INCOMING ({node.incomingTransactionsCount} TXNS)
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--cyan)', marginTop: 2 }}>
            {formatINR(node.totalIncomingAmount)}
          </div>
        </div>

        <div style={{ background: '#070B14', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 8, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight style={{ width: 10, height: 10, color: 'var(--text-secondary)' }} />
            OUTGOING ({node.outgoingTransactionsCount} TXNS)
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', marginTop: 2 }}>
            {formatINR(node.totalOutgoingAmount)}
          </div>
        </div>
      </div>

      {/* Detailed Telemetry List */}
      <div style={{ background: '#060A14', borderRadius: 'var(--radius-sm)', padding: '8px 10px', border: '1px solid var(--border-subtle)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 8, textTransform: 'uppercase', marginBottom: 4 }}>
          TRANSACTION & CONNECTIVITY TELEMETRY
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>REMAINING BALANCE:</span>
            <span style={{ color: node.remainingBalance > 0 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }}>
              {formatINR(node.remainingBalance)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>CONNECTED ACCOUNTS:</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>{node.connectedAccountsCount} Peers</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>TRANSACTION VELOCITY:</span>
            <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{node.transactionVelocity} txns/hour</span>
          </div>

          {node.devices && node.devices.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 4, marginTop: 2 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 8 }}>ASSOCIATED DEVICES:</div>
              <div style={{ color: '#fff', fontSize: 9, marginTop: 1 }}>
                {node.devices.join(', ')}
              </div>
            </div>
          )}

          {node.ipAddresses && node.ipAddresses.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 4, marginTop: 2 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 8 }}>IP ROUTING:</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 9, marginTop: 1 }}>
                {node.ipAddresses.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action containment toggle for this account */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button
          onClick={() => onToggleNodeContainment(node.id)}
          className={isContained ? 'soc-btn soc-btn-ghost' : 'soc-btn soc-btn-primary'}
          style={{ flex: 1, height: 28, fontSize: 10, justifyContent: 'center' }}
        >
          {isContained ? (
            <>
              <Unlock style={{ width: 12, height: 12 }} />
              <span>RELEASE HOLD</span>
            </>
          ) : (
            <>
              <Lock style={{ width: 12, height: 12 }} />
              <span>APPLY TEMPORARY HOLD</span>
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="soc-btn-ghost"
          style={{ height: 28, fontSize: 10, padding: '0 10px' }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
