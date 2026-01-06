import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, isPlainTextPassword } from '@/lib/password'
import { createJWT, setAuthCookie } from '@/lib/custom-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe = false } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    console.log('[Login Debug] User found:', !!user, 'email:', email)
    console.log('[Login Debug] User has password:', !!user?.password)

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('[Login Debug] Verifying password...')
    const isValidPassword = await verifyPassword(password, user.password)
    console.log('[Login Debug] Password valid:', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token with rememberMe option
    const token = await createJWT({
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role
    }, rememberMe)

    // Create response and set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    await setAuthCookie(response, token)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}