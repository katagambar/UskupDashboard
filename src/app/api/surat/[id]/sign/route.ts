/**
 * Sign Surat API
 * 
 * POST - Tandatangani surat secara digital
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { signDocument } from '@/lib/digital-signature'
import { canApproveDocuments, getRoleDisplayName } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUserFromRequest(request)

        if (!currentUser?.id) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            )
        }

        // Get user with role
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User tidak ditemukan' },
                { status: 404 }
            )
        }

        // Check permission
        if (!canApproveDocuments(user.role)) {
            return NextResponse.json(
                { success: false, error: 'Anda tidak memiliki hak untuk menandatangani dokumen' },
                { status: 403 }
            )
        }

        const { id: suratId } = await params

        // Get base URL for verification
        const baseUrl = request.headers.get('origin') ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            'http://localhost:3000'

        // Sign the document
        const result = await signDocument({
            suratId,
            signerId: user.id,
            signerName: user.name || 'Unknown',
            signerRole: user.role,
            signerJabatan: user.jabatan || getRoleDisplayName(user.role),
            signatureImage: user.signatureUrl || undefined,
            baseUrl,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            userAgent: request.headers.get('user-agent') || undefined
        })

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result.signature,
            message: 'Dokumen berhasil ditandatangani'
        })

    } catch (error) {
        console.error('Sign API error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal menandatangani dokumen' },
            { status: 500 }
        )
    }
}
