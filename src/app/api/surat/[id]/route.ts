import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get single surat by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const surat = await db.surat.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!surat) {
      return notFoundResponse('Surat')
    }

    return successResponse(surat)
  } catch (error) {
    console.error('Error fetching surat:', error)
    return serverErrorResponse('Failed to fetch surat')
  }
}

// Update surat - using withAuth wrapper
export const PUT = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()
    const { nomor, jenis, judul, pengirim, penerima, tanggal, isi, status, prioritas, lampiran } = body

    // Check if surat exists
    const existingSurat = await db.surat.findUnique({
      where: { id }
    })

    if (!existingSurat) {
      return notFoundResponse('Surat')
    }

    const updatedSurat = await db.surat.update({
      where: { id },
      data: {
        nomor: nomor || undefined,
        jenis: jenis || undefined,
        judul: judul || undefined,
        pengirim: pengirim || undefined,
        penerima: penerima || undefined,
        tanggal: tanggal || undefined,
        isi: isi || undefined,
        status: status || undefined,
        prioritas: prioritas || undefined,
        lampiran: lampiran || undefined
      }
    })

    return successResponse(updatedSurat)
  } catch (error) {
    console.error('Error updating surat:', error)
    return serverErrorResponse('Failed to update surat')
  }
})

// Delete surat - using withAuth wrapper
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    // Check if surat exists
    const existingSurat = await db.surat.findUnique({
      where: { id }
    })

    if (!existingSurat) {
      return notFoundResponse('Surat')
    }

    await db.surat.delete({
      where: { id }
    })

    return successResponse({ message: 'Surat deleted successfully' })
  } catch (error) {
    console.error('Error deleting surat:', error)
    return serverErrorResponse('Failed to delete surat')
  }
})
