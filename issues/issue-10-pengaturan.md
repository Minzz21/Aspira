# Issue #10 — Halaman Pengaturan

> **Label**: `page`, `feature`, `priority: medium`
> **Estimasi**: 4-5 jam
> **Fase**: 3 — Migrasi Halaman
> **Dependensi**: Issue #01, #02, #03, #04

---

## Deskripsi

Migrasi halaman Pengaturan — manajemen profil admin, keamanan akun (ubah NIK, ubah password dengan strength meter), dan informasi sesi aktif.

## Acceptance Criteria

### Tab Profil Admin
- [ ] Avatar display: foto (dari Firestore base64) atau inisial fallback
- [ ] Avatar upload: pilih file → kompresi → simpan Base64 ke Firestore field `avatar`
- [ ] Sinkronisasi avatar ke sidebar setelah upload
- [ ] Form: Nama Lengkap (editable), Peran/Role (disabled), Email, Telepon
- [ ] Tombol "Update Profil" → update Firestore + localStorage
- [ ] Banner informasi verifikasi

### Tab Keamanan
- [ ] **Ubah NIK Login**: Input NIK lama, NIK baru, konfirmasi NIK baru
  - Validasi NIK lama cocok dengan database
  - Validasi NIK baru = konfirmasi
  - Validasi 16 digit
- [ ] **Ubah Password**: Input password lama, baru, konfirmasi
  - Password strength meter (4 bar: lemah → kuat)
  - Persyaratan: min 8 karakter, huruf kapital, angka, karakter khusus
  - Real-time requirement checklist (✓/✗)
  - Toggle visibility (eye icon) per input
- [ ] **Sesi Aktif**: Daftar perangkat (saat ini + riwayat)
  - Tombol "Akhiri" per sesi
  - Tombol "Akhiri Semua Sesi Lain"

### Tab System
- [ ] Tab switching dengan highlight aktif (underline)
- [ ] Toast feedback untuk semua aksi

## Firestore Collection: `admins`

Update fields: `nama`, `email`, `telp`, `avatar`, `nik`, `password`

## Fitur Khusus

### Avatar Upload & Kompresi
```typescript
// 1. User pilih file via <input type="file" accept="image/*">
// 2. Kompresi via Canvas API (max 200x200, quality 0.7)
// 3. Convert ke Base64 string
// 4. Simpan ke Firestore: admins/{id}.avatar = base64String
// 5. Update sidebar avatar secara reaktif
```

### Password Strength Meter
```typescript
// Score 0-4 berdasarkan:
// +1 panjang >= 8
// +1 huruf kapital (A-Z)
// +1 angka (0-9)
// +1 karakter khusus (!@#$...)
// Visual: 4 bar dengan warna merah → kuning → hijau
```

## Referensi File Lama

- [pengaturan.html](file:///d:/Random/Aspira/pengaturan/pengaturan.html)
- [pengaturan.js](file:///d:/Random/Aspira/pengaturan/pengaturan.js)
- [pengaturan.css](file:///d:/Random/Aspira/pengaturan/pengaturan.css)
