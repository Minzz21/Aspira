"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faCheckCircle, faCircleNotch, faArrowRightToBracket, faInfo } from '@fortawesome/free-solid-svg-icons';

export default function LoginPage() {
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || !password) {
      showToast('Harap isi NIK dan Kata Sandi.', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(nik, password);
      if (success) {
        showToast('Login berhasil! Mengarahkan ke dashboard...', 'success');
        router.push('/dashboard');
      } else {
        showToast('NIK atau Kata Sandi salah.', 'error');
        setIsLoggingIn(false);
      }
    } catch (error) {
      showToast('Terjadi kesalahan saat menghubungi server.', 'error');
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <FontAwesomeIcon icon={faCircleNotch} className="fa-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* LEFT SIDE - Banner/Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden flex-col justify-center px-16 py-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1696875584438-4618529d62bc?q=80&w=1170&auto=format&fit=crop" 
          alt="Pemandangan Desa" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />
        
        <div className="relative z-20 space-y-6 max-w-lg mt-10">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold text-green-100">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-300" /> Platform Terpadu Desa
          </span>
          
          <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-white">
            Transformasi Digital untuk <span className="text-green-300">Kedaulatan Desa.</span>
          </h1>
          
          <p className="text-green-50 text-sm leading-relaxed max-w-md font-medium opacity-90">
            Kelola administrasi, dana desa, dan aspirasi warga dalam satu sistem yang aman, transparan, dan berwibawa.
          </p>

         
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-gray-50 relative overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-12 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <img src="/logo.png" alt="ASPIRA AI" className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-primary/20" />
            <div>
              <h2 className="font-extrabold text-xl text-primary tracking-tight">ASPIRA AI</h2>
             
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h1>
            <p className="text-sm text-gray-500 leading-relaxed">Silakan masuk menggunakan kredensial resmi administrator desa Anda.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input NIK */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 font-mono">Username / NIK</label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-11 p-3.5 shadow-sm transition-colors" 
                  placeholder="Masukkan NIK atau Nama Pengguna" 
                  required 
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 font-mono">Kata Sandi</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-11 pr-11 p-3.5 shadow-sm transition-colors" 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

           

            {/* Button Submit */}
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-primary-dark text-white rounded-lg text-sm font-bold tracking-wide hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <span>Memproses...</span>
                  <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" />
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <FontAwesomeIcon icon={faArrowRightToBracket} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Help Box */}
          <div className="mt-8 bg-gray-100/80 rounded-xl p-4 flex gap-3 border border-gray-200">
            <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center flex-shrink-0 text-white mt-0.5">
              <FontAwesomeIcon icon={faInfo} className="text-[10px]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 mb-0.5 font-mono">Butuh Bantuan?</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Hubungi pendamping desa atau teknisi kabupaten jika Anda mengalami kendala akses.</p>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}
