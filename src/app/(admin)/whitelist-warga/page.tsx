"use client";

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlus, faPenToSquare, faTrash, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import StatCard from '@/components/ui/StatCard';
import FilterChips from '@/components/ui/FilterChips';
import SearchInput from '@/components/ui/SearchInput';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';
import { whitelistCol } from '@/lib/firestore';
import { addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WhitelistWarga } from '@/types';

const DUSUN_LIST = ['Dusun I', 'Dusun II', 'Dusun III', 'Dusun IV', 'Dusun V'];

export default function WhitelistWargaPage() {
  const { data: rawData, loading } = useFirestoreCollection<WhitelistWarga>(whitelistCol);
  const { showToast } = useToast();

  // States
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedWarga, setSelectedWarga] = useState<WhitelistWarga | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<WhitelistWarga>>({
    nama: '',
    nik: '',
    dusun: 'Dusun I',
    gender: 'Laki-laki',
    status: 'Aktif',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      // Filter Status
      if (filter !== 'Semua' && item.status !== filter) return false;
      
      // Search text
      if (search) {
        const query = search.toLowerCase();
        return (
          item.nama.toLowerCase().includes(query) ||
          item.nik.includes(query) ||
          item.dusun.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA; // Descending
    });
  }, [rawData, filter, search]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Reset Pagination if filter/search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const handleOpenAdd = () => {
    setSelectedWarga(null);
    setFormData({
      nama: '',
      nik: '',
      dusun: 'Dusun I',
      gender: 'Laki-laki',
      status: 'Aktif',
      tanggal: new Date().toISOString().split('T')[0]
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (warga: WhitelistWarga) => {
    setSelectedWarga(warga);
    setFormData({
      nama: warga.nama,
      nik: warga.nik,
      dusun: warga.dusun,
      gender: warga.gender,
      status: warga.status,
      tanggal: warga.tanggal || new Date().toISOString().split('T')[0]
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (warga: WhitelistWarga) => {
    setSelectedWarga(warga);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi NIK 16 digit
    if (!/^\d{16}$/.test(formData.nik || '')) {
      showToast('NIK harus terdiri dari 16 digit angka.', 'error');
      return;
    }

    // Cek duplikasi NIK
    const isDuplicate = rawData.some(w => w.nik === formData.nik && w.id !== selectedWarga?.id);
    if (isDuplicate) {
      showToast('Gagal! NIK ini sudah terdaftar dalam sistem.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedWarga?.id) {
        // Update
        const docRef = doc(db, 'whitelist', selectedWarga.id);
        await updateDoc(docRef, { ...formData });
        showToast('Data warga berhasil diperbarui.', 'success');
      } else {
        // Add
        if (!formData.nama || !formData.nik || !formData.dusun || !formData.gender || !formData.status || !formData.tanggal) {
           showToast('Semua kolom harus diisi.', 'error');
           setIsSubmitting(false);
           return;
        }

        const newWarga: WhitelistWarga = {
          nama: formData.nama,
          nik: formData.nik,
          dusun: formData.dusun,
          gender: formData.gender,
          status: formData.status,
          tanggal: formData.tanggal,
          createdAt: serverTimestamp()
        };

        await addDoc(whitelistCol, newWarga);
        showToast('Data warga berhasil ditambahkan.', 'success');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast('Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWarga?.id) return;
    try {
      await deleteDoc(doc(db, 'whitelist', selectedWarga.id));
      showToast('Data warga berhasil dihapus.', 'success');
    } catch (error) {
      showToast('Terjadi kesalahan sistem saat menghapus.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Aktif') {
      return <span className="px-2 py-1 bg-green-100 text-success text-xs font-semibold rounded-md">Aktif</span>;
    }
    return <span className="px-2 py-1 bg-red-100 text-danger text-xs font-semibold rounded-md">Nonaktif</span>;
  };

  const columns: Column<WhitelistWarga>[] = [
    { key: 'nama', header: 'Nama Lengkap', render: (item) => <span className="font-semibold text-gray-900">{item.nama}</span> },
    { key: 'nik', header: 'NIK', render: (item) => <span className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">{item.nik}</span> },
    { key: 'dusun', header: 'Dusun' },
    { key: 'status', header: 'Status', render: (item) => getStatusBadge(item.status) },
    { key: 'tanggal', header: 'Tgl. Daftar', render: (item) => item.tanggal },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenEdit(item)}
            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors flex items-center justify-center"
            title="Edit"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
          <button 
            onClick={() => handleOpenDelete(item)}
            className="w-8 h-8 rounded-lg bg-red-50 text-danger hover:bg-red-100 transition-colors flex items-center justify-center"
            title="Hapus"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Whitelist Warga</h1>
          <p className="text-sm text-gray-500">Kelola daftar warga yang diizinkan mengakses portal mandiri.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2 w-fit"
        >
          <FontAwesomeIcon icon={faPlus} /> Tambah Warga
        </button>
      </div>

      <div className="grid grid-cols-1 mb-8">
        <StatCard 
          icon={faUsers}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Total Warga Terdaftar"
          value={rawData.length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <FilterChips 
            options={[
              { label: 'Semua', value: 'Semua' },
              { label: 'Aktif', value: 'Aktif' },
              { label: 'Nonaktif', value: 'Nonaktif' }
            ]}
            activeValue={filter}
            onChange={setFilter}
          />
          <SearchInput 
            placeholder="Cari NIK, Nama, atau Dusun..."
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Table */}
        <DataTable columns={columns} data={paginatedData} emptyMessage="Tidak ada data warga ditemukan." />

        {/* Pagination */}
        {filteredData.length > 0 && (
          <Pagination 
            totalItems={filteredData.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>

      {/* Modal Form Tambah/Edit */}
      <Modal 
        open={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={selectedWarga ? 'Edit Data Warga' : 'Tambah Warga Baru'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 Digit)</label>
            <input 
              type="text" 
              required
              maxLength={16}
              value={formData.nik}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); // only digits
                setFormData({...formData, nik: val});
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary font-mono"
              placeholder="1234567890123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dusun</label>
            <select 
              value={formData.dusun}
              onChange={(e) => setFormData({...formData, dusun: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary"
            >
              {DUSUN_LIST.map(dusun => (
                <option key={dusun} value={dusun}>{dusun}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Laki-laki"
                    checked={formData.gender === 'Laki-laki'}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as 'Laki-laki' | 'Perempuan'})}
                    className="text-primary focus:ring-primary"
                  />
                  Laki-laki
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Perempuan"
                    checked={formData.gender === 'Perempuan'}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as 'Laki-laki' | 'Perempuan'})}
                    className="text-primary focus:ring-primary"
                  />
                  Perempuan
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Akses</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900">
                  <input 
                    type="radio" 
                    name="status" 
                    value="Aktif"
                    checked={formData.status === 'Aktif'}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'Aktif' | 'Nonaktif'})}
                    className="text-success focus:ring-success"
                  />
                  Aktif
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900">
                  <input 
                    type="radio" 
                    name="status" 
                    value="Nonaktif"
                    checked={formData.status === 'Nonaktif'}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'Aktif' | 'Nonaktif'})}
                    className="text-danger focus:ring-danger"
                  />
                  Nonaktif
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <button 
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> Menyimpan...</>
              ) : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal 
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Warga"
        message="Apakah Anda yakin ingin menghapus data warga ini? Data yang dihapus tidak dapat dikembalikan."
        itemName={selectedWarga?.nama}
      />
    </div>
  );
}
