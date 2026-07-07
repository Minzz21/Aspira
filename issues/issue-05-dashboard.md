# Issue #05 — Halaman Dashboard Desa

> **Label**: `page`, `feature`, `priority: high`
> **Estimasi**: 3-4 jam
> **Fase**: 3 — Migrasi Halaman
> **Dependensi**: Issue #01, #02, #03, #04

---

## Deskripsi

Migrasi halaman Dashboard Desa dari `dashboard.html` ke Next.js. Dashboard menampilkan ringkasan eksekutif desa dengan data real-time dari Firestore `onSnapshot`.

## Acceptance Criteria

- [ ] Halaman `/dashboard` menampilkan header "Ringkasan Eksekutif Desa"
- [ ] 3 Stat Cards: Total Aspirasi, Laporan Kritis (badge PRIORITAS), Total UMKM
- [ ] Section "Aspirasi per Kategori" — 4 progress bar animasi
- [ ] Tabel "Laporan & Aspirasi Terkini" — 5 laporan terbaru
- [ ] Status badge: Kritis (merah), Proses (amber), Selesai (hijau), Menunggu (abu)
- [ ] Klik eye icon membuka modal detail
- [ ] Semua data real-time via `onSnapshot`
- [ ] Custom hook `useFirestoreCollection` untuk subscription

## Data Aggregation

- Collection `aspirasi`: total, kritis, per kategori (Ekonomi, Lingkungan, Kesehatan, Keamanan)
- Collection `umkm`: total count

## Referensi File Lama

- [dashboard.html](file:///d:/Random/Aspira/dashboard.html)
- [dashboard.js](file:///d:/Random/Aspira/dashboard.js)
- [dashboard.css](file:///d:/Random/Aspira/dashboard.css)
