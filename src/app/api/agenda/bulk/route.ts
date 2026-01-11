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
  }),
})

// ============================================
// POST /api/agenda/bulk - Bulk operations
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
      const agendas = await prisma.agenda.findMany({
        where: { id: { in: ids } },
        select: { id: true, createdBy: true },
      })

      const allowedIds = agendas
        .filter(a => a.createdBy === user.id || user.role === 'ADMIN' || user.role === 'USKUP')
        .map(a => a.id)

      if (allowedIds.length === 0) {
        return errorResponse('No authorized items to delete', 403)
      }

      const deleted = await prisma.agenda.deleteMany({
        where: { id: { in: allowedIds } },
      })

      return successResponse({
        message: `${deleted.count} agenda deleted`,
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
      const agendas = await prisma.agenda.findMany({
        where: { id: { in: ids } },
        select: { id: true, createdBy: true },
      })

      const allowedIds = agendas
        .filter(a => a.createdBy === user.id || user.role === 'ADMIN' || user.role === 'USKUP')
        .map(a => a.id)

      if (allowedIds.length === 0) {
        return errorResponse('No authorized items to update', 403)
      }

      const updated = await prisma.agenda.updateMany({
        where: { id: { in: allowedIds } },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })

      return successResponse({
        message: `${updated.count} agenda updated`,
        updatedCount: updated.count,
        requestedCount: ids.length,
      })
    }

    return errorResponse('Invalid action. Use "delete" or "update"')

  } catch (error) {
    console.error('Bulk operation error:', error)
    return serverErrorResponse('Failed to perform bulk operation')
  }
})
