import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get single template
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const template = await db.templateSurat.findUnique({ where: { id } })

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: template })
    } catch (error) {
        console.error('Error fetching template:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch template' },
            { status: 500 }
        )
    }
}

// Update template
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

        const template = await db.templateSurat.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ success: true, data: template })
    } catch (error) {
        console.error('Error updating template:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update template' },
            { status: 500 }
        )
    }
}

// Delete template
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
        await db.templateSurat.delete({ where: { id } })

        return NextResponse.json({ success: true, message: 'Template deleted' })
    } catch (error) {
        console.error('Error deleting template:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete template' },
            { status: 500 }
        )
    }
}
