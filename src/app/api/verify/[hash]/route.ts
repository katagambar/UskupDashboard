/**
 * Public Verification API
 * 
 * GET - Verifikasi tanda tangan digital secara publik
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySignature } from '@/lib/digital-signature'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hash: string }> }
) {
    try {
        const { hash } = await params

        if (!hash) {
            return NextResponse.json(
                { success: false, error: 'Hash tidak valid' },
                { status: 400 }
            )
        }

        const result = await verifySignature(hash)

        return NextResponse.json({
            success: true,
            data: result
        })

    } catch (error) {
        console.error('Verify API error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal memverifikasi dokumen' },
            { status: 500 }
        )
    }
}
