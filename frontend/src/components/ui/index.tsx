import React from 'react';
import { motion } from 'framer-motion';
import { getRiskColor, getStatusColor } from '../../utils';
import { useCountUp } from '../../hooks/useCountUp';
import type { RiskLevel, TransactionStatus } from '../../types';

// ─── Risk Badge ──────────────────────────────────────────────────────────────

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const color = getRiskColor(level);
  const labels: Record<RiskLevel, string> = {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    NOT_ASSESSED: 'N/A',
  };
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wider uppercase ${sizeClass}`}
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      {labels[level]}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: TransactionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const labels: Record<TransactionStatus, string> = {
    NEW: 'New',
    ASSESSED: 'Assessed',
    REVIEW_REQUIRED: 'Review Required',
    REVIEWED: 'Reviewed',
    CONFIRMED_FRAUD: 'Confirmed Fraud',
    FALSE_POSITIVE: 'False Positive',
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full text-[10px] px-2 py-0.5 font-semibold tracking-wide uppercase"
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
    >
      {labels[status] || status}
    </span>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  accentColor?: string;
  loading?: boolean;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  accentColor = '#3B82F6',
  loading = false,
  delay = 0,
}: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const displayValue = useCountUp(numericValue, loading);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 border border-blue-500/10">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-8 w-16 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="glass rounded-2xl p-5 border border-blue-500/10 hover:border-blue-500/25 transition-all duration-300 group relative overflow-hidden"
    >
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ backgroundColor: `${accentColor}20` }}
      />
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' ? displayValue.toLocaleString() : value}
      </p>
      {trend && <p className="text-xs text-slate-500">{trend}</p>}
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-white font-semibold text-base mb-2">Unable to Load Data</h3>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all focus-ring"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        {breadcrumbs && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-slate-300' : ''}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}
