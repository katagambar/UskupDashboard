import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { hashPassword, validatePassword, generateSecurePassword, verifyPassword } from '@/lib/password'

/**
 * Password management API endpoints
 * - GET: Get current password status
 * - POST: Set/Update password
 * - DELETE: Remove password (if needed)
 */

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        passwordSet: true,
        password: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        hasPassword: user.passwordSet,
        lastUpdated: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching password status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch password status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    const validation = validatePassword(newPassword)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password does not meet requirements',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        password: true,
        passwordSet: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // If user already has a password, verify current password
    if (user.passwordSet && user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required' },
          { status: 400 }
        )
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedPassword,
        passwordSet: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        hasPassword: updatedUser.passwordSet,
        updatedAt: updatedUser.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    )
  }
}

// Generate secure password for initial setup (admin only)
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow for admin/bishop users
    if (currentUser.role !== 'USKUP' && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { length = 16 } = await request.json()
    
    // Generate a secure password
    const securePassword = generateSecurePassword(length)
    const hashedPassword = await hashPassword(securePassword)

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedPassword,
        passwordSet: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Secure password generated successfully',
      data: {
        temporaryPassword: securePassword, // Only shown once!
        hasPassword: updatedUser.passwordSet
      }
    })
  } catch (error) {
    console.error('Error generating secure password:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate secure password' },
      { status: 500 }
    )
  }
}