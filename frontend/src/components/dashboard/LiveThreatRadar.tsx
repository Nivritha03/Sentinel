import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ShieldAlert, Zap, Globe2, Activity, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Transaction } from '../../types';

interface LiveThreatRadarProps {
  transactions: Transaction[];
  onQuickInspect?: (tx: Transaction) => void;
}

interface ThreatNode {
  id: string;
  angle: number;
  distance: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  amount: string;
  time: string;
  location: string;
}

export const LiveThreatRadar: React.FC<LiveThreatRadarProps> = ({
  transactions,
  onQuickInspect,
}) => {
  const [activeNode, setActiveNode] = useState<ThreatNode | null>(null);
  const [pulseCount, setPulseCount] = useState<number>(0);

  // Generate radar coordinate points strictly from real transactions
  const radarNodes: ThreatNode[] = React.useMemo(() => {
    if (transactions.length > 0) {
      return transactions.slice(0, 10).map((tx, idx) => {
        const angle = (idx * 36 + 18) % 360;
        const distRatio = tx.riskLevel === 'HIGH' ? 0.35 : tx.riskLevel === 'MEDIUM' ? 0.6 : 0.85;
        return {
          id: tx.id,
          angle,
          distance: distRatio,
          severity: tx.riskLevel === 'HIGH' ? 'HIGH' : tx.riskLevel === 'MEDIUM' ? 'MEDIUM' : 'LOW',
          title: `Tx #${tx.id.slice(0, 8)}`,
          amount: `$${tx.amount.toLocaleString()}`,
          time: new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          location: tx.location || 'Global Gateway',
        };
      });
    }
    return [];
  }, [transactions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass rounded-2xl border border-blue-500/20 p-5 relative overflow-hidden">
      {/* Background cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Header telemetry badge */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white text-sm font-semibold tracking-wide">DEFENSE COMMAND RADAR</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE INTERCEPT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Real-time fraud vector triangulation & spatial risk</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
            <span className="text-[11px] text-slate-300">High (&gt;75)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
            <span className="text-[11px] text-slate-300">Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            <span className="text-[11px] text-slate-300">Safe</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Radar Scanner Viewport */}
        <div className="lg:col-span-7 flex justify-center py-2">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-cyan-500/30 bg-[#060c18]/90 flex items-center justify-center shadow-[0_0_35px_-5px_rgba(6,182,212,0.18)]">
            {/* Concentric rings */}
            <div className="absolute inset-4 rounded-full border border-cyan-500/15" />
            <div className="absolute inset-12 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-20 rounded-full border border-cyan-500/25 border-dashed" />
            <div className="absolute inset-28 rounded-full border border-cyan-500/30" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 h-[1px] bg-cyan-500/20" />
            <div className="absolute inset-y-0 w-[1px] bg-cyan-500/20" />

            {/* Rotating radar scanline beam */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div
                className="w-full h-full animate-radar origin-center"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(34, 211, 238, 0.4) 0deg, rgba(34, 211, 238, 0.08) 35deg, transparent 65deg)',
                }}
              />
            </div>

            {/* Center defense core */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_#22D3EE]">
              <div className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
            </div>

            {/* Dynamic Threat Blips */}
            {radarNodes.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              // Distance radius max is around 110px
              const r = node.distance * 115;
              const x = r * Math.cos(rad);
              const y = r * Math.sin(rad);

              const color =
                node.severity === 'HIGH'
                  ? '#F43F5E'
                  : node.severity === 'MEDIUM'
                  ? '#F59E0B'
                  : '#10B981';

              const isSelected = activeNode?.id === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                  title={`${node.title} - ${node.amount}`}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      isSelected ? 'scale-150 ring-4 ring-cyan-400/40' : 'group-hover:scale-125'
                    }`}
                    style={{
                      width: node.severity === 'HIGH' ? 12 : 9,
                      height: node.severity === 'HIGH' ? 12 : 9,
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}`,
                    }}
                  />
                  {node.severity === 'HIGH' && (
                    <span
                      className="absolute -inset-1 rounded-full animate-ping opacity-75 pointer-events-none"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Threat Details Feed */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="bg-[#070e1d]/80 rounded-xl p-4 border border-blue-500/15">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>SELECTED TELEMETRY NODE</span>
              <span className="text-cyan-400">PULSE #{pulseCount}</span>
            </div>

            {activeNode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">{activeNode.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      activeNode.severity === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : activeNode.severity === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {activeNode.severity} RISK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">PAYLOAD VALUE</span>
                    <span className="text-white font-mono font-bold">{activeNode.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ORIGIN NODE</span>
                    <span className="text-slate-300 font-mono truncate block">{activeNode.location}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Logged: {activeNode.time}</span>
                  <Link
                    to={`/transactions/${activeNode.id}`}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    Investigate <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Activity size={24} className="mx-auto text-cyan-400/50 mb-2 animate-bounce" />
                <p className="text-xs text-slate-400">
                  {radarNodes.length > 0
                    ? 'Click any blinking radar blip to inspect threat telemetry.'
                    : 'Awaiting transactions from backend to track on radar.'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Threat Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="glass-strong rounded-xl p-2.5 border border-rose-500/20">
              <span className="text-[10px] text-slate-400 block font-mono">INTERCEPTED</span>
              <span className="text-base font-black text-rose-400 font-mono">
                {radarNodes.filter((n) => n.severity === 'HIGH').length}
              </span>
            </div>
            <div className="glass-strong rounded-xl p-2.5 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 block font-mono">FLAGGED</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {radarNodes.filter((n) => n.severity === 'MEDIUM').length}
              </span>
            </div>
            <div className="glass-strong rounded-xl p-2.5 border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 block font-mono">SECURE</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {radarNodes.filter((n) => n.severity === 'LOW').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
