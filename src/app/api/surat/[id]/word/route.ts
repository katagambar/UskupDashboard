
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { generateSuratDocx } from '@/lib/docx-export'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const surat = await prisma.surat.findUnique({
      where: { id },
      include: {
        creator: {
          select: { name: true }
        }
      }
    })

    if (!surat) {
      return NextResponse.json(
        { success: false, error: 'Surat tidak ditemukan' },
        { status: 404 }
      )
    }

    // Fetch Kop Config
    const kopParams = await prisma.masterParameter.findMany({
      where: { tipe: 'CONFIG_KOP', aktif: true }
    })

    const kopConfig = {
      nama: kopParams.find(p => p.kode === 'NAMA')?.nama || '',
      alamat: kopParams.find(p => p.kode === 'ALAMAT')?.nama || '',
      kontak: kopParams.find(p => p.kode === 'KONTAK')?.nama || '',
    }

    const docxBuffer = await generateSuratDocx({
      nomor: surat.nomor,
      jenis: surat.jenis,
      judul: surat.judul,
      tanggal: surat.tanggal,
      pengirim: surat.pengirim,
      penerima: surat.penerima,
      isi: surat.isi,
      prioritas: surat.prioritas || 'Normal',
      status: surat.status,
      creatorName: surat.creator?.name || 'Unknown',
      kopConfig,
    })

    // Sanitize filename: replace / and \ with -
    const safeNomor = surat.nomor.replace(/[\/\\]/g, '-')
    const filename = `Surat_${safeNomor}.docx`

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': docxBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[API] DOCX export error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate Word document' },
      { status: 500 }
    )
  }
}
