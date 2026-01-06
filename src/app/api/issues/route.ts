/**
 * Issues API
 * 
 * GET - List issues
 * POST - Create new issue
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { createIssue, listIssues } from '@/lib/issue-service'
import { canCreateIssues } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            )
        }

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
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil daftar isu' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            )
        }

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
            return NextResponse.json(
                { success: false, error: 'Judul dan deskripsi wajib diisi' },
                { status: 400 }
            )
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
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal membuat isu' },
            { status: 500 }
        )
    }
}
