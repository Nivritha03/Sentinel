import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Play,
  Shield,
  Activity,
  AlertTriangle,
  Search,
  BarChart3,
  ClipboardList,
  CheckCircle,
  Zap,
  Eye,
  Lock,
  TrendingUp,
  ArrowRight,
  Cpu,
  DollarSign,
} from 'lucide-react';
import { LandingNav } from '../components/layout/LandingNav';
import { SentinelLogo } from '../components/ui/SentinelLogo';
import { calculateDemoRisk } from '../utils';
import type { DemoRiskResult, RiskLevel } from '../types';

// ─── Animated Grid Background ────────────────────────────────────────────────

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/5 blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 right-20 w-3 h-3 rounded-full bg-cyan-400"
        style={{ boxShadow: '0 0 12px #22D3EE' }}
      />
      <motion.div
        animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-60 right-60 w-2 h-2 rounded-full bg-blue-400"
        style={{ boxShadow: '0 0 8px #3B82F6' }}
      />
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-40 left-40 w-2.5 h-2.5 rounded-full bg-violet-400"
        style={{ boxShadow: '0 0 10px #8B5CF6' }}
      />
    </div>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────

function DashboardPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const mockTransactions = [
    { id: 'TX4821', account: 'ACC1092', amount: '$12,450', risk: 'HIGH', color: '#F43F5E' },
    { id: 'TX4820', account: 'ACC2341', amount: '$3,200', risk: 'MED', color: '#F59E0B' },
    { id: 'TX4819', account: 'ACC0071', amount: '$890', risk: 'LOW', color: '#10B981' },
    { id: 'TX4818', account: 'ACC5512', amount: '$25,000', risk: 'HIGH', color: '#F43F5E' },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-cyan-600/20 blur-2xl" />
      <div className="relative glass rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">
        {/* Scan line */}
        <motion.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-10 pointer-events-none"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/10 bg-[#080f1e]/50">
          <div className="flex items-center gap-2">
            <SentinelLogo size={20} />
            <span className="text-white text-xs font-bold">Dashboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-medium">Live</span>
          </div>
        </div>

        {/* Metric Row */}
        <div className="grid grid-cols-4 gap-2 p-4">
          {[
            { label: 'Total', val: '2,458', color: '#3B82F6' },
            { label: 'High', val: '178', color: '#F43F5E' },
            { label: 'Medium', val: '64', color: '#F59E0B' },
            { label: 'Avg Score', val: '34.2', color: '#22D3EE' },
          ].map((m) => (
            <div key={m.label} className="bg-[#0B1224]/60 rounded-xl p-2.5 text-center border border-blue-500/10">
              <p className="text-[10px] text-slate-500 mb-1">{m.label}</p>
              <p className="text-sm font-bold" style={{ color: m.color }}>{m.val}</p>
            </div>
          ))}
        </div>

        {/* Chart bars */}
        <div className="px-4 pb-3">
          <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Risk Trend</p>
          <div className="flex items-end gap-1 h-16">
            {[40, 65, 45, 80, 35, 70, 55, 90, 48, 72, 38, 85].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                className="flex-1 rounded-sm"
                style={{
                  background: h > 70
                    ? 'rgba(244,63,94,0.6)'
                    : h > 50
                    ? 'rgba(245,158,11,0.6)'
                    : 'rgba(59,130,246,0.4)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Transaction rows */}
        <div className="px-4 pb-4 space-y-1.5">
          <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Recent Transactions</p>
          {mockTransactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="flex items-center justify-between bg-[#0B1224]/60 rounded-lg px-3 py-2 border border-blue-500/5"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.color, boxShadow: `0 0 4px ${tx.color}` }} />
                <span className="text-[10px] text-slate-300 font-mono">{tx.id}</span>
              </div>
              <span className="text-[10px] text-slate-500">{tx.account}</span>
              <span className="text-[10px] font-semibold text-white">{tx.amount}</span>
              <span className="text-[10px] font-bold" style={{ color: tx.color }}>{tx.risk}</span>
            </motion.div>
          ))}
        </div>

        {/* Alert card */}
        <AnimatePresence>
          {tick % 2 === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="mx-4 mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="text-rose-400" />
                <p className="text-[10px] font-semibold text-rose-300">High-risk transaction detected</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">TX4821 · $12,450 · Score: 80</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  { icon: Shield, title: 'Fraud Risk Scoring', desc: 'Every transaction receives a quantitative risk score based on configurable rules and behavioral patterns.', color: '#F43F5E', gradient: 'from-rose-500/10 to-transparent' },
  { icon: Activity, title: 'Transaction Monitoring', desc: 'Real-time tracking of all transactions with full visibility into amounts, accounts, locations, and timestamps.', color: '#3B82F6', gradient: 'from-blue-500/10 to-transparent' },
  { icon: Eye, title: 'Explainable Risk Decisions', desc: 'Clear, human-readable explanations for every risk score so analysts understand exactly why a flag was raised.', color: '#22D3EE', gradient: 'from-cyan-500/10 to-transparent' },
  { icon: Search, title: 'Fraud Investigation', desc: 'Dedicated workflows with review, confirm fraud, and false-positive resolution capabilities.', color: '#8B5CF6', gradient: 'from-violet-500/10 to-transparent' },
  { icon: BarChart3, title: 'Analytics & Reporting', desc: 'Interactive dashboards with risk distributions, trend charts, and metric summaries across your transaction portfolio.', color: '#F59E0B', gradient: 'from-amber-500/10 to-transparent' },
  { icon: ClipboardList, title: 'Audit Trail & Accountability', desc: 'Complete audit logs of every review action, enabling transparent accountability and regulatory-ready record-keeping.', color: '#10B981', gradient: 'from-emerald-500/10 to-transparent' },
];

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  { n: '01', title: 'Transaction Submitted', desc: 'A new transaction is received with sender, receiver, amount, currency, and location details.', icon: ArrowRight, color: '#3B82F6' },
  { n: '02', title: 'Rules Evaluated', desc: 'Fraud detection rules assess the transaction — checking amounts, account patterns, and behavioral flags.', icon: Cpu, color: '#8B5CF6' },
  { n: '03', title: 'Risk Score Generated', desc: 'A risk score (0–100) and level (LOW / MEDIUM / HIGH) are assigned with clear explanatory reasons.', icon: TrendingUp, color: '#22D3EE' },
  { n: '04', title: 'Analyst Reviews', desc: 'High-risk transactions enter a review queue where analysts can confirm fraud, dismiss false positives, or mark as reviewed.', icon: CheckCircle, color: '#10B981' },
];

// ─── Risk Meter ───────────────────────────────────────────────────────────────

function RiskMeter({ score, level }: { score: number; level: RiskLevel }) {
  const color = level === 'HIGH' ? '#F43F5E' : level === 'MEDIUM' ? '#F59E0B' : '#10B981';
  const angle = (score / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <linearGradient id="meterGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
          <path d="M 10 100 A 90 90 0 0 1 190 100" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M 10 100 A 90 90 0 0 1 190 100" stroke="url(#meterGrad)" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.5" />
          <motion.line
            x1="100" y1="100" x2="100" y2="20"
            stroke={color} strokeWidth="3" strokeLinecap="round"
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            style={{ originX: '100px', originY: '100px' }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
          <circle cx="100" cy="100" r="6" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
      </div>
      <motion.p key={score} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-black mt-1" style={{ color }}>
        {score}
      </motion.p>
      <p className="text-sm text-slate-400 mt-1">Risk Score</p>
      <motion.span
        key={level}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-2 px-4 py-1 rounded-full text-sm font-bold"
        style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      >
        {level} RISK
      </motion.span>
    </div>
  );
}

// ─── Demo Calculator ──────────────────────────────────────────────────────────

function DemoCalculator() {
  const [form, setForm] = useState({ sender: '', receiver: '', amount: '', currency: 'USD', location: '' });
  const [result, setResult] = useState<DemoRiskResult | null>(null);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.sender.trim()) e.sender = 'Required';
    if (!form.receiver.trim()) e.receiver = 'Required';
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid positive amount';
    return e;
  };

  const handleAnalyze = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setResult(calculateDemoRisk(form.sender, form.receiver, parseFloat(form.amount)));
  };

  const inputCls = (err?: string) =>
    `w-full bg-[#0B1224] border ${err ? 'border-rose-500/60' : 'border-blue-500/20'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors`;

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Sender Account</label>
            <input className={inputCls(errors.sender)} placeholder="ACC1001" value={form.sender} onChange={(e) => setForm((p) => ({ ...p, sender: e.target.value }))} />
            {errors.sender && <p className="text-rose-400 text-xs mt-1">{errors.sender}</p>}
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Receiver Account</label>
            <input className={inputCls(errors.receiver)} placeholder="ACC2002" value={form.receiver} onChange={(e) => setForm((p) => ({ ...p, receiver: e.target.value }))} />
            {errors.receiver && <p className="text-rose-400 text-xs mt-1">{errors.receiver}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Amount</label>
            <input type="number" min="0" className={inputCls(errors.amount)} placeholder="5000" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            {errors.amount && <p className="text-rose-400 text-xs mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Currency</label>
            <select className={inputCls()} value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}>
              {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD'].map((c) => <option key={c} value={c} className="bg-[#0B1224]">{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 font-medium mb-1.5">Location (optional)</label>
          <input className={inputCls()} placeholder="New York, US" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
        </div>
        <button
          onClick={handleAnalyze}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all glow-blue hover:scale-[1.02] active:scale-[0.98] focus-ring flex items-center justify-center gap-2"
        >
          <Zap size={16} /> Analyze Transaction
        </button>
        <p className="text-[10px] text-slate-600 text-center">
          ⚠ Client-side demonstration only — uses the same rules as the backend but is not a live API call.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-2xl p-6 border border-blue-500/15 space-y-4">
            <RiskMeter score={result.score} level={result.level} />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Risk Factors Detected</p>
              <ul className="space-y-2">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border border-blue-500/10 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Shield size={24} />
            </div>
            <p className="text-slate-400 text-sm">Fill in transaction details and click <strong className="text-white">Analyze</strong> to see a risk assessment.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ children, id, className = '' }: { children: React.ReactNode; id?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref} id={id} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: 'easeOut' }} className={`relative ${className}`}>
      {children}
    </motion.section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <LandingNav />

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center pt-16">
        <AnimatedGrid />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-6 uppercase tracking-widest">
                <Cpu size={12} /> Automated Rule Engine & Fraud Intelligence
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl xl:text-7xl font-black leading-tight mb-6">
                Smarter <span className="gradient-text">Detection.</span><br />
                Safer <span className="gradient-text-violet">Transactions.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
                Sentinel analyzes every transaction in real time — calculating risk scores, detecting suspicious patterns, and surfacing explainable alerts to help analysts investigate potential fraud before damage is done.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-4 mb-10">
                <Link to="/dashboard" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all glow-blue hover:scale-105 focus-ring">
                  Explore Dashboard <ChevronRight size={16} />
                </Link>
                <a href="#how-it-works" className="flex items-center gap-2 border border-blue-500/30 text-slate-300 hover:text-white hover:border-blue-500/60 font-medium px-6 py-3 rounded-xl transition-all focus-ring">
                  <Play size={14} /> See How It Works
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4">
                {[{ icon: Zap, label: 'Real-Time Analysis' }, { icon: Eye, label: 'Explainable Risk Scores' }, { icon: Search, label: 'Investigation Workflows' }].map((f) => (
                  <span key={f.label} className="flex items-center gap-1.5 text-sm text-slate-400">
                    <f.icon size={13} className="text-emerald-400" /> {f.label}
                  </span>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capability Strip */}
      <Section className="border-y border-blue-500/10 bg-[#0B1224]/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { icon: Activity, label: 'Transaction Monitoring' },
              { icon: TrendingUp, label: 'Risk Analysis' },
              { icon: Search, label: 'Fraud Investigation' },
              { icon: ClipboardList, label: 'Audit Trails' },
              { icon: Lock, label: 'Security Controls' },
            ].map((cap) => (
              <div key={cap.label} className="flex items-center gap-2.5 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <cap.icon size={16} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium">{cap.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">Platform Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Powerful Features for <span className="gradient-text">Maximum Security</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to detect, investigate, and prevent fraud — in one unified platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass rounded-2xl p-6 border border-blue-500/10 hover:border-blue-500/25 transition-all group relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative z-10" style={{ backgroundColor: `${f.color}15`, color: f.color }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2 relative z-10">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed relative z-10">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section id="how-it-works" className="py-24 bg-[#0B1224]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">From transaction to decision — in seconds.</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-500/20 via-violet-500/30 to-emerald-500/20" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="relative text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-5 relative z-10 border"
                      style={{ backgroundColor: `${step.color}12`, borderColor: `${step.color}30`, color: step.color, boxShadow: `0 0 20px ${step.color}15` }}>
                      <Icon size={28} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 mb-1 block">{step.n}</span>
                    <h3 className="text-white font-semibold text-base mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Demo Calculator */}
      <Section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">Interactive Demo</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Try the Risk <span className="gradient-text-violet">Calculator</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Enter transaction details below and see how the risk scoring engine evaluates them — using the same rule logic as the Sentinel backend.
            </p>
          </div>
          <div className="glass rounded-3xl p-6 md:p-10 border border-violet-500/15">
            <DemoCalculator />
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section id="security" className="py-24 bg-[#0B1224]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">Security</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Built for <span className="gradient-text">Trust</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Sentinel is designed with responsible access control, full audit trails, and transparent risk explanations — so every decision can be understood, reviewed, and challenged.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Transparent Risk Decisions', desc: 'Every risk score includes human-readable reasons so analysts always understand what triggered a flag.' },
                  { title: 'Complete Audit Trail', desc: 'All review actions are logged with timestamps, enabling full accountability of analyst decisions.' },
                  { title: 'Secure Data Handling', desc: 'Transaction data flows through a structured Spring Boot API with configurable security controls.' },
                  { title: 'Role-Based Access Design', desc: 'The system is architected for role-based access — analysts see only what they need.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium text-sm">{item.title}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600/5 rounded-3xl blur-3xl" />
              <div className="glass rounded-3xl p-8 border border-emerald-500/15 relative">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield size={48} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Audit Logging', icon: ClipboardList, color: '#10B981' },
                    { label: 'Risk Transparency', icon: Eye, color: '#22D3EE' },
                    { label: 'Access Control', icon: Lock, color: '#8B5CF6' },
                    { label: 'Structured APIs', icon: Activity, color: '#3B82F6' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#0B1224]/60 rounded-2xl p-4 text-center border border-white/5">
                      <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        <item.icon size={18} />
                      </div>
                      <p className="text-white text-xs font-semibold">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section id="about" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-cyan-600/10 rounded-3xl blur-2xl" />
            <div className="glass rounded-3xl p-12 border border-blue-500/20 relative">
              <SentinelLogo size={56} className="mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black mb-5">
                Ready to Stop Fraud <span className="gradient-text">Before It Happens?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Open the Sentinel dashboard and start monitoring your transactions with automated risk intelligence.
              </p>
              <Link to="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all glow-blue hover:scale-105 focus-ring text-base">
                Open Dashboard <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-blue-500/10 bg-[#0B1224]/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SentinelLogo size={24} />
                <span className="text-white font-bold">Sentinel</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">Smarter Detection. Safer Transactions.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2">
                {['Overview', 'Transactions', 'Flagged', 'Audit Logs'].map((l) => (
                  <li key={l}><Link to="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Technology</h4>
              <ul className="space-y-2">
                {['React + Vite', 'TypeScript', 'Spring Boot', 'MongoDB Atlas'].map((l) => (
                  <li key={l}><span className="text-slate-500 text-sm">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Navigation</h4>
              <ul className="space-y-2">
                {[{ label: 'Dashboard', to: '/dashboard' }, { label: 'New Transaction', to: '/transactions/new' }, { label: 'Investigations', to: '/investigations' }].map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">© 2025 Sentinel. Real-Time Fraud Detection Platform.</p>
            <p className="text-slate-700 text-xs">Built with React, TypeScript, Spring Boot &amp; MongoDB</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
