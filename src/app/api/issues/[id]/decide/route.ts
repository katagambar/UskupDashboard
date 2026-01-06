/**
 * Issue Decision API
 * 
 * POST - Make final decision on issue (Uskup only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { makeDecision } from '@/lib/issue-service'
import { isUskup } from '@/lib/rbac'
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

        if (!fullUser || !isUskup(fullUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Hanya Uskup yang dapat mengambil keputusan' },
                { status: 403 }
            )
        }

        const { id: issueId } = await params
        const body = await request.json()
        const { decision, decisionNotes } = body

        if (!decision) {
            return NextResponse.json(
                { success: false, error: 'Keputusan wajib diisi' },
                { status: 400 }
            )
        }

        const result = await makeDecision({
            issueId,
            decision,
            decisionNotes,
            decidedBy: user.id
        })

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Keputusan berhasil disimpan'
        })

    } catch (error) {
        console.error('Make decision error:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal menyimpan keputusan' },
            { status: 500 }
        )
    }
}
