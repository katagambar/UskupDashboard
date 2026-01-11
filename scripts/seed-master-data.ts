/**
 * Complete Master Data Seeder
 * 
 * Seeds all master parameters for Dashboard Uskup Surabaya.
 * 
 * Usage: npx tsx scripts/seed-master-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// MASTER DATA DEFINITIONS
// ============================================

const MASTER_DATA = {
  // ============================================
  // JENIS AGENDA
  // ============================================
  JENIS_AGENDA: [
    { kode: 'KUR', nama: 'Kuria', warna: '#ef4444', urutan: 1 },
    { kode: 'PAS', nama: 'Pastoral', warna: '#22c55e', urutan: 2 },
    { kode: 'KOM', nama: 'Komisi', warna: '#3b82f6', urutan: 3 },
    { kode: 'LIT', nama: 'Liturgi', warna: '#a855f7', urutan: 4 },
    { kode: 'ADM', nama: 'Administrasi', warna: '#f59e0b', urutan: 5 },
    { kode: 'AUD', nama: 'Audiensi', warna: '#06b6d4', urutan: 6 },
    { kode: 'PRI', nama: 'Pribadi', warna: '#64748b', urutan: 7 },
  ],

  // ============================================
  // PRIORITAS
  // ============================================
  PRIORITAS: [
    { kode: 'URG', nama: 'Mendesak', warna: '#dc2626', urutan: 1 },
    { kode: 'HIG', nama: 'Tinggi', warna: '#ea580c', urutan: 2 },
    { kode: 'MED', nama: 'Sedang', warna: '#eab308', urutan: 3 },
    { kode: 'LOW', nama: 'Rendah', warna: '#22c55e', urutan: 4 },
  ],

  // ============================================
  // KATEGORI TUGAS
  // ============================================
  KATEGORI_TUGAS: [
    { kode: 'ADM', nama: 'Administrasi', warna: '#3b82f6', urutan: 1 },
    { kode: 'PAS', nama: 'Pastoral', warna: '#22c55e', urutan: 2 },
    { kode: 'KEU', nama: 'Keuangan', warna: '#f59e0b', urutan: 3 },
    { kode: 'HUK', nama: 'Hukum Kanonik', warna: '#a855f7', urutan: 4 },
    { kode: 'PEN', nama: 'Pendidikan', warna: '#06b6d4', urutan: 5 },
    { kode: 'SOK', nama: 'Sosial Karitatif', warna: '#ec4899', urutan: 6 },
    { kode: 'LIT', nama: 'Liturgi', warna: '#8b5cf6', urutan: 7 },
    { kode: 'KAT', nama: 'Katekese', warna: '#14b8a6', urutan: 8 },
    { kode: 'KOM', nama: 'Komunikasi', warna: '#f97316', urutan: 9 },
    { kode: 'KEP', nama: 'Kepemudaan', warna: '#84cc16', urutan: 10 },
    { kode: 'KEL', nama: 'Keluarga', warna: '#f43f5e', urutan: 11 },
    { kode: 'UMU', nama: 'Umum', warna: '#64748b', urutan: 99 },
  ],

  // ============================================
  // STATUS SURAT
  // ============================================
  STATUS_SURAT: [
    { kode: 'DRF', nama: 'Draft', warna: '#94a3b8', urutan: 1 },
    { kode: 'MNG', nama: 'Menunggu', warna: '#f59e0b', urutan: 2 },
    { kode: 'PRO', nama: 'Diproses', warna: '#3b82f6', urutan: 3 },
    { kode: 'TTD', nama: 'Ditandatangani', warna: '#22c55e', urutan: 4 },
    { kode: 'KRM', nama: 'Dikirim', warna: '#06b6d4', urutan: 5 },
    { kode: 'ARS', nama: 'Diarsipkan', warna: '#64748b', urutan: 6 },
    { kode: 'TLK', nama: 'Ditolak', warna: '#ef4444', urutan: 7 },
  ],

  // ============================================
  // STATUS AGENDA
  // ============================================
  STATUS_AGENDA: [
    { kode: 'DJW', nama: 'Dijadwalkan', warna: '#3b82f6', urutan: 1 },
    { kode: 'BRL', nama: 'Berlangsung', warna: '#f59e0b', urutan: 2 },
    { kode: 'SEL', nama: 'Selesai', warna: '#22c55e', urutan: 3 },
    { kode: 'TUN', nama: 'Ditunda', warna: '#94a3b8', urutan: 4 },
    { kode: 'BTL', nama: 'Dibatalkan', warna: '#ef4444', urutan: 5 },
  ],

  // ============================================
  // STATUS TUGAS
  // ============================================
  STATUS_TUGAS: [
    { kode: 'MNG', nama: 'Menunggu', warna: '#94a3b8', urutan: 1 },
    { kode: 'PRO', nama: 'Dalam Proses', warna: '#3b82f6', urutan: 2 },
    { kode: 'RVW', nama: 'Review', warna: '#f59e0b', urutan: 3 },
    { kode: 'SEL', nama: 'Selesai', warna: '#22c55e', urutan: 4 },
    { kode: 'TUN', nama: 'Tertunda', warna: '#64748b', urutan: 5 },
    { kode: 'BTL', nama: 'Dibatalkan', warna: '#ef4444', urutan: 6 },
  ],

  // ============================================
  // JENIS NOTULENSI
  // ============================================
  JENIS_NOTULENSI: [
    { kode: 'RAP', nama: 'Rapat', warna: '#3b82f6', urutan: 1 },
    { kode: 'AUD', nama: 'Audiensi', warna: '#22c55e', urutan: 2 },
    { kode: 'PER', nama: 'Pertemuan', warna: '#f59e0b', urutan: 3 },
    { kode: 'SIN', nama: 'Sinode', warna: '#a855f7', urutan: 4 },
    { kode: 'PLN', nama: 'Pleno', warna: '#ef4444', urutan: 5 },
    { kode: 'LKY', nama: 'Lokakarya', warna: '#06b6d4', urutan: 6 },
    { kode: 'RET', nama: 'Rekoleksi/Retret', warna: '#8b5cf6', urutan: 7 },
  ],

  // ============================================
  // JENIS PERTEMUAN (untuk Issue/Konsultasi)
  // ============================================
  JENIS_PERTEMUAN: [
    { kode: 'FTF', nama: 'Tatap Muka', warna: '#22c55e', urutan: 1 },
    { kode: 'ONL', nama: 'Online', warna: '#3b82f6', urutan: 2 },
    { kode: 'HYB', nama: 'Hybrid', warna: '#f59e0b', urutan: 3 },
  ],

  // ============================================
  // KATEGORI ISU
  // ============================================
  KATEGORI_ISU: [
    { kode: 'PAS', nama: 'Pastoral', warna: '#22c55e', urutan: 1 },
    { kode: 'ADM', nama: 'Administrasi', warna: '#3b82f6', urutan: 2 },
    { kode: 'KEU', nama: 'Keuangan', warna: '#f59e0b', urutan: 3 },
    { kode: 'HUK', nama: 'Hukum Kanonik', warna: '#a855f7', urutan: 4 },
    { kode: 'PER', nama: 'Personalia', warna: '#06b6d4', urutan: 5 },
    { kode: 'UMU', nama: 'Umum', warna: '#64748b', urutan: 99 },
  ],

  // ============================================
  // PAROKI (dari kodifikasi G.700)
  // ============================================
  PAROKI: [
    { kode: 'G.701', nama: 'Blitar - St. Yusuf', warna: '#3b82f6', urutan: 1 },
    { kode: 'G.702', nama: 'Blitar - St. Maria', warna: '#3b82f6', urutan: 2 },
    { kode: 'G.704', nama: 'Bojonegoro', warna: '#3b82f6', urutan: 4 },
    { kode: 'G.705', nama: 'Cepu', warna: '#3b82f6', urutan: 5 },
    { kode: 'G.706', nama: 'Jombang', warna: '#3b82f6', urutan: 6 },
    { kode: 'G.707', nama: 'Kediri - St. Vincentius', warna: '#3b82f6', urutan: 7 },
    { kode: 'G.708', nama: 'Kediri - St. Yosef', warna: '#3b82f6', urutan: 8 },
    { kode: 'G.709', nama: 'Madiun', warna: '#3b82f6', urutan: 9 },
    { kode: 'G.711', nama: 'Magetan', warna: '#3b82f6', urutan: 11 },
    { kode: 'G.712', nama: 'Mojokerto', warna: '#3b82f6', urutan: 12 },
    { kode: 'G.713', nama: 'Ngawi', warna: '#3b82f6', urutan: 13 },
    { kode: 'G.714', nama: 'Pare', warna: '#3b82f6', urutan: 14 },
    { kode: 'G.715', nama: 'Ponorogo', warna: '#3b82f6', urutan: 15 },
    { kode: 'G.716', nama: 'Rembang', warna: '#3b82f6', urutan: 16 },
    { kode: 'G.717', nama: 'Surabaya - Katedral', warna: '#ef4444', urutan: 17 },
    { kode: 'G.718', nama: 'Surabaya - Kepanjen', warna: '#ef4444', urutan: 18 },
    { kode: 'G.719', nama: 'Surabaya - Ketabang', warna: '#ef4444', urutan: 19 },
    { kode: 'G.720', nama: 'Surabaya - Ngagel', warna: '#ef4444', urutan: 20 },
    { kode: 'G.721', nama: 'Surabaya - Perak', warna: '#ef4444', urutan: 21 },
    { kode: 'G.722', nama: 'Surabaya - Sawahan', warna: '#ef4444', urutan: 22 },
    { kode: 'G.723', nama: 'Surabaya - Wonokromo', warna: '#ef4444', urutan: 23 },
    { kode: 'G.724', nama: 'Surabaya - Jemur Andayani', warna: '#ef4444', urutan: 24 },
    { kode: 'G.725', nama: 'Surabaya - St. Al. Gonzaga', warna: '#ef4444', urutan: 25 },
    { kode: 'G.726', nama: 'Tropodo - Salib Suci', warna: '#ef4444', urutan: 26 },
    { kode: 'G.727', nama: 'Surabaya - Karangpilang', warna: '#ef4444', urutan: 27 },
    { kode: 'G.728', nama: 'Sidoarjo', warna: '#22c55e', urutan: 28 },
    { kode: 'G.729', nama: 'Nganjuk', warna: '#3b82f6', urutan: 29 },
    { kode: 'G.730', nama: 'Gresik', warna: '#22c55e', urutan: 30 },
    { kode: 'G.731', nama: 'Surabaya - Kenjeran', warna: '#ef4444', urutan: 31 },
    { kode: 'G.732', nama: 'Tulungagung', warna: '#3b82f6', urutan: 32 },
    { kode: 'G.733', nama: 'Tuban', warna: '#3b82f6', urutan: 33 },
    { kode: 'G.734', nama: 'Wlingi', warna: '#3b82f6', urutan: 34 },
    { kode: 'G.735', nama: 'Surabaya - Redemptor Mundi', warna: '#ef4444', urutan: 35 },
    { kode: 'G.736', nama: 'Tandes', warna: '#ef4444', urutan: 36 },
    { kode: 'G.737', nama: 'Pagesangan', warna: '#ef4444', urutan: 37 },
    { kode: 'G.738', nama: 'Mater Dei', warna: '#ef4444', urutan: 38 },
  ],

  // ============================================
  // KOMISI (dari kodifikasi G.500)
  // ============================================
  KOMISI: [
    { kode: 'G.500', nama: 'Komisi Kerawam', warna: '#a855f7', urutan: 1 },
    { kode: 'G.501', nama: 'Komisi Kateketik', warna: '#a855f7', urutan: 2 },
    { kode: 'G.502', nama: 'Komisi Kepemudaan', warna: '#a855f7', urutan: 3 },
    { kode: 'G.503', nama: 'Komisi Liturgi', warna: '#a855f7', urutan: 4 },
    { kode: 'G.507', nama: 'Komisi KomSos', warna: '#a855f7', urutan: 5 },
    { kode: 'G.508', nama: 'Komisi HAK', warna: '#a855f7', urutan: 6 },
    { kode: 'G.509', nama: 'Komisi Religius', warna: '#a855f7', urutan: 7 },
    { kode: 'G.510', nama: 'Komisi Keluarga', warna: '#a855f7', urutan: 8 },
    { kode: 'G.511', nama: 'Komisi BIAK', warna: '#a855f7', urutan: 9 },
    { kode: 'G.512', nama: 'Panitia Panggilan', warna: '#a855f7', urutan: 10 },
    { kode: 'G.513', nama: 'Badan Pengawas Keuangan', warna: '#a855f7', urutan: 11 },
    { kode: 'G.517', nama: 'Panitia APP', warna: '#a855f7', urutan: 12 },
    { kode: 'G.519', nama: 'Karya Kepausan', warna: '#a855f7', urutan: 13 },
    { kode: 'G.520', nama: 'Komisi Rekat', warna: '#a855f7', urutan: 14 },
    { kode: 'G.521', nama: 'Parahita/Alocita', warna: '#a855f7', urutan: 15 },
    { kode: 'G.526', nama: 'Kerasulan Khusus', warna: '#a855f7', urutan: 16 },
  ],

  // ============================================
  // USER ROLES (for reference/display)
  // ============================================
  USER_ROLE: [
    { kode: 'USKUP', nama: 'Uskup', warna: '#ef4444', urutan: 1 },
    { kode: 'VIKJEN', nama: 'Vikaris Jenderal', warna: '#f59e0b', urutan: 2 },
    { kode: 'VIKYUD', nama: 'Vikaris Yudisial', warna: '#f59e0b', urutan: 3 },
    { kode: 'EKONOM', nama: 'Ekonom Keuskupan', warna: '#f59e0b', urutan: 4 },
    { kode: 'DELEGATUS', nama: 'Delegatus', warna: '#f59e0b', urutan: 5 },
    { kode: 'SEKRETARIS', nama: 'Sekretaris Uskup', warna: '#3b82f6', urutan: 6 },
    { kode: 'KURIA', nama: 'Anggota Kuria', warna: '#3b82f6', urutan: 7 },
    { kode: 'VIKEP', nama: 'Vikaris Episkopal', warna: '#22c55e', urutan: 8 },
    { kode: 'KOMISI', nama: 'Ketua Komisi', warna: '#22c55e', urutan: 9 },
    { kode: 'PAROKI', nama: 'Pastor Paroki', warna: '#22c55e', urutan: 10 },
    { kode: 'STAFF', nama: 'Staff', warna: '#64748b', urutan: 11 },
  ],
}

// ============================================
// SEEDER FUNCTION
// ============================================

async function seedMasterData() {
  console.log('🔄 Seeding all master data...\n')
  
  const summary: Record<string, { created: number, updated: number }> = {}
  
  for (const [tipe, items] of Object.entries(MASTER_DATA)) {
    console.log(`📦 Seeding ${tipe}...`)
    let created = 0
    let updated = 0
    
    for (const item of items) {
      try {
        await prisma.masterParameter.upsert({
          where: {
            tipe_kode: { tipe, kode: item.kode }
          },
          create: {
            tipe,
            kode: item.kode,
            nama: item.nama,
            warna: item.warna,
            urutan: item.urutan,
            aktif: true,
          },
          update: {
            nama: item.nama,
            warna: item.warna,
            urutan: item.urutan,
          }
        })
        created++
      } catch (error) {
        console.error(`   ❌ Error: ${item.kode}`)
      }
    }
    
    summary[tipe] = { created, updated }
    console.log(`   ✅ ${created} records\n`)
  }
  
  // Summary
  console.log('=' .repeat(50))
  console.log('📊 SUMMARY\n')
  
  for (const [tipe, stats] of Object.entries(summary)) {
    console.log(`   ${tipe}: ${stats.created} records`)
  }
  
  const total = await prisma.masterParameter.count()
  console.log(`\n   TOTAL RECORDS: ${total}`)
  console.log('=' .repeat(50))
  console.log('\n✅ Master data seeding complete!')
}

// Run seeder
seedMasterData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
