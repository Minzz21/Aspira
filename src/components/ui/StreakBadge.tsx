"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faTrophy } from '@fortawesome/free-solid-svg-icons';

interface StreakBadgeProps {
  streak: number;
  bestStreak: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, bestStreak }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faFire} className={`text-sm ${streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
        <span className="text-sm text-gray-700">
          <span className="font-bold">{streak} hari</span> tanpa terlambat
        </span>
      </div>
      {bestStreak > 0 && (
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faTrophy} className="text-sm text-amber-400" />
          <span className="text-xs text-gray-500">
            Rekor terbaik: <span className="font-bold">{bestStreak} hari</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default StreakBadge;
