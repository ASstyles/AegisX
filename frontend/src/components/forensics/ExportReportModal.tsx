import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Copy,
  Check,
  Code,
  Shield,
  Briefcase
} from 'lucide-react';
import {
  ForensicIncident,
  ForensicAccountNode,
  ForensicTransactionEdge,
  DynamicInvestigationMetrics
} from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: ForensicIncident;
  nodes: ForensicAccountNode[];
  edges: ForensicTransactionEdge[];
  metrics: DynamicInvestigationMetrics;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  incident,
  nodes,
  edges,
  metrics
}) => {
  const [format, setFormat] = useState<'TEXT' | 'JSON'>('TEXT');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const generateTextReport = () => {
    return `================================================================================
AEGISX CYBER FORENSICS & DFIR CASE REPORT
CASE IDENTIFIER: ${incident.caseId}
INCIDENT REFERENCE: ${incident.incidentId}
EVIDENCE HASH: ${incident.evidenceHash}
================================================================================
1. INCIDENT OVERVIEW
--------------------------------------------------------------------------------
- Date/Time Detected: ${incident.detectionTime} IST
- Source Account: ${incident.sourceAccount}
- Flagged Amount: ${formatINR(incident.amount)}
- Risk Score: ${incident.riskScore} / 100
- Chain Status: ${incident.status}
- Unique Accounts Traced: ${metrics.accountsAnalyzed}
- Total Transactions: ${metrics.totalTransactions}
- Max Chain Depth: ${incident.chainDepth} Levels
- Recoverable Funds Under Hold: ${formatINR(incident.recoverableAmount)}

2. ANONYMIZED TRANSACTION DISTRIBUTION NETWORK
--------------------------------------------------------------------------------
${edges
  .map(
    (e, idx) =>
      `[HOP ${idx + 1}] TXN: ${e.id} | ${e.sourceAccount} --> ${e.destinationAccount} | ${formatINR(
        e.amount
      )} | RAIL: ${e.rail} | STATUS: ${e.status} | RISK: ${e.riskScore}`
  )
  .join('\n')}

3. ACCOUNT NODES SUMMARY
--------------------------------------------------------------------------------
${nodes
  .map(
    (n) =>
      `- ${n.accountNumber} | Role: ${n.nodeRole} | L${n.level} | In: ${formatINR(
        n.totalIncomingAmount
      )} | Out: ${formatINR(n.totalOutgoingAmount)} | Status: ${n.status} | Risk: ${n.riskScore}`
  )
  .join('\n')}

4. DFIR ACTIONS & MITIGATION
--------------------------------------------------------------------------------
- Automated 24-Hour Containment: SIMULATED PRECAUTIONARY HOLD
- Customer Advisory Dispatched: YES (SMS, EMAIL, IN-APP)
- Evidence State: CRYPTOGRAPHICALLY PRESERVED (SHA-256)
- Investigator Assigned: ${incident.investigatorAssigned}

================================================================================
END OF REPORT - CONFIDENTIAL BANKING INCIDENT RECORD
================================================================================`;
  };

  const generateJsonReport = () => {
    return JSON.stringify(
      {
        case_report: {
          case_id: incident.caseId,
          incident_id: incident.incidentId,
          evidence_hash: incident.evidenceHash,
          detection_time: incident.detectionTime,
          source_account: incident.sourceAccount,
          amount: incident.amount,
          recoverable_amount: incident.recoverableAmount,
          risk_score: incident.riskScore,
          status: incident.status,
          metrics,
          accounts: nodes.map((n) => ({
            id: n.id,
            account_number: n.accountNumber,
            role: n.nodeRole,
            level: n.level,
            incoming_amount: n.totalIncomingAmount,
            outgoing_amount: n.totalOutgoingAmount,
            remaining_balance: n.remainingBalance,
            risk_score: n.riskScore,
            status: n.status
          })),
          transactions: edges.map((e) => ({
            id: e.id,
            source: e.sourceAccount,
            destination: e.destinationAccount,
            amount: e.amount,
            rail: e.rail,
            status: e.status,
            risk_score: e.riskScore
          }))
        }
      },
      null,
      2
    );
  };

  const content = format === 'TEXT' ? generateTextReport() : generateJsonReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: format === 'TEXT' ? 'text/plain' : 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${incident.caseId}_DFIR_Report.${format === 'TEXT' ? 'txt' : 'json'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
          maxWidth: 760,
          background: '#0B1220',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
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
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc'
              }}
            >
              <FileText style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                EXPORT FORENSIC CASE REPORT
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                DFIR CASE FILE • {incident.caseId}
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

        {/* Format Selector & Actions Bar */}
        <div
          style={{
            padding: '10px 20px',
            background: '#070B14',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setFormat('TEXT')}
              className={format === 'TEXT' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
              style={{ height: 26, fontSize: 10, padding: '0 10px' }}
            >
              <FileText style={{ width: 12, height: 12 }} />
              <span>TEXT / PLAIN REPORT</span>
            </button>

            <button
              onClick={() => setFormat('JSON')}
              className={format === 'JSON' ? 'soc-btn soc-btn-primary' : 'soc-btn-ghost'}
              style={{ height: 26, fontSize: 10, padding: '0 10px' }}
            >
              <Code style={{ width: 12, height: 12 }} />
              <span>STRUCTURED JSON</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleCopy}
              className="soc-btn-ghost"
              style={{ height: 26, fontSize: 10, padding: '0 10px' }}
            >
              {copied ? <Check style={{ width: 12, height: 12, color: 'var(--green)' }} /> : <Copy style={{ width: 12, height: 12 }} />}
              <span>{copied ? 'COPIED!' : 'COPY TO CLIPBOARD'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="soc-btn soc-btn-primary"
              style={{ height: 26, fontSize: 10, padding: '0 12px' }}
            >
              <Download style={{ width: 12, height: 12 }} />
              <span>DOWNLOAD FILE</span>
            </button>
          </div>
        </div>

        {/* Preview Content Area */}
        <div style={{ padding: 20, overflowY: 'auto', background: '#050811', flex: 1 }}>
          <pre
            style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};
