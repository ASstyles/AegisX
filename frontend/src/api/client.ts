import {
  SimulationStatus,
  Transaction,
  CustomerBaseline,
  CustomerProfile,
  EvaluationResult,
  ScoreboardData,
  ReplayData,
  GraphData
} from '../types';

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000/ws/stream';

export async function fetchStatus(): Promise<SimulationStatus> {
  const res = await fetch(`${API_BASE}/status`);
  return res.json();
}

export async function startSimulation(): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
  return res.json();
}

export async function pauseSimulation(): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
  return res.json();
}

export async function resetSimulation(): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
  return res.json();
}

export async function updateConfig(config: Partial<SimulationStatus>): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return res.json();
}

export async function launchAttack(
  attackType: string,
  targetCustomer: string = 'C001',
  difficulty: string = 'MEDIUM',
  intensity: string = 'MEDIUM'
): Promise<any> {
  const res = await fetch(`${API_BASE}/attack/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attack_type: attackType,
      target_customer: targetCustomer,
      difficulty: difficulty,
      intensity: intensity
    })
  });
  return res.json();
}

export async function fetchLiveTransactions(limit: number = 50): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions/live?limit=${limit}`);
  const data = await res.json();
  return data.transactions || [];
}

export async function fetchCustomers(): Promise<CustomerProfile[]> {
  const res = await fetch(`${API_BASE}/customers?limit=50`);
  const data = await res.json();
  return data.customers || [];
}

export async function fetchCustomerBaseline(customerId: string): Promise<{ customer: CustomerProfile; baseline: CustomerBaseline }> {
  const res = await fetch(`${API_BASE}/customer/${customerId}/baseline`);
  return res.json();
}

export async function investigateTransaction(transactionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/investigate/${transactionId}`);
  return res.json();
}

export async function fetchNetworkGraph(): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/network/graph`);
  return res.json();
}

export async function evaluateSimulation(): Promise<EvaluationResult> {
  const res = await fetch(`${API_BASE}/simulation/evaluate`, { method: 'POST' });
  return res.json();
}

export async function fetchScoreboard(): Promise<ScoreboardData> {
  const res = await fetch(`${API_BASE}/scoreboard`);
  return res.json();
}

export async function adaptDefense(): Promise<any> {
  const res = await fetch(`${API_BASE}/model/adapt`, { method: 'POST' });
  return res.json();
}

export async function replayAttack(attackId?: string): Promise<ReplayData> {
  const res = await fetch(`${API_BASE}/attack/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attack_id: attackId })
  });
  return res.json();
}

export async function runFirstMVP(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/run_first_mvp`, { method: 'POST' });
  return res.json();
}

export function createStreamWebSocket(
  onMessage: (event: any) => void,
  onOpen?: () => void,
  onClose?: () => void
): WebSocket {
  const ws = new WebSocket(WS_BASE);
  ws.onopen = () => onOpen && onOpen();
  ws.onclose = () => onClose && onClose();
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      onMessage(data);
    } catch (e) {
      console.error('WS parse error', e);
    }
  };
  return ws;
}
