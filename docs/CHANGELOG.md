# 📋 Changelog

Semua perubahan penting pada project ini akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.5.0] - 2026-01-05

### ✨ Added

#### Indonesian Holiday Calendar (Tanggal Merah)

- **Holiday Data Library** - `src/lib/indonesian-holidays.ts`
  - Fixed holidays: Tahun Baru, Hari Buruh, Pancasila, Kemerdekaan, Natal
  - Variable holidays 2025-2026: Imlek, Isra Mi'raj, Nyepi, Idul Fitri, Waisak, Idul Adha, Maulid Nabi
  - Helper functions: `isRedDay()`, `getHolidayName()`, `isSunday()`, `isHoliday()`

- **Calendar Holiday Display**
  - Red text styling for Sundays and national holidays
  - Holiday name display with 🎌 emoji in card header when selected
  - Red banner below calendar showing full date and holiday name
  - Tooltip on hover (optional)

- **Enlarged Calendar View**
  - Calendar cells increased from 12px to 16px
  - Full-width calendar layout in Kalender tab
  - Legend: "Merah = Hari Libur"

### 🔧 Changed

#### Development Workflow Improvements

- **`npm run dev:local`** now recommended for Windows development
  - Faster hot-reload than Docker
  - No memory issues
  - Use port 3000 by default

- **Docker port** changed from 3038 to 3040

### 📁 New Files

| File | Description |
|------|-------------|
| `src/lib/indonesian-holidays.ts` | Indonesian public holidays data & helper functions |

### 🐛 Known Issues

- ⚠️ **Docker Memory Issues** - Docker container may run out of memory on Windows
  - **Workaround**: Use `npm run dev:local` instead

---

## [2.4.0] - 2026-01-04

### ✨ Added

#### Master Parameter System (NEW)

- **MasterParameter Model** - Dynamic dropdown value management
  - Fields: tipe, kode, nama, warna, urutan, aktif
  - 8 parameter types supported (Prioritas, Kategori Tugas, Jenis Surat, etc.)
  - 35 seeded parameter values

- **Parameter API Endpoints**
  - `GET /api/master/parameter` - List parameters by type
  - `POST /api/master/parameter` - Create new parameter
  - `PATCH /api/master/parameter/[id]` - Update parameter
  - `DELETE /api/master/parameter/[id]` - Delete parameter

- **Parameter Management UI** - `src/components/master-data/parameter-management.tsx`
  - New "Parameter" tab in Master Data page
  - Dropdown to select parameter type
  - Full CRUD with color indicators
  - Toggle active/inactive status
  - RBAC protection (USKUP, SEKRETARIS, VIKJEN only)

#### Dynamic Dropdowns (NEW)

- **useParameters Hook** - `src/hooks/use-parameters.ts`
  - Generic `useParameters({ tipe })` hook
  - Convenience hooks: `usePrioritas()`, `useKategoriTugas()`, `useJenisSurat()`, `useJenisPertemuan()`, etc.
  - Auto-fetch on mount with caching

- **Pages Updated**
  - Tasks page - Prioritas & Kategori dropdowns now dynamic
  - Surat page - Jenis Surat dropdown now dynamic
  - Agenda page - Jenis Pertemuan dropdown now dynamic

### 🔧 Changed

- Removed hardcoded dropdown values from Tasks, Surat, and Agenda pages
- All dropdown values now fetched from MasterParameter API
- Seed.ts updated with comprehensive parameter data

### 📁 New Files

| File | Description |
|------|-------------|
| `src/app/api/master/parameter/route.ts` | Parameter API (GET, POST) |
| `src/app/api/master/parameter/[id]/route.ts` | Parameter API (PATCH, DELETE) |
| `src/components/master-data/parameter-management.tsx` | Parameter UI component |
| `src/hooks/use-parameters.ts` | Dynamic parameter hooks |

---

## [2.3.1] - 2026-01-04

### ✨ Added

#### User Management (NEW)

- **Manajemen Pengguna** di halaman Pengaturan -> Tab Pengguna
- CRUD pengguna sistem (Tambah, Edit, Hapus akun)
- Role-Based Access Control (hanya USKUP, SEKRETARIS, VIKJEN dapat mengakses)
- API Endpoints: `/api/users`, `/api/users/[id]`
- Password hashing dengan bcrypt

#### Role Normalization System

- **`normalizeRole()`** function di `src/lib/rbac.ts`
- Mendukung role uppercase (USKUP) dan lowercase (bishop) dari legacy system
- Role aliases mapping untuk backward compatibility
- Centralized permission functions: `canManageUsers()`, `canCreateUsers()`

#### Development Workflow

- `npm run dev:local` - Development tanpa Docker
- `npm run db:fresh` - Reset database dengan seed data

### 🔧 Changed

- All RBAC functions now use `normalizeRole()` internally
- API routes refactored to use centralized permission functions
- Database re-seeded dengan consistent UPPERCASE roles
- User Management now displays friendly role names using `getRoleDisplayName()`
- Added database indexes on User model (role, createdAt)

### 📚 Documentation

- Added [DEVELOPMENT.md](file:///d:/@workspace/DashboardUskup/docs/DEVELOPMENT.md) - Quick start guide
- Added [ROLES.md](file:///d:/@workspace/DashboardUskup/docs/ROLES.md) - Permission matrix

### 🐛 Known Issues

#### Docker HMR (Hot Module Reload)

- ⚠️ **Masalah**: Perubahan kode kadang tidak langsung terefleksi di browser
- **Workaround**: Restart server Docker dengan port baru atau gunakan `npm run dev:local`

---

## [2.3.0] - 2026-01-04

### ✨ Added

#### Analytics Dashboard

- **Chart Components** - `src/components/dashboard-charts.tsx`
  - `DashboardAreaChart` - untuk visualisasi tren
  - `DashboardBarChart` - untuk perbandingan data
  - `DashboardPieChart` - untuk distribusi data
  - `DashboardMultiLineChart` - untuk multiple series
  - `StatCardWithChart` - stat card dengan mini chart
- **Analytics API** - `/api/analytics`
  - Overview stats (imam, paroki, reports, issues)
  - Monthly trends aggregation
  - Weekly activity data
- **Analytics Page** - `/analytics`
  - Interactive charts dengan period selector
  - Tren aktivitas mingguan
  - Distribusi tugas, laporan, konsultasi

#### Executive Summary Dashboard

- **Executive Summary Page** - `/reports/summary`
  - Traffic Light Health Indicators (🟢 Baik, 🟡 Perlu Perhatian, 🔴 Kritis)
  - Overall health status keuskupan
  - Breakdown per unit kerja
  - Recent reports list
- **Executive Summary API** - `/api/reports/summary`

#### Smart Inbox (NEW)

- **Smart Inbox Service** - `src/lib/smart-inbox.ts`
  - Centralized pending actions aggregation
  - Priority-based sorting
- **Smart Inbox API** - `/api/inbox`
- **Smart Inbox UI** - `src/components/smart-inbox.tsx`
  - Bell icon with badge counter
  - Sidebar drawer with categorized items
  - Auto-refresh every minute

#### Mobile Improvements (NEW)

- **Mobile CSS Utilities** - `src/styles/mobile.css`
  - Responsive grid classes
  - Touch-friendly targets (44px min)
  - Safe area padding for notched devices
  - Pull-to-refresh container styles

### 🔧 Changed

#### UI/UX Improvements

- **Sidebar Text** - `font-semibold` for better readability
- **Sidebar Icons** - `strokeWidth={2.5}` for bolder appearance
- **Sidebar Gradient** (Dark Mode)
  - `bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950`
- **Header Gradient** (Dark Mode)
  - `bg-gradient-to-r from-slate-900 to-slate-950`
- **Light Mode**
  - Sidebar & Header: `bg-gray-50` (clean white)
  - Text color: `text-gray-800` (darker for readability)
  - Active item: `bg-blue-50 text-blue-700`
- **Reports Cards** - Removed thick borders, using subtle bg colors
- **Master Data Kevikepan Headers** - Larger text, neutral colors

#### Navigation

- Added "Analytics" menu in sidebar (PieChart icon)
- Added page titles for `/analytics` and `/reports/summary`

### 🐛 Fixed

- Fixed missing `</div>` in reports/page.tsx causing build error
- Fixed hydration mismatch in DashboardLayout
- Fixed light mode sidebar text too light (changed to gray-800)

---

## [2.2.0] - 2026-01-03

### ✨ Added

#### Phase 1: Foundation & Roles

- **User Role System** - 11 distinct roles dengan hierarchy
  - USKUP, SEKRETARIS, VIKJEN, VIKYUD, EKONOM
  - DELEGATUS, KURIA, VIKEP, KOMISI, PAROKI, STAFF
- **RBAC Helpers** - `src/lib/rbac.ts`
  - `isUskup()`, `isSekretaris()`, `isCuria()`
  - `canApproveDocuments()`, `canCreateIssues()`, `canGiveOpinions()`
  - `hasHigherRole()` untuk role comparison
- **Extended User Model**
  - Fields: jabatan, department, canApprove, signatureUrl

#### Phase 2: Digital Signature

- **DigitalSignature Model** - Crypto hash storage
- **Signature Service** - `src/lib/digital-signature.ts`
  - SHA-256 document hashing
  - `signDocument()`, `verifySignature()`, `revokeSignature()`
- **Sign API** - `POST /api/surat/[id]/sign`
- **Public Verification** - `/verify/[hash]` page
  - Valid/Invalid/Revoked status display
  - Document and signer details

#### Phase 3: Collaboration Module

- **Issue Service** - `src/lib/issue-service.ts`
  - CRUD operations for Issues
  - Opinion management
  - Decision workflow (Uskup only)
- **API Endpoints**
  - `GET/POST /api/issues`
  - `GET/PUT /api/issues/[id]`
  - `POST /api/issues/[id]/opinions`
  - `POST /api/issues/[id]/decide`
- **Issues UI**
  - `/issues` - List with create dialog, filters
  - `/issues/[id]` - Detail with opinions and decision form
- **Sidebar** - Added "Konsultasi" menu item

#### Phase 4: Smart Reporting

- **Report Model** - Laporan dari Paroki/Komisi/Kevikepan
- **Report Service** - `src/lib/report-service.ts`
- **API Endpoints** - `/api/reports/*`
- **Reports UI** - List, detail, create, submit, review
- **Sidebar** - Added "Laporan" menu item

### 🔧 Changed

- **Bundler** - Kembali ke Turbopack (default Next.js 16+)
- **Card Styles** - Removed ring-2 shadow, replaced with subtle bg colors

### 🐛 Fixed

- **Hydration Mismatch (DashboardLayout)**
  - Root cause: Server render berbeda dari client render
  - Solution: Added `mounted` state pattern di `dashboard-layout.tsx`
  - Server renders placeholder, client renders full layout setelah mount
- **Hydration Mismatch (Sonner)** - Added `mounted` pattern for useTheme
- **next-auth Import Error** - Changed to `getCurrentUserFromRequest`

### 📝 Documentation

- **ARCHITECTURE.md** - Updated with 3-pillar system, new modules, roles
- **Walkthrough** - Comprehensive implementation documentation

---

## [2.1.0] - 2026-01-02

### ✨ Added

#### UI/UX Improvements

- **Sidebar Redesign**
  - Logo Keuskupan Surabaya dengan rounded corners (`rounded-2xl`)
  - Teks "Keuskupan Surabaya" dalam 2 baris dengan font besar
  - User section di bagian bawah dengan dropdown menu
  - Header proporsional h-20 (80px)

- **Header Content Area**
  - Dynamic page title sesuai halaman aktif
  - Page description untuk konteks
  - Search bar di desktop
  - Mobile menu trigger terintegrasi
  - Tinggi sejajar dengan sidebar header (h-20)

- **Master Data Page Redesign**
  - Card-based layout dengan grouping by Kevikepan
  - Stats cards dengan colored icon backgrounds (blue, green, purple)
  - Ring indicator untuk active tab
  - Hover actions untuk edit/delete
  - Filter by Kevikepan
  - 47 paroki dari 8 Kevikepan (data lengkap)

### 🔧 Changed

- **Sheet Component** - Added VisuallyHidden DialogTitle for accessibility
- **DashboardLayout** - Hamburger menu hanya visible di mobile
- **Sidebar Navigation** - Active state dengan primary color

### 🗑️ Removed

- **bcrypt** - Removed duplicate package, keeping bcryptjs only
- **@types/bcrypt** - Removed unused type definitions

### 🐛 Fixed

- **Hydration Mismatch** - Fixed by clearing .next cache on Turbopack
- **DialogTitle Accessibility Error** - Fixed with VisuallyHidden wrapper
- **CSS Inline Styles** - Removed inline backgroundColor styles

### 📝 Documentation

- **Audit Report** - Comprehensive application audit completed
  - 15 database models analyzed
  - 72 dependencies reviewed
  - Turbopack vs Webpack evaluation
  - Recommendations documented

#### Sinkronisasi Data Imam

- **Settings → Sinkronisasi Tab** - Konfigurasi API eksternal
  - Input API URL dan API Key untuk Pororomo
  - Jadwal sinkronisasi otomatis (harian/mingguan)
  - Riwayat sinkronisasi

- **Database Imam Empty State** - Pesan informatif untuk data kosong
  - Icon dan judul "Data Imam Belum Tersinkron"
  - Tombol ke halaman Konfigurasi Sinkronisasi
  - Tombol "Coba Sinkronkan"

- **API Endpoint** - DELETE /api/imam?action=clear-all
  - Untuk membersihkan data sebelum sync

- **Seed.ts** - Data imam dummy dihapus
  - Data akan diambil dari API Pororomo

---

## [2.0.0] - 2026-01-02

### ✨ Added

#### Authentication

- **Remember Me** - Checkbox "Ingat Saya" di halaman login
  - JWT expiry: 30 hari (remember) vs 1 hari (default)
- **Refresh Token** - Endpoint `/api/auth/refresh` untuk token renewal
  - Functions: `createRefreshToken()`, `verifyRefreshToken()`
- Debug logging untuk troubleshooting login issues

#### Performance

- **TanStack Query** - React Query integration untuk data caching
  - StaleTime: 5 menit
  - CacheTime: 30 menit
  - Auto-refetch on window focus (production only)
- **QueryProvider** - Global query client setup di providers.tsx
- **React Query Hooks** - New hooks di `useQueryApi.ts`:
  - `useAgendaQuery()`, `useTasksQuery()`, `useNotulensiQuery()`
  - `useImamQuery()`, `useSuratQuery()`, `useDecisionsQuery()`
  - CRUD mutations dengan auto-invalidation

#### UI/UX

- **Loading Skeletons** - 10+ skeleton variants:
  - `CardSkeleton`, `TableSkeleton`, `ListItemSkeleton`
  - `DashboardStatsSkeleton`, `PageLoadingSkeleton`
  - `AgendaCardSkeleton`, `TaskCardSkeleton`
- **Mobile Responsive** - Hamburger menu untuk mobile
  - Sheet component untuk sidebar mobile
  - Responsive padding (`p-4 md:p-6`)
- **Keyboard Shortcuts** - Global shortcuts:
  - `?` - Show help dialog
  - `Ctrl+D/A/T/N` - Navigate to pages
  - `Shift+N` - Create new item
  - `Esc` - Close dialog

#### Features

- **PDF Export** - Utility untuk export notulensi ke PDF
  - `exportToPDF()` - Generic PDF export
  - `exportNotulensiToPDF()` - Notulensi-specific export
  - Browser print API-based

#### Documentation

- Complete documentation in `/docs` folder:
  - README.md (index)
  - ARCHITECTURE.md
  - DATABASE.md
  - COMPONENTS.md
  - AUTHENTICATION.md
  - DEVELOPMENT.md
  - DEPLOYMENT.md
  - CHANGELOG.md

### 🐛 Fixed

#### Critical Bugs

- **Login Issue** - Password verification not working
  - Root cause: Hash format mismatch in seeded data
  - Solution: Database reset with correct bcrypt hash
- **API Auth Bug** - 3 API routes calling undefined `getCurrentUser()`
  - Fixed: `imam/route.ts`, `surat/route.ts`, `decisions/route.ts`
  - Changed to `getCurrentUserFromRequest(request)`

#### UI Issues

- **Database Imam Navigation** - Was opening in new tab
  - Removed `external: true` from sidebar-nav.tsx
- **Hydration Mismatch** - Font class hydration warning
  - Added `suppressHydrationWarning` to body element

### 🔧 Changed

- `createJWT()` now accepts optional `rememberMe` parameter
- `login()` function in useAuth now accepts `rememberMe` parameter
- Dashboard layout padding simplified for mobile

### 📁 New Files

| File | Description |
|------|-------------|
| `src/lib/query-client.tsx` | QueryClientProvider setup |
| `src/hooks/useQueryApi.ts` | React Query hooks |
| `src/hooks/useKeyboardShortcuts.ts` | Keyboard shortcuts hook |
| `src/components/ui/skeletons.tsx` | Loading skeleton components |
| `src/components/keyboard-shortcuts-dialog.tsx` | Shortcuts help dialog |
| `src/lib/pdf.ts` | PDF export utility |
| `src/app/api/auth/refresh/route.ts` | Refresh token endpoint |
| `docs/*.md` | Documentation files (8 files) |

---

## [1.0.0] - 2025-12-XX

### ✨ Initial Release

- Dashboard dengan statistik overview
- Modul Agenda dengan kalender
- Modul Tugas dengan progress tracking
- Modul Notulensi dengan approval workflow
- Modul Surat Menyurat
- Database Imam
- Timeline & Report
- Custom JWT authentication
- Socket.IO real-time notifications
- Dark/Light theme support
