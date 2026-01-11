/**
 * API Version Manager
 * 
 * Handles API versioning for backward compatibility.
 * Supports: v1 (current), v2 (future)
 * 
 * Benefits:
 * - Non-breaking changes for existing clients
 * - Clear migration path for new features
 * - Date format changes in v2 without breaking v1
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================
// API VERSIONS
// ============================================

export const API_VERSIONS = {
  V1: 'v1',  // Current stable version
  V2: 'v2',  // Future version (with DateTime fields)
} as const

export type ApiVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS]

export const CURRENT_VERSION = API_VERSIONS.V1
export const SUPPORTED_VERSIONS: ApiVersion[] = [API_VERSIONS.V1]

// ============================================
// VERSION DETECTION
// ============================================

/**
 * Extract API version from request path
 * /api/v1/agenda → v1
 * /api/v2/agenda → v2
 * /api/agenda → v1 (default)
 */
export function getApiVersion(request: NextRequest): ApiVersion {
  const path = request.nextUrl.pathname
  
  // Check for explicit version in path
  const versionMatch = path.match(/\/api\/(v\d+)\//)
  if (versionMatch) {
    const version = versionMatch[1] as ApiVersion
    if (SUPPORTED_VERSIONS.includes(version)) {
      return version
    }
  }
  
  // Check for version in header
  const headerVersion = request.headers.get('X-API-Version') as ApiVersion
  if (headerVersion && SUPPORTED_VERSIONS.includes(headerVersion)) {
    return headerVersion
  }
  
  // Default to current version
  return CURRENT_VERSION
}

/**
 * Check if version is supported
 */
export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version as ApiVersion)
}

// ============================================
// RESPONSE HEADERS
// ============================================

/**
 * Add version headers to response
 */
export function addVersionHeaders(
  response: NextResponse, 
  version: ApiVersion
): NextResponse {
  response.headers.set('X-API-Version', version)
  response.headers.set('X-API-Supported-Versions', SUPPORTED_VERSIONS.join(', '))
  return response
}

// ============================================
// VERSION MIDDLEWARE HELPER
// ============================================

/**
 * Wrap handler with version checking
 */
export function withVersion<T>(
  handlers: Partial<Record<ApiVersion, () => Promise<T>>>,
  defaultHandler: () => Promise<T>
): (request: NextRequest) => Promise<T> {
  return async (request: NextRequest) => {
    const version = getApiVersion(request)
    const handler = handlers[version] || defaultHandler
    return handler()
  }
}

// ============================================
// VERSION-SPECIFIC TRANSFORMERS
// ============================================

/**
 * Transform data based on API version
 * Useful for changing date format between versions
 */
export interface VersionTransformer<T> {
  v1: (data: T) => T
  v2?: (data: T) => T
}

export function transformForVersion<T>(
  data: T, 
  version: ApiVersion, 
  transformer: VersionTransformer<T>
): T {
  const transform = transformer[version as keyof VersionTransformer<T>]
  if (typeof transform === 'function') {
    return transform(data)
  }
  return data
}

// ============================================
// DATE FORMAT TRANSFORMERS (for v2 migration)
// ============================================

/**
 * V1: Date as string "2026-01-09"
 * V2: Date as ISO string "2026-01-09T00:00:00.000Z"
 */
export const dateTransformers = {
  // Convert from internal format to API response format
  toResponse: (date: string | Date | null, version: ApiVersion): string | null => {
    if (!date) return null
    
    if (version === 'v1') {
      // V1: Return as YYYY-MM-DD string
      if (date instanceof Date) {
        return date.toISOString().split('T')[0]
      }
      return typeof date === 'string' ? date.split('T')[0] : String(date)
    }
    
    // V2: Return as full ISO string
    if (date instanceof Date) {
      return date.toISOString()
    }
    return new Date(date).toISOString()
  },
  
  // Convert from API request to internal format
  fromRequest: (date: string | null, version: ApiVersion): string | null => {
    if (!date) return null
    
    if (version === 'v1') {
      // V1: Expect YYYY-MM-DD, store as-is
      return date.split('T')[0]
    }
    
    // V2: Accept ISO string or date, normalize
    return new Date(date).toISOString()
  },
}

// ============================================
// DEPRECATION HELPERS
// ============================================

/**
 * Add deprecation warning headers
 */
export function markDeprecated(
  response: NextResponse,
  message: string,
  sunsetDate: string
): NextResponse {
  response.headers.set('Deprecation', 'true')
  response.headers.set('Sunset', sunsetDate)
  response.headers.set('X-Deprecation-Notice', message)
  return response
}

/**
 * Create deprecation notice for response body
 */
export function deprecationNotice(message: string, sunsetDate: string) {
  return {
    _deprecation: {
      message,
      sunsetDate,
    },
  }
}

// ============================================
// VERSION INFO ENDPOINT DATA
// ============================================

export function getVersionInfo() {
  return {
    current: CURRENT_VERSION,
    supported: SUPPORTED_VERSIONS,
    latest: SUPPORTED_VERSIONS[SUPPORTED_VERSIONS.length - 1],
    roadmap: {
      v1: {
        status: 'stable',
        features: ['String dates (YYYY-MM-DD)', 'Current API format'],
        deprecation: null,
      },
      v2: {
        status: 'planned',
        features: ['DateTime fields (ISO 8601)', 'Enhanced pagination'],
        expectedRelease: 'Q2 2026',
      },
    },
  }
}

// ============================================
// EXPORTS
// ============================================

const ApiVersionManager = {
  API_VERSIONS,
  CURRENT_VERSION,
  SUPPORTED_VERSIONS,
  getApiVersion,
  isVersionSupported,
  addVersionHeaders,
  withVersion,
  transformForVersion,
  dateTransformers,
  markDeprecated,
  deprecationNotice,
  getVersionInfo,
}

export default ApiVersionManager
