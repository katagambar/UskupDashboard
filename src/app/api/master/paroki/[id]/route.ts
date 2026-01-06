import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get single paroki
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const paroki = await db.paroki.findUnique({ where: { id } })

        if (!paroki) {
            return NextResponse.json(
                { success: false, error: 'Paroki not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: paroki })
    } catch (error) {
        console.error('Error fetching paroki:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch paroki' },
            { status: 500 }
        )
    }
}

// Update paroki
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

        const paroki = await db.paroki.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ success: true, data: paroki })
    } catch (error) {
        console.error('Error updating paroki:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update paroki' },
            { status: 500 }
        )
    }
}

// Delete paroki
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
        await db.paroki.delete({ where: { id } })

        return NextResponse.json({ success: true, message: 'Paroki deleted' })
    } catch (error) {
        console.error('Error deleting paroki:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete paroki' },
            { status: 500 }
        )
    }
}
