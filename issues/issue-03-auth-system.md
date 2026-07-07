# Issue #03 — Sistem Autentikasi & Halaman Login

> **Label**: `auth`, `page`, `priority: critical`
> **Estimasi**: 4-5 jam
> **Fase**: 2 — Layout & Navigasi
> **Dependensi**: Issue #01, Issue #02

---

## Deskripsi

Membangun sistem autentikasi lengkap termasuk AuthContext, middleware route protection, dan migrasi halaman Login dari `index.html` ke Next.js. Sistem login tetap menggunakan custom NIK + password query ke Firestore collection `admins` (sesuai arsitektur saat ini).

## Acceptance Criteria

- [ ] `AuthContext` menyimpan state login (admin data) dan method `login()` / `logout()`
- [ ] `middleware.ts` melindungi semua route `/dashboard`, `/profil-desa`, dll.
- [ ] User yang belum login diredirect ke `/` (halaman login)
- [ ] User yang sudah login di `/` diredirect ke `/dashboard`
- [ ] Halaman Login (`/page.tsx`) termigrasi lengkap dari `index.html`
- [ ] Fitur toggle password visibility berfungsi
- [ ] Toast error muncul jika NIK/password salah
- [ ] Auto-seed admin default jika collection `admins` kosong
- [ ] Loading state pada tombol "Masuk" saat proses login
- [ ] Banner kiri dengan statistik dan background image
- [ ] Responsive: banner tersembunyi di mobile

## Detail Teknis

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

```typescript
interface AdminUser {
  id: string;
  nama: string;
  nik: string;
  role: string;
  email: string;
  telp: string;
  avatar?: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (nik: string, password: string) => Promise<boolean>;
  logout: () => void;
}
```

- Persist session ke `localStorage` (keys: `aspira_admin_*`)
- Pada mount, cek `localStorage` untuk auto-restore session

### 2. Middleware (`middleware.ts`)

```typescript
// Protected routes
const protectedPaths = ['/dashboard', '/profil-desa', '/aspirasi-warga',
  '/whitelist-warga', '/akun-warga', '/pengaturan'];

// Cek cookie atau header untuk auth status
```

### 3. Halaman Login (`src/app/page.tsx`)

**Layout**: Split screen (2 kolom pada desktop)

| Kolom Kiri (lg:w-1/2) | Kolom Kanan (lg:w-1/2) |
|---|---|
| Background image desa | Form login |
| Overlay gradient | Logo ASPIRA AI |
| Badge "Platform Terpadu Desa" | Input NIK + Password |
| Heading + subtext | Checkbox "Ingat perangkat" |
| Glass cards (Total Desa, Status) | Tombol Masuk |
| | Help box + Footer links |

### 4. Fungsi Login

```typescript
async function login(nik: string, password: string): Promise<boolean> {
  const q = query(collection(db, 'admins'), where('nik', '==', nik));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return false;

  let authenticated = false;
  snapshot.forEach(doc => {
    if (doc.data().password === password) {
      authenticated = true;
      // Set admin state + localStorage
    }
  });

  return authenticated;
}
```

### 5. Auto-Seed Admin

```typescript
// Pada mount LoginPage, cek jika admins collection kosong
// Jika kosong, tambahkan admin default:
// NIK: 1122334455667788, Password: Admin12345
```

## Referensi File Lama

- [index.html](file:///d:/Random/Aspira/index.html) — Layout dan UI login
- [index.js](file:///d:/Random/Aspira/index.js) — Logika login, seed admin
- [index.css](file:///d:/Random/Aspira/index.css) — Styling khusus login
