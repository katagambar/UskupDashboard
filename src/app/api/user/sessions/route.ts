import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// ============================================
// GET /api/user/sessions - List all active sessions
// ============================================

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { 
        userId: user.id,
        expires: { gt: new Date() } // Only active sessions
      },
      orderBy: { expires: 'desc' },
    })

    // Parse user agent to get device info
    const sessionsWithDetails = sessions.map((session) => ({
      id: session.id,
      expires: session.expires,
      isCurrentSession: session.sessionToken === request.cookies.get('session_token')?.value,
      createdAgo: getTimeAgo(session.expires),
    }))

    return successResponse({
      sessions: sessionsWithDetails,
      totalActive: sessions.length,
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return serverErrorResponse('Failed to fetch sessions')
  }
})

// ============================================
// DELETE /api/user/sessions - Revoke a session
// ============================================

export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')
    const revokeAll = searchParams.get('all') === 'true'

    if (revokeAll) {
      // Revoke all sessions except current
      const currentToken = request.cookies.get('session_token')?.value

      const deleted = await prisma.session.deleteMany({
        where: {
          userId: user.id,
          sessionToken: { not: currentToken },
        },
      })

      return successResponse({
        message: `${deleted.count} sessions revoked`,
        revokedCount: deleted.count,
      })
    }

    if (!sessionId) {
      return errorResponse('Session ID required')
    }

    // Check if session belongs to user
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: user.id },
    })

    if (!session) {
      return errorResponse('Session not found', 404)
    }

    // Don't allow revoking current session via this API
    const currentToken = request.cookies.get('session_token')?.value
    if (session.sessionToken === currentToken) {
      return errorResponse('Cannot revoke current session. Use logout instead.')
    }

    await prisma.session.delete({
      where: { id: sessionId },
    })

    return successResponse({
      message: 'Session revoked successfully',
      sessionId,
    })
  } catch (error) {
    console.error('Revoke session error:', error)
    return serverErrorResponse('Failed to revoke session')
  }
})

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`
  }
  if (diffHours > 0) {
    return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
  }
  return 'Expires soon'
}
