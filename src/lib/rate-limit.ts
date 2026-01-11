/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API endpoints.
 * For production with multiple instances, use Redis-based solution.
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================
// TYPES
// ============================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitConfig {
  limit: number          // Max requests
  windowMs: number       // Time window in milliseconds
}

// ============================================
// DEFAULTS
// ============================================

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  limit: 100,           // 100 requests
  windowMs: 60 * 1000,  // per minute
}

export const STRICT_RATE_LIMIT: RateLimitConfig = {
  limit: 20,
  windowMs: 60 * 1000,
}

export const RELAXED_RATE_LIMIT: RateLimitConfig = {
  limit: 200,
  windowMs: 60 * 1000,
}

// ============================================
// STORAGE (In-Memory - resets on server restart)
// ============================================

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// ============================================
// FUNCTIONS
// ============================================

/**
 * Get client identifier (IP or user ID)
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return ip
}

/**
 * Check rate limit for a request
 * @returns { allowed: true } or { allowed: false, retryAfter }
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: true } | { allowed: false; retryAfter: number; remaining: number } {
  const clientId = getClientId(request)
  const now = Date.now()
  const key = `${clientId}:${request.nextUrl.pathname}`
  
  let entry = rateLimitStore.get(key)
  
  // Create new entry if doesn't exist or has expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
  }
  
  entry.count++
  
  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return {
      allowed: false,
      retryAfter,
      remaining: 0,
    }
  }
  
  return { allowed: true }
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Record<string, string> {
  const clientId = getClientId(request)
  const key = `${clientId}:${request.nextUrl.pathname}`
  const entry = rateLimitStore.get(key)
  
  const remaining = entry ? Math.max(0, config.limit - entry.count) : config.limit
  const reset = entry ? Math.ceil(entry.resetAt / 1000) : Math.ceil((Date.now() + config.windowMs) / 1000)
  
  return {
    'X-RateLimit-Limit': String(config.limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(reset),
  }
}

/**
 * Create a 429 Too Many Requests response
 */
export function rateLimitExceededResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
      },
    }
  )
}

/**
 * Middleware-style rate limit check
 * Returns null if allowed, or error response if blocked
 */
export function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): NextResponse | null {
  const result = checkRateLimit(request, config)
  
  if (!result.allowed) {
    return rateLimitExceededResponse(result.retryAfter)
  }
  
  return null
}
