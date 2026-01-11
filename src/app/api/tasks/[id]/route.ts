import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get specific task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const task = await db.task.findUnique({
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

    if (!task) {
      return notFoundResponse('Task')
    }

    return successResponse(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return serverErrorResponse('Failed to fetch task')
  }
}

// Update task - using withAuth wrapper
export const PATCH = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()

    // Handle progress update separately
    if (body.progress !== undefined) {
      const newStatus = body.progress === 100 ? 'Selesai' :
        body.progress > 0 ? 'Dalam Proses' : 'Menunggu'

      const task = await db.task.update({
        where: { id },
        data: {
          progress: body.progress,
          status: newStatus,
          completedAt: body.progress === 100 ? new Date() : undefined
        }
      })

      return successResponse(task)
    }

    // Handle general update
    const task = await db.task.update({
      where: { id },
      data: body
    })

    return successResponse(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return serverErrorResponse('Failed to update task')
  }
})

// Delete task - using withAuth wrapper
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    await db.task.delete({
      where: { id }
    })

    return successResponse({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return serverErrorResponse('Failed to delete task')
  }
})
