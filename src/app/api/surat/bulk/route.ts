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
    prioritas: z.string().optional(),
  }),
})

// ============================================
// POST /api/surat/bulk - Bulk operations
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
      const surats = await prisma.surat.findMany({
        where: { id: { in: ids } },
        select: { id: true, createdBy: true },
      })

      const allowedIds = surats
        .filter(s => s.createdBy === user.id || user.role === 'ADMIN' || user.role === 'USKUP')
        .map(s => s.id)

      if (allowedIds.length === 0) {
        return errorResponse('No authorized items to delete', 403)
      }

      const deleted = await prisma.surat.deleteMany({
        where: { id: { in: allowedIds } },
      })

      return successResponse({
        message: `${deleted.count} surat deleted`,
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
      const surats = await prisma.surat.findMany({
        where: { id: { in: ids } },
        select: { id: true, createdBy: true },
      })

      const allowedIds = surats
        .filter(s => s.createdBy === user.id || user.role === 'ADMIN' || user.role === 'USKUP')
        .map(s => s.id)

      if (allowedIds.length === 0) {
        return errorResponse('No authorized items to update', 403)
      }

      const updated = await prisma.surat.updateMany({
        where: { id: { in: allowedIds } },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })

      return successResponse({
        message: `${updated.count} surat updated`,
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
