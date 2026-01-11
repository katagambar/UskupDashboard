/**
 * Issue Detail API
 * 
 * GET - Get issue by ID with opinions
 * PUT - Update issue
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIssueById, updateIssueStatus, openForConsultation } from '@/lib/issue-service'
import { withAuth, notFoundResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// GET - Get issue by ID (requires auth)
export const GET = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const issue = await getIssueById(id)

    if (!issue) {
      return notFoundResponse('Isu')
    }

    return NextResponse.json({
      success: true,
      data: issue
    })
  } catch (error) {
    console.error('Get issue error:', error)
    return serverErrorResponse('Gagal mengambil detail isu')
  }
})

// PUT - Update issue (requires auth)
export const PUT = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()
    const { status, consultantIds } = body

    // If opening for consultation
    if (status === 'OPEN' && consultantIds) {
      await openForConsultation(id, consultantIds)
      return NextResponse.json({
        success: true,
        message: 'Isu dibuka untuk konsultasi'
      })
    }

    // Simple status update
    if (status) {
      const updated = await updateIssueStatus(id, status)
      return NextResponse.json({
        success: true,
        data: updated
      })
    }

    return errorResponse('Tidak ada perubahan yang valid')
  } catch (error) {
    console.error('Update issue error:', error)
    return serverErrorResponse('Gagal mengupdate isu')
  }
})
