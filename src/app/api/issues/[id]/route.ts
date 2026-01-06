/**
 * Issue Detail API
 * 
 * GET - Get issue by ID with opinions
 * PUT - Update issue
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { getIssueById, updateIssueStatus, openForConsultation } from '@/lib/issue-service'

export async function GET(
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

        const { id } = await params
        const issue = await getIssueById(id)

        if (!issue) {
            return NextResponse.json(
                { success: false, error: 'Isu tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: issue
        })

    } catch (error) {
        console.error('Get issue error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil detail isu' },
            { status: 500 }
        )
    }
}

export async function PUT(
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

        const { id } = await params
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

        return NextResponse.json(
            { success: false, error: 'Tidak ada perubahan yang valid' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Update issue error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal mengupdate isu' },
            { status: 500 }
        )
    }
}
