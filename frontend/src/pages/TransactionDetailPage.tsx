import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  User,
  ArrowLeftRight,
  FileText,
} from 'lucide-react';
import { fetchTransactionById, reviewTransaction, fetchAuditLogsByTransaction } from '../services/api';
import type { Transaction, AuditLog, ReviewDecision } from '../types';
import { PageHeader, RiskBadge, StatusBadge, ErrorState, LoadingSkeleton } from '../components/ui';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { formatCurrency, formatTimestamp, formatRelativeTime, getRiskColor } from '../utils';

import { RiskGauge } from '../components/ui/RiskGauge';

type DialogState = { open: boolean; decision: ReviewDecision | null };

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ open: false, decision: null });
  const [reviewing, setReviewing] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [txData, logsData] = await Promise.all([
        fetchTransactionById(id),
        fetchAuditLogsByTransaction(id),
      ]);
      setTx(txData);
      setLogs(logsData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const openDialog = (decision: ReviewDecision) => setDialog({ open: true, decision });
  const closeDialog = () => setDialog({ open: false, decision: null });

  const handleReview = async () => {
    if (!id || !dialog.decision) return;
    setReviewing(true);
    try {
      const updated = await reviewTransaction(id, dialog.decision);
      setTx(updated);
      await load();
      addToast('success', 'Review saved', `Transaction marked as ${dialog.decision.replace(/_/g, ' ')}.`);
    } catch (e: any) {
      addToast('error', 'Review failed', e.message);
    } finally {
      setReviewing(false);
      closeDialog();
    }
  };

  const decisionLabels: Record<ReviewDecision, string> = {
    REVIEWED: 'Mark as Reviewed',
    CONFIRMED_FRAUD: 'Confirm Fraud',
    FALSE_POSITIVE: 'Mark False Positive',
  };

  const decisionWarning: Record<ReviewDecision, string> = {
    REVIEWED: 'This will mark the transaction as reviewed by an analyst.',
    CONFIRMED_FRAUD: 'This will flag this transaction as confirmed fraud. This action is logged in the audit trail.',
    FALSE_POSITIVE: 'This will dismiss the fraud flag and mark this transaction as a false positive.',
  };

  if (loading) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!tx) return null;

  const canReview = !['CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'REVIEWED'].includes(tx.status);

  return (
    <div>
      <PageHeader
        title="Transaction Details"
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Transactions', href: '/transactions' }, { label: tx.id.slice(0, 12) }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring">
              <RefreshCw size={14} />
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Main details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Core info */}
          <div className="glass rounded-2xl border border-blue-500/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-500/10 flex items-center justify-between">
              <h2 className="text-white font-semibold">Transaction Information</h2>
              <StatusBadge status={tx.status} />
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
              {[
                { label: 'Transaction ID', value: tx.id, icon: FileText, mono: true },
                { label: 'Timestamp', value: formatTimestamp(tx.timestamp), icon: Clock },
                { label: 'Sender Account', value: tx.senderAccount, icon: User, mono: true },
                { label: 'Receiver Account', value: tx.receiverAccount, icon: ArrowLeftRight, mono: true },
                { label: 'Amount', value: formatCurrency(tx.amount, tx.currency), icon: DollarSign },
                { label: 'Currency', value: tx.currency, icon: DollarSign },
                { label: 'Location', value: tx.location || '—', icon: MapPin },
              ].map((field) => (
                <div key={field.label}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <field.icon size={12} className="text-slate-600" />
                    <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">{field.label}</p>
                  </div>
                  <p className={`text-white text-sm font-medium break-all ${field.mono ? 'font-mono text-xs' : ''}`}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Reasons */}
          <div className="glass rounded-2xl border border-amber-500/15 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              Risk Factors
            </h3>
            <ul className="space-y-2.5">
              {tx.riskReasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-400 text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{reason}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Audit Timeline */}
          <div className="glass rounded-2xl border border-blue-500/10 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              Audit History
            </h3>
            {logs.length === 0 ? (
              <p className="text-slate-500 text-sm">No audit log entries for this transaction yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-blue-500/15" />
                <ul className="space-y-5 pl-8">
                  {logs.map((log, i) => (
                    <li key={log.id} className="relative">
                      <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-blue-500 border-2 border-[#050816] mt-1" style={{ boxShadow: '0 0 6px #3B82F6' }} />
                      <p className="text-xs text-slate-500 mb-0.5">{formatTimestamp(log.timestamp)}</p>
                      <p className="text-white text-sm font-semibold">{log.action}</p>
                      {log.details && <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{log.details}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Score + Actions */}
        <div className="space-y-5">
          {/* Score gauge */}
          <div className="glass rounded-2xl border border-blue-500/20 overflow-hidden p-4 flex flex-col items-center">
            <div className="w-full pb-3 border-b border-blue-500/10 mb-2">
              <h3 className="text-white font-semibold text-sm">Risk Assessment Telemetry</h3>
            </div>
            <RiskGauge
              score={tx.riskScore}
              size={180}
              label="Real-time Threat Score"
              subtext={`Status: ${tx.status.replace(/_/g, ' ')}`}
            />
          </div>

          {/* Review Actions */}
          {canReview && (
            <div className="glass rounded-2xl border border-blue-500/10 p-5 space-y-3">
              <h3 className="text-white font-semibold text-sm mb-1">Investigation Actions</h3>
              <button
                onClick={() => openDialog('REVIEWED')}
                className="w-full flex items-center gap-2.5 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-sm font-medium rounded-xl transition-all focus-ring"
              >
                <CheckCircle size={16} /> Mark as Reviewed
              </button>
              <button
                onClick={() => openDialog('CONFIRMED_FRAUD')}
                className="w-full flex items-center gap-2.5 px-4 py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-sm font-medium rounded-xl transition-all focus-ring"
              >
                <AlertTriangle size={16} /> Confirm Fraud
              </button>
              <button
                onClick={() => openDialog('FALSE_POSITIVE')}
                className="w-full flex items-center gap-2.5 px-4 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-sm font-medium rounded-xl transition-all focus-ring"
              >
                <XCircle size={16} /> Mark False Positive
              </button>
            </div>
          )}

          {!canReview && (
            <div className="glass rounded-2xl border border-blue-500/10 p-5 text-center">
              <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-white text-sm font-semibold">Review Complete</p>
              <p className="text-slate-400 text-xs mt-1">This transaction has already been reviewed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={dialog.open}
        title={dialog.decision ? decisionLabels[dialog.decision] : ''}
        message={dialog.decision ? decisionWarning[dialog.decision] : ''}
        confirmLabel={dialog.decision ? decisionLabels[dialog.decision] : 'Confirm'}
        variant={dialog.decision === 'CONFIRMED_FRAUD' ? 'danger' : dialog.decision === 'FALSE_POSITIVE' ? 'warning' : 'info'}
        onConfirm={handleReview}
        onCancel={closeDialog}
        loading={reviewing}
      />
    </div>
  );
}
