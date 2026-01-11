import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get single paroki
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const paroki = await db.paroki.findUnique({ where: { id } })

    if (!paroki) {
      return notFoundResponse('Paroki')
    }

    return successResponse(paroki)
  } catch (error) {
    console.error('Error fetching paroki:', error)
    return serverErrorResponse('Failed to fetch paroki')
  }
}

// Update paroki - using withAuth wrapper
export const PUT = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()

    const paroki = await db.paroki.update({
      where: { id },
      data: body
    })

    return successResponse(paroki)
  } catch (error) {
    console.error('Error updating paroki:', error)
    return serverErrorResponse('Failed to update paroki')
  }
})

// Delete paroki - using withAuth wrapper
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    await db.paroki.delete({ where: { id } })

    return successResponse({ message: 'Paroki deleted' })
  } catch (error) {
    console.error('Error deleting paroki:', error)
    return serverErrorResponse('Failed to delete paroki')
  }
})
