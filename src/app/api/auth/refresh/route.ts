import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyRefreshToken, createJWT, setAuthCookie } from '@/lib/custom-auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refresh-token')?.value

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, error: 'No refresh token provided' },
                { status: 401 }
            )
        }

        // Verify refresh token
        const payload = await verifyRefreshToken(refreshToken)
        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Invalid refresh token' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 401 }
            )
        }

        // Create new access token
        const newToken = await createJWT({
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role
        })

        // Create response and set new cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })

        await setAuthCookie(response, newToken)

        return response
    } catch (error) {
        console.error('Refresh token error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
