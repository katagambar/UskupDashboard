/**
 * Report Detail API
 * 
 * GET - Get report by ID
 * PUT - Update report
 * DELETE - Delete draft report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { getReportById, updateReport, deleteReport } from '@/lib/report-service'

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
        const report = await getReportById(id)

        if (!report) {
            return NextResponse.json(
                { success: false, error: 'Laporan tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: report
        })

    } catch (error) {
        console.error('Get report error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil laporan' },
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

        const existingReport = await getReportById(id)
        if (!existingReport) {
            return NextResponse.json(
                { success: false, error: 'Laporan tidak ditemukan' },
                { status: 404 }
            )
        }

        // Only owner can edit, and only if draft
        if (existingReport.submittedBy !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Tidak memiliki akses untuk mengedit laporan ini' },
                { status: 403 }
            )
        }

        if (existingReport.status !== 'DRAFT') {
            return NextResponse.json(
                { success: false, error: 'Hanya draft yang dapat diedit' },
                { status: 400 }
            )
        }

        const { title, content, highlights, challenges, requests, statistics } = body

        const updated = await updateReport(id, {
            title,
            content,
            highlights,
            challenges,
            requests,
            statistics
        })

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Laporan berhasil diperbarui'
        })

    } catch (error) {
        console.error('Update report error:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal mengupdate laporan' },
            { status: 500 }
        )
    }
}

export async function DELETE(
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

        // Only owner can delete
        if (existingReport.submittedBy !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Tidak memiliki akses untuk menghapus laporan ini' },
                { status: 403 }
            )
        }

        await deleteReport(id)

        return NextResponse.json({
            success: true,
            message: 'Laporan berhasil dihapus'
        })

    } catch (error) {
        console.error('Delete report error:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Gagal menghapus laporan' },
            { status: 500 }
        )
    }
}
