import React from 'react';
import {
  Bell,
  Smartphone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Shield,
  MessageSquare
} from 'lucide-react';
import { ForensicIncident } from '../../types';

interface VictimNotificationPanelProps {
  incident: ForensicIncident;
  onOpenModal: () => void;
  onResend: () => void;
}

export const VictimNotificationPanel: React.FC<VictimNotificationPanelProps> = ({
  incident,
  onOpenModal,
  onResend
}) => {
  const isReleased = incident.status === 'FALSE_POSITIVE_RELEASED';
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

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
              background: 'rgba(34, 211, 238, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan)'
            }}
          >
            <Bell style={{ width: 14, height: 14 }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              CUSTOMER PROTECTION
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              MULTI-CHANNEL INCIDENT NOTIFICATION
            </div>
          </div>
        </div>

        <span
          className="soc-badge"
          style={{
            background: incident.customerNotificationSent ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: incident.customerNotificationSent ? 'var(--green)' : 'var(--amber)',
            border: incident.customerNotificationSent ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
            fontSize: 9,
            fontWeight: 800
          }}
        >
          {incident.customerNotificationSent ? '✓ CUSTOMER NOTIFIED' : 'NOTIFICATION PENDING'}
        </span>
      </div>

      {/* Notification Preview Box */}
      <div
        style={{
          background: '#060A14',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            DISPATCHED MESSAGE PREVIEW:
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Smartphone style={{ width: 10, height: 10 }} /> SMS
            </span>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Mail style={{ width: 10, height: 10 }} /> EMAIL
            </span>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Bell style={{ width: 10, height: 10 }} /> IN-APP
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: 11,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.4,
            background: 'rgba(255,255,255,0.02)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '2px solid var(--cyan)'
          }}
        >
          “Suspicious activity has been detected on account {incident.sourceAccount} for {formatINR(incident.amount)}. Temporary protective measures have been applied while the transaction is reviewed.”
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onOpenModal}
          className="soc-btn soc-btn-primary"
          style={{ flex: 1, height: 30, fontSize: 10, justifyContent: 'center' }}
        >
          <Eye style={{ width: 12, height: 12 }} />
          <span>VIEW NOTICE</span>
        </button>

        <button
          onClick={onResend}
          className="soc-btn-ghost"
          style={{ height: 30, fontSize: 10, padding: '0 12px' }}
        >
          <RefreshCw style={{ width: 12, height: 12 }} />
          <span>RESEND NOTICE</span>
        </button>
      </div>
    </div>
  );
};
