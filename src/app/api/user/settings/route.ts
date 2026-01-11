import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get user settings - using withAuth wrapper
export const GET = withAuth(async (request, user) => {
  try {
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

    return successResponse(userData)
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return serverErrorResponse('Failed to fetch user settings')
  }
})

// Update user settings - using withAuth wrapper
export const PATCH = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { name, email } = body

    // Check if email already exists (if changed)
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return errorResponse('Email already in use')
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

    return successResponse(updatedUser)
  } catch (error) {
    console.error('Error updating user settings:', error)
    return serverErrorResponse('Failed to update user settings')
  }
})
