/**
 * Review Report API
 * 
 * POST - Approve or request revision (Uskup/Sekretaris only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { reviewReport } from '@/lib/report-service'
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

        // Check if user has review permission
        const fullUser = await prisma.user.findUnique({ where: { id: user.id } })
        const allowedRoles = ['USKUP', 'SEKRETARIS', 'VIKJEN']

        if (!fullUser || !allowedRoles.includes(fullUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Tidak memiliki hak untuk mereview laporan' },
                { status: 403 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { status, reviewNotes } = body

        if (!status || !['APPROVED', 'NEEDS_REVISION'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Status review tidak valid' },
                { status: 400 }
            )
        }

        const result = await reviewReport({
            reportId: id,
            status,
            reviewNotes,
            reviewedBy: user.id
        })

        return NextResponse.json({
            success: true,
            data: result,
            message: status === 'APPROVED' ? 'Laporan disetujui' : 'Laporan perlu revisi'
        })

    } catch (error) {
        console.error('Review report error:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal mereview laporan' },
            { status: 500 }
        )
    }
}
