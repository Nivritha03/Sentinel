interface SentinelLogoProps {
  size?: number;
  className?: string;
}

export function SentinelLogo({ size = 32, className = '' }: SentinelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sentinel logo"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id="shieldGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Shield shape */}
      <path
        d="M20 3L5 9v10c0 8.5 6.4 16.4 15 18.3C29.6 35.4 36 27.5 36 19V9L20 3z"
        fill="url(#shieldGrad)"
        opacity="0.15"
        filter="url(#shieldGlow)"
      />
      <path
        d="M20 3L5 9v10c0 8.5 6.4 16.4 15 18.3C29.6 35.4 36 27.5 36 19V9L20 3z"
        stroke="url(#shieldGrad)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Inner S mark */}
      <path
        d="M15 16c0-1.7 1.3-3 3-3h4a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h4c1.7 0 3-1.3 3-3"
        stroke="url(#shieldGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
