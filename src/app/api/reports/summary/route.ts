/**
 * Reports Summary API
 * 
 * GET - Get executive summary with aggregated stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { getExecutiveSummary } from '@/lib/report-service'

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
        const period = searchParams.get('period') || undefined

        const summary = await getExecutiveSummary(period)

        return NextResponse.json({
            success: true,
            data: summary
        })

    } catch (error) {
        console.error('Get summary error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil ringkasan' },
            { status: 500 }
        )
    }
}
