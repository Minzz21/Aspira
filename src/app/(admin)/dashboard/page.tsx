"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faExclamationCircle, faStore, faEye, faCircleNotch, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PerformanceGauge from '@/components/ui/PerformanceGauge';
import OverdueBanner from '@/components/ui/OverdueBanner';
import StreakBadge from '@/components/ui/StreakBadge';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';
import { useOverdueReports } from '@/hooks/useOverdueReports';
import { aspirasiCol, umkmCol, adminPerformanceCol } from '@/lib/firestore';
import { Aspirasi, UMKM, AdminPerformance } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const OVERDUE_PENALTY_PER_REPORT = 5;

export default function DashboardPage() {
  const { data: listAspirasi, loading: loadingAspirasi } = useFirestoreCollection<Aspirasi>(aspirasiCol);
  const { data: listUmkm, loading: loadingUmkm } = useFirestoreCollection<UMKM>(umkmCol);
  const { admin } = useAuth();

  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Performance state
  const [performance, setPerformance] = useState<AdminPerformance>({
    adminId: '',
    adminName: '',
    score: 100,
    streak: 0,
    bestStreak: 0,
    totalResolved: 0,
    totalOverdue: 0,
  });

  const { overdueCount, overdueReports } = useOverdueReports(listAspirasi);

  // Load/initialize admin performance from Firestore
  useEffect(() => {
    if (!admin?.nik) return;
    
    const loadPerformance = async () => {
      const docRef = doc(db, 'admin_performance', admin.nik);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setPerformance({ id: docSnap.id, ...docSnap.data() } as AdminPerformance);
      } else {
        // Initialize performance for new admin
        const initial: AdminPerformance = {
          adminId: admin.nik,
          adminName: admin.nama,
          score: 100,
          streak: 0,
          bestStreak: 0,
          totalResolved: 0,
          totalOverdue: 0,
        };
        await setDoc(docRef, initial);
        setPerformance(initial);
      }
    };
    
    loadPerformance();
  }, [admin?.nik]);

  // Calculate real-time score based on overdue reports
  const liveScore = useMemo(() => {
    const penalty = overdueCount * OVERDUE_PENALTY_PER_REPORT;
    return Math.max(0, Math.min(100, performance.score - penalty));
  }, [performance.score, overdueCount]);

  const totalResolved = listAspirasi.filter(a => a.status === 'selesai').length;

  if (loadingAspirasi || loadingUmkm) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <FontAwesomeIcon icon={faCircleNotch} className="fa-spin text-4xl text-primary" />
      </div>
    );
  }

  // Agregasi Data
  const totalAspirasi = listAspirasi.length;
  const criticalAspirasi = listAspirasi.filter(a => a.kritis || a.status === 'kritis').length;
  const totalUmkm = listUmkm.length;

  // Kategori Counts
  const categoriesCount = listAspirasi.reduce((acc, curr) => {
    const cat = curr.kategori || 'Lainnya';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top 5 Categories dynamically
  const topCategories = Object.entries(categoriesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const categoryColors = ['bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-primary', 'bg-gray-500'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'kritis':
        return <span className="px-2 py-1 bg-red-100 text-danger text-xs font-semibold rounded-md">KRITIS</span>;
      case 'proses':
        return <span className="px-2 py-1 bg-amber-100 text-warning text-xs font-semibold rounded-md">PROSES</span>;
      case 'selesai':
        return <span className="px-2 py-1 bg-green-100 text-success text-xs font-semibold rounded-md">SELESAI</span>;
      case 'menunggu':
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">MENUNGGU</span>;
    }
  };

  const columns: Column<Aspirasi>[] = [
    { key: 'tanggal', header: 'Waktu / Tanggal', render: (item) => item.waktu || 'Baru saja' },
    { key: 'nama', header: 'Pelapor', render: (item) => item.nama || item.pelapor || 'Warga' },
    { key: 'subjek', header: 'Subjek Aspirasi' },
    { key: 'kategori', header: 'Kategori' },
    { key: 'status', header: 'Status', render: (item) => getStatusBadge(item.status) },
    { 
      key: 'aksi', 
      header: 'Aksi', 
      render: (item) => (
        <button 
          onClick={() => { setSelectedAspirasi(item); setIsModalOpen(true); }}
          className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-primary hover:bg-green-50 transition-colors flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faEye} />
        </button>
      )
    }
  ];

  // Ambil 5 aspirasi terbaru (Asumsi belum tersortir dari backend, sort di client untuk demo)
  const recentAspirasi = [...listAspirasi].sort((a, b) => {
    const dateA = a.createdAt?.toMillis?.() || 0;
    const dateB = b.createdAt?.toMillis?.() || 0;
    return dateB - dateA; // Descending
  }).slice(0, 5);

  return (
    <div className="p-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Ringkasan Eksekutif Desa</h1>
        <p className="text-sm text-gray-500">Pantau statistik utama dan laporan warga secara real-time.</p>
      </div>

      {/* Overdue Alert Banner */}
      <OverdueBanner overdueCount={overdueCount} score={liveScore} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={faFileAlt}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Total Aspirasi"
          value={totalAspirasi}
        />
        <StatCard 
          icon={faExclamationCircle}
          iconBg="bg-red-100"
          iconColor="text-danger"
          label="Laporan Kritis"
          value={criticalAspirasi}
          badge={{ text: "PRIORITAS", color: "bg-red-100 text-danger" }}
        />
        <StatCard 
          icon={faStore}
          iconBg="bg-green-100"
          iconColor="text-success"
          label="Total UMKM"
          value={totalUmkm}
        />
      </div>

      {/* Performance Widget + Categories + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Categories + Performance */}
        <div className="xl:col-span-1 space-y-6">
          {/* Performance Widget */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              Skor Kinerja Admin
            </h2>
            
            <div className="flex flex-col items-center gap-4">
              <PerformanceGauge score={liveScore} size={130} />
              
              <div className="w-full border-t border-gray-100 pt-4 space-y-3">
                <StreakBadge streak={performance.streak} bestStreak={performance.bestStreak} />
                
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-sm text-green-500" />
                  <span className="text-sm text-gray-700">
                    Diselesaikan: <span className="font-bold">{totalResolved}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-sm text-red-400" />
                  <span className="text-sm text-gray-700">
                    Terlambat saat ini: <span className="font-bold text-red-600">{overdueCount}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bars (Kategori) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Aspirasi per Kategori</h2>
            <div className="space-y-5">
              {topCategories.length > 0 ? (
                topCategories.map(([cat, count], index) => (
                  <ProgressBar 
                    key={cat} 
                    value={count} 
                    max={totalAspirasi} 
                    color={categoryColors[index % categoryColors.length]} 
                    label={cat} 
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada data kategori.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Data Table (Terbaru) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Laporan & Aspirasi Terkini</h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-primary-light rounded-md">Live Update</span>
          </div>
          <div className="p-0">
            <DataTable columns={columns} data={recentAspirasi} emptyMessage="Belum ada data aspirasi." />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Aspirasi" maxWidth="lg">
        {selectedAspirasi && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Subjek</p>
              <p className="text-gray-900 font-medium">{selectedAspirasi.subjek}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Kategori</p>
                <p className="text-gray-900">{selectedAspirasi.kategori}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                <div className="mt-1">{getStatusBadge(selectedAspirasi.status)}</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Transkripsi Laporan</p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100">
                {selectedAspirasi.transkripsi || 'Tidak ada transkripsi tersedia.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
