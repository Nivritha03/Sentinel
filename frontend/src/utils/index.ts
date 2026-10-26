import type { DemoRiskResult, RiskLevel } from '../types';

/**
 * Calculates a demo risk score client-side using the same rules
 * as the Spring Boot FraudDetectionService.
 * This is clearly labelled as a demonstration calculator.
 */
export function calculateDemoRisk(
  senderAccount: string,
  receiverAccount: string,
  amount: number,
): DemoRiskResult {
  let score = 0;
  const reasons: string[] = [];

  if (amount >= 10000) {
    score += 30;
    reasons.push('Very high transaction amount (10,000 or more)');
  } else if (amount >= 5000) {
    score += 20;
    reasons.push('High transaction amount (5,000 or more)');
  } else if (amount >= 1000) {
    score += 10;
    reasons.push('Elevated transaction amount (1,000 or more)');
  }

  if (
    senderAccount.trim() !== '' &&
    senderAccount.trim().toLowerCase() === receiverAccount.trim().toLowerCase()
  ) {
    score += 50;
    reasons.push('Sender and receiver accounts are identical');
  }

  score = Math.min(score, 100);

  let level: RiskLevel;
  if (score >= 60) level = 'HIGH';
  else if (score >= 30) level = 'MEDIUM';
  else level = 'LOW';

  if (reasons.length === 0) {
    reasons.push('No configured risk rules were triggered');
  }

  return { score, level, reasons };
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'HIGH': return '#F43F5E';
    case 'MEDIUM': return '#F59E0B';
    case 'LOW': return '#10B981';
    default: return '#94A3B8';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED_FRAUD': return '#F43F5E';
    case 'REVIEW_REQUIRED': return '#F59E0B';
    case 'ASSESSED': return '#10B981';
    case 'REVIEWED': return '#3B82F6';
    case 'FALSE_POSITIVE': return '#22D3EE';
    default: return '#94A3B8';
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
