/**
 * Pagination Utility
 * 
 * Standard pagination for all list API endpoints.
 */

import { NextRequest } from 'next/server'

// ============================================
// TYPES
// ============================================

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}

// ============================================
// DEFAULTS
// ============================================

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

// ============================================
// FUNCTIONS
// ============================================

/**
 * Parse pagination parameters from request URL
 */
export function parsePaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)
  
  let page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE))
  let limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))
  
  // Validate and clamp values
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT
  if (limit > MAX_LIMIT) limit = MAX_LIMIT
  
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

/**
 * Create pagination meta information
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    meta: createPaginationMeta(total, params.page, params.limit),
  }
}

/**
 * Apply pagination to Prisma query options
 */
export function getPrismaPageOptions(params: PaginationParams) {
  return {
    skip: params.skip,
    take: params.limit,
  }
}
