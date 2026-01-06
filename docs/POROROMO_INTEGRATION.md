# 🔄 Pororomo Integration

## Overview

Integrasi one-way readonly dari Pororomo ke Dashboard Uskup untuk sinkronisasi data imam. Pororomo adalah sistem eksternal untuk pengelolaan data imam keuskupan.

## Data yang Di-Sync

| Data | Deskripsi | Source |
|------|-----------|--------|
| Detail Pribadi Imam | Nama, email, telepon, alamat | Pororomo |
| SK Penempatan | SK penempatan/tugas imam | Pororomo |
| Domisili | Lokasi domisili saat ini (paroki/tempat lain) | Pororomo |
| Status | Aktif, Non-aktif, Keluar, Meninggal, Suspensi | Pororomo |

## Konfigurasi

### Settings UI

Akses via **Pengaturan → Sinkronisasi** untuk:

- Mengisi API URL Pororomo
- Mengisi API Key/Credentials
- Test koneksi
- Trigger sync manual
- Melihat riwayat sync

### Environment Variables

```env
# Opsional - bisa juga dikonfigurasi via UI
POROROMO_API_URL=https://api.pororomo.keuskupan-sby.or.id
POROROMO_API_KEY=your_api_key
```

## API Endpoints

### GET /api/pororomo/config

Ambil konfigurasi Pororomo saat ini.

**Response:**

```json
{
  "success": true,
  "data": {
    "apiUrl": "https://api.pororomo.example.com",
    "isActive": true,
    "lastTestAt": "2026-01-03T10:00:00Z",
    "testResult": "success"
  }
}
```

### PUT /api/pororomo/config

Simpan/update konfigurasi Pororomo.

**Request Body:**

```json
{
  "apiUrl": "https://api.pororomo.example.com",
  "apiKey": "your_api_key",
  "username": "optional_username",
  "password": "optional_password"
}
```

### POST /api/pororomo/connection

Test koneksi ke Pororomo API.

**Response:**

```json
{
  "success": true,
  "message": "Koneksi berhasil",
  "latency": 150
}
```

### POST /api/pororomo/sync

Trigger sinkronisasi manual.

**Response:**

```json
{
  "success": true,
  "data": {
    "recordsSync": 25,
    "recordsNew": 3,
    "recordsUpdated": 22
  },
  "message": "Sinkronisasi selesai. 25 data diproses."
}
```

### GET /api/pororomo/sync

Ambil status dan riwayat sinkronisasi.

**Response:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "sync_123",
        "status": "success",
        "recordsSync": 25,
        "startedAt": "2026-01-03T10:00:00Z",
        "completedAt": "2026-01-03T10:00:15Z"
      }
    ],
    "lastSuccessfulSync": "2026-01-03T10:00:15Z"
  }
}
```

## Database Models

### PororomoConfig

Menyimpan konfigurasi koneksi API.

```prisma
model PororomoConfig {
  id          String    @id @default(cuid())
  apiUrl      String
  apiKey      String?
  username    String?
  password    String?   // Encrypted
  isActive    Boolean   @default(false)
  lastTestAt  DateTime?
  testResult  String?   // success/failed
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### SyncLog

Menyimpan riwayat sinkronisasi.

```prisma
model SyncLog {
  id             String    @id @default(cuid())
  source         String    // "pororomo"
  status         String    // success/failed/partial
  recordsSync    Int       @default(0)
  recordsNew     Int       @default(0)
  recordsUpdated Int       @default(0)
  errorMsg       String?
  startedAt      DateTime  @default(now())
  completedAt    DateTime?
}
```

### Imam (Extended)

Field tambahan untuk sync dari Pororomo:

```prisma
model Imam {
  // ... existing fields ...
  
  // Pororomo sync fields
  pororomoId      String?   @unique  // ID dari Pororomo
  skPenempatan    String?            // SK penempatan/tugas
  skTanggal       String?            // Tanggal SK
  domisili        String?            // Lokasi domisili saat ini
  statusDetail    String?            // Detail: keluar/meninggal/suspensi
  
  // Sync metadata
  lastSyncAt      DateTime?
  syncSource      String?   @default("manual")
}
```

## Status Implementasi

| Komponen | Status |
|----------|--------|
| Database Schema | ✅ Selesai |
| Service Layer | ✅ Placeholder (menunggu API) |
| API Endpoints | ✅ Selesai |
| Settings UI | ✅ Selesai |
| Actual API Integration | ⏳ Menunggu Pororomo API |

## Langkah Selanjutnya

1. **Dapatkan dokumentasi API Pororomo** - Endpoints, format response, authentication
2. **Implementasi actual fetch** - Update `src/lib/pororomo.ts`
3. **Mapping field** - Sesuaikan field dengan response API asli
4. **Testing** - End-to-end test dengan API production

---

*Last updated: January 3, 2026*
