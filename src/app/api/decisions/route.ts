import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

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

    return successResponse(decisions)
  } catch (error) {
    console.error('Error fetching decisions:', error)
    return serverErrorResponse('Failed to fetch decisions')
  }
}

// Create new decision - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { judul, deskripsi, targetDate, kategori, penanggungJawab } = body

    if (!judul || !deskripsi || !targetDate || !kategori || !penanggungJawab) {
      return errorResponse('Missing required fields')
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

    return successResponse(decision, 201)
  } catch (error) {
    console.error('Error creating decision:', error)
    return serverErrorResponse('Failed to create decision')
  }
})
