import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, FileText, Search } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';
import type { AuditLog } from '../types';
import { PageHeader, LoadingSkeleton, EmptyState, ErrorState } from '../components/ui';
import { formatTimestamp } from '../utils';
import { Link } from 'react-router-dom';

const actionColors: Record<string, string> = {
  CREATED: '#3B82F6',
  REVIEWED: '#10B981',
  CONFIRMED_FRAUD: '#F43F5E',
  FALSE_POSITIVE: '#22D3EE',
  ASSESSED: '#8B5CF6',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const allActions = ['ALL', ...Array.from(new Set(logs.map((l) => l.action)))];

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      log.transactionId.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle={`${sorted.length} log ${sorted.length !== 1 ? 'entries' : 'entry'} — complete action history`}
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Audit Logs' }]}
        actions={
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-[#0B1224] border border-blue-500/20 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-500" />
          <input
            type="search"
            placeholder="Search logs…"
            className="bg-transparent text-sm text-white placeholder-slate-600 outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-[#0B1224] border border-blue-500/20 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          {allActions.map((a) => (
            <option key={a} value={a} className="bg-[#0B1224]">{a === 'ALL' ? 'All Actions' : a.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          {loading ? (
            <div className="space-y-3"><LoadingSkeleton rows={8} /></div>
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No audit logs found"
              message={search || actionFilter !== 'ALL' ? 'Try adjusting filters.' : 'Audit logs will appear here as transactions are created and reviewed.'}
              icon={<FileText size={22} />}
            />
          ) : (
            <div className="glass rounded-2xl border border-blue-500/10 overflow-hidden">
              {/* Timeline */}
              <div className="p-6 space-y-0 relative">
                <div className="absolute left-[44px] top-6 bottom-6 w-px bg-blue-500/10" />
                {sorted.map((log, i) => {
                  const color = actionColors[log.action] ?? '#94A3B8';
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.5) }}
                      className="flex gap-5 group pb-6 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div
                          className="w-5 h-5 rounded-full border-2 border-[#050816] flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <Link
                            to={`/transactions/${log.transactionId}`}
                            className="text-blue-400 hover:text-blue-300 font-mono text-[10px] transition-colors"
                          >
                            {log.transactionId.slice(0, 16)}…
                          </Link>
                        </div>
                        {log.details && (
                          <p className="text-slate-400 text-xs leading-relaxed mb-1">{log.details}</p>
                        )}
                        <p className="text-slate-600 text-[10px]">{formatTimestamp(log.timestamp)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-6 py-3 border-t border-blue-500/10">
                <p className="text-slate-600 text-xs">{sorted.length} total entries</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
