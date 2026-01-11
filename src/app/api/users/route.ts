import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { canManageUsers, canCreateUsers } from '@/lib/rbac'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get all users - using withAuth wrapper with RBAC check
export const GET = withAuth(async (request, user) => {
  try {
    if (!canManageUsers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Access restricted to Admins only.' },
        { status: 403 }
      )
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jabatan: true,
        department: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })

    return successResponse(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return serverErrorResponse('Failed to fetch users')
  }
})

// Create new user - using withAuth wrapper with RBAC check
export const POST = withAuth(async (request, user) => {
  try {
    if (!canCreateUsers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, role, jabatan, password } = body

    if (!email || !password || !name || !role) {
      return errorResponse('Missing required fields')
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return errorResponse('Email already registered')
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await db.user.create({
      data: {
        email,
        name,
        role,
        jabatan,
        password: hashedPassword,
        passwordSet: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jabatan: true
      }
    })

    return successResponse(newUser, 201)
  } catch (error) {
    console.error('Failed to create user:', error)
    return serverErrorResponse('Failed to create user')
  }
})
