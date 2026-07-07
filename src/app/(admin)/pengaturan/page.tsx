"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faShieldHalved, faCamera, faEye, faEyeSlash, 
  faCheck, faXmark, faCircleNotch, faLaptop, faMobileScreen
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PengaturanPage() {
  const { admin, updateAdminData } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profil' | 'keamanan'>('profil');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profil Form State
  const [profilData, setProfilData] = useState({
    nama: '',
    email: '',
    telp: ''
  });
  const [isUpdatingProfil, setIsUpdatingProfil] = useState(false);

  // Keamanan State
  const [nikData, setNikData] = useState({ old: '', new: '', confirm: '' });
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  // Sync auth context to local form state on load
  useEffect(() => {
    if (admin) {
      setProfilData({
        nama: admin.nama || '',
        email: admin.email || '',
        telp: admin.telp || ''
      });
    }
  }, [admin]);

  // --- Avatar Logic ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG/PNG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress via Canvas API
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Base64 (70% quality)
        const base64String = canvas.toDataURL('image/jpeg', 0.7);
        saveAvatarToFirebase(base64String);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAvatarToFirebase = async (base64Str: string) => {
    if (!admin?.id) return;
    try {
      showToast('Menyimpan foto...', 'info');
      await updateDoc(doc(db, 'admins', admin.id), { avatar: base64Str });
      updateAdminData({ avatar: base64Str });
      showToast('Foto profil berhasil diperbarui.', 'success');
    } catch (e) {
      showToast('Gagal memperbarui foto.', 'error');
    }
  };

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin?.id) return;
    setIsUpdatingProfil(true);
    try {
      await updateDoc(doc(db, 'admins', admin.id), { ...profilData });
      updateAdminData({ ...profilData });
      showToast('Profil berhasil disimpan.', 'success');
    } catch (e) {
      showToast('Gagal menyimpan profil.', 'error');
    } finally {
      setIsUpdatingProfil(false);
    }
  };

  // --- Security Logic ---
  const handleUpdateNik = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin?.id) return;
    if (nikData.old !== admin.nik) {
      showToast('NIK lama tidak sesuai dengan catatan sistem.', 'error');
      return;
    }
    if (nikData.new !== nikData.confirm) {
      showToast('Konfirmasi NIK baru tidak cocok.', 'error');
      return;
    }
    if (!/^\d{16}$/.test(nikData.new)) {
      showToast('NIK baru harus berupa 16 digit angka.', 'error');
      return;
    }

    setIsUpdatingSecurity(true);
    try {
      await updateDoc(doc(db, 'admins', admin.id), { nik: nikData.new });
      updateAdminData({ nik: nikData.new });
      showToast('NIK Login berhasil diperbarui.', 'success');
      setNikData({ old: '', new: '', confirm: '' });
    } catch (e) {
      showToast('Gagal memperbarui NIK.', 'error');
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const passScore = calculatePasswordStrength(passData.new);
  const getPassScoreColor = () => {
    if (passScore <= 1) return 'bg-danger';
    if (passScore === 2) return 'bg-orange-400';
    if (passScore === 3) return 'bg-warning';
    return 'bg-success';
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin?.id) return;
    if (passData.old !== admin.password) {
      showToast('Kata sandi saat ini tidak valid.', 'error');
      return;
    }
    if (passData.new !== passData.confirm) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }
    if (passScore < 4) {
      showToast('Kata sandi baru belum memenuhi syarat kekuatan.', 'error');
      return;
    }

    setIsUpdatingSecurity(true);
    try {
      await updateDoc(doc(db, 'admins', admin.id), { password: passData.new });
      updateAdminData({ password: passData.new });
      showToast('Kata sandi berhasil diperbarui.', 'success');
      setPassData({ old: '', new: '', confirm: '' });
    } catch (e) {
      showToast('Gagal memperbarui kata sandi.', 'error');
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  return (
    <div className="p-8 pb-16 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengaturan Sistem</h1>
        <p className="text-sm text-gray-500">Kelola identitas admin dan amankan akses akun portal.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profil' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FontAwesomeIcon icon={faUser} /> Profil Admin
        </button>
        <button 
          onClick={() => setActiveTab('keamanan')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'keamanan' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FontAwesomeIcon icon={faShieldHalved} /> Keamanan Akun
        </button>
      </div>

      {/* --- TAB PROFIL --- */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold">
                  {admin?.avatar ? (
                    <img src={admin.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    admin?.nama?.charAt(0).toUpperCase() || 'A'
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-sm hover:bg-primary-dark transition-colors cursor-pointer"
                  title="Ubah Foto"
                >
                  <FontAwesomeIcon icon={faCamera} />
                </button>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{admin?.nama || 'Admin'}</h3>
              <p className="text-xs font-semibold text-primary px-2.5 py-1 bg-green-50 rounded-full mt-2 inline-block">Administrator</p>
              
              <div className="w-full border-t border-gray-100 mt-6 pt-4 text-left space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email Aktif</p>
                  <p className="text-sm font-medium text-gray-700">{admin?.email || 'Belum diatur'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Telepon</p>
                  <p className="text-sm font-medium text-gray-700">{admin?.telp || 'Belum diatur'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Profil */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Informasi Dasar</h3>
              </div>
              <form onSubmit={handleUpdateProfil} className="p-6 space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" required 
                    value={profilData.nama} 
                    onChange={e => setProfilData({...profilData, nama: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                    <input 
                      type="email" 
                      value={profilData.email} 
                      onChange={e => setProfilData({...profilData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input 
                      type="text" 
                      value={profilData.telp} 
                      onChange={e => setProfilData({...profilData, telp: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Peran Akses (Role)</label>
                  <input 
                    type="text" 
                    value="Administrator Pusat" 
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Peran akun tidak dapat diubah sendiri.</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isUpdatingProfil}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    {isUpdatingProfil ? <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB KEAMANAN --- */}
      {activeTab === 'keamanan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ubah Sandi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Ubah Kata Sandi</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              
              <div className="relative">
                <label className="block text-xs font-bold text-gray-600 mb-1">Sandi Saat Ini</label>
                <input 
                  type={showPass.old ? 'text' : 'password'} required 
                  value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary pr-10"
                />
                <button type="button" onClick={() => setShowPass({...showPass, old: !showPass.old})} className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={showPass.old ? faEyeSlash : faEye} />
                </button>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-600 mb-1">Sandi Baru</label>
                <input 
                  type={showPass.new ? 'text' : 'password'} required 
                  value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary pr-10"
                />
                <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={showPass.new ? faEyeSlash : faEye} />
                </button>
              </div>

              {/* Password Strength Meter */}
              {passData.new.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
                  <div className="flex gap-1 mb-2 h-1.5">
                    <div className={`flex-1 rounded-full ${passScore >= 1 ? getPassScoreColor() : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${passScore >= 2 ? getPassScoreColor() : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${passScore >= 3 ? getPassScoreColor() : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${passScore >= 4 ? getPassScoreColor() : 'bg-gray-200'}`}></div>
                  </div>
                  <ul className="text-[10px] space-y-1 mt-2 text-gray-500 font-medium">
                    <li className={passData.new.length >= 8 ? "text-success" : ""}><FontAwesomeIcon icon={passData.new.length >= 8 ? faCheck : faXmark} className="w-3" /> Minimal 8 karakter</li>
                    <li className={/[A-Z]/.test(passData.new) ? "text-success" : ""}><FontAwesomeIcon icon={/[A-Z]/.test(passData.new) ? faCheck : faXmark} className="w-3" /> Terdapat huruf kapital (A-Z)</li>
                    <li className={/[0-9]/.test(passData.new) ? "text-success" : ""}><FontAwesomeIcon icon={/[0-9]/.test(passData.new) ? faCheck : faXmark} className="w-3" /> Terdapat minimal 1 angka</li>
                    <li className={/[^A-Za-z0-9]/.test(passData.new) ? "text-success" : ""}><FontAwesomeIcon icon={/[^A-Za-z0-9]/.test(passData.new) ? faCheck : faXmark} className="w-3" /> Terdapat karakter khusus (!@#$)</li>
                  </ul>
                </div>
              )}

              <div className="relative pt-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Konfirmasi Sandi Baru</label>
                <input 
                  type={showPass.confirm ? 'text' : 'password'} required 
                  value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary pr-10"
                />
                <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={showPass.confirm ? faEyeSlash : faEye} />
                </button>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isUpdatingSecurity || passScore < 4}
                  className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingSecurity ? <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> : 'Perbarui Kata Sandi'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-8">
            {/* Ubah NIK */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Ubah NIK Login</h3>
              </div>
              <form onSubmit={handleUpdateNik} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">NIK Saat Ini</label>
                  <input type="text" required value={nikData.old} onChange={e => setNikData({...nikData, old: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary font-mono" maxLength={16}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">NIK Baru</label>
                  <input type="text" required value={nikData.new} onChange={e => setNikData({...nikData, new: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary font-mono" maxLength={16}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Konfirmasi NIK Baru</label>
                  <input type="text" required value={nikData.confirm} onChange={e => setNikData({...nikData, confirm: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-primary font-mono" maxLength={16}/>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={isUpdatingSecurity} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-black transition-colors">
                    Perbarui NIK
                  </button>
                </div>
              </form>
            </div>

            {/* Sesi Aktif */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Sesi Login Aktif</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-4 border border-primary/20 bg-green-50/50 rounded-lg">
                  <div className="flex gap-3 items-center">
                    <FontAwesomeIcon icon={faLaptop} className="text-xl text-primary" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Windows PC • Chrome</p>
                      <p className="text-xs text-primary font-medium">Sesi saat ini</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border border-gray-100 rounded-lg">
                  <div className="flex gap-3 items-center">
                    <FontAwesomeIcon icon={faMobileScreen} className="text-xl text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-700">Android • App Portal</p>
                      <p className="text-xs text-gray-400">Aktif 2 hari yang lalu</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-danger hover:underline">Akhiri</button>
                </div>
                <div className="pt-2 text-right">
                  <button className="text-xs font-bold text-gray-500 hover:text-danger hover:underline transition-colors">
                    Akhiri Semua Sesi Lainnya
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
