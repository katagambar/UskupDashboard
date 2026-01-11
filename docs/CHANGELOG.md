# 📋 Changelog

Semua perubahan penting pada project ini akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.9.10] - 2026-01-11

### ✨ Added (v2.9.10)

#### 🛡️ Security Hardening (Advanced)

- **Rate Limiting Engine**: Implementasi Token Bucket di level server (`server.ts`)
  - Limit: 100 request / 10 detik per IP
  - Melindungi seluruh rute aplikasi dari serangan DoS/Brute Force
  - 429 Too Many Requests response handler
- **CSP Upgrade**: Penghapusan `'unsafe-eval'` dari Content Security Policy untuk standar keamanan XSS tertinggi.
- **Secret Management**: Migrasi hardcoded keys dari `docker-compose` ke `.env`.
- **Docs**: Dokumen keamanan komprehensif di `docs/SECURITY.md`.

#### ✨ Features

- **Surat & Arsip**:
  - Implementasi **G-Code System** untuk kodifikasi surat keluar otomatis.
  - Integrasi **Google Drive** untuk lampiran file surat (PDF/Gambar).
  - Fitur **Download Word (.docx)** agar surat dapat diedit manual sebelum dicetak.
  - **Rich Text Editor**: Penulisan isi surat mendukung format tebal, miring, list, dll.
  - **Kop Surat Dinamis**: Konfigurasi Nama, Alamat, dan Kontak via Master Data.
- **UI/UX**:
  - New Dashboard Layout with collapsible sidebar.
  - Update Icon **Smart Inbox** (Inbox Icon) untuk membedakan dengan Notifikasi.
  - Refinement input form Master Data Parameter.point upload file
- **Word Export**: `GET /api/surat/[id]/word`
  - Generate `.docx` yang dapat diedit menggunakan `docx` library
  - Tombol download tersedia di detail surat (sebelah PDF)
- **G-Code System**: Validasi ketat kode surat "G" untuk integritas arsip

### 🔧 Fixed

- **Sidebar Visibility**: Memperbaiki isu sidebar hilang karena hydration check yang terlalu agresif di `DashboardLayout`
- **PDF Extensions**: Memperbaiki nama file download PDF (sanitasi karakter slash)
- **Runtime Zombie**: Mengatasi error `handleFileUpload is not defined` dengan alias backward compatibility

### 🔒 Security

- **RBAC**: Pengetatan akses endpoint upload
- **Audit**: `npm audit` run - no critical vulnerabilities found

### 📁 New Docs

- `docs/SURAT_FEATURES.md`: Panduan fitur surat
- `docs/GOOGLE_DRIVE_SETUP.md`: Panduan setup Google Drive

---

## [2.9.9] - 2026-01-09 (Night Session)

### 🔧 Hardcoded Data Fixes

- Fixed dashboard greeting to use logged-in user name
- Fixed sidebar to display user name dynamically
- Emptied default profile values (data from database)
- Template surat now uses `{nama_uskup}` and `{jabatan_uskup}` placeholders

### 📄 Template Resolver

- `src/lib/template-resolver.ts` (145 lines)
  - `resolveTemplate()` - Replace placeholders with values
  - `resolveTemplateWithProfile()` - Auto-fetch bishop data
  - `formatDateForTemplate()` - Indonesian date format

### 🎨 Tailwind v4 Syntax Updates

- `flex-shrink-0` → `shrink-0`
- `bg-gradient-to-br` → `bg-linear-to-br`

---

## [2.9.8] - 2026-01-09 (Evening Session)

### 🔍 Request Tracing (Correlation IDs)

- `src/lib/request-tracing.ts` (320 lines)
  - Unique request ID generation (`req_xxx_xxx`)
  - Request context (method, path, IP, user)
  - Structured logging (info, warn, error, debug)
  - Performance timing and metrics
  - `withTracing()` middleware wrapper
- API: `GET /api/admin/traces` - View trace logs (admin)

### 📅 DateTime Utilities

- `src/lib/date-utils.ts` (300 lines)
  - Parse multiple formats (YYYY-MM-DD, DD/MM/YYYY, ISO)
  - Indonesian date formatting
  - Comparison (isToday, isPast, isFuture)
  - Range checks (isWithinRange)
  - API transformers (v1/v2 compatibility)

### 🔒 HSTS Auto-Enable

- Updated `next.config.ts`:
  - HSTS now auto-enables when `NODE_ENV=production`
  - Includes `preload` directive for HSTS preload list
  - No manual config needed for deployment

---

## [2.9.7] - 2026-01-09 (Afternoon Session)

### 🐳 Infrastructure

- **Redis Caching** - Docker container on port 6379
  - `src/lib/redis-cache.ts` (340 lines)
  - Cache helpers, rate limiting, session management
  - Cache-aside pattern implementation
- **Google Drive File Storage** - Domain-wide delegation
  - `src/lib/file-storage.ts` (370 lines)
  - Upload/download/list/delete files
  - Sub-folders: Surat, Notulensi, Signature, Report, Profile
  - User impersonation via `GOOGLE_IMPERSONATE_USER`

### 🔧 API Versioning

- `src/lib/api-version.ts` (230 lines)
  - Version detection from path/header
  - Date format transformers for v1/v2
  - Deprecation utilities
- `src/app/api/version/route.ts` - Version info endpoint

### 📅 Date Migration Preparation (v3.0)

- `scripts/date-migration.ts` (200 lines)
  - Analysis scripts for date formats
  - SQL migration templates
  - Dry-run validation
  - v1↔v2 format transformers

### 🔑 Configuration

- VAPID keys configured for push notifications
- Google Drive folder configured with domain-wide delegation
- Complete environment variables setup

### 🪝 Webhook Support

- `src/lib/webhooks.ts` (330 lines)
  - Event triggers for agenda, surat, task, notulensi
  - HMAC signature verification
  - Retry logic with exponential backoff
  - Delivery history tracking
- API endpoints:
  - `POST /api/webhooks` - Register webhook
  - `GET /api/webhooks` - List webhooks
  - `GET/PATCH/DELETE /api/webhooks/[id]` - Manage webhook
  - `POST /api/webhooks/test` - Test webhook delivery

### ⚡ Performance Optimization

- Enhanced `next.config.ts` with:
  - Content Security Policy (CSP)
  - Referrer-Policy
  - Permissions-Policy
  - HSTS (ready for production)
  - Static file caching (1 year)

### 🔒 Security Audit

- `src/lib/security.ts` (320 lines)
  - Rate limiting (configurable per endpoint)
  - Input sanitization (XSS prevention)
  - SQL injection detection
  - Suspicious pattern detection
  - IP blocking (auto-block after 10 violations)
  - `withSecurity()` middleware wrapper

### 📁 New Files (v2.9.7)

| File                           | Description             |
| ------------------------------ | ----------------------- |
| `src/lib/redis-cache.ts`       | Redis caching library   |
| `src/lib/file-storage.ts`      | Google Drive storage    |
| `src/lib/api-version.ts`       | API versioning system   |
| `scripts/date-migration.ts`    | v3.0 migration scripts  |
| `scripts/test-file-upload.ts`  | File upload test script |
| `src/app/api/version/route.ts` | Version info endpoint   |

---

## [2.9.6] - 2026-01-09 (Morning Session)

### 🧪 Test Coverage Improvements

- **Total tests: 54 → 127** (+135% increase)
- New test files created:
  - `src/test/api-helpers.test.ts` (13 tests)
  - `src/test/rbac.test.ts` (27 tests)
  - `src/test/surat-numbering.test.ts` (20 tests)
- **Pass rate: 97%** (123/127 passing)

### 🎨 Tailwind v4 Syntax Fixes

- Fixed 7 deprecated `bg-gradient-to-br` → `bg-linear-to-br`:
  - `src/app/reset-password/page.tsx` (5 fixes)
  - `src/app/auth/signin/page.tsx` (2 fixes)

### ⚡ Bundle Optimization

- Created `src/components/lazy-load.tsx`:
  - `PDFExport` - Dynamic PDF export (~500KB saved)
  - `LazyMarkdownRenderer` - Lazy markdown (~100KB saved)
  - `LazyBarChart`, `LazyLineChart`, `LazyPieChart`, `LazyAreaChart` - Charts (~200KB saved)
  - `LazyAnimatedModal` - Framer motion animations
  - `LazyDatePicker` - Date picker component
- Helper utilities: `LoadingSpinner`, `LoadingSkeleton`, `ClientOnly`, `lazySection`

### 🔧 New UI Components

- `src/components/ui/animated.tsx` (280 lines):
  - `FadeIn`, `SlideUp`, `ScaleIn`, `AnimatedCard`, `AnimatedButton`
  - `AnimatedModal`, `AnimatedToast`, `AnimatedSkeleton`, `Pulse`
  - Stagger animations: `StaggerList`, `StaggerItem`
- `src/components/ui/markdown.tsx` (205 lines):
  - `MarkdownRenderer` - Full GFM markdown support
  - `MarkdownPreview` - Compact preview for cards

### 📁 New Files (v2.9.6)

| File                               | Description                 |
| ---------------------------------- | --------------------------- |
| `src/test/api-helpers.test.ts`     | API response helper tests   |
| `src/test/rbac.test.ts`            | RBAC permission tests       |
| `src/test/surat-numbering.test.ts` | Surat codification tests    |
| `src/components/lazy-load.tsx`     | Dynamic import wrappers     |
| `src/components/ui/animated.tsx`   | Framer-motion components    |
| `src/components/ui/markdown.tsx`   | React-markdown renderer     |
| `src/components/ui/index.ts`       | UI components barrel export |
| `docs/CODEBASE_AUDIT_2026_JAN.md`  | Full audit report           |

---

## [2.9.5] - 2026-01-09

### 🐘 PostgreSQL Migration

- **Database migrated from SQLite to PostgreSQL**
- Docker container: `dashboard-postgres` on port 5432
- All data successfully imported from SQLite
- Updated `prisma/schema.prisma` provider to postgresql
- Updated `.env` with PostgreSQL connection string

### 📝 Documentation Updates

- Updated `PENDING_TASKS_AND_OPTIONS.md` - All Q1 tasks complete
- Updated `CHANGELOG.md` - v2.9.5
- PostgreSQL Migration Guide created

### 🔧 Configuration Changes

| File                   | Change                          |
| ---------------------- | ------------------------------- |
| `.env`                 | DATABASE_URL → postgresql://... |
| `prisma/schema.prisma` | provider: postgresql            |

---

## [2.9.4] - 2026-01-08 (Evening Session)

### ✨ Added (v2.9.4)

#### Password Reset System

- `src/lib/reset-tokens.ts` - Token management
- `POST /api/auth/forgot-password` - Request reset link
- `POST /api/auth/reset-password` - Reset with token
- `src/app/reset-password/page.tsx` - Reset password UI
- Signin page forgot password modal

#### 2FA Authentication (TOTP)

- `src/lib/two-factor-auth.ts` - TOTP generation & verification
- `GET/POST /api/auth/2fa` - Setup, verify, disable, regenerate backup
- `GET/POST /api/auth/2fa/verify` - Login verification
- Features: QR code, 10 backup codes, Google Authenticator compatible

#### Push Notifications

- `src/lib/push-notifications.ts` - VAPID, subscriptions, templates
- `GET/POST /api/push/subscribe` - Subscribe/unsubscribe
- `POST /api/push/send` - Admin notification sender
- `scripts/generate-vapid-keys.ts` - VAPID key generator

#### Surat Codification (Enhanced)

- `src/lib/surat-numbering.ts` - Complete numbering system
- `GET /api/surat/numbering` - Generate/options/stats
- 15+ kode jenis surat, 20+ kode unit
- Configurable format: `{KODE}/{UNIT}/{TAHUN}/{URUTAN}`

### 📁 New Files (v2.9.4)

| File                                        | Description                     |
| ------------------------------------------- | ------------------------------- |
| `src/lib/reset-tokens.ts`                   | Password reset token management |
| `src/lib/two-factor-auth.ts`                | TOTP 2FA implementation         |
| `src/lib/push-notifications.ts`             | Push notification service       |
| `src/lib/surat-numbering.ts`                | Surat codification system       |
| `src/app/api/auth/forgot-password/route.ts` | Forgot password API             |
| `src/app/api/auth/reset-password/route.ts`  | Reset password API              |
| `src/app/api/auth/2fa/route.ts`             | 2FA setup/management API        |
| `src/app/api/auth/2fa/verify/route.ts`      | 2FA login verification          |
| `src/app/api/push/subscribe/route.ts`       | Push subscription API           |
| `src/app/api/push/send/route.ts`            | Admin push sender               |
| `src/app/api/surat/numbering/route.ts`      | Surat number API                |
| `src/app/reset-password/page.tsx`           | Reset password UI               |
| `scripts/generate-vapid-keys.ts`            | VAPID key generator             |

---

## [2.9.3] - 2026-01-08

### ✨ Added (v2.9.3)

#### Documentation Cleanup

- Consolidated 36 docs → 15 docs (58% reduction)
- Created `FEATURES.md` - All features in one document
- Created `COMPLETED_IMPROVEMENTS.md` - Implementation history
- Deleted 21 redundant/outdated documents

#### Unit Tests Fixed

- Created `auth-security.test.ts` (9 tests) for custom JWT
- Created `password.test.ts` (16 tests) for password security
- Fixed `validation.test.ts` - formatZodErrors uses `.issues` not `.errors`
- Updated `vitest.config.ts` - Excludes e2e/ and test.disabled/
- **Result:** 54/54 tests passing

#### TypeScript Types

- Created `src/types/index.ts` with 15+ interfaces:
  - Entity types: AgendaItem, TaskItem, NotulensiItem, SuratItem, DecisionItem, ImamItem, UserItem
  - API types: ApiResponse<T>, PaginatedResponse<T>
  - Dashboard types: DashboardData, DashboardStats
  - Socket types: SocketMessage, Notification
  - Error types: AppError, ValidationError

#### Bulk Operations API (3 endpoints)

- `POST /api/agenda/bulk` - delete, update
- `POST /api/tasks/bulk` - delete, update, complete
- `POST /api/surat/bulk` - delete, update
- Features: Max 100 items, ownership validation, Zod validation

#### PWA Support

- `public/manifest.json` - App manifest with shortcuts
- `public/sw.js` - Service worker (caching, offline, push)
- `public/offline.html` - Offline fallback page
- `src/components/pwa-register.tsx` - SW registration component
- `public/icons/` - 8 icon sizes (72-512px)

#### PostgreSQL Migration Scripts

- `scripts/export-data.ts` - SQLite → JSON backup
- `scripts/import-data.ts` - JSON → PostgreSQL restore
- `scripts/switch-database.ts` - Provider switcher

### 📁 New Files (v2.9.3)

| File                               | Description                        |
| ---------------------------------- | ---------------------------------- |
| `docs/FEATURES.md`                 | Consolidated feature documentation |
| `docs/COMPLETED_IMPROVEMENTS.md`   | Implementation history             |
| `src/types/index.ts`               | Shared TypeScript interfaces       |
| `src/test/auth-security.test.ts`   | Custom JWT auth tests              |
| `src/test/password.test.ts`        | Password security tests            |
| `src/app/api/agenda/bulk/route.ts` | Bulk agenda operations             |
| `src/app/api/tasks/bulk/route.ts`  | Bulk task operations               |
| `src/app/api/surat/bulk/route.ts`  | Bulk surat operations              |
| `public/manifest.json`             | PWA manifest                       |
| `public/sw.js`                     | Service worker                     |
| `public/offline.html`              | Offline page                       |
| `src/components/pwa-register.tsx`  | PWA registration                   |
| `scripts/export-data.ts`           | Data export script                 |
| `scripts/import-data.ts`           | Data import script                 |
| `scripts/switch-database.ts`       | DB provider switcher               |

### 🗑️ Deleted Files (v2.9.3)

21 redundant documentation files consolidated or removed.

---

## [2.9.2] - 2026-01-08

### ✨ Added (v2.9.2)

#### API Middleware Refactoring

- **API Helpers Library** - `src/lib/api-helpers.ts`
  - `withAuth()` - Authentication wrapper for API handlers
  - `withRBAC()` - Role-based access control wrapper
  - `successResponse()`, `errorResponse()`, `notFoundResponse()`, `serverErrorResponse()`

#### Code Quality - 40 Handlers Refactored

- `/api/tasks` - POST, PATCH, DELETE
- `/api/surat` - POST, PUT, DELETE
- `/api/notulensi` - POST, PATCH, DELETE
- `/api/users` - GET, POST, PATCH, DELETE
- `/api/decisions` - POST, PUT, DELETE
- `/api/profile` - POST
- `/api/imam` - POST, DELETE, PUT (id), DELETE (id)
- `/api/master/paroki` - POST, PUT (id), DELETE (id)
- `/api/master/template-surat` - POST, PUT (id), DELETE (id)
- `/api/master/kategori` - POST
- `/api/issues` - GET, POST, GET (id), PUT (id)
- `/api/reports` - GET, POST, GET (id), PUT (id), DELETE (id)
- `/api/user/settings` - GET, PATCH
- `/api/user/password` - POST

**Impact:** ~350 lines boilerplate removed, consistent auth patterns

### 📁 New Files (v2.9.2)

| File                     | Description                              |
| ------------------------ | ---------------------------------------- |
| `src/lib/api-helpers.ts` | API middleware wrappers and helper funcs |

---

## [2.9.0] - 2026-01-07

### ✨ Added (v2.9.0)

#### PDF Export for Surat

- **PDF Library** - `src/lib/pdf-export.tsx` with @react-pdf/renderer
- **API Endpoint** - `GET /api/surat/[id]/pdf` - Download surat as PDF
- Professional template with Keuskupan header

#### Real-time Updates

- **Core Library** - `src/lib/realtime.ts` with pub/sub pattern
- **SSE Endpoint** - `GET /api/realtime/stream` for Server-Sent Events
- **React Hook** - `src/hooks/useRealtime.ts` with auto-reconnect
- Notification types: AGENDA_CREATED, TASK_COMPLETED, SURAT_SIGNED, etc.

#### Audit Logging

- **Logging Library** - `src/lib/audit-log.ts`
- **Database Model** - `AuditLog` table with indexes
- Functions: `logCreate`, `logUpdate`, `logDelete`, `logLogin`

#### Additional Zod Validation

- **POST /api/tasks** - Uses `createTaskSchema`
- **POST /api/surat** - Uses `createSuratSchema`

### 📁 New Files (v2.9.0)

| File                                   | Description                |
| -------------------------------------- | -------------------------- |
| `src/lib/pdf-export.tsx`               | PDF generation library     |
| `src/app/api/surat/[id]/pdf/route.ts`  | PDF download endpoint      |
| `src/lib/realtime.ts`                  | Real-time pub/sub library  |
| `src/app/api/realtime/stream/route.ts` | SSE stream endpoint        |
| `src/hooks/useRealtime.ts`             | React hook for real-time   |
| `src/lib/audit-log.ts`                 | Audit logging library      |
| `docs/POSTGRESQL_MIGRATION_GUIDE.md`   | PostgreSQL migration guide |

---

## [2.8.0] - 2026-01-07

### ✨ Added (v2.8)

#### Google Calendar Integration

- **Service Account Setup** - Full 2-way sync dengan Google Calendar
- **API Endpoints:**
  - `POST /api/google-calendar/sync` - Sync single agenda
  - `GET /api/google-calendar/sync` - Bulk sync all pending
  - `GET /api/google-calendar/status` - Check config status
- **Core Library** - `src/lib/google-calendar.ts` dengan CRUD functions
- **Setup Guide** - `docs/GOOGLE_CALENDAR_SETUP_GUIDE.md`

#### Zod Validation Applied

- **POST /api/agenda** - Now uses `createAgendaSchema` for input validation
- Better error messages with `formatZodErrors()`

### 🔧 Changed

- Server running on port 3052
- Liturgical Calendar confirmed working (546 events)
- Updated `PENDING_TASKS_AND_OPTIONS.md` with completed items

### 📁 New Files (v2.8)

| File                                          | Description                  |
| --------------------------------------------- | ---------------------------- |
| `src/lib/google-calendar.ts`                  | Google Calendar CRUD library |
| `src/app/api/google-calendar/sync/route.ts`   | Sync API endpoint            |
| `src/app/api/google-calendar/status/route.ts` | Status API endpoint          |
| `docs/GOOGLE_CALENDAR_SETUP_GUIDE.md`         | Step-by-step setup guide     |

---

## [2.7.0] - 2026-01-07

### 🔍 Codebase Audit & Major Improvements

Based on comprehensive codebase audit (`CODEBASE_AUDIT_2026.md`).

### ✨ Added (v2.7.0)

#### Phase 1: Database & Validation

- **28 Database Indexes** - Performance optimization for query-heavy tables

  - Agenda: tanggal, status, jenis, createdBy
  - Task: status, deadline, prioritas, createdBy, kategori
  - Surat: status, tanggal, jenis, createdBy, isSigned
  - Notification: userId, status, createdAt
  - Issue: status, priority, createdBy, assignedTo, category
  - Report: status, type, submittedBy, unitType, period

- **Zod Validation Schemas** - `src/lib/validation-schemas.ts`

  - createAgendaSchema, updateAgendaSchema
  - createTaskSchema, updateTaskSchema
  - createSuratSchema, updateSuratSchema
  - createIssueSchema, updateIssueSchema
  - createReportSchema, updateReportSchema
  - Helper: validateInput(), formatZodErrors()

- **React Query Migration** - `src/hooks/useApi.ts`
  - useAgenda, useTasks, useSurat, useDecisions, useImam, useNotulensi
  - 5-minute stale time, automatic caching
  - Proper TypeScript types for all entities

#### Phase 2: API Performance

- **Pagination Utility** - `src/lib/pagination.ts`

  - parsePaginationParams(), createPaginatedResponse()
  - Default: page=1, limit=20, max=100
  - Query params: ?page=1&limit=20

- **Rate Limiting** - `src/lib/rate-limit.ts`

  - 100 requests per minute per IP
  - X-RateLimit-\* response headers
  - 429 Too Many Requests when exceeded

- **API Endpoints Upgraded**
  - GET /api/agenda - Pagination + Rate limit + ?all=true
  - GET /api/tasks - Pagination + Rate limit
  - GET /api/surat - Pagination + Rate limit
  - GET /api/issues - Rate limit
  - GET /api/reports - Rate limit

#### Phase 3: Testing Infrastructure

- **Test Setup** - `src/test/setup.ts`
- **Pagination Tests** - 10 unit tests
- **Validation Tests** - 18+ unit tests
- **Result**: 50/52 tests passing

#### E2E Testing with Playwright

- **Auth Tests** - `e2e/auth.spec.ts`
  - Login flow, error handling, protected routes
- **Agenda Tests** - `e2e/agenda.spec.ts`
  - Navigation, views, dialogs, filtering
- **Config** - `playwright.config.ts` with Chromium

#### CI/CD Pipeline

- **GitHub Actions** - `.github/workflows/ci.yml`
  - Lint job
  - Unit test job
  - E2E test job (Playwright)
  - Build job
- **Triggers** - Push to main/develop, Pull requests

### 📁 New Files (v2.7)

| File                                   | Description                |
| -------------------------------------- | -------------------------- |
| `src/lib/validation-schemas.ts`        | Zod validation schemas     |
| `src/lib/pagination.ts`                | Pagination utility         |
| `src/lib/rate-limit.ts`                | Rate limiter (100 req/min) |
| `src/test/setup.ts`                    | Test configuration         |
| `src/test/pagination.test.ts`          | Pagination tests           |
| `src/test/validation.test.ts`          | Validation tests           |
| `playwright.config.ts`                 | Playwright E2E config      |
| `e2e/auth.spec.ts`                     | Auth E2E tests             |
| `e2e/agenda.spec.ts`                   | Agenda E2E tests           |
| `.github/workflows/ci.yml`             | CI/CD pipeline             |
| `docs/CODEBASE_AUDIT_2026.md`          | Full audit report          |
| `docs/IMPLEMENTATION_PLAN_PHASE1.md`   | Phase 1 plan               |
| `docs/IMPLEMENTATION_PLAN_PHASE2.md`   | Phase 2 plan               |
| `docs/IMPLEMENTATION_PLAN_PHASE3.md`   | Phase 3 plan               |
| `docs/IMPLEMENTATION_PLAN_E2E_CICD.md` | E2E & CI/CD plan           |

### 🔧 Changed

- Migrated 9 documentation files from root to `/docs/` folder
- Updated `docs/README.md` with complete file list
- Updated API routes with creator.id in include queries
- Liturgical calendar API parameters updated with locale=en, epiphany=SUNDAY_JAN2_JAN8
- Added npm scripts: `e2e`, `e2e:ui`, `e2e:debug`, `e2e:report`
- Updated `.gitignore` with Playwright artifacts

---

## [2.6.0] - 2026-01-06

### ✨ Added (v2.6)

#### Multi-Day Agenda Events

- **Backend Support** - API endpoints now save `tanggalAkhir` and `waktuAkhir`
  - `POST /api/agenda` - Creates multi-day events
  - `PATCH /api/agenda/[id]` - Updates multi-day events
- **Create Dialog** - Toggle "Agenda lebih dari 1 hari" with conditional end date/time fields
- **Edit Dialog** - Same multi-day toggle and fields added for editing existing events
- **Calendar Display** - Multi-day events show on all dates in range

#### Date Range Filter

- **New Filter UI** - "Dari Tanggal" and "Sampai Tanggal" inputs in list view
- **Reset Button** - Quick clear of date filters
- **Smart Filtering** - Works correctly with multi-day agenda items

#### Liturgical Calendar API (Internal Proxy)

- **New API Route** - `GET /api/liturgical-calendar?year=2026`
- **External API** - Proxies to `litcal.johnromanodorazio.com` with parameters:
  - `ascension=THURSDAY`
  - `corpus_christi=THURSDAY`
  - `eternal_high_priest=true`
- **Caching** - 24-hour cache with React Query
- **Status**: ⚠️ Pending network fix (ISP issue)

### 🔧 Changed

#### Page Title Updates

- **Agenda page title**: "Agenda Pertemuan" → "Agenda Kegiatan"
- **Subtitle**: "Pengelolaan Agenda Kegiatan Keuskupan"

#### Error Handling Improvements

- Liturgical calendar API with 20s timeout and graceful fallback
- Better console logging for debugging

### 📁 New Files

| File                                       | Description                                      |
| ------------------------------------------ | ------------------------------------------------ |
| `src/app/api/liturgical-calendar/route.ts` | Internal API proxy for liturgical calendar       |
| `docs/LITURGICAL_CALENDAR_STATUS.md`       | Status and notes for liturgical calendar feature |
| `docs/GOOGLE_CALENDAR_INTEGRATION.md`      | Google Calendar integration options              |

### 🐛 Known Issues

- ⚠️ **Liturgical Calendar Network** - External API unreachable from Node.js (ISP/network issue)
  - **Workaround**: Test again after network fix
  - **Fallback**: Consider local JSON cache if issue persists

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

| File                             | Description                                        |
| -------------------------------- | -------------------------------------------------- |
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

| File                                                  | Description                   |
| ----------------------------------------------------- | ----------------------------- |
| `src/app/api/master/parameter/route.ts`               | Parameter API (GET, POST)     |
| `src/app/api/master/parameter/[id]/route.ts`          | Parameter API (PATCH, DELETE) |
| `src/components/master-data/parameter-management.tsx` | Parameter UI component        |
| `src/hooks/use-parameters.ts`                         | Dynamic parameter hooks       |

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

| File                                           | Description                   |
| ---------------------------------------------- | ----------------------------- |
| `src/lib/query-client.tsx`                     | QueryClientProvider setup     |
| `src/hooks/useQueryApi.ts`                     | React Query hooks             |
| `src/hooks/useKeyboardShortcuts.ts`            | Keyboard shortcuts hook       |
| `src/components/ui/skeletons.tsx`              | Loading skeleton components   |
| `src/components/keyboard-shortcuts-dialog.tsx` | Shortcuts help dialog         |
| `src/lib/pdf.ts`                               | PDF export utility            |
| `src/app/api/auth/refresh/route.ts`            | Refresh token endpoint        |
| `docs/*.md`                                    | Documentation files (8 files) |

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
