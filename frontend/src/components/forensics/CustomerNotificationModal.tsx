import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Mail,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  Lock
} from 'lucide-react';
import { ForensicIncident } from '../../types';

interface CustomerNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: ForensicIncident;
  onSimulateVictimResponse: (isFraud: boolean) => void;
}

export const CustomerNotificationModal: React.FC<CustomerNotificationModalProps> = ({
  isOpen,
  onClose,
  incident,
  onSimulateVictimResponse
}) => {
  const [activeChannel, setActiveChannel] = useState<'SMS' | 'EMAIL' | 'PUSH'>('SMS');
  const [responseSubmitted, setResponseSubmitted] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const handleVictimAction = (isFraud: boolean) => {
    setResponseSubmitted(isFraud ? 'FRAUD_CONFIRMED' : 'LEGITIMATE_CONFIRMED');
    setTimeout(() => {
      onSimulateVictimResponse(isFraud);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 6, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#0B1220',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInSlide 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#080D18'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(34, 211, 238, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)'
              }}
            >
              <Smartphone style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                CUSTOMER PROTECTION DIALOG
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                ACCOUNT: {incident.sourceAccount} • MULTI-CHANNEL DISPATCH
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="soc-btn-ghost"
            style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#090E1A' }}>
          {/* Channel Selector */}
          <div style={{ display: 'flex', gap: 8, background: '#060A14', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveChannel('SMS')}
              className={activeChannel === 'SMS' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
              style={{ flex: 1, height: 28, fontSize: 10, justifyContent: 'center' }}
            >
              <Smartphone style={{ width: 12, height: 12 }} />
              <span>SMS ALERT</span>
            </button>

            <button
              onClick={() => setActiveChannel('EMAIL')}
              className={activeChannel === 'EMAIL' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
              style={{ flex: 1, height: 28, fontSize: 10, justifyContent: 'center' }}
            >
              <Mail style={{ width: 12, height: 12 }} />
              <span>EMAIL ADVISORY</span>
            </button>

            <button
              onClick={() => setActiveChannel('PUSH')}
              className={activeChannel === 'PUSH' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
              style={{ flex: 1, height: 28, fontSize: 10, justifyContent: 'center' }}
            >
              <Bell style={{ width: 12, height: 12 }} />
              <span>IN-APP PUSH</span>
            </button>
          </div>

          {/* Simulated Mobile Device Preview */}
          <div
            style={{
              background: '#040711',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>FROM: BANK SECURITY DFIR CENTER</span>
              <span style={{ fontSize: 9, color: 'var(--cyan)' }}>{incident.detectionTime}</span>
            </div>

            <div style={{ fontSize: 11, color: '#fff', lineHeight: 1.5 }}>
              🚨 <strong>SECURITY ALERT:</strong> A suspicious transfer of{' '}
              <strong style={{ color: 'var(--red)' }}>{formatINR(incident.amount)}</strong> from account{' '}
              <strong>{incident.sourceAccount}</strong> was flagged for review.
              <br />
              Temporary protective measures have been applied across the transfer route.
            </div>

            {/* Interactive Response Simulator */}
            <div style={{ marginTop: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                SIMULATE CUSTOMER RESPONSE:
              </div>

              {responseSubmitted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: responseSubmitted === 'FRAUD_CONFIRMED' ? 'var(--red)' : 'var(--green)', fontSize: 11, fontWeight: 700, padding: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>
                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                  <span>RESPONSE RECORDED: {responseSubmitted === 'FRAUD_CONFIRMED' ? 'UNAUTHORIZED FRAUD CONFIRMED' : 'LEGITIMATE ACTIVITY CONFIRMED'}</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => handleVictimAction(true)}
                    className="soc-btn soc-btn-red"
                    style={{ height: 34, fontSize: 10, justifyContent: 'center' }}
                  >
                    <AlertTriangle style={{ width: 13, height: 13 }} />
                    <span>“NO, THIS IS FRAUD!”</span>
                  </button>

                  <button
                    onClick={() => handleVictimAction(false)}
                    className="soc-btn soc-btn-green"
                    style={{ height: 34, fontSize: 10, justifyContent: 'center' }}
                  >
                    <CheckCircle2 style={{ width: 13, height: 13 }} />
                    <span>“YES, I AUTHORIZED THIS”</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
