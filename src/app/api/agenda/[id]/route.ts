import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get specific agenda by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const agenda = await db.agenda.findUnique({
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

    if (!agenda) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Agenda not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: agenda,
      message: 'Agenda retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching agenda:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch agenda' } },
      { status: 500 }
    )
  }
}

// Update specific agenda
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { judul, tanggal, tanggalAkhir, waktu, waktuAkhir, lokasi, jenis, peserta, deskripsi, status } = body

    // Check if agenda exists
    const existingAgenda = await db.agenda.findUnique({
      where: { id }
    })

    if (!existingAgenda) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Agenda not found' } },
        { status: 404 }
      )
    }

    // Update agenda
    const updatedAgenda = await db.agenda.update({
      where: { id },
      data: {
        ...(judul && { judul }),
        ...(tanggal && { tanggal }),
        // Handle tanggalAkhir - allow null to clear it
        ...(tanggalAkhir !== undefined && { tanggalAkhir: tanggalAkhir || null }),
        ...(waktu && { waktu }),
        // Handle waktuAkhir - allow null to clear it
        ...(waktuAkhir !== undefined && { waktuAkhir: waktuAkhir || null }),
        ...(lokasi && { lokasi }),
        ...(jenis && { jenis }),
        ...(peserta && { peserta }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(status && { status })
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAgenda,
      message: 'Agenda updated successfully'
    })
  } catch (error) {
    console.error('Error updating agenda:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update agenda' } },
      { status: 500 }
    )
  }
}

// Delete specific agenda
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check if agenda exists
    const existingAgenda = await db.agenda.findUnique({
      where: { id }
    })

    if (!existingAgenda) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Agenda not found' } },
        { status: 404 }
      )
    }

    // Delete agenda
    await db.agenda.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Agenda deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting agenda:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete agenda' } },
      { status: 500 }
    )
  }
}