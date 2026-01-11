# 📚 Dashboard Uskup Surabaya

**Versi:** 2.9.9  
**Updated:** 9 Januari 2026

---

## 🎯 Overview

Sistem manajemen administrasi digital untuk Keuskupan Surabaya. Mengelola agenda, surat menyurat, tugas, notulensi, dan konsultasi dalam satu platform terintegrasi.

---

## 📌 Official References

| Website                                                    | Description                      |
| ---------------------------------------------------------- | -------------------------------- |
| [keuskupansurabaya.org](https://www.keuskupansurabaya.org) | Website resmi Keuskupan Surabaya |
| [komunio.org](https://komunio.org)                         | Portal data keuskupan            |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev

# Build for production
npm run build
```

Access: http://localhost:3000

---

## 🛠 Tech Stack

| Category  | Technology                       |
| --------- | -------------------------------- |
| Framework | Next.js 16 (Turbopack)           |
| Language  | TypeScript                       |
| Database  | SQLite (dev) / PostgreSQL (prod) |
| ORM       | Prisma                           |
| Styling   | TailwindCSS 4                    |
| Auth      | Custom JWT (jose)                |
| UI        | shadcn/ui                        |

---

## ✨ Features

### Core Features

| Feature              | Description                            | Status |
| -------------------- | -------------------------------------- | ------ |
| 📅 Agenda Kegiatan   | Multi-day events, Google Calendar sync | ✅     |
| ✅ Manajemen Tugas   | Prioritas, progress tracking           | ✅     |
| 📄 Surat Menyurat    | Digital signature, QR verification     | ✅     |
| 📝 Notulensi         | Meeting notes, approval workflow       | ✅     |
| 👥 Issues/Konsultasi | Opinion workflow dari pejabat          | ✅     |
| 📊 Smart Reporting   | Laporan Paroki/Komisi                  | ✅     |
| 🤖 Magisterium AI    | Asisten teologis AI                    | ✅     |

### Technical Features

| Feature                          | Version |
| -------------------------------- | ------- |
| Google Calendar Integration      | v2.8.0  |
| Liturgical Calendar (546 events) | v2.6.0  |
| Digital Signature + QR           | v2.0.0  |
| PDF Export                       | v2.9.0  |
| Real-time Updates (SSE)          | v2.9.0  |
| Audit Logging                    | v2.9.0  |
| 2FA Authentication               | v2.9.4  |
| Push Notifications               | v2.9.4  |
| Redis Caching                    | v2.9.7  |
| Request Tracing                  | v2.9.8  |
| Template Resolver                | v2.9.9  |

---

## 🔐 Authentication

### Test Credentials

| Role       | Email                          | Password      |
| ---------- | ------------------------------ | ------------- |
| USKUP      | uskup@keuskupan-sby.or.id      | UskupSBY2025! |
| SEKRETARIS | sekretaris@keuskupan-sby.or.id | UskupSBY2025! |
| VIKJEN     | vikjen@keuskupan-sby.or.id     | UskupSBY2025! |

### 11 Roles Available

ADMIN, USKUP, SEKRETARIS, VIKARIS_JENDERAL, VIKARIS_YUDISIAL, EKONOM, STAF, KOM_KEPALA, KOM_ANGGOTA, PASTOR_PAROKI, IMAM

---

## 📁 Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Utilities & services
├── hooks/         # Custom React hooks
└── types/         # TypeScript types

docs/              # Documentation (you are here)
prisma/            # Database schema
scripts/           # Utility scripts
```

---

## 📖 Documentation

| Document                                                  | Description                    |
| --------------------------------------------------------- | ------------------------------ |
| [API Documentation](./API_DOCUMENTATION.md)               | API endpoints, auth            |
| [Roles & Access](./ROLES.md)                              | Role hierarchy, permissions    |
| [Master Data](./MASTER_DATA.md)                           | Kode kearsipan, paroki, komisi |
| [Deployment Guide](./DEPLOYMENT.md)                       | Deploy, database, security     |
| [Changelog](./CHANGELOG.md)                               | Version history                |
| [Google Calendar Setup](./GOOGLE_CALENDAR_SETUP_GUIDE.md) | Calendar integration           |

---

## 📮 Surat Codification

### Format Nomor Surat

```
[KODE]/[UNIT]/[TAHUN]/[URUTAN]
```

Example: `SK/KUS/2026/001`

### Kode Jenis

| Kode | Jenis           |
| ---- | --------------- |
| SK   | Surat Keputusan |
| SE   | Surat Edaran    |
| SP   | Surat Perintah  |
| ST   | Surat Tugas     |
| SU   | Surat Undangan  |
| DK   | Dekrit          |
| ND   | Nota Dinas      |

### Kode Unit

| Kode | Unit               |
| ---- | ------------------ |
| KUS  | Keuskupan Surabaya |
| USK  | Uskup              |
| VIJ  | Vikaris Jenderal   |
| SEK  | Sekretariat        |
| KOM  | Komisi             |
| PAR  | Paroki             |

---

## 📝 Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-secret>
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=https://your-domain.com

# Optional
REDIS_URL=redis://...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_CALENDAR_ID=...
```

---

## 🔗 Quick Links

- **API Docs:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

_Dashboard Uskup Surabaya © 2026_
