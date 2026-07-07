# Issue #04 — Admin Layout & Sidebar

> **Label**: `layout`, `navigation`, `priority: critical`
> **Estimasi**: 3-4 jam
> **Fase**: 2 — Layout & Navigasi
> **Dependensi**: Issue #01, Issue #03

---

## Deskripsi

Membuat Admin Layout yang menjadi wrapper untuk semua halaman terproteksi, termasuk komponen Sidebar yang collapsible. Ini menggantikan sidebar HTML yang saat ini di-copy-paste di 6 file dan disinkronkan via `update_sidebar.py`.

## Acceptance Criteria

- [ ] Route group `(admin)` dengan `layout.tsx` yang membungkus Sidebar + konten
- [ ] Komponen `<Sidebar />` dengan 6 menu navigasi + tombol Keluar
- [ ] Sidebar collapsible (toggle button di pojok kanan atas sidebar)
- [ ] State collapse disimpan ke `localStorage` dan di-restore saat mount
- [ ] Icon tetap terlihat saat sidebar collapsed, teks tersembunyi
- [ ] Tooltip muncul pada hover saat sidebar collapsed (`data-title`)
- [ ] Logo ASPIRA AI di header sidebar
- [ ] User profile section di footer sidebar (avatar + nama + role)
- [ ] Avatar dinamis — menampilkan foto dari Firestore jika ada, fallback ke inisial
- [ ] Menu navigasi aktif ditandai dengan highlight visual
- [ ] Transisi animasi smooth saat collapse/expand (300ms)
- [ ] Navigasi menggunakan `next/link` (tanpa full-page reload)

## Detail Teknis

### 1. SidebarContext (`src/contexts/SidebarContext.tsx`)

```typescript
interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
}
// Persist ke localStorage key 'sidebar_collapsed'
```

### 2. Admin Layout (`src/app/(admin)/layout.tsx`)

```tsx
export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
```

### 3. Menu Items

| Label | Icon | Route |
|---|---|---|
| Dashboard Desa | `fa-table-cells-large` | `/dashboard` |
| Profil Desa & UMKM | `fa-building-columns` | `/profil-desa` |
| Aspirasi Warga | `fa-comment-dots` (regular) | `/aspirasi-warga` |
| Whitelist Warga | `fa-shield-halved` | `/whitelist-warga` |
| Akun Warga | `fa-users-gear` | `/akun-warga` |
| Pengaturan | `fa-gear` | `/pengaturan` |
| — separator — | | |
| Keluar | `fa-right-from-bracket` | Logout action |

### 4. Sidebar Visual Specs

- **Width expanded**: `w-56` (224px)
- **Width collapsed**: `w-16` (64px)
- **Background**: `bg-[#1e4d2b]`
- **Text**: White, `text-green-300` untuk secondary
- **Active item**: `bg-white/10` highlight
- **Toggle button**: Lingkaran hijau absolute `-right-3 top-7`
- **Animasi**: `transition-all duration-300`

### 5. User Profile Section

```tsx
// Di footer sidebar, sebelum tombol keluar
<div className="sidebar-user-section">
  {admin?.avatar ? (
    <img src={admin.avatar} className="w-9 h-9 rounded-full" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-green-400 flex items-center justify-center">
      {admin?.nama?.charAt(0) || 'A'}
    </div>
  )}
  <div className="sidebar-text">
    <p>{admin?.nama || 'Admin Utama'}</p>
    <p>{admin?.role || 'Administrator'}</p>
  </div>
</div>
```

## Referensi File Lama

- [dashboard.html:29-83](file:///d:/Random/Aspira/dashboard.html#L29-L83) — Sidebar HTML
- [shared/sidebar.js](file:///d:/Random/Aspira/shared/sidebar.js) — Toggle logic
- [shared/sidebar.css](file:///d:/Random/Aspira/shared/sidebar.css) — Collapsed styles
- [update_sidebar.py](file:///d:/Random/Aspira/update_sidebar.py) — Script yang akan dihapus
