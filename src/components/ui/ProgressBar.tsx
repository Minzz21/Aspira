import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color: string; // Tailwind background class, e.g., 'bg-blue-500'
  label?: string;
  showCount?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color, label, showCount = true }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showCount && <span className="text-sm font-bold text-gray-900">{value}</span>}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
        <div 
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
