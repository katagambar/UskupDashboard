import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get single decision by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const decision = await db.decision.findUnique({
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

    if (!decision) {
      return notFoundResponse('Decision')
    }

    return successResponse(decision)
  } catch (error) {
    console.error('Error fetching decision:', error)
    return serverErrorResponse('Failed to fetch decision')
  }
}

// Update decision - using withAuth wrapper
export const PUT = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()
    const { judul, deskripsi, status, progress, targetDate, kategori, penanggungJawab } = body

    // Check if decision exists
    const existingDecision = await db.decision.findUnique({
      where: { id }
    })

    if (!existingDecision) {
      return notFoundResponse('Decision')
    }

    const updatedDecision = await db.decision.update({
      where: { id },
      data: {
        judul: judul || undefined,
        deskripsi: deskripsi || undefined,
        status: status || undefined,
        progress: progress !== undefined ? progress : undefined,
        targetDate: targetDate || undefined,
        kategori: kategori || undefined,
        penanggungJawab: penanggungJawab || undefined,
        completedAt: status === 'Selesai' ? new Date() : undefined
      }
    })

    return successResponse(updatedDecision)
  } catch (error) {
    console.error('Error updating decision:', error)
    return serverErrorResponse('Failed to update decision')
  }
})

// Delete decision - using withAuth wrapper
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    // Check if decision exists
    const existingDecision = await db.decision.findUnique({
      where: { id }
    })

    if (!existingDecision) {
      return notFoundResponse('Decision')
    }

    await db.decision.delete({
      where: { id }
    })

    return successResponse({ message: 'Decision deleted successfully' })
  } catch (error) {
    console.error('Error deleting decision:', error)
    return serverErrorResponse('Failed to delete decision')
  }
})
