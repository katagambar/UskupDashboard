/**
 * Audit Logging System
 * 
 * Logs important activities for security and compliance
 */

import { prisma } from '@/lib/db'

// ============================================
// TYPES
// ============================================

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'ACCESS' 
  | 'SYNC'
  | 'SIGN'
  | 'APPROVE'
  | 'REJECT'

export type AuditResource = 
  | 'AGENDA' 
  | 'TASK' 
  | 'SURAT' 
  | 'ISSUE' 
  | 'REPORT' 
  | 'USER'
  | 'NOTULENSI'
  | 'GOOGLE_CALENDAR'

export interface AuditLogEntry {
  userId: string
  userName: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

// ============================================
// LOG FUNCTION
// ============================================

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    // Store in database
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        userName: entry.userName,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId || null,
        details: entry.details || null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        timestamp: new Date(),
      }
    })

    // Also log to console for debugging
    console.log(`[AUDIT] ${entry.userName} | ${entry.action} | ${entry.resource} | ${entry.resourceId || 'N/A'} | ${entry.details || ''}`)
  } catch (error) {
    // Don't fail the main operation if audit fails
    console.error('[AUDIT] Failed to log:', error)
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip') 
  return realIp || 'unknown'
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

// ============================================
// QUICK LOG FUNCTIONS
// ============================================

export async function logCreate(
  userId: string, 
  userName: string, 
  resource: AuditResource, 
  resourceId: string,
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    userName,
    action: 'CREATE',
    resource,
    resourceId,
    ipAddress: request ? getClientIp(request) : undefined,
    userAgent: request ? getUserAgent(request) : undefined,
  })
}

export async function logUpdate(
  userId: string, 
  userName: string, 
  resource: AuditResource, 
  resourceId: string,
  details?: string,
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    userName,
    action: 'UPDATE',
    resource,
    resourceId,
    details,
    ipAddress: request ? getClientIp(request) : undefined,
    userAgent: request ? getUserAgent(request) : undefined,
  })
}

export async function logDelete(
  userId: string, 
  userName: string, 
  resource: AuditResource, 
  resourceId: string,
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    userName,
    action: 'DELETE',
    resource,
    resourceId,
    ipAddress: request ? getClientIp(request) : undefined,
    userAgent: request ? getUserAgent(request) : undefined,
  })
}

export async function logLogin(
  userId: string, 
  userName: string, 
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    userName,
    action: 'LOGIN',
    resource: 'USER',
    resourceId: userId,
    ipAddress: request ? getClientIp(request) : undefined,
    userAgent: request ? getUserAgent(request) : undefined,
  })
}
