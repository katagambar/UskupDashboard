/**
 * Seeder: Kode Kearsipan Keuskupan Surabaya
 * 
 * Menambahkan master data kode kearsipan sesuai dokumen resmi.
 * Referensi: docs/references/kodifikasi-surat.pdf
 * 
 * Usage: npx tsx scripts/seed-kode-kearsipan.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Kode Kearsipan berdasarkan dokumen resmi Sekretariat Keuskupan Surabaya
const KODE_KEARSIPAN_DATA = [
  // ============================================
  // SURAT KELUAR KEUSKUPAN SURABAYA (G = Keluar)
  // ============================================
  
  // G.100 - USKUP
  { tipe: 'KODE_KEARSIPAN', kode: 'G.100', nama: 'Uskup', kategori: 'KELUAR', urutan: 100 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.110', nama: 'Surat Uskup', kategori: 'KELUAR', urutan: 110 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.111', nama: 'Surat Gembala Uskup Surabaya', kategori: 'KELUAR', urutan: 111 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.112', nama: 'Sambutan/Pidato Uskup Surabaya', kategori: 'KELUAR', urutan: 112 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.113', nama: 'Surat Pengangkatan/Tugas/Kuasa/Rekomendasi/Celebret', kategori: 'KELUAR', urutan: 113 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.114', nama: 'Iurisdictio/Facultates/Celebret/Litterae dimissionis', kategori: 'KELUAR', urutan: 114 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.115', nama: 'Surat Pribadi dari/kepada Uskup', kategori: 'KELUAR', urutan: 115 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.116', nama: 'Sirkuler', kategori: 'KELUAR', urutan: 116 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.120', nama: 'Program Keuskupan', kategori: 'KELUAR', urutan: 120 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.130', nama: 'Agenda bulanan/tahunan', kategori: 'KELUAR', urutan: 130 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.160', nama: 'Dokumen TOP SECRET', kategori: 'KELUAR', urutan: 160 },
  
  // G.200 - KURIA KEUSKUPAN
  { tipe: 'KODE_KEARSIPAN', kode: 'G.200', nama: 'Kuria Keuskupan', kategori: 'KELUAR', urutan: 200 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.210', nama: 'Vikaris Jendral Keuskupan', kategori: 'KELUAR', urutan: 210 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.220', nama: 'Sekretariat Keuskupan', kategori: 'KELUAR', urutan: 220 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.220.1', nama: 'Surat menyurat', kategori: 'KELUAR', urutan: 221 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.220.7', nama: 'Surat Baptis/Perkawinan', kategori: 'KELUAR', urutan: 227 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.230', nama: 'Bendahara Keuskupan', kategori: 'KELUAR', urutan: 230 },
  
  // G.300 - TRIBUNAL
  { tipe: 'KODE_KEARSIPAN', kode: 'G.300', nama: 'Tribunal', kategori: 'KELUAR', urutan: 300 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.310', nama: 'Tribunal Keuskupan Surabaya', kategori: 'KELUAR', urutan: 310 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.320', nama: 'Perkawinan', kategori: 'KELUAR', urutan: 320 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.320.3', nama: 'Dispensasi Perkawinan', kategori: 'KELUAR', urutan: 323 },
  
  // G.400 - DEWAN-DEWAN
  { tipe: 'KODE_KEARSIPAN', kode: 'G.440', nama: 'Dewan Imam', kategori: 'KELUAR', urutan: 440 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.450', nama: 'Dewan Pastoral', kategori: 'KELUAR', urutan: 450 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.460', nama: 'Rapat Pleno Keuskupan/Raker/Lokakarya/Sinode', kategori: 'KELUAR', urutan: 460 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.470', nama: 'Dewan Keuangan', kategori: 'KELUAR', urutan: 470 },
  
  // G.500 - KOMISI-KOMISI
  { tipe: 'KODE_KEARSIPAN', kode: 'G.500', nama: 'Komisi Kerawam', kategori: 'KELUAR', urutan: 500 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.501', nama: 'Komisi Kateketik', kategori: 'KELUAR', urutan: 501 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.502', nama: 'Komisi Kepemudaan', kategori: 'KELUAR', urutan: 502 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.503', nama: 'Komisi Liturgi', kategori: 'KELUAR', urutan: 503 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.507', nama: 'Komisi KomSos', kategori: 'KELUAR', urutan: 507 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.510', nama: 'Komisi Keluarga', kategori: 'KELUAR', urutan: 510 },
  
  // G.600 - PERSONALIA
  { tipe: 'KODE_KEARSIPAN', kode: 'G.600', nama: 'Personalia', kategori: 'KELUAR', urutan: 600 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.610', nama: 'Imam-imam', kategori: 'KELUAR', urutan: 610 },
  { tipe: 'KODE_KEARSIPAN', kode: 'G.650', nama: 'Katekis', kategori: 'KELUAR', urutan: 650 },
  
  // G.700 - PAROKI
  { tipe: 'KODE_KEARSIPAN', kode: 'G.700', nama: 'Paroki dan BPKP', kategori: 'KELUAR', urutan: 700 },

  // ============================================
  // SURAT MASUK (A-F, H-S = dari luar Keuskupan Surabaya)
  // ============================================
  
  // A - TAHTA SUCI
  { tipe: 'KODE_KEARSIPAN', kode: 'A.100', nama: 'Bapa Suci', kategori: 'MASUK', urutan: 1 },
  { tipe: 'KODE_KEARSIPAN', kode: 'A.200', nama: 'Sacra Congregatio et Alii', kategori: 'MASUK', urutan: 2 },
  { tipe: 'KODE_KEARSIPAN', kode: 'A.213', nama: 'S.C. Pro Doctrina Fidei (Dogma, Ajaran Gereja)', kategori: 'MASUK', urutan: 3 },
  { tipe: 'KODE_KEARSIPAN', kode: 'A.215', nama: 'S.C. Sacramentis et Cultu Divino (Liturgi)', kategori: 'MASUK', urutan: 4 },
  { tipe: 'KODE_KEARSIPAN', kode: 'A.301', nama: 'Kedutaan Besar Tahta Suci di Indonesia', kategori: 'MASUK', urutan: 5 },
  
  // B - FEDERATION OF BISHOPS CONFERENCE
  { tipe: 'KODE_KEARSIPAN', kode: 'B.100', nama: 'Asia (FABC)', kategori: 'MASUK', urutan: 10 },
  { tipe: 'KODE_KEARSIPAN', kode: 'B.200', nama: 'Asia-Pasifik (Australia)', kategori: 'MASUK', urutan: 11 },
  
  // C - BADAN-BADAN KATOLIK INTERNASIONAL
  { tipe: 'KODE_KEARSIPAN', kode: 'C.101', nama: 'MIVA', kategori: 'MASUK', urutan: 20 },
  { tipe: 'KODE_KEARSIPAN', kode: 'C.102', nama: 'MISSIO', kategori: 'MASUK', urutan: 21 },
  { tipe: 'KODE_KEARSIPAN', kode: 'C.103', nama: 'Misereor', kategori: 'MASUK', urutan: 22 },
  { tipe: 'KODE_KEARSIPAN', kode: 'C.114', nama: 'CRS (Catholic Relief Service)', kategori: 'MASUK', urutan: 23 },
  
  // D - KONFERENSI WALI GEREJA INDONESIA (KWI)
  { tipe: 'KODE_KEARSIPAN', kode: 'D.101', nama: 'Hirarki Gereja Indonesia', kategori: 'MASUK', urutan: 30 },
  { tipe: 'KODE_KEARSIPAN', kode: 'D.101.2', nama: 'Sidang KWI', kategori: 'MASUK', urutan: 31 },
  { tipe: 'KODE_KEARSIPAN', kode: 'D.101.3', nama: 'Surat Edaran KWI', kategori: 'MASUK', urutan: 32 },
  { tipe: 'KODE_KEARSIPAN', kode: 'D.102', nama: 'Sekretariat Jendral KWI', kategori: 'MASUK', urutan: 33 },
  { tipe: 'KODE_KEARSIPAN', kode: 'D.108', nama: 'Komisi PSE', kategori: 'MASUK', urutan: 34 },
  { tipe: 'KODE_KEARSIPAN', kode: 'D.112', nama: 'Komisi Liturgi', kategori: 'MASUK', urutan: 35 },
  
  // E - KEUSKUPAN-KEUSKUPAN LAIN
  { tipe: 'KODE_KEARSIPAN', kode: 'E.102', nama: 'Keuskupan Agung Jakarta', kategori: 'MASUK', urutan: 40 },
  { tipe: 'KODE_KEARSIPAN', kode: 'E.107', nama: 'Keuskupan Agung Semarang', kategori: 'MASUK', urutan: 41 },
  { tipe: 'KODE_KEARSIPAN', kode: 'E.111', nama: 'Keuskupan Bandung', kategori: 'MASUK', urutan: 42 },
  { tipe: 'KODE_KEARSIPAN', kode: 'E.120', nama: 'Keuskupan Malang', kategori: 'MASUK', urutan: 43 },
  
  // F - KONFERENSI KEUSKUPAN REGIONAL
  { tipe: 'KODE_KEARSIPAN', kode: 'F.100', nama: 'Regio Jawa', kategori: 'MASUK', urutan: 50 },
  { tipe: 'KODE_KEARSIPAN', kode: 'F.100.1', nama: 'PSE Regio Jawa', kategori: 'MASUK', urutan: 51 },
  
  // H - DE RELIGIOSIS (TAREKAT)
  { tipe: 'KODE_KEARSIPAN', kode: 'H.100', nama: 'Tarekat/Biara/Konvik', kategori: 'MASUK', urutan: 60 },
  { tipe: 'KODE_KEARSIPAN', kode: 'H.200', nama: 'Tarekat Imam-imam', kategori: 'MASUK', urutan: 61 },
  { tipe: 'KODE_KEARSIPAN', kode: 'H.300', nama: 'Tarekat Bruder-bruder', kategori: 'MASUK', urutan: 62 },
  { tipe: 'KODE_KEARSIPAN', kode: 'H.400', nama: 'Tarekat Suster-suster', kategori: 'MASUK', urutan: 63 },
  { tipe: 'KODE_KEARSIPAN', kode: 'H.706', nama: 'KOPTARI', kategori: 'MASUK', urutan: 64 },
  
  // I - DE MAGISTERIO ECCLESIASTICO (SEMINARI)
  { tipe: 'KODE_KEARSIPAN', kode: 'I.101', nama: 'Seminari', kategori: 'MASUK', urutan: 70 },
  { tipe: 'KODE_KEARSIPAN', kode: 'I.102', nama: 'S.T.F.T.', kategori: 'MASUK', urutan: 71 },
  
  // O - PEMERINTAH
  { tipe: 'KODE_KEARSIPAN', kode: 'O.110', nama: 'Pemerintah, Departemen dan Instansi', kategori: 'MASUK', urutan: 80 },
  { tipe: 'KODE_KEARSIPAN', kode: 'O.111', nama: 'Kementerian Agama', kategori: 'MASUK', urutan: 81 },
  { tipe: 'KODE_KEARSIPAN', kode: 'O.117', nama: 'Pemda Tk. I & Tk.II', kategori: 'MASUK', urutan: 82 },
  { tipe: 'KODE_KEARSIPAN', kode: 'O.118', nama: 'Militer dan Polisi', kategori: 'MASUK', urutan: 83 },
]

async function seedKodeKearsipan() {
  console.log('🔄 Seeding kode kearsipan...')
  
  let created = 0
  let skipped = 0
  
  for (const item of KODE_KEARSIPAN_DATA) {
    try {
      await prisma.masterParameter.upsert({
        where: {
          tipe_kode: { tipe: item.tipe, kode: item.kode }
        },
        create: {
          tipe: item.tipe,
          kode: item.kode,
          nama: item.nama,
          warna: item.kategori === 'KELUAR' ? '#22c55e' : '#3b82f6', // Green for keluar, Blue for masuk
          urutan: item.urutan,
          aktif: true,
        },
        update: {
          nama: item.nama,
          urutan: item.urutan,
        }
      })
      created++
    } catch (error) {
      console.error(`❌ Error upserting ${item.kode}:`, error)
      skipped++
    }
  }
  
  console.log(`✅ Seeding complete: ${created} created/updated, ${skipped} skipped`)
  
  // Show summary
  const total = await prisma.masterParameter.count({
    where: { tipe: 'KODE_KEARSIPAN' }
  })
  console.log(`📊 Total kode kearsipan in database: ${total}`)
  
  const keluarCount = KODE_KEARSIPAN_DATA.filter(k => k.kategori === 'KELUAR').length
  const masukCount = KODE_KEARSIPAN_DATA.filter(k => k.kategori === 'MASUK').length
  console.log(`   - Surat Keluar (G.*): ${keluarCount}`)
  console.log(`   - Surat Masuk (A-F,H-S): ${masukCount}`)
}

seedKodeKearsipan()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
