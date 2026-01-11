# 📦 Master Data Reference

Dokumentasi lengkap mengenai master data di Dashboard Uskup Surabaya.

**Last Updated:** 11 Januari 2026  
**Database Table:** `MasterParameter`

---

## 📋 Daftar Master Data

| Tipe            | Count | Deskripsi               |
| --------------- | ----- | ----------------------- |
| KODE_KEARSIPAN  | 69    | Kode surat masuk/keluar |
| JENIS_AGENDA    | 7     | Jenis agenda kegiatan   |
| PRIORITAS       | 4     | Level prioritas         |
| KATEGORI_TUGAS  | 12    | Kategori tugas          |
| STATUS_SURAT    | 7     | Status surat            |
| STATUS_AGENDA   | 5     | Status agenda           |
| STATUS_TUGAS    | 6     | Status tugas            |
| JENIS_NOTULENSI | 7     | Jenis notulensi         |
| JENIS_PERTEMUAN | 3     | Jenis pertemuan         |
| KATEGORI_ISU    | 6     | Kategori isu/konsultasi |
| PAROKI          | 38    | Daftar paroki           |
| KOMISI          | 16    | Daftar komisi           |
| USER_ROLE       | 11    | Daftar role user        |
| CONFIG_KOP      | 4     | Konfigurasi kop surat   |

---

## 📝 Konfigurasi Kop Surat (CONFIG_KOP)

Digunakan untuk mengatur informasi yang tampil pada **Header (Kop Surat)** hasil unduhan PDF dan Word.
Input menggunakan UI khusus di menu **Master Data -> Parameter**.

| Kode   | Deskripsi           | Contoh Nilai                       |
| ------ | ------------------- | ---------------------------------- |
| NAMA   | Nama Institusi      | KEUSKUPAN SURABAYA                 |
| ALAMAT | Alamat Lengkap      | Jl. Kepanjen No. 4-6, Surabaya ... |
| KONTAK | Kontak (Telp/Email) | Telp: (031) ... \| Email: ...      |
| LOGO   | URL Logo (Opsional) | https://example.com/logo.png       |

---

## 📄 Kode Kearsipan (Surat)

Sistem kodifikasi berdasarkan dokumen resmi Sekretariat Keuskupan Surabaya.

### Surat KELUAR (Prefix G)

Keuskupan Surabaya → Eksternal

| Kode    | Nama                              | Format Nomor     |
| ------- | --------------------------------- | ---------------- |
| G.111   | Surat Gembala Uskup               | G.111/2026/001   |
| G.112   | Sambutan/Pidato Uskup             | G.112/2026/001   |
| G.113   | Surat Pengangkatan/Tugas/Celebret | G.113/2026/001   |
| G.114   | Iurisdictio/Facultates            | G.114/2026/001   |
| G.116   | Sirkuler                          | G.116/2026/001   |
| G.210   | Vikaris Jendral                   | G.210/2026/001   |
| G.220   | Sekretariat Keuskupan             | G.220/2026/001   |
| G.220.7 | Surat Baptis/Perkawinan           | G.220.7/2026/001 |
| G.230   | Bendahara Keuskupan               | G.230/2026/001   |
| G.310   | Tribunal Keuskupan                | G.310/2026/001   |
| G.320.3 | Dispensasi Perkawinan             | G.320.3/2026/001 |
| G.440   | Dewan Imam                        | G.440/2026/001   |
| G.450   | Dewan Pastoral                    | G.450/2026/001   |

### Surat MASUK (Prefix A-F, H-S)

Eksternal → Keuskupan Surabaya

| Prefix | Sumber                      | Contoh                                 |
| ------ | --------------------------- | -------------------------------------- |
| A      | Tahta Suci                  | A.100 (Bapa Suci), A.200 (Congregatio) |
| B      | FABC                        | B.100 (Asia)                           |
| C      | Badan Katolik Internasional | C.102 (MISSIO), C.103 (Misereor)       |
| D      | KWI                         | D.101 (Hirarki), D.102 (SekJen)        |
| E      | Keuskupan lain              | E.107 (Semarang), E.120 (Malang)       |
| F      | Regio                       | F.100 (Regio Jawa)                     |
| H      | Tarekat                     | H.200 (Imam), H.400 (Suster)           |
| I      | Seminari                    | I.101 (Seminari)                       |
| O      | Pemerintah                  | O.111 (Kemenag), O.117 (Pemda)         |

---

## 📅 Jenis Agenda

| Kode | Nama         | Warna      |
| ---- | ------------ | ---------- |
| KUR  | Kuria        | 🔴 #ef4444 |
| PAS  | Pastoral     | 🟢 #22c55e |
| KOM  | Komisi       | 🔵 #3b82f6 |
| LIT  | Liturgi      | 🟣 #a855f7 |
| ADM  | Administrasi | 🟡 #f59e0b |
| AUD  | Audiensi     | 🩵 #06b6d4  |
| PRI  | Pribadi      | ⚫ #64748b |

---

## ⚡ Prioritas

| Kode | Nama     | Warna      |
| ---- | -------- | ---------- |
| URG  | Mendesak | 🔴 #dc2626 |
| HIG  | Tinggi   | 🟠 #ea580c |
| MED  | Sedang   | 🟡 #eab308 |
| LOW  | Rendah   | 🟢 #22c55e |

---

## 📁 Kategori Tugas

| Kode | Nama             | Warna      |
| ---- | ---------------- | ---------- |
| ADM  | Administrasi     | 🔵 #3b82f6 |
| PAS  | Pastoral         | 🟢 #22c55e |
| KEU  | Keuangan         | 🟡 #f59e0b |
| HUK  | Hukum Kanonik    | 🟣 #a855f7 |
| PEN  | Pendidikan       | 🩵 #06b6d4  |
| SOK  | Sosial Karitatif | 🩷 #ec4899  |
| LIT  | Liturgi          | 💜 #8b5cf6 |
| KAT  | Katekese         | 🌊 #14b8a6 |
| KOM  | Komunikasi       | 🟠 #f97316 |
| KEP  | Kepemudaan       | 🟩 #84cc16 |
| KEL  | Keluarga         | ❤️ #f43f5e |
| UMU  | Umum             | ⚫ #64748b |

---

## 📋 Status Surat

| Kode | Nama           | Warna      |
| ---- | -------------- | ---------- |
| DRF  | Draft          | ⚪ #94a3b8 |
| MNG  | Menunggu       | 🟡 #f59e0b |
| PRO  | Diproses       | 🔵 #3b82f6 |
| TTD  | Ditandatangani | 🟢 #22c55e |
| KRM  | Dikirim        | 🩵 #06b6d4  |
| ARS  | Diarsipkan     | ⚫ #64748b |
| TLK  | Ditolak        | 🔴 #ef4444 |

---

## ⛪ Daftar Paroki (38)

Berdasarkan kodifikasi G.700

### Kota Surabaya (Merah)

| Kode  | Nama                       |
| ----- | -------------------------- |
| G.717 | Surabaya - Katedral        |
| G.718 | Surabaya - Kepanjen        |
| G.719 | Surabaya - Ketabang        |
| G.720 | Surabaya - Ngagel          |
| G.721 | Surabaya - Perak           |
| G.722 | Surabaya - Sawahan         |
| G.723 | Surabaya - Wonokromo       |
| G.724 | Surabaya - Jemur Andayani  |
| G.725 | Surabaya - St. Al. Gonzaga |
| G.726 | Tropodo - Salib Suci       |
| G.727 | Surabaya - Karangpilang    |
| G.731 | Surabaya - Kenjeran        |
| G.735 | Surabaya - Redemptor Mundi |
| G.736 | Tandes                     |
| G.737 | Pagesangan                 |
| G.738 | Mater Dei                  |

### Luar Surabaya

| Kode  | Nama                    |
| ----- | ----------------------- |
| G.701 | Blitar - St. Yusuf      |
| G.702 | Blitar - St. Maria      |
| G.704 | Bojonegoro              |
| G.705 | Cepu                    |
| G.706 | Jombang                 |
| G.707 | Kediri - St. Vincentius |
| G.708 | Kediri - St. Yosef      |
| G.709 | Madiun                  |
| G.711 | Magetan                 |
| G.712 | Mojokerto               |
| G.713 | Ngawi                   |
| G.714 | Pare                    |
| G.715 | Ponorogo                |
| G.716 | Rembang                 |
| G.728 | Sidoarjo                |
| G.729 | Nganjuk                 |
| G.730 | Gresik                  |
| G.732 | Tulungagung             |
| G.733 | Tuban                   |
| G.734 | Wlingi                  |

---

## 🏛️ Daftar Komisi (16)

Berdasarkan kodifikasi G.500

| Kode  | Nama                    |
| ----- | ----------------------- |
| G.500 | Komisi Kerawam          |
| G.501 | Komisi Kateketik        |
| G.502 | Komisi Kepemudaan       |
| G.503 | Komisi Liturgi          |
| G.507 | Komisi KomSos           |
| G.508 | Komisi HAK              |
| G.509 | Komisi Religius         |
| G.510 | Komisi Keluarga         |
| G.511 | Komisi BIAK             |
| G.512 | Panitia Panggilan       |
| G.513 | Badan Pengawas Keuangan |
| G.517 | Panitia APP             |
| G.519 | Karya Kepausan          |
| G.520 | Komisi Rekat            |
| G.521 | Parahita/Alocita        |
| G.526 | Kerasulan Khusus        |

---

## 🔧 Seeder Scripts

### Seed All Master Data

```bash
npx tsx scripts/seed-master-data.ts
```

Output:

```
📦 Seeding JENIS_AGENDA...
   ✅ 7 records

📦 Seeding PRIORITAS...
   ✅ 4 records

...

TOTAL RECORDS: 120+
```

### Seed Kode Kearsipan Only

```bash
npx tsx scripts/seed-kode-kearsipan.ts
```

---

## 💻 API Usage

### Get Master Data by Type

```typescript
// Get all priorities
const priorities = await prisma.masterParameter.findMany({
  where: { tipe: "PRIORITAS", aktif: true },
  orderBy: { urutan: "asc" },
});

// Get active parishes
const parishes = await prisma.masterParameter.findMany({
  where: { tipe: "PAROKI", aktif: true },
  orderBy: { urutan: "asc" },
});
```

### Master Data Schema

```prisma
model MasterParameter {
  id        String   @id @default(cuid())
  tipe      String   // PRIORITAS, PAROKI, etc
  kode      String   // Unique code within type
  nama      String   // Display name
  warna     String?  // Color for UI
  urutan    Int      @default(0)
  aktif     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tipe, kode])
  @@index([tipe])
  @@index([tipe, aktif])
}
```

---

## 📚 Reference Documents

- **Kode Kearsipan:** `docs/references/kodifikasi-surat.pdf.md`
- **Role Access:** `docs/ROLES.md`
- **Seeder Script:** `scripts/seed-master-data.ts`

---

_Dashboard Uskup Surabaya © 2026_
