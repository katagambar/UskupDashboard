/**
 * Reports API
 * 
 * GET - List reports
 * POST - Create new report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { createReport, listReports } from '@/lib/report-service'
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
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil daftar laporan' },
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

        const body = await request.json()
        const { type, title, period, content, highlights, challenges, requests, statistics, unitType, unitId, unitName } = body

        if (!type || !title || !period || !content || !unitType || !unitName) {
            return NextResponse.json(
                { success: false, error: 'Field wajib tidak lengkap' },
                { status: 400 }
            )
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
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal membuat laporan' },
            { status: 500 }
        )
    }
}
