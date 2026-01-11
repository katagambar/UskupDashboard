/**
 * Request Tracing Library
 * 
 * Adds correlation IDs to all requests for better debugging and logging.
 * Tracks request timing, logs errors with context, and enables distributed tracing.
 * 
 * Features:
 * - Unique request ID generation
 * - Request/response logging
 * - Performance timing
 * - Error context preservation
 * - Distributed tracing support
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ============================================
// TYPES
// ============================================

export interface RequestContext {
  requestId: string
  startTime: number
  method: string
  path: string
  userAgent?: string
  ip?: string
  userId?: string
}

export interface TraceLog {
  requestId: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: Record<string, any>
  duration?: number
}

// ============================================
// REQUEST ID GENERATION
// ============================================

/**
 * Generate unique request ID
 * Format: req_[timestamp]_[random]
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(4).toString('hex')
  return `req_${timestamp}_${random}`
}

/**
 * Extract request ID from headers or generate new one
 */
export function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || 
         req.headers.get('x-correlation-id') ||
         generateRequestId()
}

// ============================================
// REQUEST CONTEXT
// ============================================

/**
 * Create request context from NextRequest
 */
export function createRequestContext(req: NextRequest, userId?: string): RequestContext {
  return {
    requestId: getRequestId(req),
    startTime: Date.now(),
    method: req.method,
    path: req.nextUrl.pathname,
    userAgent: req.headers.get('user-agent') || undefined,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        undefined,
    userId,
  }
}

// ============================================
// LOGGING
// ============================================

const logs: TraceLog[] = []
const MAX_LOGS = 1000

/**
 * Log with request context
 */
export function trace(
  ctx: RequestContext,
  level: TraceLog['level'],
  message: string,
  data?: Record<string, any>
): void {
  const log: TraceLog = {
    requestId: ctx.requestId,
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    duration: Date.now() - ctx.startTime,
  }

  // Add to in-memory logs (ring buffer)
  logs.push(log)
  if (logs.length > MAX_LOGS) {
    logs.shift()
  }

  // Console output with request ID
  const prefix = `[${ctx.requestId}] [${level.toUpperCase()}]`
  const timing = `(${log.duration}ms)`
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ${message} ${timing}`, data || '')
      break
    case 'warn':
      console.warn(`${prefix} ${message} ${timing}`, data || '')
      break
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(`${prefix} ${message} ${timing}`, data || '')
      }
      break
    default:
      console.log(`${prefix} ${message} ${timing}`, data || '')
  }
}

/**
 * Convenience methods
 */
export const traceInfo = (ctx: RequestContext, msg: string, data?: Record<string, any>) => 
  trace(ctx, 'info', msg, data)

export const traceWarn = (ctx: RequestContext, msg: string, data?: Record<string, any>) => 
  trace(ctx, 'warn', msg, data)

export const traceError = (ctx: RequestContext, msg: string, data?: Record<string, any>) => 
  trace(ctx, 'error', msg, data)

export const traceDebug = (ctx: RequestContext, msg: string, data?: Record<string, any>) => 
  trace(ctx, 'debug', msg, data)

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Add request ID to response headers
 */
export function addTraceHeaders(response: NextResponse, ctx: RequestContext): NextResponse {
  response.headers.set('X-Request-ID', ctx.requestId)
  response.headers.set('X-Response-Time', `${Date.now() - ctx.startTime}ms`)
  return response
}

/**
 * Create traced JSON response
 */
export function tracedResponse(
  ctx: RequestContext,
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json({
    ...data,
    _meta: {
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      duration: Date.now() - ctx.startTime,
    },
  }, { status })

  return addTraceHeaders(response, ctx)
}

/**
 * Create traced error response
 */
export function tracedErrorResponse(
  ctx: RequestContext,
  error: string,
  status: number = 500,
  details?: any
): NextResponse {
  traceError(ctx, error, details)

  const response = NextResponse.json({
    success: false,
    error,
    requestId: ctx.requestId,
    timestamp: new Date().toISOString(),
  }, { status })

  return addTraceHeaders(response, ctx)
}

// ============================================
// MIDDLEWARE WRAPPER
// ============================================

type TracedHandler = (
  req: NextRequest,
  ctx: RequestContext,
  ...args: any[]
) => Promise<NextResponse>

/**
 * Wrap API handler with request tracing
 */
export function withTracing(handler: TracedHandler) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const ctx = createRequestContext(req)

    traceInfo(ctx, `${req.method} ${req.nextUrl.pathname}`, {
      query: Object.fromEntries(req.nextUrl.searchParams),
    })

    try {
      const response = await handler(req, ctx, ...args)
      
      traceInfo(ctx, `Response ${response.status}`, {
        duration: Date.now() - ctx.startTime,
      })

      return addTraceHeaders(response, ctx)
    } catch (error: any) {
      traceError(ctx, `Unhandled error: ${error.message}`, {
        stack: error.stack,
      })

      return tracedErrorResponse(ctx, 'Internal server error', 500)
    }
  }
}

// ============================================
// LOG RETRIEVAL (for debugging)
// ============================================

/**
 * Get logs for a specific request ID
 */
export function getLogsByRequestId(requestId: string): TraceLog[] {
  return logs.filter(log => log.requestId === requestId)
}

/**
 * Get recent logs
 */
export function getRecentLogs(limit: number = 100): TraceLog[] {
  return logs.slice(-limit).reverse()
}

/**
 * Get error logs
 */
export function getErrorLogs(limit: number = 50): TraceLog[] {
  return logs
    .filter(log => log.level === 'error')
    .slice(-limit)
    .reverse()
}

/**
 * Clear logs (for testing)
 */
export function clearLogs(): void {
  logs.length = 0
}

// ============================================
// PERFORMANCE TRACKING
// ============================================

interface PerformanceMetric {
  path: string
  method: string
  count: number
  totalDuration: number
  avgDuration: number
  minDuration: number
  maxDuration: number
}

const metrics: Map<string, PerformanceMetric> = new Map()

/**
 * Record performance metric
 */
export function recordMetric(ctx: RequestContext): void {
  const key = `${ctx.method}:${ctx.path}`
  const duration = Date.now() - ctx.startTime
  
  const existing = metrics.get(key)
  if (existing) {
    existing.count++
    existing.totalDuration += duration
    existing.avgDuration = existing.totalDuration / existing.count
    existing.minDuration = Math.min(existing.minDuration, duration)
    existing.maxDuration = Math.max(existing.maxDuration, duration)
  } else {
    metrics.set(key, {
      path: ctx.path,
      method: ctx.method,
      count: 1,
      totalDuration: duration,
      avgDuration: duration,
      minDuration: duration,
      maxDuration: duration,
    })
  }
}

/**
 * Get performance metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return Array.from(metrics.values())
    .sort((a, b) => b.avgDuration - a.avgDuration)
}

/**
 * Get slow endpoints (avg > threshold)
 */
export function getSlowEndpoints(thresholdMs: number = 500): PerformanceMetric[] {
  return getMetrics().filter(m => m.avgDuration > thresholdMs)
}

// ============================================
// EXPORTS
// ============================================

const RequestTracing = {
  // ID Generation
  generateRequestId,
  getRequestId,
  
  // Context
  createRequestContext,
  
  // Logging
  trace,
  traceInfo,
  traceWarn,
  traceError,
  traceDebug,
  
  // Response
  addTraceHeaders,
  tracedResponse,
  tracedErrorResponse,
  
  // Middleware
  withTracing,
  
  // Log Retrieval
  getLogsByRequestId,
  getRecentLogs,
  getErrorLogs,
  clearLogs,
  
  // Performance
  recordMetric,
  getMetrics,
  getSlowEndpoints,
}

export default RequestTracing
