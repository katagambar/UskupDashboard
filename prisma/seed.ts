import { PrismaClient } from '@prisma/client'
import { hashPassword, generateSecurePassword } from '../src/lib/password'

const db = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // Create default password for all users
  const defaultPassword = 'UskupSBY2025!'
  const hashedPassword = await hashPassword(defaultPassword)

  // ============================================
  // SEED USERS WITH NEW ROLES
  // ============================================

  // 1. Uskup (Primary decision maker)
  const uskup = await db.user.upsert({
    where: { email: 'uskup@keuskupan-sby.or.id' },
    update: {
      role: 'USKUP',
      jabatan: 'Uskup Keuskupan Surabaya',
      canApprove: true
    },
    create: {
      email: 'uskup@keuskupan-sby.or.id',
      name: 'Mgr. Vincentius Sutikno Wisaksono',
      role: 'USKUP',
      jabatan: 'Uskup Keuskupan Surabaya',
      canApprove: true,
      password: hashedPassword,
      passwordSet: true
    }
  })

  // 2. Sekretaris Uskup (Administrator)
  const sekretaris = await db.user.upsert({
    where: { email: 'sekretaris@keuskupan-sby.or.id' },
    update: {
      role: 'SEKRETARIS',
      jabatan: 'Sekretaris Uskup',
      canApprove: false
    },
    create: {
      email: 'sekretaris@keuskupan-sby.or.id',
      name: 'Rm. Yohanes Antonius',
      role: 'SEKRETARIS',
      jabatan: 'Sekretaris Uskup',
      canApprove: false,
      password: hashedPassword,
      passwordSet: true
    }
  })

  // 3. Vikaris Jenderal
  const vikjen = await db.user.upsert({
    where: { email: 'vikjen@keuskupan-sby.or.id' },
    update: {
      role: 'VIKJEN',
      jabatan: 'Vikaris Jenderal',
      canApprove: true
    },
    create: {
      email: 'vikjen@keuskupan-sby.or.id',
      name: 'Rm. Petrus Canisius',
      role: 'VIKJEN',
      jabatan: 'Vikaris Jenderal',
      canApprove: true,
      password: hashedPassword,
      passwordSet: true
    }
  })

  // 4. Ekonom Keuskupan
  const ekonom = await db.user.upsert({
    where: { email: 'ekonom@keuskupan-sby.or.id' },
    update: {
      role: 'EKONOM',
      jabatan: 'Ekonom Keuskupan',
      department: 'Keuangan',
      canApprove: false
    },
    create: {
      email: 'ekonom@keuskupan-sby.or.id',
      name: 'Rm. Markus Budiman',
      role: 'EKONOM',
      jabatan: 'Ekonom Keuskupan',
      department: 'Keuangan',
      canApprove: false,
      password: hashedPassword,
      passwordSet: true
    }
  })

  // 5. Vikaris Yudisial
  const vikyud = await db.user.upsert({
    where: { email: 'vikyud@keuskupan-sby.or.id' },
    update: {
      role: 'VIKYUD',
      jabatan: 'Vikaris Yudisial',
      department: 'Tribunal',
      canApprove: false
    },
    create: {
      email: 'vikyud@keuskupan-sby.or.id',
      name: 'Rm. Thomas Aquinas',
      role: 'VIKYUD',
      jabatan: 'Vikaris Yudisial',
      department: 'Tribunal',
      canApprove: false,
      password: hashedPassword,
      passwordSet: true
    }
  })

  console.log('✅ Users created with new roles:')
  console.log('   1. Uskup:', uskup.email, `(${uskup.role})`)
  console.log('   2. Sekretaris:', sekretaris.email, `(${sekretaris.role})`)
  console.log('   3. Vikjen:', vikjen.email, `(${vikjen.role})`)
  console.log('   4. Ekonom:', ekonom.email, `(${ekonom.role})`)
  console.log('   5. Vikyud:', vikyud.email, `(${vikyud.role})`)
  console.log('   🔑 Default password for all:', defaultPassword)
  console.log('   🔒 Please change passwords after first login!')

  // Use uskup as the primary creator for sample data
  const user = uskup

  // NOTE: Imam data is NOT seeded here
  // Imam data should be synced from external Pororomo API
  // See: /settings → Sinkronisasi Data
  console.log('ℹ️  Imam data: Skipped (will sync from Pororomo API)')

  // ============================================
  // SEED MASTER PARAMETERS (Dynamic Dropdowns)
  // ============================================
  console.log('📝 Seeding master parameters...')

  const masterParameters = [
    // PRIORITAS
    { tipe: 'PRIORITAS', kode: 'TINGGI', nama: 'Tinggi', warna: '#ef4444', urutan: 1 },
    { tipe: 'PRIORITAS', kode: 'SEDANG', nama: 'Sedang', warna: '#f59e0b', urutan: 2 },
    { tipe: 'PRIORITAS', kode: 'RENDAH', nama: 'Rendah', warna: '#22c55e', urutan: 3 },

    // KATEGORI TUGAS
    { tipe: 'KATEGORI_TUGAS', kode: 'PASTORAL', nama: 'Pastoral', warna: '#3b82f6', urutan: 1 },
    { tipe: 'KATEGORI_TUGAS', kode: 'KEUANGAN', nama: 'Keuangan', warna: '#10b981', urutan: 2 },
    { tipe: 'KATEGORI_TUGAS', kode: 'PEMBANGUNAN', nama: 'Pembangunan', warna: '#6366f1', urutan: 3 },
    { tipe: 'KATEGORI_TUGAS', kode: 'KOMUNIKASI', nama: 'Komunikasi', warna: '#8b5cf6', urutan: 4 },
    { tipe: 'KATEGORI_TUGAS', kode: 'SDM', nama: 'SDM', warna: '#ec4899', urutan: 5 },
    { tipe: 'KATEGORI_TUGAS', kode: 'LAINNYA', nama: 'Lainnya', warna: '#6b7280', urutan: 99 },

    // JENIS SURAT
    { tipe: 'JENIS_SURAT', kode: 'EDARAN', nama: 'Edaran', urutan: 1 },
    { tipe: 'JENIS_SURAT', kode: 'UNDANGAN', nama: 'Undangan', urutan: 2 },
    { tipe: 'JENIS_SURAT', kode: 'REKOMENDASI', nama: 'Rekomendasi', urutan: 3 },
    { tipe: 'JENIS_SURAT', kode: 'PERSETUJUAN', nama: 'Persetujuan', urutan: 4 },
    { tipe: 'JENIS_SURAT', kode: 'LAINNYA', nama: 'Lainnya', urutan: 99 },

    // JENIS PERTEMUAN
    { tipe: 'JENIS_PERTEMUAN', kode: 'KURIA', nama: 'Kuria', warna: '#3b82f6', urutan: 1 },
    { tipe: 'JENIS_PERTEMUAN', kode: 'PASTORAL', nama: 'Pastoral', warna: '#22c55e', urutan: 2 },
    { tipe: 'JENIS_PERTEMUAN', kode: 'KOMISI', nama: 'Komisi', warna: '#a855f7', urutan: 3 },
    { tipe: 'JENIS_PERTEMUAN', kode: 'LAINNYA', nama: 'Lainnya', warna: '#6b7280', urutan: 99 },

    // JENIS NOTULENSI
    { tipe: 'JENIS_NOTULENSI', kode: 'KURIA', nama: 'Kuria', urutan: 1 },
    { tipe: 'JENIS_NOTULENSI', kode: 'PASTORAL', nama: 'Pastoral', urutan: 2 },
    { tipe: 'JENIS_NOTULENSI', kode: 'KOMISI', nama: 'Komisi', urutan: 3 },
    { tipe: 'JENIS_NOTULENSI', kode: 'LAINNYA', nama: 'Lainnya', urutan: 99 },

    // PERIODE LAPORAN
    { tipe: 'PERIODE', kode: 'Q1', nama: 'Triwulan 1', urutan: 1 },
    { tipe: 'PERIODE', kode: 'Q2', nama: 'Triwulan 2', urutan: 2 },
    { tipe: 'PERIODE', kode: 'Q3', nama: 'Triwulan 3', urutan: 3 },
    { tipe: 'PERIODE', kode: 'Q4', nama: 'Triwulan 4', urutan: 4 },
    { tipe: 'PERIODE', kode: 'TAHUNAN', nama: 'Tahunan', urutan: 5 },

    // KATEGORI ISU
    { tipe: 'KATEGORI_ISU', kode: 'PASTORAL', nama: 'Pastoral', urutan: 1 },
    { tipe: 'KATEGORI_ISU', kode: 'KEUANGAN', nama: 'Keuangan', urutan: 2 },
    { tipe: 'KATEGORI_ISU', kode: 'HUKUM', nama: 'Hukum Kanonik', urutan: 3 },
    { tipe: 'KATEGORI_ISU', kode: 'SDM', nama: 'SDM/Personalia', urutan: 4 },
    { tipe: 'KATEGORI_ISU', kode: 'LAINNYA', nama: 'Lainnya', urutan: 99 },

    // STATUS TUGAS
    { tipe: 'STATUS_TUGAS', kode: 'BELUM', nama: 'Belum Mulai', warna: '#6b7280', urutan: 1 },
    { tipe: 'STATUS_TUGAS', kode: 'PROSES', nama: 'Dalam Proses', warna: '#3b82f6', urutan: 2 },
    { tipe: 'STATUS_TUGAS', kode: 'SELESAI', nama: 'Selesai', warna: '#22c55e', urutan: 3 },
    { tipe: 'STATUS_TUGAS', kode: 'TERTUNDA', nama: 'Tertunda', warna: '#f59e0b', urutan: 4 },
  ]

  for (const param of masterParameters) {
    await db.masterParameter.upsert({
      where: { tipe_kode: { tipe: param.tipe, kode: param.kode } },
      update: { nama: param.nama, warna: param.warna, urutan: param.urutan },
      create: { ...param, aktif: true }
    })
  }

  console.log(`✅ Seeded ${masterParameters.length} master parameters`)

  // ============================================
  // SEED PAROKI DATA (47 Paroki, 8 Kevikepan)
  // ============================================
  console.log('⛪ Seeding paroki data...')

  const parokiData = [
    // Kevikepan Surabaya Selatan (7 Paroki)
    { nama: 'Katedral Hati Kudus Yesus, Surabaya', wilayah: 'Kevikepan Surabaya Selatan' },
    { nama: 'Gembala yang Baik, Surabaya', wilayah: 'Kevikepan Surabaya Selatan' },
    { nama: 'St. Paulus, Juanda Sidoarjo', wilayah: 'Kevikepan Surabaya Selatan' },
    { nama: 'Roh Kudus, Surabaya', wilayah: 'Kevikepan Surabaya Selatan' },
    { nama: 'St. Maria Annuntiata, Sidoarjo', wilayah: 'Kevikepan Surabaya Selatan' },
    { nama: 'Salib Suci, Sidoarjo', wilayah: 'Kevikepan Surabaya Selatan' },
    { nama: 'St. Yohanes Pemandi, Surabaya', wilayah: 'Kevikepan Surabaya Selatan' },

    // Kevikepan Surabaya Barat (6 Paroki)
    { nama: 'St. Yakobus, Citraland Surabaya', wilayah: 'Kevikepan Surabaya Barat' },
    { nama: 'St. Aloysius Gonzaga, Darmo Satelit Surabaya', wilayah: 'Kevikepan Surabaya Barat' },
    { nama: 'Redemptor Mundi, Surabaya', wilayah: 'Kevikepan Surabaya Barat' },
    { nama: 'Sakramen Maha Kudus, Surabaya', wilayah: 'Kevikepan Surabaya Barat' },
    { nama: 'St. Stefanus, Surabaya', wilayah: 'Kevikepan Surabaya Barat' },
    { nama: 'St. Yusup, Surabaya', wilayah: 'Kevikepan Surabaya Barat' },

    // Kevikepan Surabaya Utara (8 Paroki)
    { nama: 'St. Marinus Yohanes, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },
    { nama: 'Kelahiran Santa Perawan Maria, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },
    { nama: 'Kristus Raja, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },
    { nama: 'St. Maria Tak Bercela, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },
    { nama: 'St. Mikael, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },
    { nama: 'Ratu Pecinta Damai, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },
    { nama: 'St. Yosafat, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },
    { nama: 'St. Vincentius A Paulo, Surabaya', wilayah: 'Kevikepan Surabaya Utara' },

    // Kevikepan Mojokerto (4 Paroki)
    { nama: 'St. Perawan Maria, Gresik', wilayah: 'Kevikepan Mojokerto' },
    { nama: 'St. Maria, Jombang', wilayah: 'Kevikepan Mojokerto' },
    { nama: 'St. Monika, Krian', wilayah: 'Kevikepan Mojokerto' },
    { nama: 'St. Yosef, Mojokerto', wilayah: 'Kevikepan Mojokerto' },

    // Kevikepan Kediri (4 Paroki)
    { nama: 'St. Yosef, Kediri', wilayah: 'Kevikepan Kediri' },
    { nama: 'St. Vincentius A Paulo, Kediri', wilayah: 'Kevikepan Kediri' },
    { nama: 'St. Paulus, Nganjuk', wilayah: 'Kevikepan Kediri' },
    { nama: 'St. Mateus, Pare', wilayah: 'Kevikepan Kediri' },

    // Kevikepan Blora (5 Paroki)
    { nama: 'St. Pius X, Blora', wilayah: 'Kevikepan Blora' },
    { nama: 'St. Paulus, Bojonegoro', wilayah: 'Kevikepan Blora' },
    { nama: 'St. Willibrodus, Cepu', wilayah: 'Kevikepan Blora' },
    { nama: 'St. Petrus dan Paulus, Rembang', wilayah: 'Kevikepan Blora' },
    { nama: 'St. Petrus, Tuban', wilayah: 'Kevikepan Blora' },

    // Kevikepan Madiun (7 Paroki)
    { nama: 'St. Hilarius, Klepu', wilayah: 'Kevikepan Madiun' },
    { nama: 'St. Cornelius, Madiun', wilayah: 'Kevikepan Madiun' },
    { nama: 'Mater Dei, Madiun', wilayah: 'Kevikepan Madiun' },
    { nama: 'Regina Pacis, Magetan', wilayah: 'Kevikepan Madiun' },
    { nama: 'St. Yosef, Ngawi', wilayah: 'Kevikepan Madiun' },
    { nama: 'Kristus Raja, Ngrambe', wilayah: 'Kevikepan Madiun' },
    { nama: 'St. Maria, Ponorogo', wilayah: 'Kevikepan Madiun' },

    // Kevikepan Blitar (6 Paroki)
    { nama: 'St. Maria, Blitar', wilayah: 'Kevikepan Blitar' },
    { nama: 'St. Yusup, Blitar', wilayah: 'Kevikepan Blitar' },
    { nama: 'St. Fransiskus Asisi, Mojorejo', wilayah: 'Kevikepan Blitar' },
    { nama: 'St. Fransiskus Asisi, Resapombo', wilayah: 'Kevikepan Blitar' },
    { nama: 'St. Maria dengan Tidak Bernoda Asal, Tulungagung', wilayah: 'Kevikepan Blitar' },
    { nama: 'St. Petrus dan Paulus, Wlingi', wilayah: 'Kevikepan Blitar' },
  ]

  // Clear existing paroki and insert new ones
  await db.paroki.deleteMany({})
  await db.paroki.createMany({
    data: parokiData.map(p => ({
      nama: p.nama,
      wilayah: p.wilayah,
      status: 'Aktif'
    }))
  })

  // Count paroki by kevikepan
  const kevikepanCounts: Record<string, number> = {}
  for (const p of parokiData) {
    kevikepanCounts[p.wilayah] = (kevikepanCounts[p.wilayah] || 0) + 1
  }
  console.log(`✅ Seeded ${parokiData.length} paroki:`)
  for (const [kev, count] of Object.entries(kevikepanCounts)) {
    console.log(`   - ${kev}: ${count} paroki`)
  }

  // Seed Agenda data
  const agendaData = [
    {
      judul: 'Rapat Kuria Bulanan',
      tanggal: '2025-01-15',
      waktu: '09:00',
      lokasi: 'Ruang Rapat Uskup',
      jenis: 'Kuria',
      peserta: '12 orang',
      deskripsi: 'Pembahasan program kerja bulanan dan evaluasi kegiatan',
      status: 'Dijadwalkan',
      createdBy: user.id
    },
    {
      judul: 'Audiensi dengan Pastor Paroki',
      tanggal: '2025-01-15',
      waktu: '13:00',
      lokasi: 'Ruang Tamu Uskup',
      jenis: 'Pastoral',
      peserta: '8 orang',
      deskripsi: 'Diskusi mengenai persiapan Natal',
      status: 'Dijadwalkan',
      createdBy: user.id
    }
  ]

  for (const agenda of agendaData) {
    await db.agenda.create({
      data: agenda
    })
  }

  // Seed Tasks data
  const tasksData = [
    {
      judul: 'Review proposal gereja baru',
      deskripsi: 'Review dan memberikan persetujuan proposal pembangunan gereja baru di wilayah Surabaya Timur',
      prioritas: 'Tinggi',
      status: 'Dalam Proses',
      progress: 80,
      deadline: '2025-01-20',
      kategori: 'Pembangunan',
      penanggungJawab: 'Mgr. Agustinus Tri Budi Utomo',
      createdBy: user.id
    },
    {
      judul: 'Pastoral visitasi Paroki X',
      deskripsi: 'Melakukan kunjungan pastoral ke Paroki Santo Petrus untuk evaluasi kegiatan pastoral',
      prioritas: 'Tinggi',
      status: 'Dalam Proses',
      progress: 45,
      deadline: '2025-01-25',
      kategori: 'Pastoral',
      penanggungJawab: 'Mgr. Agustinus Tri Budi Utomo',
      createdBy: user.id
    },
    {
      judul: 'Surat edaran Adven',
      deskripsi: 'Menyusun dan menandatangani surat edaran persiapan Adven 2025',
      prioritas: 'Sedang',
      status: 'Dalam Proses',
      progress: 90,
      deadline: '2025-01-18',
      kategori: 'Komunikasi',
      penanggungJawab: 'Mgr. Agustinus Tri Budi Utomo',
      createdBy: user.id
    }
  ]

  for (const task of tasksData) {
    await db.task.create({
      data: task
    })
  }

  // Seed Notulensi data
  const notulensiData = [
    {
      judul: 'Rapat Kuria Bulanan Januari 2025',
      tanggal: '2025-01-10',
      jenis: 'Kuria',
      peserta: '12 orang',
      status: 'Disetujui',
      isi: 'Diskusi tentang program kerja bulan Januari...',
      kesimpulan: 'Disetujui untuk dilaksanakan sesuai rencana',
      createdBy: user.id
    },
    {
      judul: 'Pertemuan Komisi Pendidikan',
      tanggal: '2025-01-08',
      jenis: 'Komisi',
      peserta: '8 orang',
      status: 'Draft',
      isi: 'Pembahasan kurikulum pendidikan agama...',
      createdBy: user.id
    }
  ]

  for (const notulensi of notulensiData) {
    await db.notulensi.create({
      data: notulensi
    })
  }

  // Seed Decisions data
  const decisionsData = [
    {
      judul: 'Pembangunan Gereja Baru',
      deskripsi: 'Pembangunan gereja baru di wilayah Surabaya Timur untuk melayani umat yang semakin meningkat',
      status: 'Dalam Proses',
      progress: 65,
      targetDate: '2025-06-01',
      kategori: 'Pembangunan',
      penanggungJawab: 'Komisi Pembangunan',
      createdBy: user.id
    },
    {
      judul: 'Program Digital Pastoral',
      deskripsi: 'Implementasi teknologi digital untuk mendukung kegiatan pastoral dan administrasi',
      status: 'Dalam Proses',
      progress: 80,
      targetDate: '2025-03-01',
      kategori: 'Pastoral',
      penanggungJawab: 'Komisi Pastoral',
      createdBy: user.id
    }
  ]

  for (const decision of decisionsData) {
    await db.decision.create({
      data: decision
    })
  }

  console.log('✅ Database seeded successfully!')
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
