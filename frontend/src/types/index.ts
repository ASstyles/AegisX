export interface Transaction {
  transaction_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  merchant_id: string;
  merchant_category: string;
  merchant_name: string;
  timestamp: string;
  city: string;
  country?: string;
  device_id: string;
  payment_method: string;
  risk_score: number;
  decision: 'APPROVE' | 'MONITOR' | 'CHALLENGE' | 'BLOCK';
  risk_attribution: Record<string, number>;
  layer_scores: Record<string, number>;
  layer_details?: Record<string, any>;
  xai: {
    summary: string;
    reasons: string[];
    recommended_action: string;
  };
  customer_baseline?: CustomerBaseline;
}

export interface CustomerBaseline {
  customer_id: string;
  synthetic_name: string;
  mean_amount: number;
  median_amount: number;
  min_amount: number;
  max_amount: number;
  p95_amount: number;
  spending_range: [number, number];
  normal_hours: [number, number];
  trusted_devices: string[];
  common_cities: string[];
  home_city: string;
  preferred_categories: string[];
  typical_payment_methods: string[];
  total_historical_txns: number;
}

export interface CustomerProfile {
  customer_id: string;
  synthetic_name: string;
  age_range: string;
  home_city: string;
  country: string;
  spending_range: [number, number];
  average_transaction_amount: number;
  preferred_merchant_categories: string[];
  normal_transaction_hours: [number, number];
  trusted_devices: string[];
  typical_payment_methods: string[];
}

export interface SimulationStatus {
  is_running: boolean;
  tps: number;
  contamination_rate: number;
  difficulty: string;
  defense_version: string;
  total_transactions: number;
  threat_count: number;
  blocked_count: number;
  total_blocked_inr: number;
  active_weights: Record<string, number>;
  defense_weights?: Record<string, number>;
  block_threshold: number;
  challenge_threshold: number;
}

export interface EvaluationMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  detection_rate_pct: number;
  false_positive_rate_pct: number;
  attack_success_rate_pct: number;
  total_attacks_injected: number;
  total_attacks_detected: number;
  total_attacks_missed: number;
}

export interface EvaluationResult {
  confusion_matrix: {
    true_positives: number;
    false_positives: number;
    true_negatives: number;
    false_negatives: number;
    total_transactions: number;
  };
  metrics: EvaluationMetrics;
  missed_attacks: any[];
  detected_attacks: any[];
  evaluated_transactions_sample: any[];
}

export interface ScoreboardRound {
  round_number: number;
  title: string;
  red_team: {
    attacks_generated: number;
    evasions: number;
    attack_success_rate: number;
    hardest_attack: string;
    avg_difficulty: string;
  };
  blue_team: {
    attacks_detected: number;
    attacks_missed: number;
    detection_rate: number;
    false_positive_rate: number;
    mean_detection_time_ms: number;
    defense_version: string;
  };
  winner: string;
}

export interface ScoreboardData {
  current_round: number;
  total_rounds: number;
  rounds: ScoreboardRound[];
  overall_leader: string;
}

export interface ReplayData {
  attack_id?: string;
  attack_type: string;
  difficulty?: string;
  target_customer: string;
  improved?: boolean;
  replayed_transactions_count: number;
  timeline: Array<{ time_step: string; event: string }>;
  before: {
    version?: string;
    risk_score: number;
    action: string;
    decision?: string;
  };
  after: {
    version?: string;
    risk_score: number;
    action: string;
    decision?: string;
  };
  before_defense: {
    version: string;
    avg_risk_score: number;
    decision: string;
    is_mitigated: boolean;
    risk_attribution: Record<string, number>;
    results: any[];
  };
  after_defense: {
    version: string;
    avg_risk_score: number;
    decision: string;
    is_mitigated: boolean;
    risk_attribution: Record<string, number>;
    results: any[];
  };
  improvement_summary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  degree: number;
  is_suspicious?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- Transaction Forensics Types ---

export interface RawTransactionRecord {
  transaction_id: string;
  source_account: string;
  destination_account: string;
  amount: number;
  timestamp: string;
  status?: 'COMPLETED' | 'BLOCKED' | 'PENDING' | 'FLAGGED' | 'CONTAINED';
  device_id?: string;
  ip_metadata?: string;
  risk_score?: number;
  payment_rail?: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CRYPTO_OFFRAMP';
  location?: string;
}

export interface DynamicInvestigationMetrics {
  totalTransactions: number;
  accountsAnalyzed: number;
  suspiciousTransactions: number;
  activeInvestigations: number;
  highRiskAccounts: number;
  chainsIdentified: number;
  fundsUnderReview: number;
}

export interface ForensicAccountNode {
  id: string;
  accountNumber: string;
  nodeRole: 'SOURCE' | 'RECIPIENT' | 'INTERMEDIATE' | 'HIGH_RISK' | 'SUSPICIOUS' | 'TERMINUS' | 'UNKNOWN';
  level: number;
  incomingTransactionsCount: number;
  outgoingTransactionsCount: number;
  totalIncomingAmount: number;
  totalOutgoingAmount: number;
  remainingBalance: number;
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NORMAL' | 'FLAGGED' | 'CONTAINED' | 'UNDER_REVIEW' | 'RELEASED';
  connectedAccountsCount: number;
  transactionVelocity: number; // txns/hour
  devices: string[];
  ipAddresses: string[];
  locations: string[];
  x: number;
  y: number;
  isSource?: boolean;
  isContained?: boolean;
  accountType?: 'ANONYMIZED';
}

export interface ForensicTransactionEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  timestamp: string;
  rail: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CRYPTO_OFFRAMP';
  status: 'COMPLETED' | 'BLOCKED' | 'PENDING' | 'FLAGGED' | 'CONTAINED';
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isSuspiciousPath?: boolean;
}

export interface ForensicIncident {
  incidentId: string;
  caseId: string;
  sourceAccount: string;
  targetAccount?: string;
  amount: number;
  recoverableAmount: number;
  riskScore: number;
  status: 'UNDER_INVESTIGATION' | 'CHAIN_CONTAINED' | 'AWAITING_CUSTOMER_RESPONSE' | 'FRAUD_CONFIRMED' | 'FALSE_POSITIVE_RELEASED' | 'NO_ACTIVE_INCIDENT';
  detectionTime: string;
  countdownSeconds: number;
  accountsInvolved: number;
  transactionsTraced: number;
  chainDepth: number;
  evidenceHash: string;
  evidenceCollectedAt: string;
  investigatorAssigned: string;
  customerNotificationSent: boolean;
  customerResponseStatus: 'PENDING' | 'CONFIRMED_FRAUD' | 'CONFIRMED_LEGITIMATE';
  anomalyFactors?: {
    velocityAnomaly: number;
    unusualBehavior: number;
    accountLinkage: number;
    deviceAnomaly: number;
    locationAnomaly: number;
    chainComplexity: number;
  };
}

export interface ForensicTimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'ALERT' | 'CONTAINMENT' | 'NOTIFICATION' | 'EVIDENCE' | 'TRANSACTION' | 'ANALYSIS' | 'CASE';
  severity: 'CRITICAL' | 'HIGH' | 'INFO' | 'SUCCESS';
  isNew?: boolean;
}

export interface ForensicEvidenceItem {
  id: string;
  category: 'NETWORK_LOG' | 'AUTH_EVENT' | 'DEVICE_FINGERPRINT' | 'IP_GEO' | 'TRANSACTION_PAYLOAD';
  timestamp: string;
  title: string;
  details: Record<string, string | number | boolean>;
}
