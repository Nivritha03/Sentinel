// ─── Transaction Types ─────────────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'NOT_ASSESSED';

export type TransactionStatus =
  | 'NEW'
  | 'ASSESSED'
  | 'REVIEW_REQUIRED'
  | 'REVIEWED'
  | 'CONFIRMED_FRAUD'
  | 'FALSE_POSITIVE';

export type ReviewDecision = 'REVIEWED' | 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE';

export interface Transaction {
  id: string;
  senderAccount: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  location: string;
  timestamp: string; // ISO string from backend Instant
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  status: TransactionStatus;
}

export interface CreateTransactionPayload {
  senderAccount: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  location: string;
}

// ─── Dashboard Types ────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalTransactions: number;
  highRiskTransactions: number;
  mediumRiskTransactions: number;
  lowRiskTransactions: number;
  confirmedFraudTransactions: number;
  pendingReviewTransactions: number;
  averageRiskScore: number;
}

// ─── Audit Log Types ────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  transactionId: string;
  action: string;
  details: string;
  timestamp: string;
}

// ─── API Response Wrappers ──────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
}

// ─── UI / Utility Types ─────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface FilterState {
  search: string;
  riskLevel: RiskLevel | 'ALL';
  status: TransactionStatus | 'ALL';
  sortBy: 'timestamp' | 'amount' | 'riskScore';
  sortDir: 'asc' | 'desc';
}

// ─── Demo Calculator Types ──────────────────────────────────────────────────

export interface DemoRiskResult {
  score: number;
  level: RiskLevel;
  reasons: string[];
}
