import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get all decisions or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const kategori = searchParams.get('kategori')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'semua') {
      where.status = status
    }

    if (kategori && kategori !== 'semua') {
      where.kategori = kategori
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ]
    }

    const decisions = await db.decision.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { targetDate: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, data: decisions })
  } catch (error) {
    console.error('Error fetching decisions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch decisions' },
      { status: 500 }
    )
  }
}

// Create new decision
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
    const { judul, deskripsi, targetDate, kategori, penanggungJawab } = body

    if (!judul || !deskripsi || !targetDate || !kategori || !penanggungJawab) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const decision = await db.decision.create({
      data: {
        judul,
        deskripsi,
        targetDate,
        kategori,
        penanggungJawab,
        createdBy: user.id,
        status: 'Dalam Perencanaan',
        progress: 0
      }
    })

    return NextResponse.json({ success: true, data: decision }, { status: 201 })
  } catch (error) {
    console.error('Error creating decision:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create decision' },
      { status: 500 }
    )
  }
}
