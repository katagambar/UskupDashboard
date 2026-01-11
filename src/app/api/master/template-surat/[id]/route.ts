import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const template = await db.templateSurat.findUnique({ where: { id } })

    if (!template) {
      return notFoundResponse('Template')
    }

    return successResponse(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return serverErrorResponse('Failed to fetch template')
  }
}

// Update template - using withAuth wrapper
export const PUT = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()

    const template = await db.templateSurat.update({
      where: { id },
      data: body
    })

    return successResponse(template)
  } catch (error) {
    console.error('Error updating template:', error)
    return serverErrorResponse('Failed to update template')
  }
})

// Delete template - using withAuth wrapper
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    await db.templateSurat.delete({ where: { id } })

    return successResponse({ message: 'Template deleted' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return serverErrorResponse('Failed to delete template')
  }
})
