/**
 * Submit Report API
 * 
 * POST - Submit draft report for review
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { submitReport, getReportById } from '@/lib/report-service'

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

        const { id } = await params

        const existingReport = await getReportById(id)
        if (!existingReport) {
            return NextResponse.json(
                { success: false, error: 'Laporan tidak ditemukan' },
                { status: 404 }
            )
        }

        // Only owner can submit
        if (existingReport.submittedBy !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Tidak memiliki akses untuk mensubmit laporan ini' },
                { status: 403 }
            )
        }

        const result = await submitReport(id)

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Laporan berhasil disubmit'
        })

    } catch (error) {
        console.error('Submit report error:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal submit laporan' },
            { status: 500 }
        )
    }
}
