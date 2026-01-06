# 📝 Rencana Pengembangan: Kodifikasi Penomoran Surat

## Status: DRAFT - Menunggu Data dari Stakeholder

Dokumen ini merupakan panduan untuk pengembangan fitur **Advanced Kodifikasi Penomoran Surat** di Dashboard Uskup Surabaya.

---

## 1. Latar Belakang

Sistem penomoran surat yang terstruktur diperlukan untuk:

- **Konsistensi** - Format nomor surat yang seragam di seluruh unit
- **Tracking** - Memudahkan pencarian dan pelacakan surat
- **Auto-generate** - Menghindari duplikasi nomor manual
- **Audit Trail** - History penggunaan nomor surat

---

## 2. Komponen Nomor Surat (Draft)

### Format Umum

```
[JENIS]/[UNIT]/[URUT]/[BULAN]/[TAHUN]
```

### Contoh Implementasi

| Contoh Nomor | Penjelasan |
|--------------|------------|
| `SED/KUR/001/I/2026` | Surat Edaran, Kuria, urut 1, Januari 2026 |
| `SK/USK/005/III/2026` | Surat Keputusan, Uskup, urut 5, Maret 2026 |
| `UND/PAS/012/XII/2025` | Undangan, Pastoral, urut 12, Desember 2025 |
| `REC/VIK/003/VI/2026` | Rekomendasi, Vikjen, urut 3, Juni 2026 |

---

## 3. Komponen yang Perlu Didefinisikan

### 3.1 Kode Jenis Surat

| Kode | Jenis Surat | Keterangan |
|------|-------------|------------|
| SED | Surat Edaran | Informasi ke semua paroki |
| SK | Surat Keputusan | Keputusan resmi Uskup |
| UND | Undangan | Undangan pertemuan/acara |
| REC | Rekomendasi | Surat rekomendasi |
| PRN | Pernyataan | Surat pernyataan resmi |
| PEN | Penugasan | Surat tugas |
| KET | Keterangan | Surat keterangan |
| TGS | Tugas Pastoral | Surat tugas pastoral |

> ⚠️ **PERLU KONFIRMASI**: Daftar jenis surat sesuai kebutuhan Keuskupan

### 3.2 Kode Unit Pengirim

| Kode | Unit | Keterangan |
|------|------|------------|
| USK | Uskup | Surat resmi Uskup |
| KUR | Kuria | Dari kantor Kuria |
| VIK | Vikjen | Vikaris Jenderal |
| PAS | Pastoral | Bidang Pastoral |
| KOM | Komisi | Setiap Komisi |
| KEV | Kevikepan | Per Kevikepan |
| PAR | Paroki | Per Paroki (jika perlu) |

> ⚠️ **PERLU KONFIRMASI**: Struktur organisasi dan kode unit

### 3.3 Format Bulan

| Opsi | Format | Contoh |
|------|--------|--------|
| Romawi | I, II, III, ... XII | SK/USK/001/**III**/2026 |
| Angka | 01, 02, 03, ... 12 | SK/USK/001/**03**/2026 |

> ⚠️ **PERLU KONFIRMASI**: Preferensi format bulan

### 3.4 Reset Nomor Urut

| Opsi | Keterangan |
|------|------------|
| Per Tahun | Reset ke 001 setiap 1 Januari |
| Per Bulan | Reset ke 001 setiap bulan baru |
| Per Jenis + Tahun | Setiap jenis surat punya urutan sendiri |
| Per Unit + Tahun | Setiap unit punya urutan sendiri |

> ⚠️ **PERLU KONFIRMASI**: Kapan nomor urut di-reset?

---

## 4. Database Schema (Draft)

### Model Kodifikasi

```prisma
model SuratKodifikasi {
  id           String    @id @default(cuid())
  
  // Komponen Nomor
  jenisSurat   String    // SED, SK, UND, REC, PRN
  unitPengirim String    // USK, KUR, VIK, PAS, KOM
  nomorUrut    Int       // Auto-increment per periode
  bulan        Int       // 1-12
  tahun        Int       // 2026
  
  // Generated
  nomorLengkap String    @unique // SED/KUR/001/I/2026
  
  // Tracking
  suratId      String?   @unique
  reservedBy   String?   // User yang reserve
  reservedAt   DateTime?
  usedBy       String?   // User yang pakai
  usedAt       DateTime?
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  surat        Surat?    @relation(fields: [suratId], references: [id])
  
  @@unique([jenisSurat, unitPengirim, nomorUrut, bulan, tahun])
  @@index([tahun, bulan])
  @@index([jenisSurat, tahun])
}

model KodifikasiConfig {
  id          String   @id @default(cuid())
  kode        String   @unique  // SED, SK, UND
  nama        String            // Surat Edaran
  format      String            // {JENIS}/{UNIT}/{URUT}/{BLN}/{THN}
  resetPer    String            // TAHUN, BULAN
  aktif       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 5. Fitur yang Akan Diimplementasi

### 5.1 Auto-Generate Nomor

```typescript
// Contoh function auto-generate
async function generateNomorSurat(params: {
  jenis: string
  unit: string
}): Promise<string> {
  // 1. Get current month/year
  // 2. Find next available number
  // 3. Reserve the number
  // 4. Return formatted string
}
```

### 5.2 Reserve & Release

- **Reserve**: Nomor dicadangkan saat surat dibuat (draft)
- **Use**: Nomor digunakan saat surat final
- **Release**: Nomor dikembalikan jika surat dibatalkan

### 5.3 Validasi

- Tidak boleh ada nomor duplikat
- Format harus sesuai konfigurasi
- Unit harus valid dan aktif

### 5.4 UI Requirements

- Dropdown jenis surat (dari Master Parameter)
- Dropdown unit pengirim
- Auto-fill nomor atau input manual
- Preview format nomor
- History nomor yang sudah terpakai

---

## 6. Pertanyaan untuk Stakeholder

Sebelum implementasi, perlu konfirmasi:

1. **Format nomor surat yang saat ini digunakan?**
   - Apakah ada SOP tertulis?
   - Contoh 5 nomor surat terbaru?

2. **Daftar lengkap jenis surat?**
   - Jenis apa saja yang ada?
   - Prioritas mana yang paling sering digunakan?

3. **Struktur unit pengirim?**
   - Unit mana saja yang boleh membuat surat resmi?
   - Apakah ada hierarki?

4. **Aturan penomoran:**
   - Kapan nomor urut di-reset? (per tahun/per bulan)
   - Apakah setiap jenis punya urutan terpisah?
   - Apakah perlu kode kerahasiaan?

5. **Kasus khusus:**
   - Bagaimana dengan surat yang dibatalkan?
   - Bagaimana dengan surat revisi?
   - Apakah ada surat yang perlu nomor manual?

---

## 7. Roadmap Implementasi

| Fase | Scope | Estimasi |
|------|-------|----------|
| **Fase 1** | Database schema + seed config | 2-3 jam |
| **Fase 2** | API generate nomor | 3-4 jam |
| **Fase 3** | UI integrasi di Surat Baru | 2-3 jam |
| **Fase 4** | UI management config | 3-4 jam |
| **Fase 5** | Reporting & history | 2-3 jam |

**Total Estimasi**: 12-17 jam kerja

---

## 8. Referensi

- [Surat Model](file:///d:/@workspace/DashboardUskup/prisma/schema.prisma)
- [Master Parameter System](file:///d:/@workspace/DashboardUskup/docs/DATABASE.md)
- [API Documentation](file:///d:/@workspace/DashboardUskup/docs/API_DOCUMENTATION.md)

---

*Dokumen ini akan diperbarui setelah mendapat feedback dari stakeholder.*

*Last updated: 5 Januari 2026*
