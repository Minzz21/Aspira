"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface OverdueBannerProps {
  overdueCount: number;
  score: number;
  /** Set to true to hide the "Lihat Laporan" link (e.g., when already on the aspirasi page) */
  hideLink?: boolean;
}

const OverdueBanner: React.FC<OverdueBannerProps> = ({ overdueCount, score, hideLink = false }) => {
  if (overdueCount === 0) return null;

  const tierLabel = score >= 90 ? 'Sangat Responsif' : score >= 70 ? 'Cukup Baik' : score >= 50 ? 'Perlu Perhatian' : 'Kinerja Rendah';
  const bannerBg = score >= 50 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200';
  const iconColor = score >= 50 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className={`rounded-xl border p-4 mb-6 flex items-center justify-between gap-4 ${bannerBg} animate-fade-in`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm ${iconColor}`}>
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            ⚠️ {overdueCount} laporan sudah menunggu lebih dari 2 hari!
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Skor kinerja: <span className="font-bold">{score}/100</span> — {tierLabel}
          </p>
        </div>
      </div>
      {!hideLink && (
        <Link 
          href="/aspirasi-warga"
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
        >
          Lihat Laporan <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </Link>
      )}
    </div>
  );
};

export default OverdueBanner;
