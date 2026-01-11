/**
 * Kode Kearsipan Keuskupan Surabaya
 * 
 * Sistem penomoran surat sesuai standar resmi Sekretariat Keuskupan Surabaya.
 * Referensi: docs/references/kodifikasi-surat.pdf.md
 * 
 * Keuskupan Surabaya menggunakan prefix "G" untuk semua surat internal.
 * 
 * Format: G.[KATEGORI].[SUB]/[TAHUN]/[URUTAN]
 * Contoh: G.110/2026/001 (Surat Uskup, tahun 2026, nomor urut 001)
 */

import { prisma } from './db'

// ============================================
// KODE KEARSIPAN RESMI KEUSKUPAN SURABAYA
// Berdasarkan dokumen kodifikasi-surat.pdf
// ============================================

export const KODE_KEARSIPAN = {
  // G.100 - USKUP
  'G.100': { nama: 'Uskup', kode: 'G.100', kategori: 'uskup' },
  'G.110': { nama: 'Surat Uskup', kode: 'G.110', kategori: 'uskup' },
  'G.111': { nama: 'Surat Gembala Uskup Surabaya', kode: 'G.111', kategori: 'uskup' },
  'G.112': { nama: 'Sambutan/Pidato Uskup Surabaya', kode: 'G.112', kategori: 'uskup' },
  'G.113': { nama: 'Surat Pengangkatan/Tugas/Kuasa/Rekomendasi/Keterangan/Celebret', kode: 'G.113', kategori: 'uskup' },
  'G.114': { nama: 'Iurisdictio/Facultates/Celebret/Litterae dimissionis', kode: 'G.114', kategori: 'uskup' },
  'G.115': { nama: 'Surat Pribadi dari/kepada Uskup', kode: 'G.115', kategori: 'uskup' },
  'G.116': { nama: 'Sirkuler', kode: 'G.116', kategori: 'uskup' },
  'G.120': { nama: 'Program Keuskupan', kode: 'G.120', kategori: 'uskup' },
  'G.130': { nama: 'Agenda bulanan/tahunan', kode: 'G.130', kategori: 'uskup' },
  'G.140': { nama: 'Hal-hal lain dari/mengenai Uskup', kode: 'G.140', kategori: 'uskup' },
  'G.150': { nama: 'Examen Quinquennale', kode: 'G.150', kategori: 'uskup' },
  'G.160': { nama: 'Dokumen TOP SECRET', kode: 'G.160', kategori: 'uskup' },
  'G.170': { nama: 'Varia, Lain-lain', kode: 'G.170', kategori: 'uskup' },

  // G.200 - KURIA KEUSKUPAN
  'G.200': { nama: 'Kuria Keuskupan', kode: 'G.200', kategori: 'kuria' },
  'G.210': { nama: 'Vikaris Jendral Keuskupan', kode: 'G.210', kategori: 'kuria' },
  'G.220': { nama: 'Sekretariat Keuskupan', kode: 'G.220', kategori: 'kuria' },
  'G.220.1': { nama: 'Surat menyurat', kode: 'G.220.1', kategori: 'kuria' },
  'G.220.2': { nama: 'Rumah Tangga Keuskupan', kode: 'G.220.2', kategori: 'kuria' },
  'G.220.3': { nama: 'Kepegawaian, Gambaran tugas', kode: 'G.220.3', kategori: 'kuria' },
  'G.220.4': { nama: 'Pengangkatan', kode: 'G.220.4', kategori: 'kuria' },
  'G.220.5': { nama: 'Penggajian', kode: 'G.220.5', kategori: 'kuria' },
  'G.220.6': { nama: 'Lamaran Pekerjaan', kode: 'G.220.6', kategori: 'kuria' },
  'G.220.7': { nama: 'Surat Baptis/Perkawinan', kode: 'G.220.7', kategori: 'kuria' },
  'G.220.8': { nama: 'Perpustakaan', kode: 'G.220.8', kategori: 'kuria' },
  'G.230': { nama: 'Bendahara Keuskupan', kode: 'G.230', kategori: 'kuria' },
  'G.230.1': { nama: 'Surat Menyurat Keuangan', kode: 'G.230.1', kategori: 'kuria' },
  'G.230.2': { nama: 'Kolekte-kolekte/Lap. Keuangan', kode: 'G.230.2', kategori: 'kuria' },
  'G.230.3': { nama: 'Bantuan dalam keuskupan', kode: 'G.230.3', kategori: 'kuria' },

  // G.300 - TRIBUNAL
  'G.300': { nama: 'Tribunal', kode: 'G.300', kategori: 'tribunal' },
  'G.310': { nama: 'Tribunal Keuskupan Surabaya', kode: 'G.310', kategori: 'tribunal' },
  'G.320': { nama: 'Perkawinan', kode: 'G.320', kategori: 'tribunal' },
  'G.320.1': { nama: 'Causa Matrimonialis', kode: 'G.320.1', kategori: 'tribunal' },
  'G.320.2': { nama: 'Keputusan Pemisahan Hidup Perkawinan', kode: 'G.320.2', kategori: 'tribunal' },
  'G.320.3': { nama: 'Dispensasi Perkawinan', kode: 'G.320.3', kategori: 'tribunal' },

  // G.400 - DEWAN-DEWAN
  'G.410': { nama: 'Consultores', kode: 'G.410', kategori: 'dewan' },
  'G.420': { nama: 'Vicariatus Episcopalis', kode: 'G.420', kategori: 'dewan' },
  'G.430': { nama: 'Vicariatus Castrensis (BIMAS KAT MILITER)', kode: 'G.430', kategori: 'dewan' },
  'G.440': { nama: 'Dewan Imam', kode: 'G.440', kategori: 'dewan' },
  'G.450': { nama: 'Dewan Pastoral', kode: 'G.450', kategori: 'dewan' },
  'G.460': { nama: 'Rapat Pleno Keuskupan/Raker/Lokakarya/Sinode', kode: 'G.460', kategori: 'dewan' },
  'G.470': { nama: 'Dewan Keuangan', kode: 'G.470', kategori: 'dewan' },

  // G.500 - KOMISI-KOMISI
  'G.500': { nama: 'Komisi Kerawam', kode: 'G.500', kategori: 'komisi' },
  'G.501': { nama: 'Komisi Kateketik', kode: 'G.501', kategori: 'komisi' },
  'G.502': { nama: 'Komisi Kepemudaan', kode: 'G.502', kategori: 'komisi' },
  'G.503': { nama: 'Komisi Liturgi', kode: 'G.503', kategori: 'komisi' },
  'G.507': { nama: 'Komisi KomSos', kode: 'G.507', kategori: 'komisi' },
  'G.508': { nama: 'Komisi HAK', kode: 'G.508', kategori: 'komisi' },
  'G.509': { nama: 'Komisi Religius', kode: 'G.509', kategori: 'komisi' },
  'G.510': { nama: 'Komisi Keluarga', kode: 'G.510', kategori: 'komisi' },
  'G.511': { nama: 'Komisi BIAK', kode: 'G.511', kategori: 'komisi' },
  'G.512': { nama: 'Panitia Panggilan', kode: 'G.512', kategori: 'komisi' },
  'G.513': { nama: 'Badan Pengawas Keuangan', kode: 'G.513', kategori: 'komisi' },
  'G.517': { nama: 'Panitia APP', kode: 'G.517', kategori: 'komisi' },
  'G.519': { nama: 'Karya Kepausan', kode: 'G.519', kategori: 'komisi' },
  'G.520': { nama: 'Komisi Rekat', kode: 'G.520', kategori: 'komisi' },
  'G.521': { nama: 'Parahita/Alocita', kode: 'G.521', kategori: 'komisi' },

  // G.600 - PERSONALIA
  'G.600': { nama: 'Personalia', kode: 'G.600', kategori: 'personalia' },
  'G.610': { nama: 'Imam-imam', kode: 'G.610', kategori: 'personalia' },
  'G.610.1': { nama: 'Imam Projo', kode: 'G.610.1', kategori: 'personalia' },
  'G.610.2': { nama: 'Imam-imam di Keuskupan Surabaya', kode: 'G.610.2', kategori: 'personalia' },
  'G.620': { nama: 'Diakon', kode: 'G.620', kategori: 'personalia' },
  'G.630': { nama: 'Frater', kode: 'G.630', kategori: 'personalia' },
  'G.640': { nama: 'Rohaniwan/rohaniwati', kode: 'G.640', kategori: 'personalia' },
  'G.650': { nama: 'Katekis', kode: 'G.650', kategori: 'personalia' },
  'G.660': { nama: 'Karyawan', kode: 'G.660', kategori: 'personalia' },
  'G.670': { nama: 'Personalia lain', kode: 'G.670', kategori: 'personalia' },

  // G.700 - PAROKI DAN BPKP
  'G.700': { nama: 'Paroki dan BPKP', kode: 'G.700', kategori: 'paroki' },
  'G.717': { nama: 'Surabaya - Katedral', kode: 'G.717', kategori: 'paroki' },
  'G.718': { nama: 'Surabaya - Kepanjen', kode: 'G.718', kategori: 'paroki' },
  'G.719': { nama: 'Surabaya - Ketabang', kode: 'G.719', kategori: 'paroki' },
  'G.720': { nama: 'Surabaya - Ngagel', kode: 'G.720', kategori: 'paroki' },
  'G.721': { nama: 'Surabaya - Perak', kode: 'G.721', kategori: 'paroki' },
  'G.722': { nama: 'Surabaya - Sawahan', kode: 'G.722', kategori: 'paroki' },
  'G.723': { nama: 'Surabaya - Wonokromo', kode: 'G.723', kategori: 'paroki' },
  'G.728': { nama: 'Sidoarjo', kode: 'G.728', kategori: 'paroki' },
  'G.730': { nama: 'Gresik', kode: 'G.730', kategori: 'paroki' },
  'G.709': { nama: 'Madiun', kode: 'G.709', kategori: 'paroki' },
  'G.707': { nama: 'Kediri - St.Vincentius', kode: 'G.707', kategori: 'paroki' },
} as const

export type KodeKearsipan = keyof typeof KODE_KEARSIPAN

// ============================================
// JENIS SURAT UMUM (untuk backward compatibility)
// ============================================

export const JENIS_SURAT = {
  'Surat Gembala': 'G.111',
  'Surat Pengangkatan': 'G.113',
  'Sirkuler': 'G.116',
  'Surat Edaran': 'G.116',
  'Surat Tugas': 'G.113',
  'Surat Keterangan': 'G.220.1',
  'Surat Undangan': 'G.220.1',
  'Dispensasi Perkawinan': 'G.320.3',
  'Surat Baptis': 'G.220.7',
  'Surat Perkawinan': 'G.220.7',
  'Nota Dinas': 'G.220.1',
  'Umum': 'G.220.1',
} as const

export type JenisSurat = keyof typeof JENIS_SURAT

// ============================================
// HELPER: Get Kode Options for Dropdowns
// ============================================

/**
 * Mendapatkan semua kode kearsipan untuk dropdown
 * Format: { value: 'G.111', label: 'Surat Gembala Uskup Surabaya', kode: 'G.111' }
 */
export function getKodeKearsipanOptions() {
  return Object.entries(KODE_KEARSIPAN).map(([kode, info]) => ({
    value: kode,
    label: info.nama,
    kode: info.kode,
    kategori: info.kategori,
  }))
}

/**
 * Mendapatkan hanya kode G (surat keluar Keuskupan Surabaya)
 * Untuk form pembuatan surat baru
 */
export function getGKodeOptions() {
  return Object.entries(KODE_KEARSIPAN)
    .filter(([kode]) => kode.startsWith('G.'))
    .map(([kode, info]) => ({
      value: kode,
      label: info.nama,
      kode: info.kode,
      kategori: info.kategori,
    }))
}

/**
 * Mendapatkan jenis surat sederhana untuk dropdown (backward compatible)
 */
export function getJenisSuratOptions() {
  return Object.entries(JENIS_SURAT).map(([nama, kode]) => ({
    value: nama,
    label: nama,
    kode,
  }))
}

// ============================================
// CONFIGURATION
// ============================================

export interface SuratNumberConfig {
  format: string
  urutanLength: number
  yearlyReset: boolean
  separator: string
  prefix?: string
}

export const DEFAULT_CONFIG: SuratNumberConfig = {
  format: '{KODE}/{TAHUN}/{URUTAN}',
  urutanLength: 3,
  yearlyReset: true,
  separator: '/',
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function padUrutan(urutan: number, length: number): string {
  return urutan.toString().padStart(length, '0')
}

function getTahun(tanggal?: Date): string {
  const date = tanggal || new Date()
  return date.getFullYear().toString()
}

export function getBulanRomawi(bulan: number): string {
  const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return romawi[bulan - 1] || bulan.toString()
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Mendapatkan nomor urut berikutnya untuk kode kearsipan tertentu
 */
export async function getNextUrutan(
  kode: string,
  tahun?: string
): Promise<number> {
  const year = tahun || getTahun()

  const lastSurat = await prisma.surat.findFirst({
    where: {
      nomor: { contains: `${kode}/${year}` },
    },
    orderBy: { createdAt: 'desc' },
    select: { nomor: true },
  })

  if (!lastSurat) {
    return 1
  }

  // Extract nomor urut dari nomor terakhir
  const parts = lastSurat.nomor.split('/')
  const lastPart = parts[parts.length - 1]
  const lastUrutan = parseInt(lastPart, 10)

  return isNaN(lastUrutan) ? 1 : lastUrutan + 1
}

/**
 * Generate nomor surat otomatis dengan kode kearsipan Keuskupan Surabaya
 * 
 * @param kode - Kode kearsipan (misal: 'G.111' untuk Surat Gembala)
 * @param config - Konfigurasi opsional
 * @returns Nomor surat format: G.111/2026/001
 */
export async function generateNomorSurat(
  kode: string,
  config: Partial<SuratNumberConfig> = {}
): Promise<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const tahun = getTahun()

  // Validate kode
  const kodeKearsipan = KODE_KEARSIPAN[kode as KodeKearsipan]?.kode || kode

  // Get next urutan
  const urutan = await getNextUrutan(kodeKearsipan, tahun)
  const urutanStr = padUrutan(urutan, cfg.urutanLength)

  // Build nomor: G.111/2026/001
  let nomor = cfg.format
    .replace('{KODE}', kodeKearsipan)
    .replace('{TAHUN}', tahun)
    .replace('{URUTAN}', urutanStr)
    .replace('{BULAN}', getBulanRomawi(new Date().getMonth() + 1))

  if (cfg.prefix) {
    nomor = cfg.prefix + nomor
  }

  return nomor
}

/**
 * Generate nomor surat dari jenis surat (human-readable)
 */
export async function generateNomorDariJenis(
  jenis: string,
  config: Partial<SuratNumberConfig> = {}
): Promise<string> {
  const kode = JENIS_SURAT[jenis as JenisSurat] || 'G.220.1'
  return generateNomorSurat(kode, config)
}

/**
 * Validasi format nomor surat
 */
export function validateNomorSurat(nomor: string): boolean {
  // Format: G.XXX/YYYY/NNN
  const pattern = /^G\.\d{3}(\.\d+)?\/\d{4}\/\d{3,}$/
  return pattern.test(nomor)
}

/**
 * Parse nomor surat menjadi komponen
 */
export function parseNomorSurat(nomor: string): {
  kode?: string
  tahun?: string
  urutan?: string
  kategori?: string
  raw: string
} {
  const parts = nomor.split('/')
  const kode = parts[0]
  const kodeInfo = KODE_KEARSIPAN[kode as KodeKearsipan]

  return {
    kode,
    tahun: parts[1],
    urutan: parts[2],
    kategori: kodeInfo?.kategori,
    raw: nomor,
  }
}

/**
 * Get statistics untuk dashboard
 */
export async function getSuratStatistics(tahun?: string): Promise<{
  total: number
  byKategori: Record<string, number>
  byStatus: Record<string, number>
}> {
  const year = tahun || getTahun()

  const surats = await prisma.surat.findMany({
    where: {
      nomor: { contains: `/${year}/` },
    },
    select: {
      nomor: true,
      status: true,
    },
  })

  const byKategori: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  for (const surat of surats) {
    const parsed = parseNomorSurat(surat.nomor)
    const kategori = parsed.kategori || 'lainnya'
    byKategori[kategori] = (byKategori[kategori] || 0) + 1
    byStatus[surat.status] = (byStatus[surat.status] || 0) + 1
  }

  return {
    total: surats.length,
    byKategori,
    byStatus,
  }
}

// ============================================
// EXPORT OPTIONS UNTUK FRONTEND - Additional helpers
// ============================================

export function getKodeByKategori(kategori: string) {
  return Object.entries(KODE_KEARSIPAN)
    .filter(([, value]) => value.kategori === kategori)
    .map(([key, value]) => ({
      value: key,
      label: `${value.kode} - ${value.nama}`,
      kode: value.kode,
      nama: value.nama,
    }))
}

// Backward compatibility
export const KODE_JENIS_SURAT = JENIS_SURAT
export const KODE_UNIT = {
  'KUS': { nama: 'Keuskupan Surabaya', kode: 'G.200' },
  'USK': { nama: 'Uskup', kode: 'G.100' },
  'VIJ': { nama: 'Vikaris Jenderal', kode: 'G.210' },
  'SEK': { nama: 'Sekretariat', kode: 'G.220' },
  'TRB': { nama: 'Tribunal', kode: 'G.300' },
  'KOM': { nama: 'Komisi', kode: 'G.500' },
  'PAR': { nama: 'Paroki', kode: 'G.700' },
}
