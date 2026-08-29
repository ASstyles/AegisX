import React, { useState, useEffect, useRef } from 'react';
import { AlertOctagon, CheckCircle2, Sparkles, ShieldAlert } from 'lucide-react';

import {
  Transaction,
  SimulationStatus,
  CustomerProfile,
  EvaluationResult,
  ScoreboardData,
  ReplayData
} from './types';

import {
  fetchStatus,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  updateConfig,
  fetchLiveTransactions,
  fetchCustomers,
  evaluateSimulation,
  fetchScoreboard,
  adaptDefense,
  replayAttack,
  runFirstMVP,
  createStreamWebSocket
} from './api/client';

import { Sidebar } from './components/Sidebar';
import { TopCommandBar } from './components/TopCommandBar';
import { InvestigatorModal } from './components/InvestigatorModal';
import { ReplayModal } from './components/ReplayModal';
import { Dashboard } from './pages/Dashboard';
import { AttackLab } from './pages/AttackLab';
import { DefenseCenter } from './pages/DefenseCenter';
import { EvaluationView } from './pages/EvaluationView';
import { ScoreboardView } from './components/ScoreboardView';
import { BenchmarkView } from './pages/BenchmarkView';
import { TransactionForensics } from './pages/TransactionForensics';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [status, setStatus] = useState<SimulationStatus>({
    is_running: false,
    tps: 2.0,
    contamination_rate: 0.02,
    difficulty: 'MEDIUM',
    defense_version: 'v1.0.0 (Standard)',
    total_transactions: 0,
    threat_count: 0,
    blocked_count: 0,
    total_blocked_inr: 0,
    active_weights: {},
    block_threshold: 80.0,
    challenge_threshold: 60.0
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [investigatingTxn, setInvestigatingTxn] = useState<Transaction | null>(null);
  const [replayData, setReplayData] = useState<ReplayData | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Initial State Loading
  const loadInitialData = async () => {
    try {
      const [sData, txData, cData, sbData] = await Promise.all([
        fetchStatus(),
        fetchLiveTransactions(50),
        fetchCustomers(),
        fetchScoreboard()
      ]);
      setStatus(sData);
      setTransactions(txData);
      setCustomers(cData);
      setScoreboard(sbData);
    } catch (e) {
      console.warn('Backend initial loading...', e);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Connect WebSocket Stream
    const ws = createStreamWebSocket(
      (event) => {
        if (event.type === 'TRANSACTION_EVALUATED') {
          const newTxn: Transaction = event.data;
          setTransactions((prev) => [newTxn, ...prev.slice(0, 150)]);
          if (event.metrics) {
            setStatus((prev) => ({
              ...prev,
              total_transactions: event.metrics.total_processed,
              threat_count: event.metrics.threat_count,
              blocked_count: event.metrics.blocked_count,
              total_blocked_inr: event.metrics.total_blocked_inr
            }));
          }

          if (newTxn.decision === 'BLOCK') {
            showToast(`AUTONOMOUS BLOCK: ₹${newTxn.amount.toLocaleString()} at ${newTxn.city} (Risk: ${newTxn.risk_score})`, 'alert');
          }
        } else if (event.type === 'INITIAL_STATE') {
          setStatus(event.status);
        }
      },
      () => console.log('WebSocket Connected to AEGISX Stream'),
      () => console.log('WebSocket Disconnected')
    );

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  // Handlers
  const handleStart = async () => {
    await startSimulation();
    setStatus((prev) => ({ ...prev, is_running: true }));
    showToast(`Simulation stream started at ${status.tps} TPS (Attack Rate: ${(status.contamination_rate * 100).toFixed(1)}%)`, 'info');
  };

  const handlePause = async () => {
    await pauseSimulation();
    setStatus((prev) => ({ ...prev, is_running: false }));
    showToast('Simulation stream paused', 'info');
  };

  const handleReset = async () => {
    await resetSimulation();
    setTransactions([]);
    setEvaluation(null);
    await loadInitialData();
    showToast('Simulation state reset to pristine baseline', 'info');
  };

  const handleConfigChange = async (key: string, value: any) => {
    await updateConfig({ [key]: value });
    setStatus((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuickAttack = async (attackType: string, target: string) => {
    showToast(`Red Team synthesized attack '${attackType}' targeting ${target}!`, 'alert');
    if (!status.is_running) {
      await handleStart();
    }
  };

  const handleAdaptDefense = async () => {
    setIsAdapting(true);
    try {
      const res = await adaptDefense();
      const newScoreboard = await fetchScoreboard();
      setScoreboard(newScoreboard);
      const newStatus = await fetchStatus();
      setStatus(newStatus);
      showToast(`Continuous Adaptation Complete! Upgraded to ${res.adaptation.version}`, 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleReplayClick = async (txn?: Transaction) => {
    try {
      const replay = await replayAttack(txn?.transaction_id);
      setReplayData(replay);
    } catch (e) {
      console.error(e);
    }
  };

  // 2-Minute Deterministic Judge Walkthrough Flow
  const handleRunDemo = async () => {
    setIsDemoRunning(true);
    showToast('Starting 2-Minute Mastercard / GFF 2026 Judge Walkthrough...', 'info');

    try {
      const mvp = await runFirstMVP();
      setActiveTab('DASHBOARD');
      const updatedTxns = await fetchLiveTransactions(50);
      setTransactions(updatedTxns);
      const updatedStatus = await fetchStatus();
      setStatus(updatedStatus);

      const blockedTxn = updatedTxns.find((t) => t.decision === 'BLOCK') || updatedTxns[0];
      if (blockedTxn) {
        setInvestigatingTxn(blockedTxn);
      }

      showToast('Step 1 Complete: Account Takeover (₹78k surge, Mumbai, 02:13 AM) blocked by Blue Team!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Demo execution error', 'alert');
    } finally {
      setIsDemoRunning(false);
    }
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'INVESTIGATION') {
      const targetTxn = transactions.find((t) => t.decision === 'BLOCK' || t.decision === 'CHALLENGE') || transactions[0];
      if (targetTxn) {
        setInvestigatingTxn(targetTxn);
      } else {
        showToast('No transaction currently available for forensic investigation', 'info');
      }
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="soc-app">
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        status={status}
      />

      {/* 2. Main Application Body */}
      <div className="soc-body">
        {/* Top Command Center Bar */}
        <TopCommandBar
          status={status}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onDemo={handleRunDemo}
          onConfigChange={handleConfigChange}
          isDemoRunning={isDemoRunning}
        />

        {/* Page Content Container */}
        <main className="soc-content">
          {activeTab === 'DASHBOARD' && (
            <Dashboard
              status={status}
              transactions={transactions}
              scoreboard={scoreboard}
              onInvestigate={(txn) => setInvestigatingTxn(txn)}
              onQuickAttack={handleQuickAttack}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'ATTACK_LAB' && (
            <AttackLab
              customers={customers}
              onAttackLaunched={(atk, target) => {
                showToast(`Attack '${atk}' injected targeting ${target}!`, 'alert');
                setActiveTab('DASHBOARD');
              }}
            />
          )}

          {activeTab === 'DEFENSE_CENTER' && (
            <DefenseCenter
              status={status}
              onConfigUpdated={() => {
                loadInitialData();
                showToast('Blue Team defense parameters updated', 'success');
              }}
            />
          )}

          {activeTab === 'TRANSACTION_FORENSICS' && <TransactionForensics />}

          {activeTab === 'EVALUATION' && (
            <EvaluationView
              initialEvaluation={evaluation}
              onAdaptDefense={handleAdaptDefense}
            />
          )}

          {activeTab === 'SCOREBOARD' && (
            <ScoreboardView
              scoreboard={scoreboard}
              onAdaptDefense={handleAdaptDefense}
              isAdapting={isAdapting}
            />
          )}

          {activeTab === 'BENCHMARKS' && <BenchmarkView />}
        </main>
      </div>

      {/* Floating Alert Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: toastMessage.type === 'alert' ? 'rgba(239, 68, 68, 0.95)' : toastMessage.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : '#080D18',
            color: toastMessage.type === 'alert' || toastMessage.type === 'success' ? '#fff' : 'var(--cyan)',
            border: toastMessage.type === 'alert' ? '1px solid #ef4444' : toastMessage.type === 'success' ? '1px solid #22c55e' : '1px solid var(--border-active)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700
          }}
        >
          {toastMessage.type === 'alert' ? (
            <AlertOctagon style={{ width: 15, height: 15 }} />
          ) : toastMessage.type === 'success' ? (
            <CheckCircle2 style={{ width: 15, height: 15 }} />
          ) : (
            <Sparkles style={{ width: 15, height: 15 }} />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Forensic Case File Modal */}
      <InvestigatorModal
        transaction={investigatingTxn}
        onClose={() => setInvestigatingTxn(null)}
        onReplay={(txn) => {
          setInvestigatingTxn(null);
          handleReplayClick(txn);
        }}
      />

      {/* Attack Replay Cinematic Modal */}
      <ReplayModal
        replayData={replayData}
        onClose={() => setReplayData(null)}
        onRunReplay={() => handleReplayClick()}
      />
    </div>
  );
}

export default App;
