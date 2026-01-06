import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get single decision by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const decision = await db.decision.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!decision) {
            return NextResponse.json(
                { success: false, error: 'Decision not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: decision })
    } catch (error) {
        console.error('Error fetching decision:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch decision' },
            { status: 500 }
        )
    }
}

// Update decision
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
        const { judul, deskripsi, status, progress, targetDate, kategori, penanggungJawab } = body

        // Check if decision exists
        const existingDecision = await db.decision.findUnique({
            where: { id }
        })

        if (!existingDecision) {
            return NextResponse.json(
                { success: false, error: 'Decision not found' },
                { status: 404 }
            )
        }

        const updatedDecision = await db.decision.update({
            where: { id },
            data: {
                judul: judul || undefined,
                deskripsi: deskripsi || undefined,
                status: status || undefined,
                progress: progress !== undefined ? progress : undefined,
                targetDate: targetDate || undefined,
                kategori: kategori || undefined,
                penanggungJawab: penanggungJawab || undefined,
                completedAt: status === 'Selesai' ? new Date() : undefined
            }
        })

        return NextResponse.json({ success: true, data: updatedDecision })
    } catch (error) {
        console.error('Error updating decision:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update decision' },
            { status: 500 }
        )
    }
}

// Delete decision
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

        // Check if decision exists
        const existingDecision = await db.decision.findUnique({
            where: { id }
        })

        if (!existingDecision) {
            return NextResponse.json(
                { success: false, error: 'Decision not found' },
                { status: 404 }
            )
        }

        await db.decision.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Decision deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting decision:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete decision' },
            { status: 500 }
        )
    }
}
