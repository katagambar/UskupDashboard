import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateResetToken, markTokenUsed, deleteResetToken } from '@/lib/reset-tokens'
import { hashPassword, isPasswordStrong } from '@/lib/password'

/**
 * POST /api/auth/reset-password
 * 
 * Resets the user's password using a valid reset token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword, confirmPassword } = body

    // Validate input
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      )
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password baru diperlukan' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password tidak cocok' },
        { status: 400 }
      )
    }

    // Check password strength
    if (!isPasswordStrong(newPassword)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password harus minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol' 
        },
        { status: 400 }
      )
    }

    // Validate reset token
    const resetToken = validateResetToken(token)

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid atau telah kedaluwarsa' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        passwordSet: true,
        updatedAt: new Date(),
      },
    })

    // Mark token as used and delete it
    markTokenUsed(token)
    deleteResetToken(token)

    console.log(`[Password Reset] Password reset successful for user: ${resetToken.userId}`)

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    })

  } catch (error) {
    console.error('[Password Reset] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * 
 * Validates a reset token without using it.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Token required' },
        { status: 400 }
      )
    }

    const resetToken = validateResetToken(token)

    if (!resetToken) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Token tidak valid atau telah kedaluwarsa',
      })
    }

    return NextResponse.json({
      success: true,
      valid: true,
      email: resetToken.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
      expiresAt: resetToken.expiresAt,
    })

  } catch (error) {
    console.error('[Password Reset] Validation error:', error)
    return NextResponse.json(
      { success: false, valid: false, error: 'Validation failed' },
      { status: 500 }
    )
  }
}
