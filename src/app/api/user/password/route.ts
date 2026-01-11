import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, hashPassword } from '@/lib/password'
import { prisma } from '@/lib/db'
import { withAuth, errorResponse, notFoundResponse, serverErrorResponse, successResponse } from '@/lib/api-helpers'

// Change password - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse('All password fields are required')
    }

    if (newPassword !== confirmPassword) {
      return errorResponse('New password and confirmation do not match')
    }

    if (newPassword.length < 8) {
      return errorResponse('New password must be at least 8 characters')
    }

    // Get user with password
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    })

    if (!userData?.password) {
      return notFoundResponse('User')
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, userData.password)
    if (!isValid) {
      return errorResponse('Current password is incorrect')
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

    return successResponse({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    return serverErrorResponse('Failed to change password')
  }
})
