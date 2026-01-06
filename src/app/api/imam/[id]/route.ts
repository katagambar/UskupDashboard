import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get single imam by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const imam = await db.imam.findUnique({
            where: { id }
        })

        if (!imam) {
            return NextResponse.json(
                { success: false, error: 'Imam not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: imam })
    } catch (error) {
        console.error('Error fetching imam:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch imam' },
            { status: 500 }
        )
    }
}

// Update imam
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { nama, paroki, jabatan, tanggalTahbisan, nomorTelepon, email, alamat, status } = body

        // Check if imam exists
        const existingImam = await db.imam.findUnique({
            where: { id }
        })

        if (!existingImam) {
            return NextResponse.json(
                { success: false, error: 'Imam not found' },
                { status: 404 }
            )
        }

        const updatedImam = await db.imam.update({
            where: { id },
            data: {
                nama: nama || undefined,
                paroki: paroki || undefined,
                jabatan: jabatan || undefined,
                tanggalTahbisan: tanggalTahbisan || undefined,
                nomorTelepon: nomorTelepon || undefined,
                email: email || undefined,
                alamat: alamat || undefined,
                status: status || undefined
            }
        })

        return NextResponse.json({ success: true, data: updatedImam })
    } catch (error) {
        console.error('Error updating imam:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update imam' },
            { status: 500 }
        )
    }
}

// Delete imam
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params

        // Check if imam exists
        const existingImam = await db.imam.findUnique({
            where: { id }
        })

        if (!existingImam) {
            return NextResponse.json(
                { success: false, error: 'Imam not found' },
                { status: 404 }
            )
        }

        await db.imam.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Imam deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting imam:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete imam' },
            { status: 500 }
        )
    }
}
