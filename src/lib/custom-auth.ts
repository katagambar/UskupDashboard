import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')

interface JWTPayload {
  userId: string
  email: string
  name: string
  role: string
  exp: number
  [key: string]: unknown // Index signature for jose compatibility
}

export async function createJWT(user: { id: string; email: string; name: string; role: string }, rememberMe: boolean = false) {
  const expirationDays = rememberMe ? 30 : 1 // 30 days if remember me, otherwise 1 day

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * expirationDays
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')
  const alg = 'HS256'

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? '30d' : '1d')
    .sign(secret)
}

// Create refresh token (longer expiration)
export async function createRefreshToken(userId: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')

  return new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('60d') // 60 days for refresh token
    .sign(secret)
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'refresh') return null
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return null
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export async function clearAuthCookie(response: NextResponse) {
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}