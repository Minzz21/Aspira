"use client";

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faMars, faVenus, faMapLocationDot,
  faFileExcel, faPlus, faPenToSquare, faTrash, faStore, faCircleNotch
} from '@fortawesome/free-solid-svg-icons';
import StatCard from '@/components/ui/StatCard';
import FilterChips from '@/components/ui/FilterChips';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';
import { whitelistCol, umkmCol } from '@/lib/firestore';
import { addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WhitelistWarga, UMKM } from '@/types';
import { calculateAgeFromNIK } from '@/utils/age';
import * as XLSX from 'xlsx';

const DUSUN_LIST = ['Dusun I', 'Dusun II', 'Dusun III', 'Dusun IV', 'Dusun V'];
const SEKTOR_LIST = ['Kuliner', 'Kerajinan', 'Fashion', 'Jasa', 'Agrikultur', 'Perdagangan', 'Lainnya'];

export default function ProfilDesaPage() {
  const { data: rawWarga, loading: loadingWarga } = useFirestoreCollection<WhitelistWarga>(whitelistCol);
  const { data: rawUmkm, loading: loadingUmkm } = useFirestoreCollection<UMKM>(umkmCol);
  const { showToast } = useToast();

  const [filterDusun, setFilterDusun] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedUmkm, setSelectedUmkm] = useState<UMKM | null>(null);
  const [selectedWilayah, setSelectedWilayah] = useState<string>('');

  const [formData, setFormData] = useState<Partial<UMKM>>({
    nama: '',
    pemilik: '',
    sektor: 'Kuliner',
    wilayah: 'Dusun I',
    alamat: ''
  });

  // --- Demography Calculations ---
  const totalPenduduk = rawWarga.length;
  const totalLaki = rawWarga.filter(w => w.gender === 'Laki-laki').length;
  const totalPerempuan = rawWarga.filter(w => w.gender === 'Perempuan').length;
  const pctLaki = totalPenduduk > 0 ? (totalLaki / totalPenduduk) * 100 : 0;
  const pctPerempuan = totalPenduduk > 0 ? (totalPerempuan / totalPenduduk) * 100 : 0;
  
  const ageGroups = useMemo(() => {
    const groups = { '0-14': 0, '15-24': 0, '25-44': 0, '45-64': 0, '65+': 0 };
    rawWarga.forEach(w => {
      const age = calculateAgeFromNIK(w.nik);
      if (age !== null) {
        if (age <= 14) groups['0-14']++;
        else if (age <= 24) groups['15-24']++;
        else if (age <= 44) groups['25-44']++;
        else if (age <= 64) groups['45-64']++;
        else groups['65+']++;
      }
    });
    return groups;
  }, [rawWarga]);

  // --- UMKM Breakdown Calculations ---
  const umkmByWilayah = useMemo(() => {
    const counts = rawUmkm.reduce((acc, curr) => {
      const w = curr.wilayah || 'Tidak Diketahui';
      acc[w] = (acc[w] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(w => ({ id: w, wilayah: w, umkmCount: counts[w] })).sort((a, b) => a.wilayah.localeCompare(b.wilayah));
  }, [rawUmkm]);

  const filteredWilayah = useMemo(() => {
    if (filterDusun === 'Semua') return umkmByWilayah;
    return umkmByWilayah.filter(w => w.wilayah === filterDusun);
  }, [umkmByWilayah, filterDusun]);

  const paginatedWilayah = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWilayah.slice(start, start + itemsPerPage);
  }, [filteredWilayah, currentPage]);

  useMemo(() => setCurrentPage(1), [filterDusun]);

  // --- Top Sectors ---
  const topSektors = useMemo(() => {
    const counts = rawUmkm.reduce((acc, curr) => {
      const s = curr.sektor || curr.sektor_usaha || 'Lainnya';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts)
      .map(s => ({ nama: s, count: counts[s] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3
  }, [rawUmkm]);

  // --- Actions ---
  const handleExportExcel = () => {
    try {
      showToast('Memproses Ekspor Data...', 'info');
      
      const wsPenduduk = XLSX.utils.json_to_sheet(rawWarga.map((p, i) => ({
        'No': i + 1,
        'Nama Lengkap': p.nama || '-',
        'NIK': p.nik || '-',
        'Jenis Kelamin': p.gender || '-',
        'Dusun': p.dusun || '-',
        'Status': p.status || '-',
      })));

      const wsUMKM = XLSX.utils.json_to_sheet(rawUmkm.map((u, i) => ({
        'No': i + 1,
        'Nama UMKM': u.nama || u.nama_umkm || '-',
        'Pemilik': u.pemilik || u.nama_pemilik || '-',
        'Sektor Usaha': u.sektor || u.sektor_usaha || '-',
        'Wilayah': u.wilayah || '-',
        'Alamat Lengkap': u.alamat || u.alamat_lengkap || '-'
      })));

      wsPenduduk['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      wsUMKM['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 40 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsPenduduk, "Data Penduduk");
      XLSX.utils.book_append_sheet(wb, wsUMKM, "Data UMKM");

      XLSX.writeFile(wb, "Data_Profil_Desa_dan_UMKM.xlsx");
      showToast('Data berhasil diekspor.', 'success');
    } catch (e) {
      showToast('Terjadi kesalahan saat mengekspor data.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setSelectedUmkm(null);
    setFormData({ nama: '', pemilik: '', sektor: 'Kuliner', wilayah: 'Dusun I', alamat: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (umkm: UMKM) => {
    setSelectedUmkm(umkm);
    setFormData({
      nama: umkm.nama || umkm.nama_umkm || '',
      pemilik: umkm.pemilik || umkm.nama_pemilik || '',
      sektor: umkm.sektor || umkm.sektor_usaha || '',
      wilayah: umkm.wilayah || '',
      alamat: umkm.alamat || umkm.alamat_lengkap || ''
    });
    setIsDetailModalOpen(false); // Close detail if open
    setIsFormModalOpen(true);
  };

  const handleSubmitUmkm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.pemilik || !formData.alamat) {
      showToast('Harap lengkapi semua bidang yang wajib.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (selectedUmkm?.id) {
        await updateDoc(doc(db, 'umkm', selectedUmkm.id), { ...formData });
        showToast('Data UMKM berhasil diperbarui.', 'success');
      } else {
        const newUmkm: UMKM = {
          nama: formData.nama!,
          pemilik: formData.pemilik!,
          sektor: formData.sektor!,
          wilayah: formData.wilayah!,
          alamat: formData.alamat,
          createdAt: serverTimestamp()
        };
        await addDoc(umkmCol, newUmkm);
        showToast('UMKM berhasil diregistrasi.', 'success');
      }
      setIsFormModalOpen(false);
      // Re-open detail if we edited from there
      if (selectedUmkm?.id && selectedWilayah) {
         setIsDetailModalOpen(true);
      }
    } catch (e) {
      showToast('Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUmkm?.id) return;
    try {
      await deleteDoc(doc(db, 'umkm', selectedUmkm.id));
      showToast('Data UMKM berhasil dihapus.', 'success');
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false); // Close detail list as it might be stale
    } catch (e) {
      showToast('Gagal menghapus UMKM.', 'error');
    }
  };

  const columns: Column<{ id: string; wilayah: string; umkmCount: number }>[] = [
    { key: 'wilayah', header: 'Dusun/Wilayah', render: (item) => <span className="font-bold text-gray-900">{item.wilayah}</span> },
    { key: 'umkmCount', header: 'Jumlah UMKM', render: (item) => <span className="text-gray-600">{item.umkmCount} Unit Terdaftar</span> },
    { 
      key: 'aksi', 
      header: 'Aksi', 
      render: (item) => (
        <button 
          onClick={() => { setSelectedWilayah(item.wilayah); setIsDetailModalOpen(true); }}
          className="text-primary text-sm font-bold hover:underline"
        >
          Lihat Detail
        </button>
      )
    }
  ];

  if (loadingWarga || loadingUmkm) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <FontAwesomeIcon icon={faCircleNotch} className="fa-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Profil Desa & Potensi UMKM</h1>
          <p className="text-sm text-gray-500">Pusat wawasan demografi penduduk dan penggerak ekonomi desa.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-success text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 w-fit"
        >
          <FontAwesomeIcon icon={faFileExcel} /> Export Data (Excel)
        </button>
      </div>

      {/* Demography Infographics Section */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FontAwesomeIcon icon={faUsers} className="text-primary-light"/> Demografi Kependudukan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={faUsers} iconBg="bg-blue-100" iconColor="text-blue-600" label="Total Penduduk" value={totalPenduduk} />
        <StatCard icon={faMars} iconBg="bg-indigo-100" iconColor="text-indigo-600" label="Laki-laki" value={totalLaki} badge={{text: `${pctLaki.toFixed(1)}%`, color: "bg-indigo-100 text-indigo-700"}} />
        <StatCard icon={faVenus} iconBg="bg-pink-100" iconColor="text-pink-600" label="Perempuan" value={totalPerempuan} badge={{text: `${pctPerempuan.toFixed(1)}%`, color: "bg-pink-100 text-pink-700"}} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Usia Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Distribusi Usia</h3>
          <div className="space-y-4">
            {Object.entries(ageGroups).map(([group, count]) => {
              const pct = totalPenduduk > 0 ? (count / totalPenduduk) * 100 : 0;
              return (
                <div key={group} className="flex items-center gap-4">
                  <div className="w-12 text-xs font-bold text-gray-600 text-right">{group}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-16 text-xs text-gray-500">{count} <span className="text-[10px]">({pct.toFixed(0)}%)</span></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender SVG Donut */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center gap-8">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#fdf4ff" strokeWidth="4" />
              {/* Male ring */}
              <circle 
                cx="18" cy="18" r="16" fill="transparent" stroke="#4f46e5" strokeWidth="4"
                strokeDasharray={`${pctLaki} 100`} 
                className="transition-all duration-1000 ease-out"
              />
              {/* Female ring (offset by male) */}
              <circle 
                cx="18" cy="18" r="16" fill="transparent" stroke="#db2777" strokeWidth="4"
                strokeDasharray={`${pctPerempuan} 100`} 
                strokeDashoffset={`-${pctLaki}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{totalPerempuan > 0 ? (totalLaki / totalPerempuan).toFixed(2) : '-'}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rasio (L/P)</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              <span className="text-sm text-gray-700 font-medium">Laki-laki ({pctLaki.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-600"></div>
              <span className="text-sm text-gray-700 font-medium">Perempuan ({pctPerempuan.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* UMKM Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 mt-8">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FontAwesomeIcon icon={faStore} className="text-primary-light"/> Data Usaha Mikro (UMKM)</h2>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} /> Registrasi UMKM Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table Wilayah */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <FilterChips 
              options={[{label: 'Semua Dusun', value: 'Semua'}, ...DUSUN_LIST.map(d => ({label: d, value: d}))]}
              activeValue={filterDusun}
              onChange={setFilterDusun}
            />
          </div>
          <DataTable columns={columns} data={paginatedWilayah} emptyMessage="Belum ada data UMKM terdaftar." />
          {filteredWilayah.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination totalItems={filteredWilayah.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>

        {/* Top Sektor */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Sektor Unggulan</h3>
            {topSektors.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada data.</p>
            ) : (
              <div className="space-y-4">
                {topSektors.map((s, idx) => {
                  const colors = ['bg-green-500', 'bg-amber-500', 'bg-blue-500'];
                  const pct = (s.count / rawUmkm.length) * 100;
                  return (
                    <div key={s.nama}>
                      <div className="flex justify-between items-center mb-1 text-xs font-bold text-gray-700">
                        <span>{s.nama}</span>
                        <span>{s.count} Unit</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gray-200 rounded-xl overflow-hidden shadow-sm h-48 relative border border-gray-100">
            {/* Google Maps Iframe */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15886.68007693962!2d119.46788329999999!3d-5.467472250000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee2b85eefcccd%3A0xb35fa7c9197c3f3b!2sBontoparang%2C%20Kec.%20Mangarabombang%2C%20Kabupaten%20Takalar%2C%20Sulawesi%20Selatan!5e0!3m2!1sid!2sid!4v1714407873634!5m2!1sid!2sid" 
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow text-[10px] font-bold text-gray-800 flex items-center gap-1">
              <FontAwesomeIcon icon={faMapLocationDot} className="text-primary" /> Peta Wilayah
            </div>
          </div>
        </div>

      </div>

      {/* Modal CRUD UMKM */}
      <Modal open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedUmkm ? "Edit Data UMKM" : "Registrasi UMKM Baru"}>
        <form onSubmit={handleSubmitUmkm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Usaha (UMKM)</label>
            <input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
            <input type="text" required value={formData.pemilik} onChange={(e) => setFormData({...formData, pemilik: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sektor Usaha</label>
              <select value={formData.sektor} onChange={(e) => setFormData({...formData, sektor: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary">
                {SEKTOR_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah / Dusun</label>
              <select value={formData.wilayah} onChange={(e) => setFormData({...formData, wilayah: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary">
                {DUSUN_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea required value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary" rows={3}></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark">
              {isSubmitting ? <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Daftar UMKM Wilayah */}
      <Modal open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Daftar UMKM di ${selectedWilayah}`}>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {rawUmkm.filter(u => u.wilayah === selectedWilayah).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada UMKM terdaftar di wilayah ini.</p>
          ) : (
            rawUmkm.filter(u => u.wilayah === selectedWilayah).map(u => (
              <div key={u.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:border-primary hover:shadow-sm transition-all group relative">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{u.nama || u.nama_umkm}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{u.sektor || u.sektor_usaha}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(u)} className="w-7 h-7 bg-white border border-gray-200 text-blue-500 rounded hover:bg-blue-50" title="Edit"><FontAwesomeIcon icon={faPenToSquare} className="text-xs" /></button>
                    <button onClick={() => { setSelectedUmkm(u); setIsDeleteModalOpen(true); }} className="w-7 h-7 bg-white border border-gray-200 text-danger rounded hover:bg-red-50" title="Hapus"><FontAwesomeIcon icon={faTrash} className="text-xs" /></button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium"><FontAwesomeIcon icon={faUsers} className="mr-1 opacity-50"/> {u.pemilik || u.nama_pemilik}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{u.alamat || u.alamat_lengkap}</p>
              </div>
            ))
          )}
        </div>
      </Modal>

      <ConfirmModal 
        open={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete} 
        title="Hapus UMKM" 
        message="Yakin ingin menghapus usaha ini dari direktori desa?"
        itemName={selectedUmkm?.nama || selectedUmkm?.nama_umkm} 
      />

    </div>
  );
}
