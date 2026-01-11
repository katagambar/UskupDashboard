/**
 * Redis Caching Service
 * 
 * High-performance caching layer using Redis.
 * Provides cache helpers for API responses, sessions, and rate limiting.
 */

import Redis from 'ioredis'

// ============================================
// REDIS CLIENT CONFIGURATION
// ============================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Create Redis client (singleton pattern)
let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: true,
    })

    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
    })

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully')
    })
  }
  return redisClient
}

// ============================================
// CACHE HELPERS
// ============================================

/**
 * Default cache TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,         // 1 hour
  DAY: 86400,         // 24 hours
  WEEK: 604800,       // 7 days
} as const

/**
 * Set a value in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<void> {
  try {
    const redis = getRedisClient()
    const serialized = JSON.stringify(value)
    await redis.setex(key, ttlSeconds, serialized)
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error)
  }
}

/**
 * Get a value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient()
    const value = await redis.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error)
    return null
  }
}

/**
 * Delete a key from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.del(key)
  } catch (error) {
    console.error(`[Cache] Error deleting key ${key}:`, error)
  }
}

/**
 * Delete keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedisClient()
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, error)
  }
}

/**
 * Check if key exists in cache
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const exists = await redis.exists(key)
    return exists === 1
  } catch (error) {
    console.error(`[Cache] Error checking key ${key}:`, error)
    return false
  }
}

// ============================================
// CACHE KEY GENERATORS
// ============================================

export const CacheKeys = {
  // API Response Cache
  agenda: (id: string) => `agenda:${id}`,
  agendaList: (userId: string, page: number) => `agenda:list:${userId}:${page}`,
  
  task: (id: string) => `task:${id}`,
  taskList: (userId: string, page: number) => `task:list:${userId}:${page}`,
  
  surat: (id: string) => `surat:${id}`,
  suratList: (userId: string, page: number) => `surat:list:${userId}:${page}`,
  
  user: (id: string) => `user:${id}`,
  userList: (page: number) => `user:list:${page}`,
  
  // Statistics
  dashboardStats: (userId: string) => `stats:dashboard:${userId}`,
  analytics: (period: string) => `stats:analytics:${period}`,
  
  // Session
  session: (token: string) => `session:${token}`,
  
  // Rate Limiting
  rateLimit: (ip: string, endpoint: string) => `rate:${ip}:${endpoint}`,
  
  // Calendar
  liturgicalCalendar: (year: number) => `calendar:liturgical:${year}`,
}

// ============================================
// CACHE-ASIDE PATTERN HELPER
// ============================================

/**
 * Get cached value or fetch and cache
 * Implements the cache-aside pattern
 */
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetchFn()
  
  // Store in cache
  await setCache(key, data, ttlSeconds)
  
  return data
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

/**
 * Rate limiting using Redis
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  try {
    const redis = getRedisClient()
    const key = `ratelimit:${identifier}`
    
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }
    
    const ttl = await redis.ttl(key)
    const remaining = Math.max(0, maxRequests - current)
    
    return {
      allowed: current <= maxRequests,
      remaining,
      resetIn: ttl,
    }
  } catch (error) {
    console.error('[RateLimit] Error:', error)
    // Fail open - allow request if Redis fails
    return { allowed: true, remaining: maxRequests, resetIn: 0 }
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export interface SessionData {
  userId: string
  email: string
  role: string
  createdAt: number
  expiresAt: number
}

/**
 * Store session in Redis
 */
export async function storeSession(
  token: string,
  session: SessionData,
  ttlSeconds: number = 86400 // 24 hours
): Promise<void> {
  const key = CacheKeys.session(token)
  await setCache(key, session, ttlSeconds)
}

/**
 * Get session from Redis
 */
export async function getSession(token: string): Promise<SessionData | null> {
  const key = CacheKeys.session(token)
  return await getCache<SessionData>(key)
}

/**
 * Delete session from Redis
 */
export async function deleteSession(token: string): Promise<void> {
  const key = CacheKeys.session(token)
  await deleteCache(key)
}

// ============================================
// CACHE INVALIDATION
// ============================================

/**
 * Invalidate all cache for a specific entity
 */
export async function invalidateEntity(entity: 'agenda' | 'task' | 'surat' | 'user'): Promise<void> {
  await deleteCachePattern(`${entity}:*`)
}

/**
 * Invalidate all cache for a specific user
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await deleteCachePattern(`*:${userId}:*`)
  await deleteCachePattern(`stats:dashboard:${userId}`)
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check Redis connection health
 */
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const pong = await redis.ping()
    return pong === 'PONG'
  } catch {
    return false
  }
}

/**
 * Get Redis connection info
 */
export async function getRedisInfo(): Promise<{
  connected: boolean
  memory?: string
  clients?: number
}> {
  try {
    const redis = getRedisClient()
    const info = await redis.info('memory')
    const clients = await redis.info('clients')
    
    const memoryMatch = info.match(/used_memory_human:(\S+)/)
    const clientsMatch = clients.match(/connected_clients:(\d+)/)
    
    return {
      connected: true,
      memory: memoryMatch?.[1],
      clients: clientsMatch ? parseInt(clientsMatch[1]) : undefined,
    }
  } catch {
    return { connected: false }
  }
}

// ============================================
// CLEANUP
// ============================================

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

export default {
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  hasCache,
  cacheAside,
  checkRateLimit,
  storeSession,
  getSession,
  deleteSession,
  invalidateEntity,
  invalidateUserCache,
  isRedisHealthy,
  getRedisInfo,
  closeRedis,
  CacheTTL,
  CacheKeys,
}
