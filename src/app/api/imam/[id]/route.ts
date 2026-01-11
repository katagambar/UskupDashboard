import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get single imam by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const imam = await db.imam.findUnique({
      where: { id }
    })

    if (!imam) {
      return notFoundResponse('Imam')
    }

    return successResponse(imam)
  } catch (error) {
    console.error('Error fetching imam:', error)
    return serverErrorResponse('Failed to fetch imam')
  }
}

// Update imam - using withAuth wrapper
export const PUT = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()
    const { nama, paroki, jabatan, tanggalTahbisan, nomorTelepon, email, alamat, status } = body

    // Check if imam exists
    const existingImam = await db.imam.findUnique({
      where: { id }
    })

    if (!existingImam) {
      return notFoundResponse('Imam')
    }

    const updatedImam = await db.imam.update({
      where: { id },
      data: {
        nama: nama || undefined,
        paroki: paroki || undefined,
        jabatan: jabatan || undefined,
        tanggalTahbisan: tanggalTahbisan || undefined,
        nomorTelepon: nomorTelepon || undefined,
        email: email || undefined,
        alamat: alamat || undefined,
        status: status || undefined
      }
    })

    return successResponse(updatedImam)
  } catch (error) {
    console.error('Error updating imam:', error)
    return serverErrorResponse('Failed to update imam')
  }
})

// Delete imam - using withAuth wrapper
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    // Check if imam exists
    const existingImam = await db.imam.findUnique({
      where: { id }
    })

    if (!existingImam) {
      return notFoundResponse('Imam')
    }

    await db.imam.delete({
      where: { id }
    })

    return successResponse({ message: 'Imam deleted successfully' })
  } catch (error) {
    console.error('Error deleting imam:', error)
    return serverErrorResponse('Failed to delete imam')
  }
})
