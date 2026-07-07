# Issue #07 — Halaman Aspirasi Warga

> **Label**: `page`, `feature`, `priority: high`
> **Estimasi**: 5-6 jam
> **Fase**: 3 — Migrasi Halaman
> **Dependensi**: Issue #01, #02, #04

---

## Deskripsi

Migrasi halaman Aspirasi Warga — modul paling kompleks dengan layout 2 kolom, audio player, transkripsi AI, panel tindak lanjut admin, dan export PDF.

## Acceptance Criteria

- [ ] 3 Stat Cards: Total Laporan, Diproses, Kritis
- [ ] Tabel aspirasi (kolom kiri 2/3): ID Laporan, Pelapor & Waktu, Kategori, Status, Aksi
- [ ] Filter: Semua Laporan / Prioritas Kritis / Selesai
- [ ] Search pelapor/subjek
- [ ] Pagination
- [ ] Detail Panel (kolom kanan 1/3, sticky):
  - Badge status + ID Laporan
  - Subjek laporan + badge kritis
  - Avatar + nama pelapor + waktu
  - Audio player dengan visualizer bars
  - Transkripsi AI (dengan tombol "Salin Teks")
  - Kategori & Lokasi kejadian
- [ ] Panel Tindak Lanjut: 3 tombol status (Menunggu/Diproses/Selesai) + "Simpan Status"
- [ ] Update status ke Firestore
- [ ] Export PDF via jsPDF + AutoTable
- [ ] Real-time sync via `onSnapshot`

## Fitur Khusus

### Audio Player
- Tombol play/pause
- Progress bar visualizer (bar chart style)
- Timestamp current / total

### Export PDF
- Generate laporan semua aspirasi ke PDF
- Menggunakan `jspdf` + `jspdf-autotable`

## Firestore Collection: `aspirasi`

Fields: `nama`, `subjek`, `kategori`, `status`, `kritis`, `transkripsi`, `audioUrl`, `createdAt`

## Referensi File Lama

- [aspirasi-warga.html](file:///d:/Random/Aspira/aspirasi-warga/aspirasi-warga.html)
- [aspirasi-warga-v3.js](file:///d:/Random/Aspira/aspirasi-warga/aspirasi-warga-v3.js)
- [aspirasi-warga.css](file:///d:/Random/Aspira/aspirasi-warga/aspirasi-warga.css)
