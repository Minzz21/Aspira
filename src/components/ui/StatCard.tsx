import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface StatCardProps {
  icon: IconDefinition;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  badge?: {
    text: string;
    color: string; // e.g., 'bg-red-100 text-danger'
  };
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconBg, iconColor, label, value, badge }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
        <FontAwesomeIcon icon={icon} className="text-2xl" />
      </div>
      <div className="flex-1">
        <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
        <div className="flex items-center gap-3">
          <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
          {badge && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
