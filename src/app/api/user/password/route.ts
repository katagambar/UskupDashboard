import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { verifyPassword, hashPassword } from '@/lib/password'
import { prisma } from '@/lib/db'

// Change password
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { currentPassword, newPassword, confirmPassword } = body

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'All password fields are required' },
                { status: 400 }
            )
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'New password and confirmation do not match' },
                { status: 400 }
            )
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, error: 'New password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Get user with password
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { password: true }
        })

        if (!userData?.password) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, userData.password)
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        // Hash new password and update
        const hashedPassword = await hashPassword(newPassword)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordSet: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully'
        })
    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to change password' },
            { status: 500 }
        )
    }
}
