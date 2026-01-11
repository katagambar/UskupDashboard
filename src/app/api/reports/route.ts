/**
 * Reports API
 * 
 * GET - List reports
 * POST - Create new report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createReport, listReports } from '@/lib/report-service'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/rate-limit'
import { withAuth, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// GET - List reports (requires auth)
export const GET = withAuth(async (request, user) => {
  const rateLimitResponse = withRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any || undefined
    const unitType = searchParams.get('unitType') || undefined
    const type = searchParams.get('type') as any || undefined
    const period = searchParams.get('period') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's role to filter
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } })

    // Non-admin users only see their own reports
    const submittedBy = ['USKUP', 'SEKRETARIS', 'VIKJEN'].includes(fullUser?.role || '')
      ? undefined
      : user.id

    const result = await listReports({
      status,
      unitType,
      type,
      period,
      limit,
      offset,
      submittedBy
    })

    return NextResponse.json({
      success: true,
      data: result.reports,
      total: result.total
    })
  } catch (error) {
    console.error('List reports error:', error)
    return serverErrorResponse('Gagal mengambil daftar laporan')
  }
})

// POST - Create new report (requires auth)
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { type, title, period, content, highlights, challenges, requests, statistics, unitType, unitId, unitName } = body

    if (!type || !title || !period || !content || !unitType || !unitName) {
      return errorResponse('Field wajib tidak lengkap')
    }

    const report = await createReport({
      type,
      title,
      period,
      content,
      highlights,
      challenges,
      requests,
      statistics,
      unitType,
      unitId,
      unitName,
      submittedBy: user.id
    })

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Laporan berhasil dibuat'
    }, { status: 201 })
  } catch (error) {
    console.error('Create report error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Gagal membuat laporan')
  }
})
