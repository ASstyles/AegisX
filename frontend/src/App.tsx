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
  launchAttack,
  runFirstMVP,
  createStreamWebSocket
} from './api/client';
import { formatISTTime } from './utils/timezone';

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
  const [demoSecondsRemaining, setDemoSecondsRemaining] = useState<number>(120);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const demoIntervalRef = useRef<any>(null);
  const demoStartTimeRef = useRef<Date | null>(null);

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
            const timeStr = formatISTTime(newTxn.timestamp);
            showToast(`AUTONOMOUS BLOCK [${timeStr} IST]: ₹${newTxn.amount.toLocaleString()} at ${newTxn.city} (Risk: ${newTxn.risk_score})`, 'alert');
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
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
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
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setIsDemoRunning(false);
    setDemoSecondsRemaining(120);
    demoStartTimeRef.current = null;

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

  // 2-Minute Orchestrated Real-Time Demo Walkthrough Flow
  const handleRunDemo = async () => {
    if (isDemoRunning) {
      // User cancelled active demo
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      setIsDemoRunning(false);
      setDemoSecondsRemaining(120);
      demoStartTimeRef.current = null;
      await pauseSimulation();
      showToast('2-Minute Demo cancelled by user', 'info');
      return;
    }

    // Start 2-Minute Demo Flow
    demoStartTimeRef.current = new Date();
    setIsDemoRunning(true);
    setDemoSecondsRemaining(120);
    setActiveTab('DASHBOARD');

    // Ensure simulation is running with fresh transactions
    await startSimulation();
    setStatus((prev) => ({ ...prev, is_running: true }));
    showToast(`Starting 2-Minute Live Demo at ${formatISTTime(new Date().toISOString())} IST — generating real-time traffic with Red Team attack injections!`, 'info');

    // Step 1: Immediate Priya Sharma ATO attack injection at start
    setTimeout(async () => {
      try {
        await launchAttack('ACCOUNT_TAKEOVER', 'C001', 'MEDIUM', 'HIGH');
        showToast('Demo Step 1: Red Team injected Account Takeover on Priya Sharma (C001, ₹78k, Mumbai)!', 'alert');
      } catch (e) {
        console.error(e);
      }
    }, 4000);

    let remaining = 120;
    demoIntervalRef.current = setInterval(async () => {
      remaining -= 1;
      setDemoSecondsRemaining(remaining);

      // Milestone injections
      if (remaining === 90) {
        // 30s in: Card testing bot flood
        try {
          await launchAttack('CARD_TESTING', 'C002', 'MEDIUM', 'HIGH');
          showToast('Demo Step 2: Red Team launched Card Testing Bot Micro-charge Flood!', 'alert');
        } catch (e) {
          console.error(e);
        }
      } else if (remaining === 60) {
        // 60s in: Velocity burst
        try {
          await launchAttack('VELOCITY_ATTACK', 'C004', 'MEDIUM', 'HIGH');
          showToast('Demo Step 3: Red Team unleashed High-Velocity Draining Burst!', 'alert');
        } catch (e) {
          console.error(e);
        }
      } else if (remaining === 30) {
        // 90s in: Adversarial behavior mimicry
        try {
          await launchAttack('BEHAVIOR_MIMICRY', 'C001', 'HARD', 'HIGH');
          showToast('Demo Step 4: Red Team launched Adversarial Statistical Mimicry Attack!', 'alert');
        } catch (e) {
          console.error(e);
        }
      } else if (remaining <= 0) {
        // Demo complete!
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
        setIsDemoRunning(false);
        setDemoSecondsRemaining(120);

        try {
          await pauseSimulation();
          setStatus((prev) => ({ ...prev, is_running: false }));

          // Reveal Hidden Ground Truth Evaluation
          const evalResult = await evaluateSimulation();
          setEvaluation(evalResult);
          const newScoreboard = await fetchScoreboard();
          setScoreboard(newScoreboard);

          setActiveTab('EVALUATION');
          showToast('2-Minute Demo Complete! Hidden Ground Truth revealed: Confusion Matrix & Metrics evaluated.', 'success');
        } catch (e) {
          console.error('Demo completion evaluation error', e);
        }
      }
    }, 1000);
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
          demoSecondsRemaining={demoSecondsRemaining}
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
