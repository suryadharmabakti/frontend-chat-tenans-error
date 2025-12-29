<<<<<<< HEAD
=======
# template-next-frontend
Standart Template Next JS Frontend

>>>>>>> 4f3423b (Initial commit)
# 🚀 Proyek Next.js dengan Struktur Modular

Ini adalah proyek [Next.js](https://nextjs.org) yang dibuat menggunakan [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). Proyek ini menggunakan struktur modular dan komponen DynamicPage untuk mempercepat pengembangan halaman berbasis data.

## 🚧 Memulai Proyek

Jalankan server pengembangan:

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

## 📁 Struktur Folder Modular

Contoh modul: `app/console/users`

```
app/
└── console/
    └── users/
        ├── access-definition.ts
        ├── page.tsx
        ├── page.config.tsx
        ├── logic/
        ├── api/
        ├── components/
        ├── add/
        └── [slug]/
```

## 🔐 Akses & Izin (`access-definition.ts`)

Setiap modul mendefinisikan akses seperti:

```ts
const userDefinition: AccessDefinition = {
  id: 'user',
  group: 'user-management',
  name: 'Manajemen Pengguna',
  description: 'Mengelola pengguna dan prosesnya',
  permissions: ['read', 'create', 'update', 'delete', 'cancel', 'confirm', 'process'],
};
```

Gunakan `hasPermission(user, 'user:create')` untuk memeriksa izin.

## ⚙️ Konfigurasi Halaman (`page.config.tsx`)

Digunakan untuk konfigurasi seperti:

```ts
export const title = "Manajemen Pengguna";
export const apiPath = "/console/users";
export const pageRoute = { list: "...", add: "...", edit: (id) => "...", details: (id) => "..." };
```

## 📊 DynamicPage

Komponen utama untuk menampilkan tabel, filter, dan pagination.

### Properti Wajib

- `apiPath`
- `columnFormats`
- `pageRoute`

### Properti Opsional

- `title`, `description`, `breadcrumb`
- `filterFields`
- `queryWithTenandID`, `slugTenantID`
- `showAddAction`, `showExportAction`, `showImportAction`, `showDetailTable`

## 💻 Contoh Implementasi (`page.tsx`)

```tsx
<DynamicPage
  title={title}
  breadcrumb={breadcrumb}
  filterFields={filterFields}
  columnFormats={columnFormats}
  apiPath={`${apiPath}/api`}
  pageRoute={pageRoute}
  showAddAction={hasPermission(user, `${userDefinition.id}:create`)}
  queryWithTenandID={true}
  slugTenantID="tenants.id"
/>
```

## 🧠 Tips & Best Practices

- Modularisasi tiap fitur
- Gunakan `access-definition.ts` untuk standarisasi izin
- Simpan konfigurasi di `page.config.tsx`
- Gunakan `DynamicPage` untuk halaman berbasis tabel
- Pisahkan logika (di `logic/`) dan API (di `api/`)
## 📥 Akses Permission Default dari File `access-permissions.json`

Tampilan default untuk create, edit, dan view pada Role Access akan mengambil data permission dari file `access-permissions.json`. File ini berisi struktur permission yang sudah dikelompokkan dan digunakan untuk menampilkan daftar checkbox secara otomatis.

File ini dimuat menggunakan fungsi:

```ts
import { loadAccessPermissions } from "@/lib/permission/access-permissions-loader";

const accessData = loadAccessPermissions();
```

Struktur data di dalamnya akan secara otomatis dikelompokkan berdasarkan group dan ditampilkan dalam bentuk checkbox multi permission, seperti `create`, `edit`, `delete`, dst.

Jika belum tersedia, Anda harus menghasilkan file ini terlebih dahulu.

## 🔧 Cara Menghasilkan File `access-permissions.json`

Jalankan perintah berikut untuk menghasilkan file `access-permissions.json`:

```bash
npm run generate:access
```

Script ini akan menjalankan file `scripts/generate-access-permissions.ts` untuk membuat file permission berdasarkan `access-definition.ts` dari semua modul.

Pastikan Anda menjalankan ini setiap kali ada perubahan definisi akses.