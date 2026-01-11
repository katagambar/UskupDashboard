import { NextRequest } from 'next/server'
import { 
  sendPushNotification, 
  broadcastNotification,
  NOTIFICATION_TEMPLATES,
} from '@/lib/push-notifications'
import { withRBAC, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

/**
 * POST /api/push/send
 * 
 * Send push notification (admin only)
 * 
 * Body:
 * - userId: string (optional, for targeted notification)
 * - broadcast: boolean (optional, for all users)
 * - title: string
 * - body: string
 * - template: string (optional, use predefined template)
 * - templateData: object (optional, data for template)
 */
export const POST = withRBAC(['USKUP', 'SEKRETARIS', 'VIKJEN'], async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { 
      userId, 
      broadcast, 
      title, 
      body: notificationBody, 
      template,
      templateData,
    } = body

    let payload: { title: string; body: string; icon?: string; tag?: string }

    // Use template if specified
    if (template) {
      switch (template) {
        case 'AGENDA_REMINDER':
          payload = NOTIFICATION_TEMPLATES.AGENDA_REMINDER(
            templateData?.title || 'Agenda',
            templateData?.time || ''
          )
          break
        case 'TASK_ASSIGNED':
          payload = NOTIFICATION_TEMPLATES.TASK_ASSIGNED(
            templateData?.taskTitle || 'Tugas baru'
          )
          break
        case 'SURAT_SIGNED':
          payload = NOTIFICATION_TEMPLATES.SURAT_SIGNED(
            templateData?.nomorSurat || ''
          )
          break
        case 'ISSUE_RESOLVED':
          payload = NOTIFICATION_TEMPLATES.ISSUE_RESOLVED(
            templateData?.issueTitle || ''
          )
          break
        default:
          payload = NOTIFICATION_TEMPLATES.GENERAL(
            title || 'Notifikasi',
            notificationBody || ''
          )
      }
    } else {
      if (!title || !notificationBody) {
        return errorResponse('Title and body required')
      }
      payload = NOTIFICATION_TEMPLATES.GENERAL(title, notificationBody)
    }

    // Broadcast to all users
    if (broadcast) {
      const result = await broadcastNotification(payload)
      return successResponse({
        message: `Broadcast sent: ${result.sent} success, ${result.failed} failed`,
        ...result,
      })
    }

    // Send to specific user
    if (userId) {
      const result = await sendPushNotification(userId, payload)
      return successResponse({
        message: `Notification sent: ${result.sent} success, ${result.failed} failed`,
        ...result,
      })
    }

    return errorResponse('userId or broadcast flag required')

  } catch (error) {
    console.error('Send notification error:', error)
    return serverErrorResponse('Failed to send notification')
  }
})
