# Issue #08 — Halaman Profil Desa & UMKM

> **Label**: `page`, `feature`, `crud`, `priority: high`
> **Estimasi**: 5-6 jam
> **Fase**: 3 — Migrasi Halaman
> **Dependensi**: Issue #01, #02, #04

---

## Deskripsi

Migrasi halaman Profil Desa & UMKM — termasuk peta Google Maps, infografis penduduk (SVG donut chart, bar chart usia), CRUD UMKM, dan export Excel.

## Acceptance Criteria

- [ ] Google Maps embed (Desa Bontoparang, Takalar)
- [ ] Sektor UMKM Unggulan: Top 3 sektor dinamis dari data Firestore
- [ ] Infografis Penduduk:
  - 3 stat cards: Total Penduduk, Laki-laki, Perempuan (dengan persentase)
  - Distribusi usia (5 kelompok: 0-14, 15-24, 25-44, 45-64, 65+) — horizontal bar chart
  - Rasio Gender — SVG donut/ring chart dengan animasi
- [ ] Tabel Breakdown UMKM per Wilayah: filter dusun + tahun, pagination
- [ ] Klik "Lihat" pada wilayah → modal detail daftar UMKM
- [ ] CRUD UMKM: Registrasi baru (nama, pemilik, sektor, wilayah, alamat), Edit, Hapus
- [ ] Export Data ke Excel (.xlsx) — semua data warga + UMKM
- [ ] Real-time sync via `onSnapshot`

## Firestore Collections

- `whitelist` — untuk data penduduk (gender, count per dusun)
- `umkm` — untuk data UMKM (sektor, wilayah, pemilik)

## Fitur Khusus

### SVG Donut Chart (Rasio Gender)
- Lingkaran SVG dengan `stroke-dasharray` untuk visualisasi persen L vs P
- Animasi transisi saat data berubah

### Export Excel
- Library: `xlsx` (SheetJS)
- Sheet 1: Data Whitelist Warga
- Sheet 2: Data UMKM

## Referensi File Lama

- [profil-desa.html](file:///d:/Random/Aspira/profil-desa/profil-desa.html)
- [profil-desa.js](file:///d:/Random/Aspira/profil-desa/profil-desa.js)
- [profil-desa.css](file:///d:/Random/Aspira/profil-desa/profil-desa.css)
