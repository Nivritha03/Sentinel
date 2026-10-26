import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchDashboardSummary, fetchTransactions } from '../services/api';
import type { DashboardSummary, Transaction } from '../types';
import {
  MetricCard,
  ErrorState,
  EmptyState,
  PageHeader,
  RiskBadge,
  StatusBadge,
} from '../components/ui';
import { LiveThreatRadar } from '../components/dashboard/LiveThreatRadar';
import { AdvancedExplainabilityHub } from '../components/dashboard/AdvancedExplainabilityHub';
import { formatCurrency, formatRelativeTime } from '../utils';

const RISK_COLORS = {
  HIGH: '#F43F5E',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 border border-blue-500/20 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t] = await Promise.all([fetchDashboardSummary(), fetchTransactions()]);
      setSummary(s);
      setTransactions(t);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pieData = summary
    ? [
        { name: 'High', value: summary.highRiskTransactions, color: RISK_COLORS.HIGH },
        { name: 'Medium', value: summary.mediumRiskTransactions, color: RISK_COLORS.MEDIUM },
        { name: 'Low', value: summary.lowRiskTransactions, color: RISK_COLORS.LOW },
      ].filter((d) => d.value > 0)
    : [];

  const recent = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const flagged = transactions.filter((t) => t.status === 'REVIEW_REQUIRED').slice(0, 5);

  // Compute real activity distribution from live transactions
  const activityTrend = useMemo(() => {
    if (transactions.length === 0) return [];

    // Group transactions by hour
    const buckets: Record<string, { time: string; total: number; high: number }> = {};
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sorted.forEach((tx) => {
      const d = new Date(tx.timestamp);
      const hourStr = `${String(d.getHours()).padStart(2, '0')}:00`;
      if (!buckets[hourStr]) {
        buckets[hourStr] = { time: hourStr, total: 0, high: 0 };
      }
      buckets[hourStr].total += 1;
      if (tx.riskLevel === 'HIGH') {
        buckets[hourStr].high += 1;
      }
    });

    return Object.values(buckets);
  }, [transactions]);

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Real-time transaction intelligence and fraud risk summary"
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Overview' }]}
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Transactions"
              value={summary?.totalTransactions ?? 0}
              icon={<ArrowLeftRight size={16} />}
              accentColor="#3B82F6"
              loading={loading}
              delay={0}
            />
            <MetricCard
              title="High Risk"
              value={summary?.highRiskTransactions ?? 0}
              icon={<AlertTriangle size={16} />}
              accentColor="#F43F5E"
              loading={loading}
              delay={0.05}
            />
            <MetricCard
              title="Pending Review"
              value={summary?.pendingReviewTransactions ?? 0}
              icon={<Clock size={16} />}
              accentColor="#F59E0B"
              loading={loading}
              delay={0.1}
            />
            <MetricCard
              title="Confirmed Fraud"
              value={summary?.confirmedFraudTransactions ?? 0}
              icon={<CheckCircle size={16} />}
              accentColor="#10B981"
              loading={loading}
              delay={0.15}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Medium Risk"
              value={summary?.mediumRiskTransactions ?? 0}
              icon={<TrendingUp size={16} />}
              accentColor="#F59E0B"
              loading={loading}
              delay={0.2}
            />
            <MetricCard
              title="Low Risk"
              value={summary?.lowRiskTransactions ?? 0}
              icon={<CheckCircle size={16} />}
              accentColor="#10B981"
              loading={loading}
              delay={0.25}
            />
            <MetricCard
              title="Avg Risk Score"
              value={summary ? summary.averageRiskScore.toFixed(1) : '0'}
              icon={<BarChart3 size={16} />}
              accentColor="#22D3EE"
              loading={loading}
              delay={0.3}
            />
            <MetricCard
              title="Flagged for Review"
              value={flagged.length}
              icon={<AlertTriangle size={16} />}
              accentColor="#8B5CF6"
              loading={loading}
              delay={0.35}
            />
          </div>

          {/* Live Threat Radar & Defense Operations Command Center */}
          <div className="mb-6">
            <LiveThreatRadar transactions={transactions} />
          </div>

          {/* AI Explainability & SHAP Analytics Hub */}
          <div className="mb-6">
            <AdvancedExplainabilityHub />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            {/* Activity Chart */}
            <div className="lg:col-span-2 glass rounded-2xl p-5 border border-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-sm">Transaction Activity</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {transactions.length > 0 ? 'Live stream from MongoDB' : 'No recorded transactions'}
                  </p>
                </div>
                <BarChart3 size={16} className="text-slate-600" />
              </div>
              {activityTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={activityTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} fill="url(#totalGrad)" name="Total" />
                    <Area type="monotone" dataKey="high" stroke="#F43F5E" strokeWidth={2} fill="url(#highGrad)" name="High Risk" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-44 text-center">
                  <BarChart3 size={24} className="text-slate-600 mb-2" />
                  <p className="text-slate-500 text-xs">No transaction activity recorded yet.</p>
                </div>
              )}
            </div>

            {/* Risk Distribution */}
            <div className="glass rounded-2xl p-5 border border-blue-500/10">
              <h3 className="text-white font-semibold text-sm mb-1">Risk Distribution</h3>
              <p className="text-slate-500 text-xs mb-4">By risk level</p>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#101B32', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, color: '#F8FAFC', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-white font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
                    <BarChart3 size={18} />
                  </div>
                  <p className="text-slate-500 text-xs">No transaction data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="grid lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 glass rounded-2xl border border-blue-500/10 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-blue-500/10">
                <h3 className="text-white font-semibold text-sm">Recent Transactions</h3>
                <Link to="/transactions" className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
                  View All →
                </Link>
              </div>
              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                </div>
              ) : recent.length === 0 ? (
                <EmptyState
                  title="No transactions yet"
                  message="Transactions will appear here once submitted to the backend."
                  icon={<ArrowLeftRight size={22} />}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-500/10">
                        <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">ID</th>
                        <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Amount</th>
                        <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Risk</th>
                        <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Status</th>
                        <th className="text-left text-slate-500 text-xs font-medium px-5 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((tx, i) => (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-blue-500/05 hover:bg-blue-500/05 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <Link to={`/transactions/${tx.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs transition-colors">
                              {tx.id.slice(0, 8)}…
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-white text-xs font-semibold">{formatCurrency(tx.amount, tx.currency)}</td>
                          <td className="px-5 py-3"><RiskBadge level={tx.riskLevel} /></td>
                          <td className="px-5 py-3"><StatusBadge status={tx.status} /></td>
                          <td className="px-5 py-3 text-slate-500 text-xs">{formatRelativeTime(tx.timestamp)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Flagged Panel */}
            <div className="lg:col-span-2 glass rounded-2xl border border-rose-500/15 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-rose-500/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <h3 className="text-white font-semibold text-sm">Flagged for Review</h3>
                </div>
                <Link to="/flagged" className="text-rose-400 hover:text-rose-300 text-xs font-medium transition-colors">
                  View All →
                </Link>
              </div>
              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
              ) : flagged.length === 0 ? (
                <EmptyState
                  title="No flagged transactions"
                  message="High-risk transactions requiring review will appear here."
                  icon={<CheckCircle size={22} />}
                />
              ) : (
                <div className="p-3 space-y-2">
                  {flagged.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to={`/transactions/${tx.id}`}
                        className="block bg-[#0B1224]/60 rounded-xl p-3 border border-rose-500/10 hover:border-rose-500/25 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-blue-400 font-mono text-xs">{tx.id.slice(0, 8)}…</span>
                          <span className="text-rose-400 font-bold text-xs">Score: {tx.riskScore}</span>
                        </div>
                        <p className="text-white text-xs font-semibold">{formatCurrency(tx.amount, tx.currency)}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{tx.senderAccount} → {tx.receiverAccount}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
