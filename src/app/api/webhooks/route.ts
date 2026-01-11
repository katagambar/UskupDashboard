/**
 * Webhook Management API
 * 
 * POST /api/webhooks - Register new webhook
 * GET /api/webhooks - List all webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  registerWebhook, 
  listWebhooks,
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

const CreateWebhookSchema = z.object({
  url: z.string().url('URL tidak valid'),
  events: z.array(z.enum(VALID_EVENTS as [string, ...string[]])).min(1, 'Minimal 1 event'),
  metadata: z.record(z.any()).optional(),
})

// POST /api/webhooks - Register new webhook
export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin only' },
      { status: 401 }
    )
  }

  const body = await req.json()
  
  const result = CreateWebhookSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { url, events, metadata } = result.data
  
  const webhook = registerWebhook(url, events as WebhookEvent[], metadata)

  return NextResponse.json({
    success: true,
    data: {
      id: webhook.id,
      url: webhook.url,
      secret: webhook.secret, // Only shown on creation
      events: webhook.events,
      active: webhook.active,
      createdAt: webhook.createdAt,
    },
    message: 'Simpan secret ini! Secret hanya ditampilkan sekali.',
  }, { status: 201 })
}

// GET /api/webhooks - List all webhooks
export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin only' },
      { status: 401 }
    )
  }

  const webhooks = listWebhooks()

  return NextResponse.json({
    success: true,
    data: webhooks.map(w => ({
      id: w.id,
      url: w.url,
      events: w.events,
      active: w.active,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    })),
    count: webhooks.length,
  })
}
