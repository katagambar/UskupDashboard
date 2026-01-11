/**
 * Push Notification Service
 * 
 * Web Push notifications using VAPID.
 * 
 * Setup:
 * 1. Generate VAPID keys (run generateVAPIDKeys() once)
 * 2. Add keys to .env
 * 3. Subscribe users via service worker
 * 4. Send notifications from server
 */

// ============================================
// VAPID KEY GENERATION
// ============================================

/**
 * Generate VAPID keys for push notifications
 * Run once and save to .env
 */
export async function generateVAPIDKeys(): Promise<{
  publicKey: string
  privateKey: string
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  )

  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey)
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

  const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return { publicKey, privateKey }
}

// ============================================
// SUBSCRIPTION STORAGE
// ============================================

interface PushSubscription {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: Date
  userAgent?: string
}

// In-memory subscription storage
// In production, store in database
const subscriptions = new Map<string, PushSubscription[]>()

/**
 * Save push subscription for a user
 */
export function saveSubscription(
  userId: string,
  subscription: {
    endpoint: string
    keys: { p256dh: string; auth: string }
  },
  userAgent?: string
): void {
  const userSubs = subscriptions.get(userId) || []
  
  // Check if already subscribed
  const existing = userSubs.find(s => s.endpoint === subscription.endpoint)
  if (existing) {
    return
  }
  
  userSubs.push({
    userId,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    createdAt: new Date(),
    userAgent,
  })
  
  subscriptions.set(userId, userSubs)
  console.log(`[Push] Subscription saved for user ${userId}. Total: ${userSubs.length}`)
}

/**
 * Remove subscription
 */
export function removeSubscription(userId: string, endpoint: string): boolean {
  const userSubs = subscriptions.get(userId) || []
  const filtered = userSubs.filter(s => s.endpoint !== endpoint)
  
  if (filtered.length === userSubs.length) {
    return false
  }
  
  subscriptions.set(userId, filtered)
  return true
}

/**
 * Get all subscriptions for a user
 */
export function getUserSubscriptions(userId: string): PushSubscription[] {
  return subscriptions.get(userId) || []
}

/**
 * Get all subscriptions (for broadcast)
 */
export function getAllSubscriptions(): PushSubscription[] {
  const all: PushSubscription[] = []
  for (const subs of subscriptions.values()) {
    all.push(...subs)
  }
  return all
}

// ============================================
// NOTIFICATION SENDING
// ============================================

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: Array<{ action: string; title: string }>
}

/**
 * Send push notification to a specific user
 * Note: Full web-push implementation requires the web-push npm package
 * This is a simplified version for structure
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  const userSubs = getUserSubscriptions(userId)
  
  if (userSubs.length === 0) {
    console.log(`[Push] No subscriptions for user ${userId}`)
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const sub of userSubs) {
    try {
      // In production, use web-push library:
      // await webpush.sendNotification(sub, JSON.stringify(payload))
      
      console.log(`[Push] Would send to ${sub.endpoint.substring(0, 50)}...`)
      console.log(`[Push] Payload: ${JSON.stringify(payload)}`)
      
      sent++
    } catch (error) {
      console.error(`[Push] Failed to send:`, error)
      failed++
    }
  }

  return { sent, failed }
}

/**
 * Broadcast notification to all users
 */
export async function broadcastNotification(
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  const allSubs = getAllSubscriptions()
  
  let sent = 0
  let failed = 0

  for (const sub of allSubs) {
    try {
      console.log(`[Push] Broadcast to user ${sub.userId}`)
      sent++
    } catch {
      failed++
    }
  }

  return { sent, failed }
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

export const NOTIFICATION_TEMPLATES = {
  AGENDA_REMINDER: (title: string, time: string) => ({
    title: '📅 Pengingat Agenda',
    body: `${title} - ${time}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'agenda-reminder',
  }),

  TASK_ASSIGNED: (taskTitle: string) => ({
    title: '📋 Tugas Baru',
    body: `Anda ditugaskan: ${taskTitle}`,
    icon: '/icons/icon-192x192.png',
    tag: 'task-assigned',
  }),

  SURAT_SIGNED: (nomorSurat: string) => ({
    title: '✅ Surat Ditandatangani',
    body: `Surat ${nomorSurat} telah ditandatangani`,
    icon: '/icons/icon-192x192.png',
    tag: 'surat-signed',
  }),

  ISSUE_RESOLVED: (issueTitle: string) => ({
    title: '✔️ Isu Diselesaikan',
    body: `${issueTitle} telah diselesaikan`,
    icon: '/icons/icon-192x192.png',
    tag: 'issue-resolved',
  }),

  GENERAL: (title: string, body: string) => ({
    title,
    body,
    icon: '/icons/icon-192x192.png',
  }),
}

// ============================================
// ENV CHECK
// ============================================

export function getVAPIDPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null
}

export function hasVAPIDKeys(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}
