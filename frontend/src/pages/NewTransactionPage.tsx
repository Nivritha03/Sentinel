import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { createTransaction } from '../services/api';
import type { CreateTransactionPayload, Transaction } from '../types';
import { PageHeader, RiskBadge, StatusBadge } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils';

type FormData = CreateTransactionPayload;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF'];

export default function NewTransactionPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState<FormData>({
    senderAccount: '',
    receiverAccount: '',
    amount: 0,
    currency: 'USD',
    location: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.senderAccount.trim()) e.senderAccount = 'Sender account is required';
    if (!form.receiverAccount.trim()) e.receiverAccount = 'Receiver account is required';
    if (!form.amount || form.amount <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.currency) e.currency = 'Currency is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await createTransaction(form);
      setResult(created);
      addToast('success', 'Transaction created', `Risk score: ${created.riskScore} (${created.riskLevel})`);
    } catch (err: any) {
      addToast('error', 'Failed to create transaction', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const inputCls = (err?: string) =>
    `w-full bg-[#080f1e] border ${err ? 'border-rose-500/60' : 'border-blue-500/20'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors`;

  if (result) {
    return (
      <div>
        <PageHeader
          title="Transaction Created"
          breadcrumbs={[{ label: 'Sentinel' }, { label: 'Transactions' }, { label: 'New' }]}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl"
        >
          <div className="glass rounded-2xl border border-blue-500/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-blue-500/10 flex items-center justify-between">
              <h2 className="text-white font-semibold">Risk Assessment Result</h2>
              <RiskBadge level={result.riskLevel} size="md" />
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#0B1224]/60 rounded-xl p-4 text-center border border-blue-500/10">
                  <p className="text-slate-500 text-xs mb-1">Risk Score</p>
                  <p
                    className="text-4xl font-black"
                    style={{ color: result.riskLevel === 'HIGH' ? '#F43F5E' : result.riskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981' }}
                  >
                    {result.riskScore}
                  </p>
                </div>
                <div className="bg-[#0B1224]/60 rounded-xl p-4 text-center border border-blue-500/10">
                  <p className="text-slate-500 text-xs mb-1">Status</p>
                  <div className="flex justify-center mt-2"><StatusBadge status={result.status} /></div>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Amount</p>
                <p className="text-white font-bold text-lg">{formatCurrency(result.amount, result.currency)}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Risk Reasons</p>
                <ul className="space-y-1.5">
                  {result.riskReasons.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-blue-500/10 flex gap-3">
              <button
                onClick={() => navigate(`/transactions/${result.id}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all focus-ring text-sm"
              >
                View Full Details
              </button>
              <button
                onClick={() => { setResult(null); setForm({ senderAccount: '', receiverAccount: '', amount: 0, currency: 'USD', location: '' }); }}
                className="flex-1 border border-blue-500/20 text-slate-300 hover:text-white py-2.5 rounded-xl transition-all focus-ring text-sm"
              >
                Submit Another
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New Transaction"
        subtitle="Submit a transaction for fraud risk assessment"
        breadcrumbs={[{ label: 'Sentinel' }, { label: 'Transactions' }, { label: 'New' }]}
        actions={
          <button onClick={() => navigate('/transactions')} className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/20 text-slate-300 hover:text-white text-sm font-medium transition-all focus-ring">
            <ArrowLeft size={14} /> Back
          </button>
        }
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <div className="glass rounded-2xl border border-blue-500/10 p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-2" htmlFor="sender">Sender Account *</label>
                <input id="sender" className={inputCls(errors.senderAccount)} placeholder="ACC1001" value={form.senderAccount} onChange={(e) => set('senderAccount', e.target.value)} />
                {errors.senderAccount && <p className="text-rose-400 text-xs mt-1.5">{errors.senderAccount}</p>}
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-2" htmlFor="receiver">Receiver Account *</label>
                <input id="receiver" className={inputCls(errors.receiverAccount)} placeholder="ACC2002" value={form.receiverAccount} onChange={(e) => set('receiverAccount', e.target.value)} />
                {errors.receiverAccount && <p className="text-rose-400 text-xs mt-1.5">{errors.receiverAccount}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-2" htmlFor="amount">Amount *</label>
                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={inputCls(errors.amount)}
                  placeholder="1000.00"
                  value={form.amount || ''}
                  onChange={(e) => set('amount', parseFloat(e.target.value) || 0)}
                />
                {errors.amount && <p className="text-rose-400 text-xs mt-1.5">{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-2" htmlFor="currency">Currency *</label>
                <select id="currency" className={inputCls(errors.currency)} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c} className="bg-[#080f1e]">{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-2" htmlFor="location">Location (optional)</label>
              <input id="location" className={inputCls()} placeholder="New York, US" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all glow-blue hover:scale-[1.01] active:scale-[0.99] focus-ring text-sm"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {submitting ? 'Submitting…' : 'Submit Transaction'}
              </button>
            </div>
          </div>
        </form>

        <p className="text-slate-600 text-xs text-center mt-4">
          Transaction data will be assessed by the Sentinel fraud detection engine and stored in MongoDB.
        </p>
      </div>
    </div>
  );
}

