/**
 * Trace Logs API
 * 
 * GET /api/admin/traces - Get recent trace logs
 * GET /api/admin/traces/metrics - Get performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { 
  getRecentLogs, 
  getErrorLogs, 
  getLogsByRequestId,
  getMetrics,
  getSlowEndpoints,
} from '@/lib/request-tracing'

// GET /api/admin/traces
export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin only' },
      { status: 401 }
    )
  }

  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') || 'recent'
  const requestId = searchParams.get('requestId')
  const limit = parseInt(searchParams.get('limit') || '100')

  let logs

  if (requestId) {
    // Get logs for specific request
    logs = getLogsByRequestId(requestId)
  } else if (type === 'errors') {
    // Get error logs only
    logs = getErrorLogs(limit)
  } else if (type === 'metrics') {
    // Get performance metrics
    const threshold = parseInt(searchParams.get('threshold') || '500')
    return NextResponse.json({
      success: true,
      data: {
        all: getMetrics(),
        slow: getSlowEndpoints(threshold),
      },
    })
  } else {
    // Get recent logs
    logs = getRecentLogs(limit)
  }

  return NextResponse.json({
    success: true,
    data: logs,
    count: logs.length,
  })
}
