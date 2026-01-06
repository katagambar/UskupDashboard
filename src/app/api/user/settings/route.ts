import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get user settings
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        return NextResponse.json({ success: true, data: userData })
    } catch (error) {
        console.error('Error fetching user settings:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user settings' },
            { status: 500 }
        )
    }
}

// Update user settings
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, email } = body

        // Check if email already exists (if changed)
        if (email && email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            })
            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: 'Email already in use' },
                    { status: 400 }
                )
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name || undefined,
                email: email || undefined,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        })

        return NextResponse.json({ success: true, data: updatedUser })
    } catch (error) {
        console.error('Error updating user settings:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user settings' },
            { status: 500 }
        )
    }
}
