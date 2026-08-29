import React from 'react';
import {
  Briefcase,
  FileText,
  UserCheck,
  Download,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Shield,
  Layers,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { ForensicIncident } from '../../types';

interface CaseManagementPanelProps {
  incident: ForensicIncident;
  onConfirmFraud: () => void;
  onMarkFalsePositive: () => void;
  onOpenEvidence: () => void;
  onOpenExportModal: () => void;
  onAssignInvestigator?: () => void;
}

export const CaseManagementPanel: React.FC<CaseManagementPanelProps> = ({
  incident,
  onConfirmFraud,
  onMarkFalsePositive,
  onOpenEvidence,
  onOpenExportModal,
  onAssignInvestigator
}) => {
  const isReleased = incident.status === 'FALSE_POSITIVE_RELEASED';
  const isFraud = incident.status === 'FRAUD_CONFIRMED';

  const workflowSteps = [
    { label: 'DETECTION', done: true },
    { label: 'TXN ANALYSIS', done: true },
    { label: 'CHAIN RECONSTRUCT', done: true },
    { label: 'RISK SCORE', done: true },
    { label: '24H CONTAINMENT', done: !isReleased },
    { label: 'NOTIFY CUSTOMER', done: incident.customerNotificationSent },
    { label: 'DISPOSITION', done: isFraud || isReleased }
  ];

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
      {/* Header */}
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
            <Briefcase style={{ width: 14, height: 14 }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
              CASE MANAGEMENT
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              CASE ID: {incident.caseId} • INVESTIGATION WORKFLOW
            </div>
          </div>
        </div>

        <span
          className="soc-badge"
          style={{
            background: isReleased ? 'rgba(34, 197, 94, 0.2)' : isFraud ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: isReleased ? 'var(--green)' : isFraud ? 'var(--red)' : 'var(--amber)',
            fontSize: 9,
            fontWeight: 800
          }}
        >
          {isReleased ? 'LEGITIMATE / UNFREEZE' : isFraud ? 'FRAUD CONFIRMED' : 'AWAITING CUSTOMER RESPONSE'}
        </span>
      </div>

      {/* 7-Step Horizontal Flowchart */}
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
        <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          INVESTIGATION PIPELINE STAGES
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, overflowX: 'auto' }}>
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 6px',
                  borderRadius: 3,
                  background: step.done ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255,255,255,0.03)',
                  border: step.done ? '1px solid rgba(34, 211, 238, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: step.done ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
                    color: '#000',
                    fontSize: 7,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {idx + 1}
                </div>
                <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', fontWeight: 700, color: step.done ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {step.label}
                </span>
              </div>

              {idx < workflowSteps.length - 1 && (
                <ArrowRight style={{ width: 10, height: 10, color: 'var(--text-muted)', flexShrink: 0 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Decision / Disposition Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          onClick={onConfirmFraud}
          disabled={isFraud}
          className={isFraud ? 'soc-btn soc-btn-ghost' : 'soc-btn soc-btn-red'}
          style={{ height: 32, fontSize: 10, justifyContent: 'center' }}
        >
          <AlertOctagon style={{ width: 13, height: 13 }} />
          <span>CONFIRM SUSPICIOUS FRAUD</span>
        </button>

        <button
          onClick={onMarkFalsePositive}
          disabled={isReleased}
          className={isReleased ? 'soc-btn soc-btn-ghost' : 'soc-btn soc-btn-green'}
          style={{ height: 32, fontSize: 10, justifyContent: 'center' }}
        >
          <CheckCircle2 style={{ width: 13, height: 13 }} />
          <span>LEGITIMATE / UNFREEZE</span>
        </button>
      </div>

      {/* Secondary Tools: Evidence, Assign, Export */}
      <div style={{ display: 'flex', gap: 6, paddingTop: 2 }}>
        <button
          onClick={onOpenEvidence}
          className="soc-btn-ghost"
          style={{ flex: 1, height: 28, fontSize: 9, justifyContent: 'center' }}
        >
          <FileText style={{ width: 11, height: 11, color: 'var(--cyan)' }} />
          <span>VIEW EVIDENCE</span>
        </button>

        <button
          onClick={onAssignInvestigator || onOpenEvidence}
          className="soc-btn-ghost"
          style={{ flex: 1, height: 28, fontSize: 9, justifyContent: 'center' }}
        >
          <UserCheck style={{ width: 11, height: 11, color: 'var(--green)' }} />
          <span>ASSIGN INVESTIGATOR</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="soc-btn-ghost"
          style={{ flex: 1, height: 28, fontSize: 9, justifyContent: 'center', color: '#c084fc', borderColor: 'rgba(139,92,246,0.3)' }}
        >
          <Download style={{ width: 11, height: 11 }} />
          <span>EXPORT REPORT</span>
        </button>
      </div>
    </div>
  );
};
