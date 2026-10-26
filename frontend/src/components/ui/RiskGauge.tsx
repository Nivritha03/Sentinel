import React from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  subtext?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 180,
  label = 'Fraud Risk Score',
  subtext,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semicircle gauge: arc covers 240 degrees (2/3 of circle)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(Math.max(score, 0), 100)) / 100;

  // Determine color theme based on score
  let strokeColor = '#10B981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let riskTitle = 'LOW RISK';
  let badgeBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';

  if (score >= 70) {
    strokeColor = '#F43F5E'; // rose
    glowColor = 'rgba(244, 63, 94, 0.45)';
    riskTitle = 'CRITICAL RISK';
    badgeBg = 'bg-rose-500/20 border-rose-500/40 text-rose-400';
  } else if (score >= 40) {
    strokeColor = '#F59E0B'; // amber
    glowColor = 'rgba(245, 158, 11, 0.45)';
    riskTitle = 'SUSPICIOUS / ELEVATED';
    badgeBg = 'bg-amber-500/20 border-amber-500/40 text-amber-400';
  }

  return (
    <div className="flex flex-col items-center justify-center relative p-2 select-none">
      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-[210deg] origin-center"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black font-mono tracking-tight"
            style={{ color: strokeColor }}
          >
            {Math.round(score)}
          </motion.span>
          <span className={`text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full border ${badgeBg}`}>
            {riskTitle}
          </span>
        </div>
      </div>

      <div className="text-center mt-1">
        <span className="text-xs font-semibold text-slate-300 block">{label}</span>
        {subtext && <span className="text-[11px] text-slate-500">{subtext}</span>}
      </div>
    </div>
  );
};
