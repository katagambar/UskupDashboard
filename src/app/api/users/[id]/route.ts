import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { canCreateUsers } from '@/lib/rbac'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Delete user - using withAuth wrapper with RBAC check
export const DELETE = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    // Only Super Admins can delete users
    if (!canCreateUsers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (user.id === id) {
      return errorResponse('Cannot delete your own account')
    }

    await db.user.delete({ where: { id } })

    return successResponse({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return serverErrorResponse('Failed to delete user')
  }
})

// Update user - using withAuth wrapper with RBAC check
export const PATCH = withAuth(async (request, user, context) => {
  try {
    const { id } = await context?.params as { id: string }

    if (!canCreateUsers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    // Only allow updating specific fields
    const { name, email, role, jabatan, password } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (jabatan) updateData.jabatan = jabatan
    if (password && password.length >= 6) {
      updateData.password = await hashPassword(password)
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jabatan: true
      }
    })

    return successResponse(updatedUser)
  } catch (error) {
    console.error('Failed to update user:', error)
    return serverErrorResponse('Failed to update user')
  }
})
