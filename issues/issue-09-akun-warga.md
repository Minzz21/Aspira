# Issue #09 — Halaman Akun Warga

> **Label**: `page`, `feature`, `priority: high`
> **Estimasi**: 4-5 jam
> **Fase**: 3 — Migrasi Halaman
> **Dependensi**: Issue #01, #02, #04

---

## Deskripsi

Migrasi halaman Akun Warga — manajemen akun warga terdaftar (dari aplikasi Android) termasuk edit data, reset password, dan filter dinamis per dusun.

## Acceptance Criteria

- [ ] Hero Banner: "Pantau Pertumbuhan Komunitas" dengan desain gradient hijau
- [ ] 3 Stat Cards: Total Warga, Laki-laki (% populasi), Perempuan (% populasi)
- [ ] Filter dinamis: tombol per dusun (diambil dari data unik) + "Semua"
- [ ] Search input by NIK atau Nama
- [ ] Tabel: No, Nama, NIK, Password (masked `••••••••`), L/P, Dusun, Tgl Terdaftar, Aksi
- [ ] Edit Modal: edit nama, NIK, gender, dusun → update Firestore
- [ ] Reset Password flow:
  1. Klik "Reset Password" di edit modal
  2. Loading modal dengan spinner
  3. Success modal menampilkan password baru (`12345678`)
  4. Tombol salin password + peringatan
- [ ] Pagination
- [ ] Real-time sync via `onSnapshot`

## Firestore Collection: `warga`

Fields: `nama`, `nik`, `password`, `gender`, `dusun`, `createdAt`

## Fitur Khusus

### Filter Dinamis Per Dusun
- Ambil daftar dusun unik dari data warga
- Generate tombol filter secara dinamis
- Active state: `bg-[#1e4d2b] text-white`

### Reset Password
- Set password ke default `12345678`
- Multi-step modal flow (loading → success)

## Referensi File Lama

- [akun-warga.html](file:///d:/Random/Aspira/akun-warga/akun-warga.html)
- [akun-warga.js](file:///d:/Random/Aspira/akun-warga/akun-warga.js)
- [akun-warga.css](file:///d:/Random/Aspira/akun-warga/akun-warga.css)
