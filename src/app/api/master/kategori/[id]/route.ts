import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get single kategori
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const kategori = await db.kategori.findUnique({ where: { id } })

        if (!kategori) {
            return NextResponse.json(
                { success: false, error: 'Kategori not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: kategori })
    } catch (error) {
        console.error('Error fetching kategori:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch kategori' },
            { status: 500 }
        )
    }
}

// Update kategori
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

        const kategori = await db.kategori.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ success: true, data: kategori })
    } catch (error) {
        console.error('Error updating kategori:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update kategori' },
            { status: 500 }
        )
    }
}

// Delete kategori
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
        await db.kategori.delete({ where: { id } })

        return NextResponse.json({ success: true, message: 'Kategori deleted' })
    } catch (error) {
        console.error('Error deleting kategori:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete kategori' },
            { status: 500 }
        )
    }
}
