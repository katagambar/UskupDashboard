import { NextRequest, NextResponse } from 'next/server'
import { verify2FALogin, is2FAEnabled } from '@/lib/two-factor-auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/auth/2fa/verify
 * 
 * Verify 2FA code during login.
 * Called after initial password verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification code required' },
        { status: 400 }
      )
    }

    // Check if 2FA is enabled
    if (!is2FAEnabled(userId)) {
      return NextResponse.json(
        { success: false, error: '2FA not enabled for this user' },
        { status: 400 }
      )
    }

    // Verify the code
    const result = await verify2FALogin(userId, code)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Invalid verification code',
      }, { status: 401 })
    }

    // Get user info for session
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
      user,
    })

  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/2fa/verify?userId=xxx
 * 
 * Check if user needs 2FA verification
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const enabled = is2FAEnabled(userId)

    return NextResponse.json({
      success: true,
      requires2FA: enabled,
    })

  } catch (error) {
    console.error('2FA check error:', error)
    return NextResponse.json(
      { success: false, error: 'Check failed' },
      { status: 500 }
    )
  }
}
