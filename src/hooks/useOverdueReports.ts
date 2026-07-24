import { useMemo } from 'react';
import { Aspirasi } from '@/types';

const OVERDUE_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours in ms

export interface OverdueInfo {
  overdueReports: Aspirasi[];
  overdueCount: number;
  /** Returns how many days a specific report has been overdue */
  getOverdueDays: (item: Aspirasi) => number;
  /** Returns true if a report is overdue (>48h and still 'menunggu') */
  isOverdue: (item: Aspirasi) => boolean;
}

export function useOverdueReports(data: Aspirasi[]): OverdueInfo {
  const now = Date.now();

  const isOverdue = (item: Aspirasi): boolean => {
    const createdMs = item.createdAt?.toMillis?.() || 0;
    if (createdMs === 0) return false;
    const elapsed = now - createdMs;
    return item.status === 'menunggu' && elapsed > OVERDUE_THRESHOLD;
  };

  const getOverdueDays = (item: Aspirasi): number => {
    const createdMs = item.createdAt?.toMillis?.() || 0;
    if (createdMs === 0) return 0;
    const elapsed = now - createdMs;
    return Math.floor(elapsed / (24 * 60 * 60 * 1000));
  };

  const overdueReports = useMemo(() => {
    return data.filter(isOverdue);
  }, [data, now]);

  return {
    overdueReports,
    overdueCount: overdueReports.length,
    getOverdueDays,
    isOverdue,
  };
}
