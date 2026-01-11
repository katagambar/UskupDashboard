# Dashboard Keuskupan Surabaya

Sistem Informasi Manajemen Terpadu untuk Keuskupan Surabaya, dirancang untuk membantu Uskup dan Kuria dalam pengelolaan administrasi, pastoral, dan pengambilan keputusan berbasis data.

**Version**: 2.9.10
**Last Updated**: 11 Januari 2026

## 📚 Dokumentasi Lengkap

| Dokumen                                          | Deskripsi                     |
| ------------------------------------------------ | ----------------------------- |
| [📖 Arsitektur & Database](docs/ARCHITECTURE.md) | Arsitektur sistem dan ERD     |
| [🔌 API Reference](docs/API_DOCUMENTATION.md)    | Dokumentasi API endpoints     |
| [🔧 Development Guide](docs/DEVELOPMENT.md)      | Panduan pengembangan          |
| [🚀 Deployment Guide](docs/DEPLOYMENT.md)        | Panduan deployment production |
| [📝 Changelog](docs/CHANGELOG.md)                | Riwayat perubahan             |

## 🌟 Fitur Utama

### 1. Dashboard Eksekutif

- Visualisasi data statistik umat, paroki, dan imam
- Traffic Light Health Indicators
- Smart Inbox untuk pending actions

### 2. Kalender Agenda

- Kalender dengan tanggal merah (hari libur Indonesia)
- Integrasi hari libur nasional 2025-2026
- Display nama hari libur saat dipilih

### 3. AI Theological Assistant (Magisterium AI)

- Konsultasi Dokumen Gereja dengan AI
- Kutipan referensi otomatis
- Related questions

### 4. Task Management & Disposisi

- Pengelolaan tugas dengan prioritas dinamis
- Disposisi surat dan isu strategis
- Tracking progress real-time

### 5. Digital Signature

- Tanda tangan digital dengan hash SHA-256
- Verifikasi publik via QR Code
- Revocation support

### 6. Smart Reporting

- Laporan dari Paroki/Komisi/Kevikepan
- Traffic Light Status (Baik/Perlu Perhatian/Kritis)
- Review workflow

### 7. Surat Menyurat & Arsip Digital

- **G-Code System**: Kodifikasi surat keluar otomatis/terstandar
- **Rich Text Editor**: Pembuatan draft surat dengan formatting lengkap
- **Digital Attachments**: Upload lampiran ke Google Drive
- **Multi-format Export**: Download PDF (Siap Cetak) dan Word (Editable)
- **Dynamic Letterhead**: Konfigurasi Kop Surat via Master Data

## 🛠️ Stack Teknologi

| Layer         | Technology                         |
| ------------- | ---------------------------------- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language**  | TypeScript                         |
| **Styling**   | TailwindCSS 4, shadcn/ui           |
| **ORM**       | Prisma                             |
| **Database**  | SQLite (Dev) / PostgreSQL (Prod)   |
| **Auth**      | Custom JWT                         |
| **Real-time** | Socket.IO                          |

## 🚀 Quick Start

### Option 1: Local Development (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Setup database
npm run db:setup

# 4. Start development server
npm run dev:local
```

Access at: **<http://localhost:3000>**

### Option 2: Docker

```bash
# Start dengan Docker
npm run docker:dev
```

Access at: **<http://localhost:3040>**

## 🔐 Test Credentials

| Role       | Email                            | Password      |
| ---------- | -------------------------------- | ------------- |
| USKUP      | <uskup@keuskupan-sby.or.id>      | UskupSBY2025! |
| SEKRETARIS | <sekretaris@keuskupan-sby.or.id> | UskupSBY2025! |
| VIKJEN     | <vikjen@keuskupan-sby.or.id>     | UskupSBY2025! |

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   ├── agenda/           # Agenda/Calendar
│   ├── tasks/            # Task Management
│   ├── surat/            # Surat Menyurat
│   ├── issues/           # Konsultasi/Issues
│   └── reports/          # Laporan
├── components/           # React Components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities
│   ├── rbac.ts           # Role-based access control
│   ├── indonesian-holidays.ts  # Indonesian holidays
│   └── ...
└── prisma/               # Database Schema
```

## 🔒 Security

- JWT-based authentication
- Role-Based Access Control (11 roles)
- Password hashing with bcrypt
- Input validation with Zod
- Digital signature verification

## 📊 User Roles

| Role       | Level | Permissions                          |
| ---------- | ----- | ------------------------------------ |
| USKUP      | 1     | Full access, final decisions         |
| SEKRETARIS | 2     | Document management, user management |
| VIKJEN     | 3     | Vicar General access                 |
| VIKYUD     | 4     | Judicial Vicar access                |
| EKONOM     | 5     | Financial management                 |
| DELEGATUS  | 6     | Delegate access                      |
| KURIA      | 7     | Curia staff access                   |
| VIKEP      | 8     | Viceprovincial access                |
| KOMISI     | 9     | Commission access                    |
| PAROKI     | 10    | Parish access                        |
| STAFF      | 11    | Basic staff access                   |

---

Dikembangkan untuk Keuskupan Surabaya © 2026
