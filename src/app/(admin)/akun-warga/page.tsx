"use client";

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faMars, faVenus, faSearch, faPenToSquare, 
  faKey, faCheck, faCircleNotch, faCopy
} from '@fortawesome/free-solid-svg-icons';
import StatCard from '@/components/ui/StatCard';
import FilterChips from '@/components/ui/FilterChips';
import SearchInput from '@/components/ui/SearchInput';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/contexts/ToastContext';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';
import { wargaCol } from '@/lib/firestore';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Warga } from '@/types';

export default function AkunWargaPage() {
  const { data: rawWarga, loading } = useFirestoreCollection<Warga>(wargaCol);
  const { showToast } = useToast();

  const [filterDusun, setFilterDusun] = useState('Semua');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetLoadingOpen, setIsResetLoadingOpen] = useState(false);
  const [isResetSuccessOpen, setIsResetSuccessOpen] = useState(false);
  
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null);
  const [formData, setFormData] = useState<Partial<Warga>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Dynamic Dusun List ---
  const dusunList = useMemo(() => {
    const uniqueDusuns = Array.from(new Set(rawWarga.map(w => w.dusun || 'Tidak Diketahui')));
    return uniqueDusuns.sort();
  }, [rawWarga]);

  // --- Demography Metrics ---
  const totalWarga = rawWarga.length;
  const totalLaki = rawWarga.filter(w => w.gender === 'Laki-laki').length;
  const totalPerempuan = rawWarga.filter(w => w.gender === 'Perempuan').length;
  const pctLaki = totalWarga > 0 ? (totalLaki / totalWarga) * 100 : 0;
  const pctPerempuan = totalWarga > 0 ? (totalPerempuan / totalWarga) * 100 : 0;

  // --- Filtering & Pagination ---
  const filteredData = useMemo(() => {
    return rawWarga.filter(item => {
      if (filterDusun !== 'Semua' && item.dusun !== filterDusun) return false;
      
      if (search) {
        const query = search.toLowerCase();
        return (
          item.nama.toLowerCase().includes(query) ||
          item.nik.includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA; // Newest first
    });
  }, [rawWarga, filterDusun, search]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useMemo(() => setCurrentPage(1), [filterDusun, search]);

  // --- Actions ---
  const handleOpenEdit = (warga: Warga) => {
    setSelectedWarga(warga);
    setFormData({
      nama: warga.nama,
      nik: warga.nik,
      gender: warga.gender,
      dusun: warga.dusun
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarga?.id) return;
    
    if (!formData.nama || !formData.nik || !formData.gender || !formData.dusun) {
      showToast('Semua kolom harus diisi.', 'error');
      return;
    }

    // Validate NIK
    if (!/^\d{16}$/.test(formData.nik)) {
      showToast('NIK harus terdiri dari 16 digit angka.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'akun_warga', selectedWarga.id), { ...formData });
      showToast('Data akun warga berhasil diperbarui.', 'success');
      setIsEditModalOpen(false);
    } catch (error) {
      showToast('Gagal memperbarui data akun.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedWarga?.id) return;
    
    setIsEditModalOpen(false);
    setIsResetLoadingOpen(true);

    try {
      const newPassword = '12345678';
      await updateDoc(doc(db, 'akun_warga', selectedWarga.id), { password: newPassword });
      
      // Simulate network delay for dramatic UX effect
      setTimeout(() => {
        setIsResetLoadingOpen(false);
        setIsResetSuccessOpen(true);
      }, 1500);

    } catch (error) {
      setIsResetLoadingOpen(false);
      showToast('Gagal mereset kata sandi.', 'error');
    }
  };

  const copyNewPassword = () => {
    navigator.clipboard.writeText('12345678');
    setCopied(true);
    showToast('Kata sandi disalin ke clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTanggal = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const columns: Column<Warga>[] = [
    { key: 'nama', header: 'Nama Lengkap', render: (item) => <span className="font-bold text-gray-900">{item.nama}</span> },
    { key: 'nik', header: 'NIK', render: (item) => <span className="text-gray-600 font-mono text-xs">{item.nik}</span> },
    { key: 'gender', header: 'L/P', render: (item) => <span className="text-xs">{item.gender === 'Laki-laki' ? 'L' : 'P'}</span> },
    { key: 'dusun', header: 'Dusun', render: (item) => <span className="text-xs px-2 py-1 bg-gray-100 rounded-md font-medium text-gray-600">{item.dusun}</span> },
    { key: 'password', header: 'Password', render: () => <span className="text-gray-400 tracking-[0.2em] font-bold">••••••••</span> },
    { key: 'createdAt', header: 'Tgl Terdaftar', render: (item) => <span className="text-xs text-gray-500">{formatTanggal(item.createdAt)}</span> },
    { 
      key: 'aksi', 
      header: 'Aksi', 
      render: (item) => (
        <button 
          onClick={() => handleOpenEdit(item)}
          className="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-green-50 transition-colors"
          title="Edit Akun"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <FontAwesomeIcon icon={faCircleNotch} className="fa-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-16">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary to-[#143a20] rounded-2xl p-8 mb-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Pantau Pertumbuhan Komunitas</h1>
          <p className="text-green-100/80 max-w-xl text-sm leading-relaxed">
            Kelola dan kelancarkan akses pengguna aplikasi ASPIRA. Dari sini Anda bisa mereset kata sandi warga yang lupa akses, serta memverifikasi data demografi mereka.
          </p>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-8 right-16 w-32 h-32 bg-green-400/10 rounded-full blur-xl"></div>
      </div>

      {/* Demography Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={faUsers} iconBg="bg-blue-100" iconColor="text-blue-600" label="Total Warga Terdaftar" value={totalWarga} />
        <StatCard icon={faMars} iconBg="bg-indigo-100" iconColor="text-indigo-600" label="Laki-laki" value={totalLaki} badge={{text: `${pctLaki.toFixed(1)}% Populasi`, color: "bg-indigo-100 text-indigo-700"}} />
        <StatCard icon={faVenus} iconBg="bg-pink-100" iconColor="text-pink-600" label="Perempuan" value={totalPerempuan} badge={{text: `${pctPerempuan.toFixed(1)}% Populasi`, color: "bg-pink-100 text-pink-700"}} />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <FilterChips 
            options={[{label: 'Semua Dusun', value: 'Semua'}, ...dusunList.map(d => ({label: d, value: d}))]}
            activeValue={filterDusun}
            onChange={setFilterDusun}
          />
          <SearchInput 
            placeholder="Cari NIK atau Nama..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <DataTable columns={columns} data={paginatedData} emptyMessage="Tidak ada akun warga ditemukan." />

        {filteredData.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination totalItems={filteredData.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modal Edit Warga */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Manajemen Akun Warga">
        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
            <input type="text" required value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary font-mono" maxLength={16} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as 'Laki-laki' | 'Perempuan'})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dusun / Wilayah</label>
              <select required value={formData.dusun} onChange={(e) => setFormData({...formData, dusun: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary">
                {dusunList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between mt-6">
            <div>
              <h5 className="text-sm font-bold text-danger mb-0.5">Keamanan Akun</h5>
              <p className="text-xs text-red-700/80">Reset kata sandi jika warga lupa akses.</p>
            </div>
            <button 
              type="button" 
              onClick={handleResetPassword}
              className="px-4 py-2 bg-white border border-danger text-danger text-xs font-bold rounded-lg hover:bg-danger hover:text-white transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faKey} /> Reset Password
            </button>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark">
              {isSubmitting ? <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Loading Modal for Reset Password */}
      <Modal open={isResetLoadingOpen} onClose={() => {}} title="">
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <FontAwesomeIcon icon={faCircleNotch} className="fa-spin text-5xl text-primary mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Mereset Kata Sandi...</h3>
          <p className="text-sm text-gray-500">Mohon tunggu, sistem sedang mengenkripsi data baru.</p>
        </div>
      </Modal>

      {/* Success Modal for Reset Password */}
      <Modal open={isResetSuccessOpen} onClose={() => setIsResetSuccessOpen(false)} title="Reset Berhasil">
        <div className="py-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-success rounded-full flex items-center justify-center text-3xl mb-4 border-4 border-white shadow-sm">
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Kata Sandi Diperbarui</h3>
          <p className="text-sm text-gray-500 mb-6">Berikut adalah kata sandi default baru untuk akun <strong>{selectedWarga?.nama}</strong>. Harap berikan ini kepada warga bersangkutan agar mereka bisa login kembali.</p>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-full mb-6 relative group">
            <p className="text-3xl font-mono tracking-[0.2em] font-bold text-gray-800">12345678</p>
            <button 
              onClick={copyNewPassword}
              className="absolute top-2 right-2 text-xs text-primary font-bold hover:bg-green-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? 'Disalin!' : 'Salin'}
            </button>
          </div>

          <button 
            onClick={() => setIsResetSuccessOpen(false)}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tutup Jendela
          </button>
        </div>
      </Modal>

    </div>
  );
}
