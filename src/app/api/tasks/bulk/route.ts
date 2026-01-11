import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one ID required').max(100, 'Maximum 100 items'),
})

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one ID required').max(100, 'Maximum 100 items'),
  data: z.object({
    status: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    penanggungJawab: z.string().optional(),
  }),
})

// ============================================
// POST /api/tasks/bulk - Bulk operations
// ============================================

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'delete') {
      const result = bulkDeleteSchema.safeParse(body)
      if (!result.success) {
        return errorResponse(result.error.issues[0].message)
      }

      const { ids } = result.data
      
      // Check ownership - only delete user's own items or admin
      const tasks = await prisma.task.findMany({
        where: { id: { in: ids } },
        select: { id: true, createdBy: true },
      })

      const allowedIds = tasks
        .filter(t => t.createdBy === user.id || user.role === 'ADMIN' || user.role === 'USKUP')
        .map(t => t.id)

      if (allowedIds.length === 0) {
        return errorResponse('No authorized items to delete', 403)
      }

      const deleted = await prisma.task.deleteMany({
        where: { id: { in: allowedIds } },
      })

      return successResponse({
        message: `${deleted.count} tasks deleted`,
        deletedCount: deleted.count,
        requestedCount: ids.length,
      })
    }

    if (action === 'update') {
      const result = bulkUpdateSchema.safeParse(body)
      if (!result.success) {
        return errorResponse(result.error.issues[0].message)
      }

      const { ids, data } = result.data

      // Check ownership
      const tasks = await prisma.task.findMany({
        where: { id: { in: ids } },
        select: { id: true, createdBy: true },
      })

      const allowedIds = tasks
        .filter(t => t.createdBy === user.id || user.role === 'ADMIN' || user.role === 'USKUP')
        .map(t => t.id)

      if (allowedIds.length === 0) {
        return errorResponse('No authorized items to update', 403)
      }

      // Handle task completion
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: new Date(),
      }

      if (data.status === 'Selesai') {
        updateData.completedAt = new Date()
        updateData.progress = 100
      }

      const updated = await prisma.task.updateMany({
        where: { id: { in: allowedIds } },
        data: updateData,
      })

      return successResponse({
        message: `${updated.count} tasks updated`,
        updatedCount: updated.count,
        requestedCount: ids.length,
      })
    }

    if (action === 'complete') {
      // Shortcut to mark tasks as complete
      const result = bulkDeleteSchema.safeParse(body) // Same schema for ids
      if (!result.success) {
        return errorResponse(result.error.issues[0].message)
      }

      const { ids } = result.data

      const tasks = await prisma.task.findMany({
        where: { id: { in: ids } },
        select: { id: true, createdBy: true },
      })

      const allowedIds = tasks
        .filter(t => t.createdBy === user.id || user.role === 'ADMIN' || user.role === 'USKUP')
        .map(t => t.id)

      const updated = await prisma.task.updateMany({
        where: { id: { in: allowedIds } },
        data: {
          status: 'Selesai',
          progress: 100,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return successResponse({
        message: `${updated.count} tasks marked as complete`,
        updatedCount: updated.count,
        requestedCount: ids.length,
      })
    }

    return errorResponse('Invalid action. Use "delete", "update", or "complete"')

  } catch (error) {
    console.error('Bulk operation error:', error)
    return serverErrorResponse('Failed to perform bulk operation')
  }
})
