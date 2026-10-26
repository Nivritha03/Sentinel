import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { fetchFlaggedTransactions, reviewTransaction } from '../services/api';
import type { Transaction, ReviewDecision } from '../types';
import { PageHeader, RiskBadge, StatusBadge, LoadingSkeleton, EmptyState, ErrorState } from '../components/ui';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { formatCurrency, formatRelativeTime, getRiskColor } from '../utils';

type Dialog = { open: boolean; tx: Transaction | null; decision: ReviewDecision | null };

export default function FlaggedPage() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>({ open: false, tx: null, decision: null });
  const [reviewing, setReviewing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFlaggedTransactions();
      setTransactions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openDialog = (tx: Transaction, decision: ReviewDecision) =>
    setDialog({ open: true, tx, decision });
  const closeDialog = () => setDialog({ open: false, tx: null, decision: null });

  const handleReview = async () => {
    if (!dialog.tx || !dialog.decision) return;
    setReviewing(true);
    try {
      await reviewTransaction(dialog.tx.id, dialog.decision);
      await load();
      addToast('success', 'Transaction reviewed', `Marked as ${dialog.decision.replace(/_/g, ' ')}.`);
    } catch (e: any) {
      addToast('error', 'Review failed', e.message);
    } finally {
      setReviewing(false);
      closeDialog();
    }
  };

  return (
    <div>
      <PageHeader
        title="Flagged Transactions"
        subtitle="Transactions flagged for analyst review due to high risk scores"
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Flagged' }]}
        actions={
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          {loading ? (
            <div className="space-y-3"><LoadingSkeleton rows={6} /></div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No flagged transactions"
              message="All clear! Transactions requiring review will appear here when the risk score reaches the flagging threshold."
              icon={<CheckCircle size={22} />}
            />
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => {
                const riskColor = getRiskColor(tx.riskLevel);
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass rounded-2xl border overflow-hidden"
                    style={{ borderColor: `${riskColor}25` }}
                  >
                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: riskColor, boxShadow: `0 0 6px ${riskColor}` }}
                              />
                              <span className="text-blue-400 font-mono text-xs font-medium">{tx.id.slice(0, 16)}…</span>
                            </div>
                            <RiskBadge level={tx.riskLevel} />
                            <StatusBadge status={tx.status} />
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-0.5">Amount</p>
                              <p className="text-white font-bold text-base">{formatCurrency(tx.amount, tx.currency)}</p>
                            </div>
                            <div>
                              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-0.5">Sender → Receiver</p>
                              <p className="text-slate-300 font-mono text-xs">{tx.senderAccount} → {tx.receiverAccount}</p>
                            </div>
                            <div>
                              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-0.5">Time</p>
                              <p className="text-slate-400 text-xs">{formatRelativeTime(tx.timestamp)}</p>
                            </div>
                          </div>

                          {/* Risk score bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${tx.riskScore}%` }}
                                transition={{ delay: i * 0.06 + 0.3, duration: 0.6, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: riskColor }}
                              />
                            </div>
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: riskColor }}>
                              Score: {tx.riskScore}
                            </span>
                          </div>

                          {tx.riskReasons.length > 0 && (
                            <div className="mt-3">
                              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1.5">Risk Reasons</p>
                              <ul className="space-y-0.5">
                                {tx.riskReasons.map((r, j) => (
                                  <li key={j} className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <AlertTriangle size={10} className="text-amber-500 flex-shrink-0" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Link
                            to={`/transactions/${tx.id}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-blue-300 hover:text-blue-200 text-xs font-medium rounded-xl transition-all focus-ring"
                          >
                            <Eye size={12} /> View Details
                          </Link>
                          <button
                            onClick={() => openDialog(tx, 'CONFIRMED_FRAUD')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/25 text-rose-300 hover:text-rose-200 text-xs font-medium rounded-xl transition-all focus-ring"
                          >
                            <AlertTriangle size={12} /> Confirm Fraud
                          </button>
                          <button
                            onClick={() => openDialog(tx, 'FALSE_POSITIVE')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/25 text-cyan-300 hover:text-cyan-200 text-xs font-medium rounded-xl transition-all focus-ring"
                          >
                            <XCircle size={12} /> False Positive
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={dialog.open}
        title={dialog.decision === 'CONFIRMED_FRAUD' ? 'Confirm Fraud' : 'Mark as False Positive'}
        message={
          dialog.decision === 'CONFIRMED_FRAUD'
            ? `Are you sure this transaction is fraudulent? This will be logged in the audit trail.`
            : `Are you sure this is a false positive? The transaction will be cleared from the flagged list.`
        }
        confirmLabel={dialog.decision === 'CONFIRMED_FRAUD' ? 'Confirm Fraud' : 'Mark False Positive'}
        variant={dialog.decision === 'CONFIRMED_FRAUD' ? 'danger' : 'warning'}
        onConfirm={handleReview}
        onCancel={closeDialog}
        loading={reviewing}
      />
    </div>
  );
}
