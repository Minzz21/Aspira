"use client";

import React from 'react';

interface PerformanceGaugeProps {
  score: number;
  size?: number;
}

function getTier(score: number) {
  if (score >= 90) return { label: 'Sangat Responsif', color: '#22c55e', bgColor: 'from-green-50 to-emerald-50', borderColor: 'border-green-200', textColor: 'text-green-700' };
  if (score >= 70) return { label: 'Cukup Baik', color: '#eab308', bgColor: 'from-yellow-50 to-amber-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' };
  if (score >= 50) return { label: 'Perlu Perhatian', color: '#f97316', bgColor: 'from-orange-50 to-amber-50', borderColor: 'border-orange-200', textColor: 'text-orange-700' };
  return { label: 'Kinerja Rendah', color: '#ef4444', bgColor: 'from-red-50 to-rose-50', borderColor: 'border-red-200', textColor: 'text-red-700' };
}

const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({ score, size = 120 }) => {
  const tier = getTier(score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tier.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{score}</span>
          <span className="text-[10px] font-bold text-gray-400">/100</span>
        </div>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.textColor} bg-gradient-to-r ${tier.bgColor}`}>
        {tier.label}
      </span>
    </div>
  );
};

export { getTier };
export default PerformanceGauge;
