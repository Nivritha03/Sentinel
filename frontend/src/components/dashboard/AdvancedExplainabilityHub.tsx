import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sliders, Cpu, Sparkles, AlertCircle, Info, ChevronRight, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ShapFeature {
  name: string;
  importance: number; // positive = pushes to fraud, negative = pushes to legitimate
  description: string;
}

const DEFAULT_SHAP_FEATURES: ShapFeature[] = [
  { name: 'Transaction Amount vs Normal', importance: 0.42, description: 'Amount is 8.4x higher than 30-day baseline' },
  { name: 'Velocity Burst (10 min)', importance: 0.28, description: '5 rapid attempts in under 600 seconds' },
  { name: 'Geo-Distance / Impossible Speed', importance: 0.19, description: 'Previous auth was in Paris 20m ago' },
  { name: 'Device Fingerprint Incongruence', importance: 0.11, description: 'Unrecognized browser agent & canvas hash' },
  { name: 'Historical Account Age', importance: -0.14, description: 'Account opened > 2 years ago (lowers risk)' },
  { name: 'Verified MFA Ingress', importance: -0.22, description: 'FIDO2 / WebAuthn token verified (lowers risk)' },
];

export const AdvancedExplainabilityHub: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(65);
  const [selectedFeature, setSelectedFeature] = useState<ShapFeature | null>(DEFAULT_SHAP_FEATURES[0]);
  const [activeTab, setActiveTab] = useState<'SHAP' | 'SIMULATOR'>('SHAP');

  // Interactive risk simulation calculation
  const calculatedRisk = Math.round(
    Math.min(
      Math.max(
        DEFAULT_SHAP_FEATURES.reduce((acc, f) => acc + f.importance * 100, 30),
        0
      ),
      100
    )
  );

  const isTriggered = calculatedRisk >= threshold;

  return (
    <div className="glass rounded-2xl border border-blue-500/20 p-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-blue-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <Brain size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white text-sm font-semibold tracking-wide">STATISTICAL EXPLAINABILITY & SHAP REASONING</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                XGBoost + SHAP v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Deconstructed feature attribution & algorithmic decision boundaries</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#070e1d] p-1 rounded-xl border border-blue-500/15 text-xs font-medium">
          <button
            onClick={() => setActiveTab('SHAP')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SHAP'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SHAP Attribution
          </button>
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SIMULATOR'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Threshold Simulator
          </button>
        </div>
      </div>

      {activeTab === 'SHAP' ? (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* SHAP Waterfall / Feature Impact Chart */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">FEATURE SHAP VALUE CONTRIBUTION (Δ RISK)</span>
              <span className="text-[11px] text-cyan-400 font-mono">Base Score: 30.0</span>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                layout="vertical"
                data={DEFAULT_SHAP_FEATURES}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[-0.3, 0.5]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
                  stroke="#334155"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={140}
                  stroke="#334155"
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload as ShapFeature;
                    return (
                      <div className="glass-strong rounded-xl p-3 border border-blue-500/30 text-xs shadow-2xl">
                        <span className="font-semibold text-white block mb-1">{item.name}</span>
                        <div className="text-[11px] text-slate-300 font-mono mb-1">
                          SHAP Impact:{' '}
                          <span
                            className={
                              item.importance > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
                            }
                          >
                            {item.importance > 0 ? '+' : ''}
                            {(item.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">{item.description}</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="importance"
                  radius={[4, 4, 4, 4]}
                  onClick={(entry) => setSelectedFeature(entry as any)}
                >
                  {DEFAULT_SHAP_FEATURES.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.importance > 0 ? '#F43F5E' : '#10B981'}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Lowers Fraud Risk
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Drives Fraud Score Up
              </span>
            </div>
          </div>

          {/* Deep Feature Inspector Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-[#070e1d]/90 rounded-xl p-4 border border-violet-500/20">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-mono mb-2">
                <Sparkles size={14} />
                <span>FEATURE DRILLDOWN & AUDIT</span>
              </div>

              {selectedFeature ? (
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{selectedFeature.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{selectedFeature.description}</p>

                  <div className="bg-[#0b1329] p-3 rounded-lg border border-blue-500/10 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weight Coefficient:</span>
                      <span className="text-white">
                        {selectedFeature.importance > 0 ? '+' : ''}
                        {selectedFeature.importance.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model Sensitivity:</span>
                      <span className="text-cyan-400">High (Top Decile)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Confidence Band:</span>
                      <span className="text-emerald-400">99.4% (p &lt; 0.001)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Click a bar in the SHAP chart to inspect individual neural weights.
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/05 border border-blue-500/15 flex items-center justify-between text-xs mt-3">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-blue-400" />
                <span className="text-slate-300">Composite ML Model Score</span>
              </div>
              <span className="text-base font-black font-mono text-rose-400">{calculatedRisk} / 100</span>
            </div>
          </div>
        </div>
      ) : (
        /* Dynamic Threshold Simulator */
        <div className="space-y-5 py-2">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-2">
                  <Sliders size={14} className="text-violet-400" />
                  AUTOMATED BLOCK THRESHOLD:
                </label>
                <span className="text-lg font-black font-mono text-violet-400 px-3 py-0.5 rounded-lg bg-violet-500/15 border border-violet-500/30">
                  {threshold}
                </span>
              </div>

              <input
                type="range"
                min="30"
                max="90"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Relaxed (30)</span>
                <span>Balanced (65)</span>
                <span>Aggressive (90)</span>
              </div>

              <p className="text-xs text-slate-400">
                Adjusting this threshold alters the precision/recall trade-off. Lower thresholds catch more
                fraud but increase false positive friction for verified users.
              </p>
            </div>

            <div className="bg-[#070e1d]/90 rounded-2xl p-5 border border-violet-500/20 text-center">
              <span className="text-xs font-mono text-slate-400 block mb-1">SIMULATED INTERCEPT VERDICT</span>
              <div
                className={`text-2xl font-black font-mono py-2 px-4 rounded-xl inline-block my-2 border ${
                  isTriggered
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 glow-box-rose'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-box-cyan'
                }`}
              >
                {isTriggered ? 'AUTO-BLOCK TRANSACTION' : 'ALLOW & STEP-UP AUTH'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                At score <strong className="text-white">{calculatedRisk}</strong> vs threshold{' '}
                <strong className="text-white">{threshold}</strong>: Expected precision 99.1%, false alert
                rate &lt;0.04%.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
