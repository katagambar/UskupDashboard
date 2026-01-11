import { NextRequest, NextResponse } from 'next/server'
import { generateNomorDariJenis, JENIS_SURAT } from '@/lib/surat-numbering'

/**
 * POST /api/surat/generate-nomor
 * 
 * Generate nomor surat otomatis berdasarkan jenis surat.
 * Menggunakan sistem kode kearsipan resmi Keuskupan Surabaya.
 * 
 * Body:
 * - jenis: string (Jenis surat, e.g., "Surat Gembala", "Sirkuler")
 * 
 * Returns:
 * - success: boolean
 * - nomor: string (e.g., "G.111/2026/001")
 * - kode: string (Kode kearsipan, e.g., "G.111")
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jenis } = body

    if (!jenis) {
      return NextResponse.json(
        { success: false, error: 'Jenis surat harus dipilih' },
        { status: 400 }
      )
    }

    // Generate nomor using surat-numbering utility
    const nomor = await generateNomorDariJenis(jenis)
    
    // Get kode kearsipan for display
    const kode = JENIS_SURAT[jenis as keyof typeof JENIS_SURAT] || 'G.220.1'

    return NextResponse.json({
      success: true,
      nomor,
      kode,
      jenis
    })
    
  } catch (error) {
    console.error('Generate nomor error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal generate nomor surat' },
      { status: 500 }
    )
  }
}

// Also allow GET for simple testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jenis = searchParams.get('jenis')

  if (!jenis) {
    return NextResponse.json({
      success: true,
      message: 'API untuk generate nomor surat otomatis',
      usage: 'POST dengan body { jenis: "Surat Gembala" }'
    })
  }

  try {
    const nomor = await generateNomorDariJenis(jenis)
    const kode = JENIS_SURAT[jenis as keyof typeof JENIS_SURAT] || 'G.220.1'

    return NextResponse.json({
      success: true,
      nomor,
      kode,
      jenis
    })
  } catch (error) {
    console.error('Generate nomor error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal generate nomor surat' },
      { status: 500 }
    )
  }
}
