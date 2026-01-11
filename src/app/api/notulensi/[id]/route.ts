import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get single notulensi by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const notulensi = await db.notulensi.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        agenda: {
          select: {
            judul: true,
            tanggal: true
          }
        }
      }
    })

    if (!notulensi) {
      return notFoundResponse('Notulensi')
    }

    return successResponse(notulensi)
  } catch (error) {
    console.error('Error fetching notulensi:', error)
    return serverErrorResponse('Failed to fetch notulensi')
  }
}

// Update notulensi by ID - using withAuth wrapper
export const PATCH = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()
    const { judul, tanggal, jenis, peserta, isi, kesimpulan, status } = body

    // Check if notulensi exists
    const existingNotulensi = await db.notulensi.findUnique({
      where: { id }
    })

    if (!existingNotulensi) {
      return notFoundResponse('Notulensi')
    }

    const updateData: any = {}
    if (judul !== undefined) updateData.judul = judul
    if (tanggal !== undefined) updateData.tanggal = tanggal
    if (jenis !== undefined) updateData.jenis = jenis
    if (peserta !== undefined) updateData.peserta = peserta
    if (isi !== undefined) updateData.isi = isi
    if (kesimpulan !== undefined) updateData.kesimpulan = kesimpulan

    // Special handling for status changes (approval)
    if (status !== undefined) {
      updateData.status = status
      if (status === 'Disetujui') {
        updateData.approvedAt = new Date()
        updateData.approvedBy = user.id
      }
    }

    const notulensi = await db.notulensi.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return successResponse(notulensi)
  } catch (error) {
    console.error('Error updating notulensi:', error)
    return serverErrorResponse('Failed to update notulensi')
  }
})

// Delete notulensi by ID - using withAuth wrapper
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    // Check if notulensi exists
    const existingNotulensi = await db.notulensi.findUnique({
      where: { id }
    })

    if (!existingNotulensi) {
      return notFoundResponse('Notulensi')
    }

    await db.notulensi.delete({
      where: { id }
    })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Error deleting notulensi:', error)
    return serverErrorResponse('Failed to delete notulensi')
  }
})