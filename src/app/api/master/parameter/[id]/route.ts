import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { canManageUsers } from '@/lib/rbac'

// PATCH - Update parameter
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(req)
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        if (!canManageUsers(user.role)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { nama, warna, urutan, aktif } = body

        const parameter = await prisma.masterParameter.update({
            where: { id },
            data: {
                ...(nama !== undefined && { nama }),
                ...(warna !== undefined && { warna }),
                ...(urutan !== undefined && { urutan }),
                ...(aktif !== undefined && { aktif })
            }
        })

        return NextResponse.json({ success: true, data: parameter })
    } catch (error) {
        console.error('Error updating parameter:', error)
        return NextResponse.json({ success: false, error: 'Failed to update parameter' }, { status: 500 })
    }
}

// DELETE - Delete parameter
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(req)
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        if (!canManageUsers(user.role)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        await prisma.masterParameter.delete({ where: { id } })

        return NextResponse.json({ success: true, message: 'Parameter deleted' })
    } catch (error) {
        console.error('Error deleting parameter:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete parameter' }, { status: 500 })
    }
}
