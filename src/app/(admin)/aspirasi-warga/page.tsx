"use client";

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilePdf, faCommentDots, faSpinner, faTriangleExclamation, 
  faSearch, faCopy, faCheck, faCircleNotch, faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import StatCard from '@/components/ui/StatCard';
import FilterChips from '@/components/ui/FilterChips';
import SearchInput from '@/components/ui/SearchInput';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { useToast } from '@/contexts/ToastContext';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';
import { aspirasiCol } from '@/lib/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Aspirasi } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AspirasiWargaPage() {
  const { data: rawData, loading } = useFirestoreCollection<Aspirasi>(aspirasiCol);
  const { showToast } = useToast();

  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  // Derived Metrics
  const totalLaporan = rawData.length;
  const diproses = rawData.filter(item => item.status === 'proses').length;
  const kritis = rawData.filter(item => item.status === 'kritis' || item.kritis).length;

  // Filtering
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      if (filter === 'Kritis' && item.status !== 'kritis' && !item.kritis) return false;
      if (filter === 'Selesai' && item.status !== 'selesai') return false;
      
      if (search) {
        const query = search.toLowerCase();
        return (
          (item.nama || item.pelapor || '').toLowerCase().includes(query) ||
          item.subjek.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });
  }, [rawData, filter, search]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useMemo(() => {
    setCurrentPage(1);
  }, [filter, search]);

  // Export PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Laporan Aspirasi Warga - ASPIRA AI", 14, 15);
      doc.setFontSize(10);
      doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
      
      const tableData = filteredData.map(item => [
        item.waktu || 'Baru saja',
        item.nama || item.pelapor || 'Warga',
        item.subjek,
        item.kategori,
        item.status === 'proses' ? 'DIPROSES' : item.status === 'selesai' ? 'SELESAI' : 'MENUNGGU',
        (item.status === 'kritis' || item.kritis) ? 'KRITIS' : 'NORMAL'
      ]);

      autoTable(doc, {
        head: [['Waktu', 'Pelapor', 'Subjek', 'Kategori', 'Progres', 'Status']],
        body: tableData,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 77, 43] } // ASPIRA primary color
      });

      doc.save("Laporan_Aspirasi_ASPIRA.pdf");
      showToast("Berhasil mengunduh dokumen PDF.", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal mengunduh dokumen PDF.", "error");
    }
  };

  const getProgresBadge = (status: string) => {
    if (status === 'proses') {
      return <span className="px-2 py-1 bg-amber-100 text-warning text-[10px] font-bold rounded shadow-sm border border-amber-200">DIPROSES</span>;
    }
    if (status === 'selesai') {
      return <span className="px-2 py-1 bg-green-100 text-success text-[10px] font-bold rounded shadow-sm border border-green-200">SELESAI</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded shadow-sm border border-gray-200">MENUNGGU</span>;
  };

  const getStatusKritisBadge = (status: string, isKritis: boolean = false) => {
    if (status === 'kritis' || isKritis) {
      return <span className="px-2 py-1 bg-red-100 text-danger text-[10px] font-bold rounded shadow-sm border border-red-200">KRITIS</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded shadow-sm border border-blue-200">NORMAL</span>;
  };

  const columns: Column<Aspirasi>[] = [
    { key: 'waktu', header: 'Waktu', render: (item) => <span className="text-xs text-gray-500 whitespace-nowrap">{item.waktu || 'Baru saja'}</span> },
    { key: 'pelapor', header: 'Pelapor', render: (item) => <span className="font-semibold text-gray-900">{item.nama || item.pelapor || 'Warga'}</span> },
    { key: 'subjek', header: 'Subjek', render: (item) => <span className="text-gray-700 truncate max-w-[150px] inline-block">{item.subjek}</span> },
    { key: 'kategori', header: 'Kategori', render: (item) => <span className="text-xs font-medium text-gray-600">{item.kategori}</span> },
    { key: 'progres', header: 'Progres', render: (item) => getProgresBadge(item.status) },
    { key: 'status', header: 'Status', render: (item) => getStatusKritisBadge(item.status, item.kritis) }
  ];

  const handleCopyTranscription = () => {
    if (selectedAspirasi?.transkripsi) {
      navigator.clipboard.writeText(selectedAspirasi.transkripsi);
      setCopied(true);
      showToast("Teks disalin ke clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateStatus = async (newStatus: 'kritis' | 'proses' | 'selesai' | 'menunggu') => {
    if (!selectedAspirasi?.id) return;
    setIsUpdatingStatus(true);
    try {
      const docRef = doc(db, 'aspirasi', selectedAspirasi.id);
      await updateDoc(docRef, { status: newStatus });
      // Update local selected item state
      setSelectedAspirasi({ ...selectedAspirasi, status: newStatus });
      showToast(`Status laporan berhasil diubah ke ${newStatus.toUpperCase()}`, "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui status laporan", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <FontAwesomeIcon icon={faCircleNotch} className="fa-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Aspirasi & Laporan Warga</h1>
          <p className="text-sm text-gray-500">Tindak lanjuti keluhan warga dengan fitur transkripsi AI terintegrasi.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="px-4 py-2.5 bg-danger text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2 w-fit"
        >
          <FontAwesomeIcon icon={faFilePdf} /> Export Data (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={faCommentDots} iconBg="bg-blue-100" iconColor="text-blue-600" label="Total Laporan" value={totalLaporan} />
        <StatCard icon={faSpinner} iconBg="bg-amber-100" iconColor="text-warning" label="Sedang Diproses" value={diproses} />
        <StatCard icon={faTriangleExclamation} iconBg="bg-red-100" iconColor="text-danger" label="Prioritas Kritis" value={kritis} badge={{text: "SEGERA", color: "bg-red-100 text-danger"}}/>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Data Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <FilterChips 
                options={[
                  { label: 'Semua', value: 'Semua' },
                  { label: 'Kritis', value: 'Kritis' },
                  { label: 'Selesai', value: 'Selesai' }
                ]}
                activeValue={filter}
                onChange={setFilter}
              />
              <SearchInput 
                placeholder="Cari subjek atau pelapor..."
                value={search}
                onChange={setSearch}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {columns.map(col => (
                      <th key={col.key} className="p-4">{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                        Tidak ada laporan aspirasi ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedAspirasi(item)}
                        className={`hover:bg-green-50/30 transition-colors cursor-pointer ${selectedAspirasi?.id === item.id ? 'bg-green-50/50 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                      >
                        {columns.map(col => (
                          <td key={col.key} className="p-4">
                            {col.render ? col.render(item) : (item as any)[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredData.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination 
                  totalItems={filteredData.length} 
                  itemsPerPage={itemsPerPage} 
                  currentPage={currentPage} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detail Panel (Sticky) */}
        <div className="lg:col-span-1 sticky top-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-4 bg-gray-50/80 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faSearch} className="text-primary-light" /> 
                Detail Laporan
              </h2>
            </div>
            
            {!selectedAspirasi ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <FontAwesomeIcon icon={faCommentDots} className="text-5xl text-gray-200 mb-4" />
                <p className="text-sm">Klik salah satu laporan pada tabel di sebelah kiri untuk melihat rincian lengkapnya.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-6">
                
                {/* Info Pelapor */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                      {(selectedAspirasi.nama || selectedAspirasi.pelapor || 'W')?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedAspirasi.nama || selectedAspirasi.pelapor || 'Warga Anonim'}</h3>
                      <p className="text-xs text-gray-500">{selectedAspirasi.waktu || 'Baru saja'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {getProgresBadge(selectedAspirasi.status)}
                    {getStatusKritisBadge(selectedAspirasi.status, selectedAspirasi.kritis)}
                  </div>
                </div>

                {/* Subjek & Kategori */}
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50">
                  <h4 className="font-bold text-gray-900 mb-1">{selectedAspirasi.subjek}</h4>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                    <span className="px-2 py-0.5 bg-blue-100 rounded">{selectedAspirasi.kategori}</span>
                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faLocationDot}/> Lokasi Terlampir</span>
                  </div>
                </div>

                {/* Audio Player */}
                {selectedAspirasi.audioUrl && (
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Rekaman Suara</h5>
                    <AudioPlayer url={selectedAspirasi.audioUrl} />
                  </div>
                )}

                {/* Transkripsi AI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-gray-500 uppercase">Transkripsi AI (Otomatis)</h5>
                    {selectedAspirasi.transkripsi && (
                      <button 
                        onClick={handleCopyTranscription}
                        className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? 'Disalin!' : 'Salin Teks'}
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                    {selectedAspirasi.transkripsi ? `"${selectedAspirasi.transkripsi}"` : <span className="italic text-gray-400">Tidak ada transkripsi teks yang terlampir pada laporan ini.</span>}
                  </div>
                </div>

                {/* Panel Tindak Lanjut */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Tindak Lanjut Admin</h5>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleUpdateStatus('proses')}
                      disabled={isUpdatingStatus || selectedAspirasi.status === 'proses'}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${selectedAspirasi.status === 'proses' ? 'bg-amber-100 text-amber-700 cursor-default' : 'bg-white border border-gray-200 text-gray-600 hover:border-warning hover:text-warning'}`}
                    >
                      <FontAwesomeIcon icon={faSpinner} className={isUpdatingStatus && selectedAspirasi.status !== 'proses' ? "fa-spin" : ""} /> Tandai Sedang Diproses
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('selesai')}
                      disabled={isUpdatingStatus || selectedAspirasi.status === 'selesai'}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${selectedAspirasi.status === 'selesai' ? 'bg-green-100 text-green-700 cursor-default' : 'bg-primary text-white shadow-sm hover:bg-primary-dark'}`}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Tandai Kasus Selesai
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
