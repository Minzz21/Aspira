# Issue #02 — Komponen UI Reusable

> **Label**: `ui`, `components`, `priority: critical`
> **Estimasi**: 4-5 jam
> **Fase**: 1 — Fondasi
> **Dependensi**: Issue #01 (Project Setup)

---

## Deskripsi

Membuat library komponen UI reusable yang akan digunakan di seluruh modul ASPIRA AI. Komponen ini menggantikan kode HTML yang saat ini di-copy-paste di setiap halaman (Toast, Modal, StatCard, dll).

## Acceptance Criteria

- [ ] Komponen `<Toast />` dengan support `success` dan `error` variant
- [ ] `ToastContext` provider agar toast bisa dipanggil dari mana saja
- [ ] Komponen `<Modal />` dengan animasi backdrop blur + scale
- [ ] Komponen `<ConfirmModal />` untuk konfirmasi hapus data
- [ ] Komponen `<StatCard />` dengan props icon, label, value, badge, color
- [ ] Komponen `<DataTable />` generik dengan kolom konfigurabel
- [ ] Komponen `<Pagination />` dengan navigasi halaman
- [ ] Komponen `<FilterChips />` untuk filter data (Semua/Aktif/Nonaktif, dll)
- [ ] Komponen `<SearchInput />` dengan icon dan debounce
- [ ] Komponen `<ProgressBar />` dengan gradient fill
- [ ] Semua komponen menggunakan Tailwind CSS (bukan inline style)
- [ ] Semua komponen memiliki TypeScript props interface

## Detail Komponen

### 1. Toast (`src/components/ui/Toast.tsx` + `src/contexts/ToastContext.tsx`)

```typescript
// Penggunaan:
const { showToast } = useToast();
showToast('Data berhasil disimpan.', 'success');
showToast('Gagal menghapus data.', 'error');
```

- Auto-dismiss setelah 3 detik
- Posisi: fixed bottom-right
- Animasi slide-up + fade

**Referensi**: Lihat toast di [whitelist-warga.html:260-264](file:///d:/Random/Aspira/whitelist-warga/whitelist-warga.html#L260-L264)

### 2. Modal (`src/components/ui/Modal.tsx`)

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}
```

- Backdrop: `bg-gray-900/40 backdrop-blur-sm`
- Animasi: scale dari 95% → 100%
- Close on backdrop click + Escape key

**Referensi**: Modal di [whitelist-warga.html:162-243](file:///d:/Random/Aspira/whitelist-warga/whitelist-warga.html#L162-L243)

### 3. ConfirmModal (`src/components/ui/ConfirmModal.tsx`)

```typescript
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  confirmLabel?: string;   // default: "Ya, Hapus"
  variant?: 'danger' | 'warning';
}
```

**Referensi**: Delete modal di [whitelist-warga.html:245-258](file:///d:/Random/Aspira/whitelist-warga/whitelist-warga.html#L245-L258)

### 4. StatCard (`src/components/ui/StatCard.tsx`)

```typescript
interface StatCardProps {
  icon: IconDefinition;
  iconBg: string;        // e.g. "bg-green-50"
  iconColor: string;     // e.g. "text-green-600"
  label: string;
  value: string | number;
  badge?: { text: string; color: string };
}
```

**Digunakan di**: Dashboard (3 cards), Aspirasi (3 cards), Whitelist (1 card), Akun (3 cards)

### 5. DataTable (`src/components/ui/DataTable.tsx`)

```typescript
interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}
```

### 6. Pagination (`src/components/ui/Pagination.tsx`)

```typescript
interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}
```

- Menampilkan info "Menampilkan X - Y dari Z data"
- Tombol prev/next + nomor halaman

### 7. FilterChips (`src/components/ui/FilterChips.tsx`)

```typescript
interface FilterChipsProps {
  options: { value: string; label: string }[];
  activeValue: string;
  onChange: (value: string) => void;
}
```

### 8. SearchInput (`src/components/ui/SearchInput.tsx`)

```typescript
interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;  // default: 300
}
```

### 9. ProgressBar (`src/components/ui/ProgressBar.tsx`)

```typescript
interface ProgressBarProps {
  value: number;
  max: number;
  color: string;       // Tailwind bg class
  label?: string;
  showCount?: boolean;
}
```

## Design Tokens

Warna utama yang digunakan di seluruh project:

| Token | Hex | Penggunaan |
|---|---|---|
| `primary` | `#1e4d2b` | Sidebar, buttons, accent |
| `primary-dark` | `#164020` | Hover state |
| `primary-light` | `#2d7a45` | Gradient end |
| `success` | `#4ade80` | Status aktif, badge |
| `danger` | `#ef4444` | Error, hapus, kritis |
| `warning` | `#f59e0b` | Status proses |
