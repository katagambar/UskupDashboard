/**
 * Surat PDF Export API
 * 
 * GET /api/surat/[id]/pdf - Download surat as PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { generateSuratPDF } from '@/lib/pdf-export'

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

    // Get surat from database
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

    // Generate PDF
    const pdfBuffer = await generateSuratPDF({
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

    // Generate filename - Sanitize slashes
    const safeNomor = surat.nomor.replace(/[\/\\]/g, '-')
    const filename = `Surat_${safeNomor}.pdf`

    // Return PDF response - convert Buffer to Uint8Array
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })


  } catch (error: any) {
    console.error('[API] PDF export error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
