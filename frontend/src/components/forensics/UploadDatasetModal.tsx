import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileCode,
  FileText,
  Check,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { RawTransactionRecord } from '../../types';
import { parseUploadedDataset } from '../../utils/forensicsEngine';

interface UploadDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (records: RawTransactionRecord[]) => void;
}

export const UploadDatasetModal: React.FC<UploadDatasetModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded
}) => {
  const [pasteText, setPasteText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseUploadedDataset(text);
        onDatasetLoaded(parsed);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  const handleParsePasted = () => {
    try {
      setErrorMsg(null);
      const parsed = parseUploadedDataset(pasteText);
      onDatasetLoaded(parsed);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse transaction data');
    }
  };

  const handleLoadSampleJson = () => {
    const sample = [
      {
        transaction_id: "TXN-A9401",
        source_account: "ACC-4821",
        destination_account: "ACC-7193",
        amount: 145000,
        timestamp: new Date().toISOString(),
        risk_score: 94,
        payment_rail: "IMPS",
        status: "CONTAINED"
      },
      {
        transaction_id: "TXN-A9402",
        source_account: "ACC-4821",
        destination_account: "ACC-1038",
        amount: 240000,
        timestamp: new Date().toISOString(),
        risk_score: 97,
        payment_rail: "NEFT",
        status: "CONTAINED"
      },
      {
        transaction_id: "TXN-B1101",
        source_account: "ACC-7193",
        destination_account: "ACC-5520",
        amount: 85000,
        timestamp: new Date().toISOString(),
        risk_score: 86,
        payment_rail: "UPI",
        status: "CONTAINED"
      },
      {
        transaction_id: "TXN-B1102",
        source_account: "ACC-7193",
        destination_account: "ACC-9904",
        amount: 60000,
        timestamp: new Date().toISOString(),
        risk_score: 82,
        payment_rail: "UPI",
        status: "CONTAINED"
      },
      {
        transaction_id: "TXN-C2201",
        source_account: "ACC-1038",
        destination_account: "ACC-3312",
        amount: 140000,
        timestamp: new Date().toISOString(),
        risk_score: 91,
        payment_rail: "IMPS",
        status: "CONTAINED"
      },
      {
        transaction_id: "TXN-C2202",
        source_account: "ACC-1038",
        destination_account: "ACC-7740",
        amount: 100000,
        timestamp: new Date().toISOString(),
        risk_score: 88,
        payment_rail: "IMPS",
        status: "CONTAINED"
      },
      {
        transaction_id: "TXN-D3301",
        source_account: "ACC-5520",
        destination_account: "ACC-8819",
        amount: 55000,
        timestamp: new Date().toISOString(),
        risk_score: 96,
        payment_rail: "CRYPTO_OFFRAMP",
        status: "BLOCKED"
      },
      {
        transaction_id: "TXN-D3302",
        source_account: "ACC-3312",
        destination_account: "ACC-6628",
        amount: 90000,
        timestamp: new Date().toISOString(),
        risk_score: 95,
        payment_rail: "RTGS",
        status: "BLOCKED"
      }
    ];
    setPasteText(JSON.stringify(sample, null, 2));
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
          maxWidth: 680,
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
              <UploadCloud style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                INGEST CUSTOM TRANSACTION DATASET
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                DYNAMIC GRAPH RECONSTRUCTION FROM JSON OR CSV
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
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, background: '#090E1A' }}>
          {/* File Upload Zone */}
          <label
            style={{
              border: '2px dashed rgba(34, 211, 238, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'rgba(34, 211, 238, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <UploadCloud style={{ width: 28, height: 28, color: 'var(--cyan)' }} />
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
              Drop .JSON or .CSV file here or click to browse
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Supports transaction records with source_account, destination_account, amount, risk_score
            </div>
            <input
              type="file"
              accept=".json,.csv,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Paste JSON/CSV text area */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                OR PASTE RAW DATA:
              </span>
              <button
                onClick={handleLoadSampleJson}
                className="soc-btn-ghost"
                style={{ fontSize: 9, height: 20, padding: '0 6px' }}
              >
                <Sparkles style={{ width: 10, height: 10, color: 'var(--cyan)' }} />
                <span>LOAD SAMPLE PAYLOAD</span>
              </button>
            </div>

            <textarea
              rows={8}
              placeholder={`[\n  {\n    "transaction_id": "TXN-001",\n    "source_account": "ACC-4821",\n    "destination_account": "ACC-7193",\n    "amount": 95000,\n    "risk_score": 92\n  }\n]`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              style={{
                width: '100%',
                background: '#040711',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: 10,
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--red)', fontSize: 10, fontFamily: 'var(--font-mono)', background: 'rgba(239,68,68,0.1)', padding: '6px 10px', borderRadius: 4 }}>
              <AlertTriangle style={{ width: 12, height: 12 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button onClick={onClose} className="soc-btn-ghost" style={{ height: 32, fontSize: 11 }}>
              CANCEL
            </button>
            <button
              onClick={handleParsePasted}
              disabled={!pasteText.trim()}
              className="soc-btn soc-btn-primary"
              style={{ height: 32, fontSize: 11, padding: '0 14px' }}
            >
              <Check style={{ width: 13, height: 13 }} />
              <span>INGEST & BUILD GRAPH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
