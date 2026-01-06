/**
 * Smart Inbox API
 * 
 * GET - Get all pending inbox items and counts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { getSmartInbox } from '@/lib/smart-inbox'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            )
        }

        const inbox = await getSmartInbox(user.id)

        return NextResponse.json({
            success: true,
            data: inbox
        })

    } catch (error) {
        console.error('Smart inbox error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data inbox' },
            { status: 500 }
        )
    }
}
