import React from 'react';
import { Radio, AlertOctagon, Shield, Lock, Activity, Flame } from 'lucide-react';
import { Transaction } from '../types';
import { formatISTTime } from '../utils/timezone';

interface LiveEventTimelineProps {
  transactions: Transaction[];
}

export const LiveEventTimeline: React.FC<LiveEventTimelineProps> = ({ transactions }) => {
  // Generate realistic reactive events from recent transactions
  const threatTxns = transactions.filter((t) => t.decision === 'BLOCK' || t.decision === 'CHALLENGE').slice(0, 4);

  return (
    <div className="soc-panel p-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
        <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live SOC Event Timeline</span>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          ACTIVE
        </span>
      </div>

      <div className="space-y-1.5 text-xs font-mono max-h-36 overflow-y-auto pr-1">
        {threatTxns.length > 0 ? (
          threatTxns.map((t, idx) => (
            <React.Fragment key={t.transaction_id + idx}>
              <div className="flex items-center gap-2 text-[10px] text-slate-300 py-0.5 border-b border-slate-900/60">
                <span className="text-slate-500">{formatISTTime(t.timestamp)}</span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 text-red-400" />
                  Red Team Injected {t.amount > 50000 ? 'ATO Surge' : 'Anomaly'} ({t.customer_id})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-300 py-0.5 border-b border-slate-900/60 pl-2">
                <span className="text-slate-500">→</span>
                <span className="text-cyan-400">
                  Blue Team flagged multi-vector anomaly (+{t.risk_score} pts)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-300 py-0.5 border-b border-slate-900/60 pl-2">
                <span className="text-slate-500">→</span>
                <span className="text-red-400 font-bold">
                  🛡 Action: {t.decision} at ₹{t.amount.toLocaleString()} ({t.city})
                </span>
              </div>
            </React.Fragment>
          ))
        ) : (
          <div className="space-y-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-2 py-0.5">
              <span className="text-slate-500">SYSTEM</span>
              <span className="text-emerald-400">● Baseline established (120 synthetic customer profiles)</span>
            </div>
            <div className="flex items-center gap-2 py-0.5">
              <span className="text-slate-500">STREAM</span>
              <span className="text-cyan-400">● 7-Layer Unlabeled Inference Grid active</span>
            </div>
            <div className="flex items-center gap-2 py-0.5">
              <span className="text-slate-500">LEDGER</span>
              <span className="text-purple-400">● Ground truth isolated in World 3 backend store</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
