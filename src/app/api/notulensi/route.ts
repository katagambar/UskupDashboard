import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get all notulensi or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (jenis && jenis !== 'semua') {
      where.jenis = jenis
    }

    if (status && status !== 'semua') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { jenis: { contains: search, mode: 'insensitive' } }
      ]
    }

    const notulensi = await db.notulensi.findMany({
      where,
      include: {
        creator: {
          select: { name: true, email: true }
        },
        agenda: {
          select: { judul: true, tanggal: true }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    return successResponse(notulensi)
  } catch (error) {
    console.error('Error fetching notulensi:', error)
    return serverErrorResponse('Failed to fetch notulensi')
  }
}

// Create new notulensi - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { judul, tanggal, jenis, peserta, isi, kesimpulan, agendaId } = body

    if (!judul || !tanggal || !jenis || !peserta) {
      return errorResponse('Missing required fields')
    }

    const notulensi = await db.notulensi.create({
      data: {
        judul,
        tanggal,
        jenis,
        peserta,
        isi,
        kesimpulan,
        agendaId,
        createdBy: user.id,
        status: 'Draft'
      }
    })

    return successResponse(notulensi, 201)
  } catch (error) {
    console.error('Error creating notulensi:', error)
    return serverErrorResponse('Failed to create notulensi')
  }
})