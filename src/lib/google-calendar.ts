/**
 * Google Calendar Service
 * 
 * Handles integration with Google Calendar using Service Account
 */

import { google, calendar_v3 } from 'googleapis'

// ============================================
// TYPES
// ============================================

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  colorId?: string
}

export interface SyncResult {
  success: boolean
  googleEventId?: string
  error?: string
}

// ============================================
// CONFIGURATION
// ============================================

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
const TIMEZONE = 'Asia/Jakarta'

// Color mapping for agenda types
const COLOR_MAP: Record<string, string> = {
  'Misa': '11',        // Red
  'Rapat': '9',        // Blue
  'Audiensi': '10',    // Green
  'Kunjungan': '6',    // Orange
  'Lainnya': '8',      // Gray
}

// ============================================
// AUTH
// ============================================

function getAuth() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Calendar credentials not configured')
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
}

function getCalendar() {
  const auth = getAuth()
  return google.calendar({ version: 'v3', auth })
}

// ============================================
// CHECK CONFIGURATION
// ============================================

export function isConfigured(): boolean {
  return !!(CALENDAR_ID && SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY)
}

// ============================================
// CREATE EVENT
// ============================================

export async function createEvent(event: CalendarEvent): Promise<SyncResult> {
  if (!isConfigured()) {
    return { success: false, error: 'Google Calendar not configured' }
  }

  try {
    const calendar = getCalendar()
    
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start.dateTime,
          date: event.start.date,
          timeZone: event.start.timeZone || TIMEZONE,
        },
        end: {
          dateTime: event.end.dateTime,
          date: event.end.date,
          timeZone: event.end.timeZone || TIMEZONE,
        },
        colorId: event.colorId,
      },
    })

    console.log(`[GoogleCalendar] Created event: ${response.data.id}`)
    
    return {
      success: true,
      googleEventId: response.data.id || undefined,
    }
  } catch (error: any) {
    console.error('[GoogleCalendar] Create error:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// UPDATE EVENT
// ============================================

export async function updateEvent(
  googleEventId: string,
  event: CalendarEvent
): Promise<SyncResult> {
  if (!isConfigured()) {
    return { success: false, error: 'Google Calendar not configured' }
  }

  try {
    const calendar = getCalendar()
    
    await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start.dateTime,
          date: event.start.date,
          timeZone: event.start.timeZone || TIMEZONE,
        },
        end: {
          dateTime: event.end.dateTime,
          date: event.end.date,
          timeZone: event.end.timeZone || TIMEZONE,
        },
        colorId: event.colorId,
      },
    })

    console.log(`[GoogleCalendar] Updated event: ${googleEventId}`)
    
    return {
      success: true,
      googleEventId,
    }
  } catch (error: any) {
    console.error('[GoogleCalendar] Update error:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// DELETE EVENT
// ============================================

export async function deleteEvent(googleEventId: string): Promise<SyncResult> {
  if (!isConfigured()) {
    return { success: false, error: 'Google Calendar not configured' }
  }

  try {
    const calendar = getCalendar()
    
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
    })

    console.log(`[GoogleCalendar] Deleted event: ${googleEventId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error('[GoogleCalendar] Delete error:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// LIST EVENTS
// ============================================

export async function listEvents(
  timeMin?: Date,
  timeMax?: Date,
  maxResults: number = 100
): Promise<calendar_v3.Schema$Event[]> {
  if (!isConfigured()) {
    return []
  }

  try {
    const calendar = getCalendar()
    
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin?.toISOString(),
      timeMax: timeMax?.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []
  } catch (error: any) {
    console.error('[GoogleCalendar] List error:', error.message)
    return []
  }
}

// ============================================
// HELPER: Convert Agenda to Calendar Event
// ============================================

export function agendaToCalendarEvent(agenda: {
  judul: string
  tanggal: string
  tanggalAkhir?: string | null
  waktu: string
  waktuAkhir?: string | null
  lokasi: string
  jenis: string
  deskripsi?: string | null
  peserta?: string
}): CalendarEvent {
  const startDateTime = `${agenda.tanggal}T${agenda.waktu}:00`
  
  // Determine end date/time
  let endDateTime: string
  if (agenda.tanggalAkhir && agenda.waktuAkhir) {
    endDateTime = `${agenda.tanggalAkhir}T${agenda.waktuAkhir}:00`
  } else if (agenda.waktuAkhir) {
    endDateTime = `${agenda.tanggal}T${agenda.waktuAkhir}:00`
  } else {
    // Default to 1 hour after start
    const start = new Date(startDateTime)
    start.setHours(start.getHours() + 1)
    endDateTime = start.toISOString().split('.')[0]
  }

  const description = [
    agenda.deskripsi,
    agenda.peserta ? `\n\nPeserta: ${agenda.peserta}` : '',
  ].filter(Boolean).join('')

  return {
    summary: `[${agenda.jenis}] ${agenda.judul}`,
    description,
    location: agenda.lokasi,
    start: {
      dateTime: startDateTime,
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: endDateTime,
      timeZone: TIMEZONE,
    },
    colorId: COLOR_MAP[agenda.jenis] || COLOR_MAP['Lainnya'],
  }
}
