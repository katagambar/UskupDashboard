# 🔐 Tanda Tangan Digital - Panduan Penggunaan

## Overview

Dashboard Uskup Surabaya memiliki fitur **Tanda Tangan Digital** yang memungkinkan dokumen (surat) ditandatangani secara elektronik dan dapat diverifikasi keasliannya.

---

## Status Implementasi: ✅ LENGKAP

| Komponen | Status | Lokasi |
|----------|--------|--------|
| Digital Signature Service | ✅ | `src/lib/digital-signature.ts` |
| Sign API | ✅ | `src/app/api/surat/[id]/sign/route.ts` |
| Verification Page | ✅ | `src/app/verify/[hash]/page.tsx` |
| Database Model | ✅ | `DigitalSignature` in Prisma schema |

---

## Fitur yang Tersedia

### 1. Menandatangani Dokumen

- Generate SHA-256 hash dari konten dokumen
- Simpan signature dengan data penandatangan
- Generate QR Code untuk verifikasi
- Update status surat menjadi "Ditandatangani"

### 2. Verifikasi Dokumen

- Public URL untuk verifikasi: `/verify/[hash]`
- Menampilkan status: **VALID**, **TIDAK VALID**, atau **DICABUT**
- Informasi dokumen dan penandatangan

### 3. Pencabutan Tanda Tangan

- Revoke signature dengan alasan
- Dokumen akan tampil sebagai "Dicabut" saat verifikasi

---

## Panduan Penggunaan

### A. Menandatangani Surat

#### Langkah-langkah

1. **Buka halaman Surat**

   ```
   http://localhost:3036/surat
   ```

2. **Pilih surat yang akan ditandatangani**
   - Klik pada surat dengan status "Menunggu" atau "Diproses"
   - Hanya surat yang belum ditandatangani yang bisa di-sign

3. **Klik tombol "Tandatangani"**
   - Tombol ini hanya muncul untuk user dengan role yang berhak (USKUP, VIKJEN)

4. **Konfirmasi tanda tangan**
   - Sistem akan generate hash unik
   - QR Code akan dibuat otomatis
   - Status surat berubah menjadi "Ditandatangani"

#### Hasil

- Surat memiliki status `isSigned: true`
- Record `DigitalSignature` tersimpan di database
- URL verifikasi tersedia: `/verify/[hash]`

---

### B. Verifikasi Dokumen (Publik)

Halaman verifikasi dapat diakses **tanpa login** oleh siapa saja.

#### Cara Verifikasi

1. **Scan QR Code**
   - Jika dokumen cetak memiliki QR Code, scan dengan kamera HP
   - Akan otomatis membuka URL verifikasi

2. **Akses URL Langsung**

   ```
   http://localhost:3036/verify/[hash]
   
   Contoh:
   http://localhost:3036/verify/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

3. **Hasil Verifikasi:**

   | Status | Warna | Keterangan |
   |--------|-------|------------|
   | ✅ VALID | Hijau | Dokumen asli dan sah |
   | ❌ TIDAK VALID | Merah | Hash tidak ditemukan |
   | ⚠️ DICABUT | Orange | Tanda tangan telah dibatalkan |

4. **Informasi yang Ditampilkan:**
   - Nomor dokumen
   - Judul dokumen
   - Tanggal dokumen
   - Nama penandatangan
   - Jabatan penandatangan
   - Waktu tanda tangan
   - Alasan pencabutan (jika dicabut)

---

### C. Mencabut Tanda Tangan

Jika terjadi kesalahan atau dokumen perlu dibatalkan:

#### Via API

```typescript
// POST /api/surat/[id]/revoke
{
  "reason": "Alasan pencabutan dokumen"
}
```

#### Efek

- Field `isValid` berubah menjadi `false`
- Field `revokedAt` terisi timestamp
- Field `revokedReason` terisi alasan
- Verifikasi akan menampilkan status "DICABUT"

---

## Struktur Data

### QR Code Data (JSON)

```json
{
  "type": "KEUSKUPAN_SBY_DOC",
  "hash": "a1b2c3d4e5f6g7h8...",
  "doc": "SK/USK/001/I/2026",
  "signer": "Mgr. Agustinus Tri Budi Utomo",
  "date": "2026-01-05T10:30:00.000Z",
  "url": "https://dashboard.keuskupan-sby.or.id/verify/a1b2c3..."
}
```

### Database Schema

```prisma
model DigitalSignature {
  id              String    @id @default(cuid())
  suratId         String    @unique
  documentHash    String    // SHA-256 hash konten
  signatureHash   String    @unique // Hash unik untuk verifikasi
  qrCodeData      String    // JSON data untuk QR
  signerId        String
  signerName      String
  signerRole      String
  signerJabatan   String?
  signatureImage  String?   // Base64 gambar tanda tangan
  verificationUrl String
  ipAddress       String?
  userAgent       String?
  isValid         Boolean   @default(true)
  revokedAt       DateTime?
  revokedReason   String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  surat           Surat     @relation(fields: [suratId], references: [id])
}
```

---

## API Reference

### Sign Document

```
POST /api/surat/[id]/sign
```

**Headers:**

- `Authorization: Bearer [token]` (required)
- `Content-Type: application/json`

**Body:**

```json
{
  "signatureImage": "data:image/png;base64,..." // Optional
}
```

**Response (Success):**

```json
{
  "success": true,
  "signature": {
    "id": "sig_xxx",
    "documentHash": "abc123...",
    "signatureHash": "def456...",
    "verificationUrl": "https://domain/verify/def456...",
    "qrCodeData": "{...}"
  }
}
```

### Verify Signature (Public)

```
GET /verify/[hash]
```

No authentication required. Renders verification page.

---

## Keamanan

### Hash Algorithm

- **SHA-256** untuk document hash
- **Random bytes** untuk signature hash

### Apa yang Di-hash?

```typescript
const content = `${surat.nomor}|${surat.judul}|${surat.isi}|${surat.tanggal}`
```

### Proteksi

- Sign hanya bisa dilakukan oleh user terotentikasi dengan role tertentu
- Verifikasi bersifat publik (read-only)
- Revoke hanya bisa dilakukan oleh admin

---

## Troubleshooting

### Masalah: Tombol Tandatangani Tidak Muncul

**Kemungkinan penyebab:**

1. User tidak memiliki role yang tepat (USKUP, VIKJEN)
2. Surat sudah ditandatangani
3. Status surat tidak valid

**Solusi:**

- Cek role user di Settings → Profile
- Verifikasi field `isSigned` di database

### Masalah: Verifikasi Menampilkan TIDAK VALID

**Kemungkinan penyebab:**

1. Hash salah atau corrupt
2. Record signature sudah dihapus

**Solusi:**

- Verifikasi hash di URL sesuai dengan yang tersimpan
- Cek tabel `DigitalSignature` di database

### Masalah: QR Code Tidak Bisa Di-scan

**Kemungkinan penyebab:**

1. Kualitas cetak rendah
2. QR Code terlalu kecil

**Solusi:**

- Cetak dengan resolusi minimal 300 DPI
- Ukuran QR minimal 3x3 cm

---

## Referensi Kode

| File | Fungsi |
|------|--------|
| [digital-signature.ts](file:///d:/@workspace/DashboardUskup/src/lib/digital-signature.ts) | Service untuk sign, verify, revoke |
| [sign/route.ts](file:///d:/@workspace/DashboardUskup/src/app/api/surat/[id]/sign/route.ts) | API endpoint untuk sign |
| [verify/page.tsx](file:///d:/@workspace/DashboardUskup/src/app/verify/[hash]/page.tsx) | Halaman verifikasi publik |

---

*Last updated: 5 Januari 2026*
