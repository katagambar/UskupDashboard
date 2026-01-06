/**
 * Pororomo Sync API
 * 
 * POST - Trigger manual sync dari Pororomo
 * GET - Get sync status/history
 */

import { NextResponse } from 'next/server'
import { syncImamFromPororomo, getSyncLogs, getLastSuccessfulSync } from '@/lib/pororomo'

export async function POST() {
    try {
        const result = await syncImamFromPororomo()

        return NextResponse.json({
            success: result.success,
            data: {
                recordsSync: result.recordsSync,
                recordsNew: result.recordsNew,
                recordsUpdated: result.recordsUpdated
            },
            errors: result.errors.length > 0 ? result.errors : undefined,
            message: result.success
                ? `Sinkronisasi selesai. ${result.recordsSync} data diproses.`
                : 'Sinkronisasi gagal. Silakan cek konfigurasi API.'
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const [logs, lastSuccess] = await Promise.all([
            getSyncLogs(10),
            getLastSuccessfulSync()
        ])

        return NextResponse.json({
            success: true,
            data: {
                history: logs,
                lastSuccessfulSync: lastSuccess?.completedAt || null
            }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        )
    }
}
