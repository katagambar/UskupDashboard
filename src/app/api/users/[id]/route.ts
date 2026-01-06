
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { hashPassword } from '@/lib/password'
import { canCreateUsers } from '@/lib/rbac'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const currentUser = await getCurrentUserFromRequest(request)

        // Only Super Admins can delete users
        if (!currentUser || !canCreateUsers(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        if (currentUser.id === id) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        await db.user.delete({ where: { id } })

        return NextResponse.json({ success: true, message: 'User deleted successfully' })
    } catch (error) {
        console.error('Failed to delete user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const currentUser = await getCurrentUserFromRequest(request)

        if (!currentUser || !canCreateUsers(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        // Only allow updating specific fields
        const { name, email, role, jabatan, password } = body

        const updateData: any = {}
        if (name) updateData.name = name
        if (email) updateData.email = email
        if (role) updateData.role = role
        if (jabatan) updateData.jabatan = jabatan
        if (password && password.length >= 6) {
            updateData.password = await hashPassword(password)
        }

        const updatedUser = await db.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                jabatan: true
            }
        })

        return NextResponse.json({ success: true, data: updatedUser })
    } catch (error) {
        console.error('Failed to update user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        )
    }
}
