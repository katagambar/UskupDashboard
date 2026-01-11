/**
 * Server-Sent Events (SSE) API for Real-time Updates
 * 
 * GET /api/realtime/stream - Subscribe to real-time notifications
 */

import { NextRequest } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { subscribe, unsubscribe, RealtimeNotification } from '@/lib/realtime'

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const clientId = `${user.id}_${Date.now()}`

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`)
      )

      // Subscribe to notifications
      const handleNotification = (notification: RealtimeNotification) => {
        try {
          const data = JSON.stringify(notification)
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch (error) {
          console.error('[SSE] Error sending notification:', error)
        }
      }

      subscribe(clientId, handleNotification)

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch (error) {
          clearInterval(heartbeatInterval)
          unsubscribe(clientId)
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval)
        unsubscribe(clientId)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
