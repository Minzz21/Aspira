# Issue #06 — Halaman Whitelist Warga

> **Label**: `page`, `feature`, `crud`, `priority: high`
> **Estimasi**: 4-5 jam
> **Fase**: 3 — Migrasi Halaman
> **Dependensi**: Issue #01, #02, #04

---

## Deskripsi

Migrasi halaman Whitelist Warga — CRUD lengkap untuk mengelola warga yang diberikan akses ke sistem ASPIRA.

## Acceptance Criteria

- [ ] Stat Card: Total Whitelist (real-time count)
- [ ] Filter chips: Semua / Aktif / Nonaktif
- [ ] Search input filter by Nama, NIK, Dusun
- [ ] Tabel: Nama, NIK (monospace), Dusun, Status (badge), Tanggal, Aksi
- [ ] Pagination (4 items/page)
- [ ] Modal Tambah Warga: Nama, NIK (16 digit validasi), Dusun (dropdown), Gender (radio), Status (radio)
- [ ] Modal Edit Warga: pre-fill data
- [ ] Konfirmasi Hapus modal
- [ ] Validasi duplikasi NIK
- [ ] Toast feedback untuk semua operasi
- [ ] Real-time sync via `onSnapshot`

## Firestore Collection: `whitelist`

Fields: `nama`, `nik`, `dusun`, `gender`, `status`, `tanggal`, `createdAt`

## Referensi File Lama

- [whitelist-warga.html](file:///d:/Random/Aspira/whitelist-warga/whitelist-warga.html)
- [whitelist-warga.js](file:///d:/Random/Aspira/whitelist-warga/whitelist-warga.js)
- [whitelist-warga.css](file:///d:/Random/Aspira/whitelist-warga/whitelist-warga.css)
