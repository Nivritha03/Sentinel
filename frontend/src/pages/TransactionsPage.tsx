import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowLeftRight,
  Filter,
  Plus,
  X,
} from 'lucide-react';
import { fetchTransactions } from '../services/api';
import type { Transaction, FilterState, RiskLevel, TransactionStatus } from '../types';
import { PageHeader, RiskBadge, StatusBadge, LoadingSkeleton, EmptyState, ErrorState } from '../components/ui';
import { formatCurrency, formatTimestamp } from '../utils';

const RISK_LEVELS: (RiskLevel | 'ALL')[] = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: (TransactionStatus | 'ALL')[] = [
  'ALL', 'NEW', 'ASSESSED', 'REVIEW_REQUIRED', 'REVIEWED', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE',
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    riskLevel: 'ALL',
    status: 'ALL',
    sortBy: 'timestamp',
    sortDir: 'desc',
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.senderAccount.toLowerCase().includes(q) ||
          t.receiverAccount.toLowerCase().includes(q),
      );
    }
    if (filters.riskLevel !== 'ALL') list = list.filter((t) => t.riskLevel === filters.riskLevel);
    if (filters.status !== 'ALL') list = list.filter((t) => t.status === filters.status);

    list.sort((a, b) => {
      let cmp = 0;
      if (filters.sortBy === 'timestamp') cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (filters.sortBy === 'amount') cmp = a.amount - b.amount;
      else if (filters.sortBy === 'riskScore') cmp = a.riskScore - b.riskScore;
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (col: FilterState['sortBy']) => {
    setFilters((f) => ({
      ...f,
      sortBy: col,
      sortDir: f.sortBy === col && f.sortDir === 'desc' ? 'asc' : 'desc',
    }));
    setPage(1);
  };

  const SortIcon = ({ col }: { col: FilterState['sortBy'] }) =>
    filters.sortBy === col ? (
      <ArrowUpDown size={12} className="text-blue-400" />
    ) : (
      <ArrowUpDown size={12} className="text-slate-600" />
    );

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle={`${filtered.length} transaction${filtered.length !== 1 ? 's' : ''} found`}
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Transactions' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link to="/transactions/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all focus-ring">
              <Plus size={14} /> New Transaction
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-blue-500/10 mb-5">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#0B1224] border border-blue-500/20 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={14} className="text-slate-500 flex-shrink-0" />
            <input
              type="search"
              placeholder="Search by ID or account…"
              className="bg-transparent text-sm text-white placeholder-slate-600 outline-none w-full"
              value={filters.search}
              onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
            />
            {filters.search && (
              <button onClick={() => setFilters((f) => ({ ...f, search: '' }))} className="text-slate-500 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Risk Level */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-500" />
            <select
              className="bg-[#0B1224] border border-blue-500/20 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500/40"
              value={filters.riskLevel}
              onChange={(e) => { setFilters((f) => ({ ...f, riskLevel: e.target.value as any })); setPage(1); }}
            >
              {RISK_LEVELS.map((l) => <option key={l} value={l} className="bg-[#0B1224]">{l === 'ALL' ? 'All Risk Levels' : l}</option>)}
            </select>
          </div>

          {/* Status */}
          <select
            className="bg-[#0B1224] border border-blue-500/20 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500/40"
            value={filters.status}
            onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value as any })); setPage(1); }}
          >
            {STATUSES.map((s) => <option key={s} value={s} className="bg-[#0B1224]">{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <div className="glass rounded-2xl border border-blue-500/10 overflow-hidden">
          {loading ? (
            <div className="p-6"><LoadingSkeleton rows={8} /></div>
          ) : paginated.length === 0 ? (
            <EmptyState
              title="No transactions found"
              message={filters.search || filters.riskLevel !== 'ALL' || filters.status !== 'ALL' ? 'Try adjusting your filters.' : 'No transactions have been submitted to the backend yet.'}
              icon={<ArrowLeftRight size={22} />}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-500/10 bg-[#080f1e]/30">
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">
                        <button onClick={() => toggleSort('timestamp')} className="flex items-center gap-1 hover:text-slate-300 transition-colors focus-ring rounded">
                          Time <SortIcon col="timestamp" />
                        </button>
                      </th>
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Transaction ID</th>
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Sender</th>
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Receiver</th>
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">
                        <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 hover:text-slate-300 transition-colors focus-ring rounded">
                          Amount <SortIcon col="amount" />
                        </button>
                      </th>
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">
                        <button onClick={() => toggleSort('riskScore')} className="flex items-center gap-1 hover:text-slate-300 transition-colors focus-ring rounded">
                          Risk <SortIcon col="riskScore" />
                        </button>
                      </th>
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Status</th>
                      <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((tx, i) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-blue-500/05 hover:bg-blue-500/04 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatTimestamp(tx.timestamp)}</td>
                        <td className="px-5 py-3">
                          <Link to={`/transactions/${tx.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs transition-colors">
                            {tx.id.slice(0, 12)}…
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-slate-300 text-xs font-mono truncate-cell">{tx.senderAccount}</td>
                        <td className="px-5 py-3 text-slate-300 text-xs font-mono truncate-cell">{tx.receiverAccount}</td>
                        <td className="px-5 py-3 text-white text-xs font-bold whitespace-nowrap">{formatCurrency(tx.amount, tx.currency)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-300">{tx.riskScore}</span>
                            <RiskBadge level={tx.riskLevel} />
                          </div>
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={tx.status} /></td>
                        <td className="px-5 py-3 text-slate-500 text-xs truncate-cell">{tx.location || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-blue-500/10">
                  <p className="text-slate-500 text-xs">
                    Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs rounded-lg border border-blue-500/20 text-slate-400 hover:text-white hover:border-blue-500/40 transition-all disabled:opacity-40 focus-ring"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = i + Math.max(1, page - 2);
                      if (p > totalPages) return null;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 text-xs rounded-lg transition-all focus-ring ${page === p ? 'bg-blue-600 text-white' : 'border border-blue-500/20 text-slate-400 hover:text-white'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs rounded-lg border border-blue-500/20 text-slate-400 hover:text-white hover:border-blue-500/40 transition-all disabled:opacity-40 focus-ring"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
