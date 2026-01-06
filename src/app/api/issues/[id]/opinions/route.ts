/**
 * Issue Opinions API
 * 
 * POST - Add opinion to issue
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { addOpinion } from '@/lib/issue-service'
import { canGiveOpinions } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        if (!fullUser || !canGiveOpinions(fullUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Tidak memiliki hak untuk memberikan pendapat' },
                { status: 403 }
            )
        }

        const { id: issueId } = await params
        const body = await request.json()
        const { content, recommendation } = body

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Isi pendapat wajib diisi' },
                { status: 400 }
            )
        }

        const opinion = await addOpinion({
            issueId,
            authorId: user.id,
            content,
            recommendation
        })

        return NextResponse.json({
            success: true,
            data: opinion,
            message: 'Pendapat berhasil ditambahkan'
        }, { status: 201 })

    } catch (error) {
        console.error('Add opinion error:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal menambahkan pendapat' },
            { status: 500 }
        )
    }
}
