/**
 * Issues API
 * 
 * GET - List issues
 * POST - Create new issue
 */

import { NextRequest, NextResponse } from 'next/server'
import { createIssue, listIssues } from '@/lib/issue-service'
import { canCreateIssues } from '@/lib/rbac'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/rate-limit'
import { withAuth, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// GET - List issues (requires auth)
export const GET = withAuth(async (request, user) => {
  const rateLimitResponse = withRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await listIssues({ status, category, limit, offset })

    return NextResponse.json({
      success: true,
      data: result.issues,
      total: result.total
    })
  } catch (error) {
    console.error('List issues error:', error)
    return serverErrorResponse('Gagal mengambil daftar isu')
  }
})

// POST - Create new issue (requires auth + RBAC)
export const POST = withAuth(async (request, user) => {
  try {
    // Get full user with role
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!fullUser || !canCreateIssues(fullUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Tidak memiliki hak untuk membuat isu' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, priority, assignedTo, relatedDocType, relatedDocId } = body

    if (!title || !description) {
      return errorResponse('Judul dan deskripsi wajib diisi')
    }

    const issue = await createIssue({
      title,
      description,
      category,
      priority,
      createdBy: user.id,
      assignedTo,
      relatedDocType,
      relatedDocId
    })

    return NextResponse.json({
      success: true,
      data: issue,
      message: 'Isu berhasil dibuat'
    }, { status: 201 })
  } catch (error) {
    console.error('Create issue error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Gagal membuat isu')
  }
})
