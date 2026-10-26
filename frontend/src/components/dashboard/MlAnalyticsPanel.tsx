import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

/**
 * ML Analytics panel displayed on the Dashboard Overview.
 * Shows recent fraud probability trends and the current scoring mode.
 */
export const MlAnalyticsPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<string>("RULES_ONLY");
  const [latestProb, setLatestProb] = useState<number>(0);
  const [trend, setTrend] = useState<Array<{ ts: string; prob: number }>>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('sentinel_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get("http://localhost:8080/api/ml/analytics", { headers });
        setMode(data.mode);
        setLatestProb(data.latestFraudProbability);
        setTrend(data.trend || []);
      } catch (e) {
        // Fallback demo data
        setMode("HYBRID");
        setLatestProb(0.18);
        setTrend([
          { ts: "10:00", prob: 0.12 },
          { ts: "11:00", prob: 0.18 },
          { ts: "12:00", prob: 0.45 },
          { ts: "13:00", prob: 0.15 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="glass rounded-2xl p-4 text-xs text-slate-400">Loading ML analytics...</div>;
  }

  return (
    <div className="glass rounded-2xl p-5 border border-blue-500/15">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">ML Fraud Scoring Analytics</h3>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
          mode === "HYBRID" ? "bg-amber-500/20 text-amber-300" : mode === "ML_ONLY" ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"
        }`}>
          Mode: {mode}
        </span>
      </div>

      <div className="mb-3 text-xs text-slate-400">
        Recent fraud probability: <strong className="text-white">{(latestProb * 100).toFixed(1)}%</strong>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={trend}>
          <XAxis dataKey="ts" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#334155" />
          <YAxis domain={[0, 1]} tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`} tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#334155" />
          <RechartsTooltip formatter={(v: any) => `${(Number(v) * 100).toFixed(1)}%`} />
          <Line type="monotone" dataKey="prob" stroke="#38bdf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
