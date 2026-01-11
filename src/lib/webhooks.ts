/**
 * Webhook System
 * 
 * Send event notifications to external systems.
 * Supports retry logic, signature verification, and event filtering.
 * 
 * Use cases:
 * - Notify external systems when surat is created/updated
 * - Trigger workflows when agenda changes
 * - Sync data with third-party services
 */

import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// ============================================
// TYPES
// ============================================

export type WebhookEvent = 
  | 'agenda.created'
  | 'agenda.updated'
  | 'agenda.deleted'
  | 'surat.created'
  | 'surat.updated'
  | 'surat.deleted'
  | 'surat.approved'
  | 'task.created'
  | 'task.completed'
  | 'task.overdue'
  | 'notulensi.created'
  | 'user.created'
  | 'user.updated'

export interface WebhookConfig {
  id: string
  url: string
  secret: string
  events: WebhookEvent[]
  active: boolean
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface WebhookPayload {
  id: string
  event: WebhookEvent
  timestamp: string
  data: Record<string, any>
  signature?: string
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: Record<string, any>
  statusCode: number | null
  response: string | null
  success: boolean
  attempts: number
  createdAt: Date
  deliveredAt: Date | null
}

// ============================================
// SIGNATURE GENERATION
// ============================================

/**
 * Generate HMAC signature for webhook payload
 */
export function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  const expected = generateSignature(payload, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

// ============================================
// WEBHOOK STORAGE (In-Memory for now)
// TODO: Move to database table
// ============================================

const webhooks: Map<string, WebhookConfig> = new Map()
const deliveries: WebhookDelivery[] = []

/**
 * Register a new webhook
 */
export function registerWebhook(
  url: string,
  events: WebhookEvent[],
  metadata?: Record<string, any>
): WebhookConfig {
  const webhook: WebhookConfig = {
    id: crypto.randomUUID(),
    url,
    secret: crypto.randomBytes(32).toString('hex'),
    events,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata,
  }
  
  webhooks.set(webhook.id, webhook)
  return webhook
}

/**
 * Get webhook by ID
 */
export function getWebhook(id: string): WebhookConfig | undefined {
  return webhooks.get(id)
}

/**
 * List all webhooks
 */
export function listWebhooks(): WebhookConfig[] {
  return Array.from(webhooks.values())
}

/**
 * Update webhook
 */
export function updateWebhook(
  id: string,
  updates: Partial<Pick<WebhookConfig, 'url' | 'events' | 'active' | 'metadata'>>
): WebhookConfig | null {
  const webhook = webhooks.get(id)
  if (!webhook) return null
  
  const updated = {
    ...webhook,
    ...updates,
    updatedAt: new Date(),
  }
  
  webhooks.set(id, updated)
  return updated
}

/**
 * Delete webhook
 */
export function deleteWebhook(id: string): boolean {
  return webhooks.delete(id)
}

/**
 * Regenerate webhook secret
 */
export function regenerateSecret(id: string): WebhookConfig | null {
  const webhook = webhooks.get(id)
  if (!webhook) return null
  
  const updated = {
    ...webhook,
    secret: crypto.randomBytes(32).toString('hex'),
    updatedAt: new Date(),
  }
  
  webhooks.set(id, updated)
  return updated
}

// ============================================
// WEBHOOK DELIVERY
// ============================================

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 5000, 30000] // 1s, 5s, 30s

/**
 * Send webhook to a specific endpoint
 */
async function sendWebhook(
  webhook: WebhookConfig,
  payload: WebhookPayload
): Promise<WebhookDelivery> {
  const delivery: WebhookDelivery = {
    id: crypto.randomUUID(),
    webhookId: webhook.id,
    event: payload.event,
    payload: payload as unknown as Record<string, any>,
    statusCode: null,
    response: null,
    success: false,
    attempts: 0,
    createdAt: new Date(),
    deliveredAt: null,
  }

  const payloadString = JSON.stringify(payload)
  const signature = generateSignature(payloadString, webhook.secret)

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    delivery.attempts++
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Id': payload.id,
          'X-Webhook-Timestamp': payload.timestamp,
        },
        body: payloadString,
        signal: AbortSignal.timeout(10000), // 10s timeout
      })

      delivery.statusCode = response.status
      delivery.response = await response.text().catch(() => null)
      
      if (response.ok) {
        delivery.success = true
        delivery.deliveredAt = new Date()
        break
      }
      
      // 4xx errors - don't retry
      if (response.status >= 400 && response.status < 500) {
        break
      }
      
    } catch (error: any) {
      delivery.response = error.message
    }
    
    // Wait before retry
    if (attempt < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]))
    }
  }

  deliveries.push(delivery)
  return delivery
}

/**
 * Trigger webhook event to all subscribed endpoints
 */
export async function triggerEvent(
  event: WebhookEvent,
  data: Record<string, any>
): Promise<WebhookDelivery[]> {
  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    event,
    timestamp: new Date().toISOString(),
    data,
  }

  const subscribedWebhooks = Array.from(webhooks.values())
    .filter(w => w.active && w.events.includes(event))

  const results = await Promise.all(
    subscribedWebhooks.map(webhook => sendWebhook(webhook, payload))
  )

  return results
}

// ============================================
// DELIVERY HISTORY
// ============================================

/**
 * Get delivery history for a webhook
 */
export function getDeliveryHistory(
  webhookId: string,
  limit: number = 50
): WebhookDelivery[] {
  return deliveries
    .filter(d => d.webhookId === webhookId)
    .slice(-limit)
    .reverse()
}

/**
 * Get recent deliveries across all webhooks
 */
export function getRecentDeliveries(limit: number = 100): WebhookDelivery[] {
  return deliveries.slice(-limit).reverse()
}

/**
 * Retry a failed delivery
 */
export async function retryDelivery(deliveryId: string): Promise<WebhookDelivery | null> {
  const delivery = deliveries.find(d => d.id === deliveryId)
  if (!delivery || delivery.success) return null

  const webhook = webhooks.get(delivery.webhookId)
  if (!webhook) return null

  const payload = delivery.payload as unknown as WebhookPayload
  return sendWebhook(webhook, payload)
}

// ============================================
// EVENT HELPERS
// ============================================

/**
 * Helper to trigger agenda events
 */
export const agendaEvents = {
  created: (agenda: any) => triggerEvent('agenda.created', agenda),
  updated: (agenda: any) => triggerEvent('agenda.updated', agenda),
  deleted: (agendaId: string) => triggerEvent('agenda.deleted', { id: agendaId }),
}

/**
 * Helper to trigger surat events
 */
export const suratEvents = {
  created: (surat: any) => triggerEvent('surat.created', surat),
  updated: (surat: any) => triggerEvent('surat.updated', surat),
  deleted: (suratId: string) => triggerEvent('surat.deleted', { id: suratId }),
  approved: (surat: any) => triggerEvent('surat.approved', surat),
}

/**
 * Helper to trigger task events
 */
export const taskEvents = {
  created: (task: any) => triggerEvent('task.created', task),
  completed: (task: any) => triggerEvent('task.completed', task),
  overdue: (task: any) => triggerEvent('task.overdue', task),
}

// ============================================
// EXPORTS
// ============================================

const WebhookService = {
  // Registration
  registerWebhook,
  getWebhook,
  listWebhooks,
  updateWebhook,
  deleteWebhook,
  regenerateSecret,
  
  // Events
  triggerEvent,
  agendaEvents,
  suratEvents,
  taskEvents,
  
  // Delivery
  getDeliveryHistory,
  getRecentDeliveries,
  retryDelivery,
  
  // Utilities
  generateSignature,
  verifySignature,
}

export default WebhookService
