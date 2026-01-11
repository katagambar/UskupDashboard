import { NextRequest, NextResponse } from 'next/server'
import { 
  generateNomorDariJenis, 
  getJenisSuratOptions, 
  getSuratStatistics,
  JENIS_SURAT,
  KODE_UNIT,
} from '@/lib/surat-numbering'


/**
 * GET /api/surat/numbering
 * 
 * Get next available surat number or options for dropdowns.
 * 
 * Query params:
 * - action: 'generate' | 'options' | 'stats'
 * - jenis: Jenis surat (for generate)
 * - unit: Unit/seksi (for generate, default: KUS)
 * - tahun: Tahun (for stats)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'options'
    
    if (action === 'generate') {
      const jenis = searchParams.get('jenis')
      const unit = searchParams.get('unit') || 'KUS'
      
      if (!jenis) {
        return NextResponse.json(
          { success: false, error: 'Jenis surat required' },
          { status: 400 }
        )
      }
      
      const nomor = await generateNomorDariJenis(jenis)
      
      return NextResponse.json({
        success: true,
        data: {
          nomor,
          jenis,
          unit,
          preview: {
            kode: JENIS_SURAT[jenis as keyof typeof JENIS_SURAT] || jenis,
            unit: KODE_UNIT[unit as keyof typeof KODE_UNIT]?.nama || unit,
          },
        },
      })
    }
    
    if (action === 'options') {
      return NextResponse.json({
        success: true,
        data: {
          jenisOptions: getJenisSuratOptions(),
          unitOptions: Object.entries(KODE_UNIT).map(([key, val]) => ({ value: key, label: val.nama })),
        },
      })
    }
    
    if (action === 'stats') {
      const tahun = searchParams.get('tahun') || undefined
      const stats = await getSuratStatistics(tahun)
      
      return NextResponse.json({
        success: true,
        data: stats,
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Surat numbering error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
