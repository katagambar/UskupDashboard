/**
 * Google Calendar Sync API
 * 
 * POST - Sync agenda to Google Calendar
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import {
  isConfigured,
  createEvent,
  updateEvent,
  agendaToCalendarEvent,
} from '@/lib/google-calendar'

// POST /api/google-calendar/sync
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    // Check if Google Calendar is configured
    if (!isConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Google Calendar belum dikonfigurasi. Silakan set environment variables.' 
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { agendaId } = body

    if (!agendaId) {
      return NextResponse.json(
        { success: false, error: 'agendaId diperlukan' },
        { status: 400 }
      )
    }

    // Get agenda from database
    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
    })

    if (!agenda) {
      return NextResponse.json(
        { success: false, error: 'Agenda tidak ditemukan' },
        { status: 404 }
      )
    }

    // Convert to Google Calendar event
    const calendarEvent = agendaToCalendarEvent({
      judul: agenda.judul,
      tanggal: agenda.tanggal,
      tanggalAkhir: agenda.tanggalAkhir,
      waktu: agenda.waktu,
      waktuAkhir: agenda.waktuAkhir,
      lokasi: agenda.lokasi,
      jenis: agenda.jenis,
      deskripsi: agenda.deskripsi,
      peserta: agenda.peserta,
    })

    let result
    
    // Check if already synced (has googleCalendarId)
    if (agenda.googleCalendarId) {
      // Update existing event
      result = await updateEvent(agenda.googleCalendarId, calendarEvent)
    } else {
      // Create new event
      result = await createEvent(calendarEvent)
      
      // Save googleCalendarId to database
      if (result.success && result.googleEventId) {
        await prisma.agenda.update({
          where: { id: agendaId },
          data: { googleCalendarId: result.googleEventId },
        })
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: agenda.googleCalendarId 
        ? 'Agenda berhasil diperbarui di Google Calendar'
        : 'Agenda berhasil ditambahkan ke Google Calendar',
      googleEventId: result.googleEventId,
    })

  } catch (error: any) {
    console.error('[API] Google Calendar sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal sync ke Google Calendar' },
      { status: 500 }
    )
  }
}

// GET /api/google-calendar/sync - Bulk sync all agenda
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    if (!isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Google Calendar belum dikonfigurasi' },
        { status: 400 }
      )
    }

    // Get all agenda that haven't been synced
    const pendingAgenda = await prisma.agenda.findMany({
      where: {
        googleCalendarId: null,
        status: { not: 'Dibatalkan' },
      },
      orderBy: { tanggal: 'asc' },
    })

    let synced = 0
    let failed = 0
    const errors: string[] = []

    for (const agenda of pendingAgenda) {
      const calendarEvent = agendaToCalendarEvent({
        judul: agenda.judul,
        tanggal: agenda.tanggal,
        tanggalAkhir: agenda.tanggalAkhir,
        waktu: agenda.waktu,
        waktuAkhir: agenda.waktuAkhir,
        lokasi: agenda.lokasi,
        jenis: agenda.jenis,
        deskripsi: agenda.deskripsi,
        peserta: agenda.peserta,
      })

      const result = await createEvent(calendarEvent)

      if (result.success && result.googleEventId) {
        await prisma.agenda.update({
          where: { id: agenda.id },
          data: { googleCalendarId: result.googleEventId },
        })
        synced++
      } else {
        failed++
        errors.push(`${agenda.judul}: ${result.error}`)
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 100))
    }

    return NextResponse.json({
      success: true,
      message: `Sync selesai: ${synced} berhasil, ${failed} gagal`,
      synced,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error: any) {
    console.error('[API] Bulk sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
