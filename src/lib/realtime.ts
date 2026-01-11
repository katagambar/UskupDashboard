/**
 * Real-time Notification System
 * 
 * Broadcast notifications for agenda, task, and surat updates
 */

// ============================================
// TYPES
// ============================================

export type NotificationType = 
  | 'AGENDA_CREATED'
  | 'AGENDA_UPDATED'
  | 'AGENDA_DELETED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'SURAT_CREATED'
  | 'SURAT_SIGNED'
  | 'ISSUE_CREATED'
  | 'REPORT_SUBMITTED'
  | 'CALENDAR_SYNCED'

export interface RealtimeNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  resourceId?: string
  resourceType?: string
  userId: string
  userName: string
  timestamp: Date
}

// ============================================
// NOTIFICATION STORE (In-memory for SSE)
// ============================================

const subscribers: Map<string, (notification: RealtimeNotification) => void> = new Map()
let notificationId = 0

// ============================================
// PUBLISH NOTIFICATION
// ============================================

export function publishNotification(notification: Omit<RealtimeNotification, 'id' | 'timestamp'>): void {
  const fullNotification: RealtimeNotification = {
    ...notification,
    id: `notif_${++notificationId}_${Date.now()}`,
    timestamp: new Date(),
  }

  console.log(`[Realtime] Publishing: ${fullNotification.type} - ${fullNotification.title}`)

  // Broadcast to all subscribers
  subscribers.forEach((callback) => {
    try {
      callback(fullNotification)
    } catch (error) {
      console.error('[Realtime] Error broadcasting:', error)
    }
  })
}

// ============================================
// SUBSCRIBE / UNSUBSCRIBE
// ============================================

export function subscribe(
  clientId: string, 
  callback: (notification: RealtimeNotification) => void
): void {
  subscribers.set(clientId, callback)
  console.log(`[Realtime] Client subscribed: ${clientId} (total: ${subscribers.size})`)
}

export function unsubscribe(clientId: string): void {
  subscribers.delete(clientId)
  console.log(`[Realtime] Client unsubscribed: ${clientId} (total: ${subscribers.size})`)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function notifyAgendaCreated(
  agendaId: string, 
  title: string, 
  userId: string, 
  userName: string
): void {
  publishNotification({
    type: 'AGENDA_CREATED',
    title: 'Agenda Baru',
    message: `${userName} membuat agenda: ${title}`,
    resourceId: agendaId,
    resourceType: 'AGENDA',
    userId,
    userName,
  })
}

export function notifyTaskCompleted(
  taskId: string, 
  title: string, 
  userId: string, 
  userName: string
): void {
  publishNotification({
    type: 'TASK_COMPLETED',
    title: 'Tugas Selesai',
    message: `${userName} menyelesaikan tugas: ${title}`,
    resourceId: taskId,
    resourceType: 'TASK',
    userId,
    userName,
  })
}

export function notifySuratSigned(
  suratId: string, 
  nomor: string, 
  userId: string, 
  userName: string
): void {
  publishNotification({
    type: 'SURAT_SIGNED',
    title: 'Surat Ditandatangani',
    message: `${userName} menandatangani surat: ${nomor}`,
    resourceId: suratId,
    resourceType: 'SURAT',
    userId,
    userName,
  })
}

export function notifyCalendarSynced(
  count: number, 
  userId: string, 
  userName: string
): void {
  publishNotification({
    type: 'CALENDAR_SYNCED',
    title: 'Kalender Disinkronkan',
    message: `${userName} sinkronisasi ${count} agenda ke Google Calendar`,
    userId,
    userName,
  })
}
