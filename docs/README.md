# 📚 Dokumentasi Dashboard Uskup Surabaya

Dokumentasi lengkap untuk sistem Dashboard Uskup Surabaya.

**Versi**: 2.5.0  
**Terakhir diperbarui**: 5 Januari 2026

## Daftar Isi

| Dokumen | Deskripsi |
|---------|-----------|
| [README](./README.md) | Panduan utama project |
| [Architecture](./ARCHITECTURE.md) | Arsitektur sistem dan tech stack |
| [Database](./DATABASE.md) | Schema database dan relasi |
| [API Reference](./API_DOCUMENTATION.md) | Dokumentasi API endpoints |
| [Components](./COMPONENTS.md) | Komponen UI dan hooks |
| [Authentication](./AUTHENTICATION.md) | Sistem autentikasi |
| [Digital Signature](./DIGITAL_SIGNATURE.md) | Panduan tanda tangan digital & QR Code |
| [Surat Codification](./SURAT_CODIFICATION.md) | Rencana kodifikasi penomoran surat |
| [Development Guide](./DEVELOPMENT.md) | Panduan pengembangan |
| [Deployment](./DEPLOYMENT.md) | Panduan deployment |
| [Changelog](./CHANGELOG.md) | Riwayat perubahan |

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Setup database
npm run db:setup

# Start development server (Recommended)
npm run dev:local
```

Access at: <http://localhost:3000>

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Language**: TypeScript
- **ORM**: Prisma
- **Styling**: TailwindCSS 4
- **Database**: SQLite (dev) / PostgreSQL (prod)

## Credentials

| Role | Email | Password |
|------|-------|----------|
| USKUP | <uskup@keuskupan-sby.or.id> | UskupSBY2025! |
| SEKRETARIS | <sekretaris@keuskupan-sby.or.id> | UskupSBY2025! |
| VIKJEN | <vikjen@keuskupan-sby.or.id> | UskupSBY2025! |

## Fitur Utama

- 📅 **Kalender Agenda** dengan tanggal merah (hari libur Indonesia)
- 📝 **Manajemen Tugas** dengan prioritas dinamis
- 📄 **Surat Menyurat** dengan tanda tangan digital
- 👥 **Konsultasi/Issues** dengan workflow opini
- 📊 **Laporan** dari Paroki/Komisi/Kevikepan
- 🔐 **RBAC** dengan 11 role berbeda
