import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Search as SearchIcon,
  RefreshCw,
  XCircle,
  Eye,
} from 'lucide-react';
import { fetchTransactions, reviewTransaction } from '../services/api';
import type { Transaction, ReviewDecision } from '../types';
import { PageHeader, LoadingSkeleton, EmptyState, ErrorState, RiskBadge, StatusBadge } from '../components/ui';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { formatCurrency, formatRelativeTime, getRiskColor } from '../utils';

export default function InvestigationsPage() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{
    open: boolean;
    tx: Transaction | null;
    decision: ReviewDecision | null;
  }>({ open: false, tx: null, decision: null });
  const [reviewing, setReviewing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchTransactions();
      // Show all that need investigation: REVIEW_REQUIRED + already actioned
      setTransactions(
        all.filter((t) =>
          ['REVIEW_REQUIRED', 'REVIEWED', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE'].includes(t.status),
        ),
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.senderAccount.toLowerCase().includes(q) ||
      t.receiverAccount.toLowerCase().includes(q)
    );
  });

  const openDialog = (tx: Transaction, decision: ReviewDecision) =>
    setDialog({ open: true, tx, decision });
  const closeDialog = () => setDialog({ open: false, tx: null, decision: null });

  const handleReview = async () => {
    if (!dialog.tx || !dialog.decision) return;
    setReviewing(true);
    try {
      await reviewTransaction(dialog.tx.id, dialog.decision);
      await load();
      addToast('success', 'Review updated', `Marked as ${dialog.decision.replace(/_/g, ' ')}.`);
    } catch (e: any) {
      addToast('error', 'Review failed', e.message);
    } finally {
      setReviewing(false);
      closeDialog();
    }
  };

  const pending = filtered.filter((t) => t.status === 'REVIEW_REQUIRED');
  const closed = filtered.filter((t) => t.status !== 'REVIEW_REQUIRED');

  const InvestigationCard = ({ tx, i }: { tx: Transaction; i: number }) => {
    const riskColor = getRiskColor(tx.riskLevel);
    const isOpen = tx.status === 'REVIEW_REQUIRED';
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className={`glass rounded-2xl border p-4 transition-all ${isOpen ? 'border-amber-500/20' : 'border-blue-500/10'}`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link to={`/transactions/${tx.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs transition-colors">
                {tx.id.slice(0, 16)}…
              </Link>
              <RiskBadge level={tx.riskLevel} />
              <StatusBadge status={tx.status} />
            </div>
            <div className="flex items-center gap-4 mb-2 flex-wrap">
              <p className="text-white font-bold text-sm">{formatCurrency(tx.amount, tx.currency)}</p>
              <p className="text-slate-500 text-xs font-mono">{tx.senderAccount} → {tx.receiverAccount}</p>
              <p className="text-slate-600 text-xs">{formatRelativeTime(tx.timestamp)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[200px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tx.riskScore}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: riskColor }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: riskColor }}>
                {tx.riskScore}/100
              </span>
            </div>
          </div>
          {isOpen && (
            <div className="flex gap-2 flex-shrink-0">
              <Link to={`/transactions/${tx.id}`} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/15 border border-blue-500/25 text-blue-300 text-xs rounded-lg hover:bg-blue-600/25 transition-all focus-ring">
                <Eye size={11} /> Details
              </Link>
              <button onClick={() => openDialog(tx, 'CONFIRMED_FRAUD')} className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/15 border border-rose-500/25 text-rose-300 text-xs rounded-lg hover:bg-rose-600/25 transition-all focus-ring">
                <AlertTriangle size={11} /> Fraud
              </button>
              <button onClick={() => openDialog(tx, 'FALSE_POSITIVE')} className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600/15 border border-cyan-500/25 text-cyan-300 text-xs rounded-lg hover:bg-cyan-600/25 transition-all focus-ring">
                <XCircle size={11} /> FP
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Investigations"
        subtitle="Active fraud investigation queue and completed reviews"
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Investigations' }]}
        actions={
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      <div className="flex items-center gap-2 bg-[#0B1224] border border-blue-500/20 rounded-xl px-3 py-2.5 mb-5 max-w-md">
        <SearchIcon size={14} className="text-slate-500" />
        <input
          type="search"
          placeholder="Search investigations…"
          className="bg-transparent text-sm text-white placeholder-slate-600 outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && loading && <div className="space-y-3"><LoadingSkeleton rows={5} /></div>}

      {!error && !loading && (
        <div className="space-y-8">
          {/* Pending */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-amber-400" />
              <h2 className="text-white font-semibold">Pending Review</h2>
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <EmptyState
                title="No pending investigations"
                message="No transactions currently require review."
                icon={<CheckCircle size={22} />}
              />
            ) : (
              <div className="space-y-3">
                {pending.map((tx, i) => <InvestigationCard key={tx.id} tx={tx} i={i} />)}
              </div>
            )}
          </div>

          {/* Closed */}
          {closed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={16} className="text-emerald-400" />
                <h2 className="text-white font-semibold">Completed</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{closed.length}</span>
              </div>
              <div className="space-y-3">
                {closed.map((tx, i) => <InvestigationCard key={tx.id} tx={tx} i={i} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={dialog.open}
        title={dialog.decision === 'CONFIRMED_FRAUD' ? 'Confirm Fraud' : 'Mark as False Positive'}
        message={
          dialog.decision === 'CONFIRMED_FRAUD'
            ? 'Confirm this transaction as fraud? This action will be logged in the audit trail.'
            : 'Mark this as a false positive? The transaction will be cleared from the investigation queue.'
        }
        confirmLabel={dialog.decision === 'CONFIRMED_FRAUD' ? 'Confirm Fraud' : 'False Positive'}
        variant={dialog.decision === 'CONFIRMED_FRAUD' ? 'danger' : 'warning'}
        onConfirm={handleReview}
        onCancel={closeDialog}
        loading={reviewing}
      />
    </div>
  );
}
