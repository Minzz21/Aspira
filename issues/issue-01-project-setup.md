# Issue #01 — Project Setup & Fondasi

> **Label**: `setup`, `priority: critical`
> **Estimasi**: 3-4 jam
> **Fase**: 1 — Fondasi
> **Dependensi**: Tidak ada (issue pertama)

---

## Deskripsi

Inisialisasi proyek Next.js baru dengan seluruh konfigurasi dasar yang dibutuhkan sebagai pondasi migrasi ASPIRA AI. Termasuk setup TypeScript, Tailwind CSS, Firebase modular SDK, dan struktur folder.

## Acceptance Criteria

- [ ] Proyek Next.js 15 berhasil diinisialisasi dengan App Router
- [ ] TypeScript dikonfigurasi dengan strict mode
- [ ] Tailwind CSS v4 terintegrasi via PostCSS (bukan CDN)
- [ ] Font **Inter** dan **JetBrains Mono** dikonfigurasi via `next/font/google`
- [ ] Firebase modular SDK terinstall dan file `lib/firebase.ts` dibuat
- [ ] File `lib/firestore.ts` berisi collection references
- [ ] Environment variables (`.env.local`) dikonfigurasi untuk Firebase
- [ ] Aset (`logo.png`, `favicon.png`) dipindahkan ke `/public`
- [ ] `npm run dev` berjalan tanpa error

## Detail Teknis

### 1. Inisialisasi Next.js

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

### 2. Install Dependencies

```bash
npm install firebase @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/react-fontawesome
npm install jspdf jspdf-autotable xlsx
```

### 3. Firebase Config (`src/lib/firebase.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...dst
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
```

### 4. TypeScript Interfaces (`src/types/index.ts`)

Definisikan interface untuk:
- `Admin` (nik, password, nama, role, email, telp, avatar)
- `Aspirasi` (nama, subjek, kategori, status, kritis, transkripsi, createdAt)
- `WhitelistWarga` (nama, nik, dusun, gender, status, tanggal, createdAt)
- `UMKM` (nama, pemilik, sektor, wilayah, alamat, createdAt)
- `Warga` (nama, nik, password, gender, dusun, createdAt)

### 5. Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 6. Struktur Folder Awal

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx          # placeholder
│   └── globals.css
├── components/
│   ├── layout/
│   ├── ui/
│   └── modules/
├── lib/
│   ├── firebase.ts
│   └── firestore.ts
├── hooks/
├── contexts/
└── types/
    └── index.ts
```

## Referensi File Lama

- [firebase-config.js](file:///d:/Random/Aspira/shared/firebase-config.js) — Firebase config saat ini
- [logo/](file:///d:/Random/Aspira/logo) — Aset yang perlu dipindahkan
