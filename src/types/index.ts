export interface Admin {
  id?: string;
  nama: string;
  nik: string;
  password?: string;
  role: string;
  email?: string;
  telp?: string;
  avatar?: string;
  createdAt?: any;
}

export interface Aspirasi {
  id?: string;
  nama: string;
  subjek: string;
  kategori: string;
  status: 'kritis' | 'proses' | 'selesai' | 'menunggu';
  kritis: boolean;
  transkripsi?: string;
  transkripsi_asli?: string;
  bahasa_asli?: string;
  diterjemahkan?: boolean;
  audioUrl?: string;
  createdAt?: any;
  waktu?: string;
  pelapor?: string; // Sometimes fallback for nama
  lokasi?: string;
}

export interface WhitelistWarga {
  id?: string;
  nama: string;
  nik: string;
  dusun: string;
  gender: 'Laki-laki' | 'Perempuan';
  status: 'Aktif' | 'Nonaktif';
  tanggal: string;
  createdAt?: any;
}

export interface UMKM {
  id?: string;
  nama?: string;
  pemilik?: string;
  sektor?: string;
  wilayah?: string;
  alamat?: string;
  // Legacy Firebase fields
  nama_umkm?: string;
  nama_pemilik?: string;
  sektor_usaha?: string;
  alamat_lengkap?: string;
  tanggal_registrasi?: any;
  createdAt?: any;
}

export interface Warga {
  id?: string;
  nama: string;
  nik: string;
  password?: string;
  gender: 'Laki-laki' | 'Perempuan';
  dusun: string;
  createdAt?: any;
}

export interface AdminPerformance {
  id?: string;
  adminId: string;
  adminName: string;
  score: number;
  streak: number;
  bestStreak: number;
  totalResolved: number;
  totalOverdue: number;
  lastUpdated?: any;
}
