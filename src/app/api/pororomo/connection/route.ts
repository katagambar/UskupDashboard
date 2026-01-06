/**
 * Pororomo Connection Test API
 * 
 * POST - Test koneksi ke Pororomo API
 */

import { NextResponse } from 'next/server'
import { testPororomoConnection } from '@/lib/pororomo'

export async function POST() {
    try {
        const result = await testPororomoConnection()

        return NextResponse.json({
            success: result.success,
            message: result.message,
            latency: result.latency
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { success: false, error: errorMessage, message: 'Test koneksi gagal' },
            { status: 500 }
        )
    }
}
