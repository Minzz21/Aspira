# Issue #11 — Gamifikasi: Admin Performance Score & Overdue Alert

> **Label**: `feature`, `gamification`, `priority: high`
> **Estimasi**: 6-8 jam
> **Fase**: 4 — Fitur Lanjutan
> **Dependensi**: Issue #07 (Aspirasi Warga), Issue #05 (Dashboard)

---

## Deskripsi

Implementasi sistem gamifikasi untuk mendorong responsivitas admin dalam menangani laporan warga. Admin akan memiliki **skor kinerja** yang naik/turun berdasarkan kecepatan penanganan laporan. Laporan yang tidak ditindaklanjuti dalam **48 jam** (2 hari) akan dianggap **overdue** dan memberikan penalti skor.

## Latar Belakang

Saat ini tidak ada mekanisme yang mendorong admin untuk segera menangani laporan. Laporan bisa menumpuk tanpa konsekuensi. Dengan gamifikasi, admin termotivasi menyelesaikan laporan tepat waktu melalui sistem reward & penalty yang transparan.

---

## Mekanisme Skor

| Aksi | Poin |
|------|------|
| Skor awal admin | **100** |
| Selesaikan laporan tepat waktu (<48 jam) | **+2** |
| Selesaikan laporan kritis dalam <24 jam | **+5** (bonus) |
| Laporan overdue (>48 jam, status masih `menunggu`) | **-5** per laporan per hari |
| Skor minimum | **0** (tidak bisa negatif) |
| Skor maksimum | **100** |

### Tier Kinerja

| Skor | Label | Warna | Ikon |
|------|-------|-------|------|
| 90–100 | Sangat Responsif | 🟢 Hijau | ⭐ Bintang |
| 70–89 | Cukup Baik | 🟡 Kuning | 👍 |
| 50–69 | Perlu Perhatian | 🟠 Oranye | ⚠️ Warning |
| 0–49 | Kinerja Rendah | 🔴 Merah | 🚨 Alert |

---

## Acceptance Criteria

### 1. Firestore Collection: `admin_performance`

- [ ] Buat collection `admin_performance` dengan dokumen per admin
- [ ] Fields:
  ```
  {
    adminId: string,
    adminName: string,
    score: number (default: 100),
    streak: number (hari berturut-turut tanpa overdue),
    bestStreak: number,
    totalResolved: number,
    totalOverdue: number,
    lastUpdated: Timestamp
  }
  ```

### 2. Logika Overdue Detection

- [ ] Laporan dianggap **overdue** jika:
  - `status === 'menunggu'` DAN
  - `createdAt` sudah lebih dari **48 jam** dari waktu sekarang
- [ ] Hitung jumlah laporan overdue secara real-time dari collection `aspirasi`
- [ ] Laporan dengan status `proses`, `selesai`, atau `kritis` TIDAK dihitung overdue

### 3. Dashboard — Performance Widget

- [ ] Tampilkan **skor kinerja admin** di halaman Dashboard (card baru)
  - Circular progress bar / gauge menampilkan skor (0-100)
  - Label tier kinerja (warna sesuai tier)
  - Streak counter: "🔥 X hari tanpa laporan terbengkalai"
- [ ] Tampilkan jumlah laporan overdue saat ini
- [ ] Warna card berubah sesuai tier (hijau/kuning/oranye/merah)

### 4. Overdue Alert Banner

- [ ] Jika ada laporan overdue (>48 jam), tampilkan **alert banner** di:
  - Halaman Dashboard (atas)
  - Halaman Aspirasi Warga (atas)
- [ ] Format banner:
  ```
  ⚠️ Perhatian: X laporan sudah menunggu lebih dari 2 hari!
  Skor kinerja Anda: XX/100 — [Lihat Laporan Tertunda]
  ```
- [ ] Banner berwarna merah/oranye, tidak bisa di-dismiss (hilang otomatis saat laporan ditangani)

### 5. Update Skor Otomatis

- [ ] Saat admin mengubah status laporan menjadi `selesai`:
  - Cek apakah diselesaikan dalam <48 jam → tambah +2
  - Cek apakah kritis dan diselesaikan <24 jam → tambah +5 bonus
  - Update `totalResolved`
  - Update `streak` (increment jika tidak ada overdue)
- [ ] Saat ada laporan overdue baru terdeteksi:
  - Kurangi skor -5 per laporan
  - Reset `streak` ke 0
  - Update `totalOverdue`

### 6. Halaman Aspirasi — Visual Overdue Indicator

- [ ] Laporan yang sudah overdue ditandai dengan:
  - Badge merah "TERLAMBAT" atau "OVERDUE" di tabel
  - Highlight baris dengan background merah muda
  - Tooltip: "Laporan ini sudah menunggu X hari"
- [ ] Tambah filter baru: "Terlambat" di FilterChips

### 7. Sidebar — Quick Indicator (Opsional)

- [ ] Tampilkan dot/badge kecil di menu "Aspirasi Warga" jika ada laporan overdue
- [ ] Warna merah dengan jumlah laporan overdue

---

## Komponen yang Perlu Dibuat/Dimodifikasi

### Komponen Baru
- `components/ui/PerformanceGauge.tsx` — Circular gauge untuk skor
- `components/ui/OverdueBanner.tsx` — Alert banner overdue
- `components/ui/StreakBadge.tsx` — Badge streak counter

### File yang Dimodifikasi
- `app/(admin)/dashboard/page.tsx` — Tambah Performance Widget + Overdue Banner
- `app/(admin)/aspirasi-warga/page.tsx` — Tambah Overdue Banner + visual indicator + filter "Terlambat" + update skor saat ubah status
- `components/layout/Sidebar.tsx` — Badge overdue count (opsional)
- `types/index.ts` — Tambah interface `AdminPerformance`
- `lib/firestore.ts` — Tambah collection reference `admin_performance`

---

## Kalkulasi Overdue (Pseudocode)

```typescript
const now = Date.now();
const OVERDUE_THRESHOLD = 48 * 60 * 60 * 1000; // 48 jam dalam ms

const overdueReports = aspirasi.filter(item => {
  const createdMs = item.createdAt?.toMillis?.() || 0;
  const elapsed = now - createdMs;
  return item.status === 'menunggu' && elapsed > OVERDUE_THRESHOLD;
});

const overdueCount = overdueReports.length;
```

---

## Referensi UI

### Performance Widget (Dashboard)
```
┌─────────────────────────────────────┐
│  ⭐ Skor Kinerja Admin              │
│                                     │
│     ┌───────────┐                   │
│     │    92     │  Sangat Responsif  │
│     │   /100    │  🟢               │
│     └───────────┘                   │
│                                     │
│  🔥 Streak: 12 hari                 │
│  ✅ Total diselesaikan: 45          │
│  ⚠️ Total terlambat: 3              │
└─────────────────────────────────────┘
```

### Overdue Banner
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ 3 laporan sudah menunggu lebih dari 2 hari!         │
│    Skor kinerja: 72/100 — Perlu Perhatian               │
│                                    [Lihat Laporan →]    │
└─────────────────────────────────────────────────────────┘
```

---

## Catatan Teknis

- Skor dihitung **client-side** berdasarkan data real-time dari Firestore (tidak perlu cloud function)
- Overdue detection menggunakan perbandingan `createdAt` timestamp vs `Date.now()`
- Streak dihitung berdasarkan hari kalender terakhir tanpa laporan overdue
- Skor di-persist ke Firestore agar bisa dilacak historinya
