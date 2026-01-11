import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createResetToken } from '@/lib/reset-tokens'

/**
 * POST /api/auth/forgot-password
 * 
 * Initiates password reset by generating a token.
 * In production, this would send an email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[Password Reset] User not found for email: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link reset password telah dikirim.',
      })
    }

    // Generate reset token
    const token = createResetToken(user.id, user.email)
    
    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3053'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Log the reset URL (in production, send email instead)
    console.log(`[Password Reset] Reset link for ${user.email}:`)
    console.log(`   ${resetUrl}`)
    console.log(`   Token: ${token}`)

    // TODO: In production, send email using resend/nodemailer/etc
    // await sendPasswordResetEmail(user.email, resetUrl)

    return NextResponse.json({
      success: true,
      message: 'Jika email terdaftar, link reset password telah dikirim.',
      // Only include in development for testing
      ...(process.env.NODE_ENV === 'development' && {
        _dev: {
          resetUrl,
          token,
          expiresIn: '1 hour',
        },
      }),
    })

  } catch (error) {
    console.error('[Password Reset] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
