/**
 * API Helper Functions
 * 
 * Middleware wrappers for common API patterns:
 * - withAuth: Authentication wrapper
 * - withRBAC: Role-based access control wrapper
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest, UserWithoutPassword } from '@/lib/custom-auth'

// ============================================
// TYPES
// ============================================

export type AuthenticatedHandler = (
  request: NextRequest,
  user: UserWithoutPassword,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>

export type RBACHandler = (
  request: NextRequest,
  user: UserWithoutPassword,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>

// ============================================
// withAuth WRAPPER
// ============================================

/**
 * Wraps an API handler with authentication.
 * If user is not authenticated, returns 401 Unauthorized.
 * Otherwise, passes the user to the handler.
 * 
 * @example
 * export const POST = withAuth(async (request, user) => {
 *   // user is guaranteed to be authenticated here
 *   const task = await db.task.create({ data: { createdBy: user.id } })
 *   return NextResponse.json({ success: true, data: task })
 * })
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    request: NextRequest, 
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      const user = await getCurrentUserFromRequest(request)
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      return handler(request, user, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { success: false, error: 'Authentication error' },
        { status: 500 }
      )
    }
  }
}

// ============================================
// withRBAC WRAPPER
// ============================================

/**
 * Wraps an API handler with role-based access control.
 * Requires authentication + specific roles.
 * 
 * @example
 * export const DELETE = withRBAC(['USKUP', 'SEKRETARIS'], async (request, user) => {
 *   // only USKUP and SEKRETARIS can delete
 *   await db.item.delete({ where: { id } })
 *   return NextResponse.json({ success: true })
 * })
 */
export function withRBAC(allowedRoles: string[], handler: RBACHandler) {
  return withAuth(async (request, user, context) => {
    const userRole = user.role?.toUpperCase() || ''
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return handler(request, user, context)
  })
}

// ============================================
// HELPER RESPONSE FUNCTIONS
// ============================================

/**
 * Create a success JSON response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Create an error JSON response
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

/**
 * Create a 404 not found response
 */
export function notFoundResponse(resource = 'Resource') {
  return NextResponse.json(
    { success: false, error: `${resource} tidak ditemukan` },
    { status: 404 }
  )
}

/**
 * Create a 500 server error response
 */
export function serverErrorResponse(message = 'Internal server error') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  )
}
