/**
 * Security Middleware
 * 
 * Comprehensive security checks for API routes:
 * - Rate limiting
 * - Input sanitization
 * - Request validation
 * - IP blocking
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from './redis-cache'

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - stricter limits
  'auth': { windowMs: 60000, maxRequests: 10 }, // 10 per minute
  'login': { windowMs: 300000, maxRequests: 5 }, // 5 per 5 minutes
  'register': { windowMs: 3600000, maxRequests: 3 }, // 3 per hour
  'forgot-password': { windowMs: 3600000, maxRequests: 3 }, // 3 per hour
  
  // API endpoints - normal limits
  'api': { windowMs: 60000, maxRequests: 100 }, // 100 per minute
  'upload': { windowMs: 60000, maxRequests: 10 }, // 10 per minute
  'webhooks': { windowMs: 60000, maxRequests: 30 }, // 30 per minute
}

/**
 * Get rate limit config for endpoint
 */
function getRateLimitConfig(path: string): RateLimitConfig {
  if (path.includes('/auth/login')) return RATE_LIMITS['login']
  if (path.includes('/auth/register')) return RATE_LIMITS['register']
  if (path.includes('/forgot-password')) return RATE_LIMITS['forgot-password']
  if (path.includes('/auth')) return RATE_LIMITS['auth']
  if (path.includes('/upload')) return RATE_LIMITS['upload']
  if (path.includes('/webhooks')) return RATE_LIMITS['webhooks']
  return RATE_LIMITS['api']
}

/**
 * Apply rate limiting to request
 */
export async function applyRateLimit(
  req: NextRequest,
  identifier?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown'
  
  const key = identifier || `${ip}:${req.nextUrl.pathname}`
  const config = getRateLimitConfig(req.nextUrl.pathname)
  
  const result = await checkRateLimit(
    key,
    config.maxRequests,
    Math.floor(config.windowMs / 1000)
  )
  
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetTime: Date.now() + config.windowMs,
  }
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      )
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}

// ============================================
// SQL INJECTION PREVENTION
// ============================================

const SQL_INJECTION_PATTERNS = [
  /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)(\s|$)/i,
  /--/,
  /;.*$/,
  /\/\*.*\*\//,
  /'.*OR.*'/i,
  /".*OR.*"/i,
]

/**
 * Check for SQL injection attempts
 */
export function hasSqlInjection(input: string): boolean {
  if (typeof input !== 'string') return false
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))
}

/**
 * Validate input is safe from SQL injection
 */
export function validateNoSqlInjection(data: Record<string, any>): boolean {
  for (const value of Object.values(data)) {
    if (typeof value === 'string' && hasSqlInjection(value)) {
      return false
    }
    if (typeof value === 'object' && value !== null) {
      if (!validateNoSqlInjection(value)) return false
    }
  }
  return true
}

// ============================================
// SUSPICIOUS ACTIVITY DETECTION
// ============================================

const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+=/i,  // onclick=, onerror=, etc.
  /data:text\/html/i,
  /eval\(/i,
  /document\./i,
  /window\./i,
]

/**
 * Check for suspicious patterns in input
 */
export function hasSuspiciousPatterns(input: string): boolean {
  if (typeof input !== 'string') return false
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(input))
}

// ============================================
// SECURITY HEADERS FOR API RESPONSES
// ============================================

/**
 * Add security headers to API response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response
}

// ============================================
// IP BLOCKING (In-Memory for now)
// ============================================

const blockedIPs: Set<string> = new Set()
const suspiciousAttempts: Map<string, number> = new Map()

const MAX_SUSPICIOUS_ATTEMPTS = 10
const BLOCK_DURATION = 3600000 // 1 hour

/**
 * Record suspicious activity from IP
 */
export function recordSuspiciousActivity(ip: string): void {
  const attempts = (suspiciousAttempts.get(ip) || 0) + 1
  suspiciousAttempts.set(ip, attempts)
  
  if (attempts >= MAX_SUSPICIOUS_ATTEMPTS) {
    blockedIPs.add(ip)
    // Auto-unblock after duration
    setTimeout(() => {
      blockedIPs.delete(ip)
      suspiciousAttempts.delete(ip)
    }, BLOCK_DURATION)
  }
}

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip)
}

/**
 * Get client IP from request
 */
export function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown'
}

// ============================================
// SECURITY MIDDLEWARE WRAPPER
// ============================================

interface SecurityOptions {
  rateLimit?: boolean
  sanitize?: boolean
  checkSqlInjection?: boolean
  skipPaths?: string[]
}

/**
 * Apply security checks to handler
 */
export function withSecurity(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: SecurityOptions = {}
): (req: NextRequest, ...args: any[]) => Promise<NextResponse> {
  const {
    rateLimit = true,
    sanitize = true,
    checkSqlInjection = true,
    skipPaths = [],
  } = options

  return async (req: NextRequest, ...args: any[]) => {
    const path = req.nextUrl.pathname
    
    // Skip security for certain paths
    if (skipPaths.some(p => path.startsWith(p))) {
      return handler(req, ...args)
    }

    const ip = getClientIP(req)

    // Check IP block
    if (isIPBlocked(ip)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Rate limiting
    if (rateLimit) {
      const { allowed, remaining } = await applyRateLimit(req)
      if (!allowed) {
        recordSuspiciousActivity(ip)
        const response = NextResponse.json(
          { success: false, error: 'Too many requests' },
          { status: 429 }
        )
        response.headers.set('X-RateLimit-Remaining', '0')
        return response
      }
    }

    // For POST/PATCH/PUT, validate body
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      try {
        const body = await req.clone().json()
        
        // SQL injection check
        if (checkSqlInjection && !validateNoSqlInjection(body)) {
          recordSuspiciousActivity(ip)
          return NextResponse.json(
            { success: false, error: 'Invalid input detected' },
            { status: 400 }
          )
        }

        // Suspicious patterns check
        const bodyStr = JSON.stringify(body)
        if (hasSuspiciousPatterns(bodyStr)) {
          recordSuspiciousActivity(ip)
          return NextResponse.json(
            { success: false, error: 'Invalid input detected' },
            { status: 400 }
          )
        }
      } catch {
        // Body is not JSON, continue
      }
    }

    // Execute handler
    const response = await handler(req, ...args)
    
    // Add security headers
    return addSecurityHeaders(response)
  }
}

// ============================================
// EXPORTS
// ============================================

const SecurityMiddleware = {
  applyRateLimit,
  sanitizeString,
  sanitizeObject,
  hasSqlInjection,
  validateNoSqlInjection,
  hasSuspiciousPatterns,
  addSecurityHeaders,
  recordSuspiciousActivity,
  isIPBlocked,
  getClientIP,
  withSecurity,
}

export default SecurityMiddleware
