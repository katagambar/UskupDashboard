/**
 * Webhook Detail API
 * 
 * GET /api/webhooks/[id] - Get webhook details
 * PATCH /api/webhooks/[id] - Update webhook
 * DELETE /api/webhooks/[id] - Delete webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  getWebhook, 
  updateWebhook, 
  deleteWebhook,
  regenerateSecret,
  getDeliveryHistory,
  WebhookEvent,
} from '@/lib/webhooks'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { z } from 'zod'

const VALID_EVENTS: WebhookEvent[] = [
  'agenda.created',
  'agenda.updated',
  'agenda.deleted',
  'surat.created',
  'surat.updated',
  'surat.deleted',
  'surat.approved',
  'task.created',
  'task.completed',
  'task.overdue',
  'notulensi.created',
  'user.created',
  'user.updated',
]

const UpdateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.enum(VALID_EVENTS as [string, ...string[]])).optional(),
  active: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  regenerateSecret: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/webhooks/[id]
export async function GET(req: NextRequest, ctx: RouteContext) {
  const user = await getCurrentUserFromRequest(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin only' },
      { status: 401 }
    )
  }

  const { id } = await ctx.params
  
  const webhook = getWebhook(id)
  if (!webhook) {
    return NextResponse.json(
      { success: false, error: 'Webhook tidak ditemukan' },
      { status: 404 }
    )
  }

  const deliveries = getDeliveryHistory(id, 20)

  return NextResponse.json({
    success: true,
    data: {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active,
      createdAt: webhook.createdAt,
      updatedAt: webhook.updatedAt,
      metadata: webhook.metadata,
      recentDeliveries: deliveries.map(d => ({
        id: d.id,
        event: d.event,
        success: d.success,
        statusCode: d.statusCode,
        attempts: d.attempts,
        createdAt: d.createdAt,
        deliveredAt: d.deliveredAt,
      })),
    },
  })
}

// PATCH /api/webhooks/[id]
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const user = await getCurrentUserFromRequest(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin only' },
      { status: 401 }
    )
  }

  const { id } = await ctx.params
  const body = await req.json()
  
  const result = UpdateWebhookSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const webhook = getWebhook(id)
  if (!webhook) {
    return NextResponse.json(
      { success: false, error: 'Webhook tidak ditemukan' },
      { status: 404 }
    )
  }

  // Regenerate secret if requested
  if (result.data.regenerateSecret) {
    const updated = regenerateSecret(id)
    if (updated) {
      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          secret: updated.secret,
          message: 'Secret baru! Simpan ini, tidak akan ditampilkan lagi.',
        },
      })
    }
  }

  // Update other fields
  const { url, events, active, metadata } = result.data
  const updated = updateWebhook(id, { 
    url, 
    events: events as WebhookEvent[], 
    active, 
    metadata 
  })

  if (!updated) {
    return NextResponse.json(
      { success: false, error: 'Gagal update webhook' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      url: updated.url,
      events: updated.events,
      active: updated.active,
      updatedAt: updated.updatedAt,
    },
  })
}

// DELETE /api/webhooks/[id]
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const user = await getCurrentUserFromRequest(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin only' },
      { status: 401 }
    )
  }

  const { id } = await ctx.params
  
  const deleted = deleteWebhook(id)
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Webhook tidak ditemukan' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Webhook berhasil dihapus',
  })
}
