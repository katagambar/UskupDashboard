/**
 * Google Calendar Status API
 * 
 * GET - Check if Google Calendar is configured and working
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { isConfigured, listEvents } from '@/lib/google-calendar'

// GET /api/google-calendar/status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    const configured = isConfigured()

    if (!configured) {
      return NextResponse.json({
        success: true,
        configured: false,
        message: 'Google Calendar belum dikonfigurasi',
        instructions: 'Set GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, dan GOOGLE_PRIVATE_KEY di environment variables',
      })
    }

    // Try to list events to verify connection
    try {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const events = await listEvents(now, nextWeek, 5)

      return NextResponse.json({
        success: true,
        configured: true,
        connected: true,
        message: 'Google Calendar terhubung',
        upcomingEvents: events.length,
      })
    } catch (error: any) {
      return NextResponse.json({
        success: true,
        configured: true,
        connected: false,
        message: 'Konfigurasi ada tapi koneksi gagal',
        error: error.message,
      })
    }

  } catch (error: any) {
    console.error('[API] Status check error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
