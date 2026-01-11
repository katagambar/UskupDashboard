'use client'

/**
 * React Hook for Real-time Updates
 * 
 * Connects to SSE endpoint and provides real-time notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export interface RealtimeNotification {
  id: string
  type: string
  title: string
  message: string
  resourceId?: string
  resourceType?: string
  userId: string
  userName: string
  timestamp: string
}

interface UseRealtimeOptions {
  showToasts?: boolean
  autoReconnect?: boolean
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { showToasts = true, autoReconnect = true } = options
  
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [lastNotification, setLastNotification] = useState<RealtimeNotification | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource('/api/realtime/stream')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('[Realtime] Connected to SSE')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'connected') {
          console.log('[Realtime] Client ID:', data.clientId)
          return
        }

        const notification = data as RealtimeNotification
        
        setNotifications((prev) => [notification, ...prev.slice(0, 49)])
        setLastNotification(notification)

        // Show toast notification
        if (showToasts) {
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
          })
        }

      } catch (error) {
        console.error('[Realtime] Error parsing message:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      eventSource.close()
      
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[Realtime] Reconnecting...')
          connect()
        }, 5000)
      }
    }
  }, [showToasts, autoReconnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setLastNotification(null)
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    isConnected,
    notifications,
    lastNotification,
    clearNotifications,
    reconnect: connect,
    disconnect,
  }
}

export default useRealtime
