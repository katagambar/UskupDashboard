/**
 * Report Detail API
 * 
 * GET - Get report by ID
 * PUT - Update report
 * DELETE - Delete draft report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getReportById, updateReport, deleteReport } from '@/lib/report-service'
import { withAuth, notFoundResponse, errorResponse, serverErrorResponse, successResponse } from '@/lib/api-helpers'

// GET - Get report by ID (requires auth)
export const GET = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const report = await getReportById(id)

    if (!report) {
      return notFoundResponse('Laporan')
    }

    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Get report error:', error)
    return serverErrorResponse('Gagal mengambil laporan')
  }
})

// PUT - Update report (requires auth + ownership)
export const PUT = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }
    const body = await request.json()

    const existingReport = await getReportById(id)
    if (!existingReport) {
      return notFoundResponse('Laporan')
    }

    // Only owner can edit, and only if draft
    if (existingReport.submittedBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Tidak memiliki akses untuk mengedit laporan ini' },
        { status: 403 }
      )
    }

    if (existingReport.status !== 'DRAFT') {
      return errorResponse('Hanya draft yang dapat diedit')
    }

    const { title, content, highlights, challenges, requests, statistics } = body

    const updated = await updateReport(id, {
      title,
      content,
      highlights,
      challenges,
      requests,
      statistics
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Laporan berhasil diperbarui'
    })
  } catch (error) {
    console.error('Update report error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Gagal mengupdate laporan')
  }
})

// DELETE - Delete draft report (requires auth + ownership)
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    const existingReport = await getReportById(id)
    if (!existingReport) {
      return notFoundResponse('Laporan')
    }

    // Only owner can delete
    if (existingReport.submittedBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Tidak memiliki akses untuk menghapus laporan ini' },
        { status: 403 }
      )
    }

    await deleteReport(id)

    return successResponse({ message: 'Laporan berhasil dihapus' })
  } catch (error) {
    console.error('Delete report error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Gagal menghapus laporan')
  }
})
