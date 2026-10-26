import axios, { AxiosError } from 'axios';
import type {
  Transaction,
  CreateTransactionPayload,
  DashboardSummary,
  AuditLog,
  ReviewDecision,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor ────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ───────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    let message = 'An unexpected error occurred.';

    if (!error.response) {
      message =
        'Cannot connect to the Sentinel backend. Ensure the Spring Boot server is running on ' +
        BASE_URL;
    } else if (status === 400) {
      const data = error.response.data as Record<string, string> | string;
      message =
        typeof data === 'string'
          ? data
          : (data as Record<string, string>)?.message ?? 'Invalid request.';
    } else if (status === 401 || status === 403) {
      message = 'Access denied.';
    } else if (status === 404) {
      message = 'Resource not found.';
    } else if (status && status >= 500) {
      message = 'Backend server error. Please try again later.';
    }

    return Promise.reject(new Error(message));
  },
);

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/api/dashboard/summary');
  return data;
}

// ─── Transactions ───────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>('/api/transactions');
  return data;
}

export async function fetchFlaggedTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>('/api/transactions/flagged');
  return data;
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  const { data } = await api.get<Transaction>(`/api/transactions/${id}`);
  return data;
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const { data } = await api.post<Transaction>('/api/transactions', payload);
  return data;
}

export async function reviewTransaction(
  id: string,
  decision: ReviewDecision,
): Promise<Transaction> {
  const { data } = await api.patch<Transaction>(
    `/api/transactions/${id}/review`,
    null,
    { params: { decision } },
  );
  return data;
}

// ─── Audit Logs ─────────────────────────────────────────────────────────────

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { data } = await api.get<AuditLog[]>('/api/audit-logs');
  return data;
}

export async function fetchAuditLogsByTransaction(
  transactionId: string,
): Promise<AuditLog[]> {
  const { data } = await api.get<AuditLog[]>(
    `/api/audit-logs/transaction/${transactionId}`,
  );
  return data;
}

// ─── Authentication ─────────────────────────────────────────────────────────

export async function loginApi(credentials: {
  username: string;
  password: string;
  rememberMe?: boolean;
}): Promise<{ token: string; username: string; role: string }> {
  const { data } = await api.post<{ token: string; username: string; role: string }>(
    '/api/auth/login',
    credentials,
  );
  if (data.token) {
    if (credentials.rememberMe) {
      localStorage.setItem('sentinel_token', data.token);
      localStorage.setItem('sentinel_user', JSON.stringify({ username: data.username, role: data.role }));
    } else {
      sessionStorage.setItem('sentinel_token', data.token);
      sessionStorage.setItem('sentinel_user', JSON.stringify({ username: data.username, role: data.role }));
      localStorage.setItem('sentinel_token', data.token);
      localStorage.setItem('sentinel_user', JSON.stringify({ username: data.username, role: data.role }));
    }
  }
  return data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/api/auth/forgot-password', { email });
  return data;
}
