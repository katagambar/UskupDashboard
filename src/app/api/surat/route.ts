import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get all surat or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis')
    const status = searchParams.get('status')
    const prioritas = searchParams.get('prioritas')
    const search = searchParams.get('search')

    const where: any = {}

    if (jenis && jenis !== 'semua') {
      where.jenis = jenis
    }

    if (status && status !== 'semua') {
      where.status = status
    }

    if (prioritas && prioritas !== 'semua') {
      where.prioritas = prioritas
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { pengirim: { contains: search, mode: 'insensitive' } },
        { penerima: { contains: search, mode: 'insensitive' } }
      ]
    }

    const surat = await db.surat.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    return NextResponse.json({ success: true, data: surat })
  } catch (error) {
    console.error('Error fetching surat:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch surat' },
      { status: 500 }
    )
  }
}

// Create new surat
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nomor, jenis, judul, pengirim, penerima, tanggal, isi, prioritas } = body

    if (!nomor || !jenis || !judul || !pengirim || !penerima || !tanggal) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const surat = await db.surat.create({
      data: {
        nomor,
        jenis,
        judul,
        pengirim,
        penerima,
        tanggal,
        isi,
        prioritas,
        createdBy: user.id,
        status: 'Menunggu'
      }
    })

    return NextResponse.json({ success: true, data: surat }, { status: 201 })
  } catch (error) {
    console.error('Error creating surat:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create surat' },
      { status: 500 }
    )
  }
}
