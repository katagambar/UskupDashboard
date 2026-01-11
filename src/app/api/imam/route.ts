import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get all imam or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paroki = searchParams.get('paroki')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'semua') {
      where.status = status
    }

    if (paroki) {
      where.paroki = { contains: paroki, mode: 'insensitive' }
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { paroki: { contains: search, mode: 'insensitive' } },
        { jabatan: { contains: search, mode: 'insensitive' } }
      ]
    }

    const imam = await db.imam.findMany({
      where,
      orderBy: {
        nama: 'asc'
      }
    })

    return successResponse(imam)
  } catch (error) {
    console.error('Error fetching imam:', error)
    return serverErrorResponse('Failed to fetch imam data')
  }
}

// Create new imam entry - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { nama, paroki, jabatan, tanggalTahbisan, nomorTelepon, email, alamat, status } = body

    if (!nama || !paroki || !jabatan || !tanggalTahbisan) {
      return errorResponse('Missing required fields')
    }

    const imam = await db.imam.create({
      data: {
        nama,
        paroki,
        jabatan,
        tanggalTahbisan,
        nomorTelepon,
        email,
        alamat,
        status: status || 'Aktif'
      }
    })

    return successResponse(imam, 201)
  } catch (error) {
    console.error('Error creating imam:', error)
    return serverErrorResponse('Failed to create imam entry')
  }
})

// Clear all imam data (for sync preparation) - using withAuth wrapper
export const DELETE = withAuth(async (request, user) => {
  try {
    // Check if action is "clear-all"
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'clear-all') {
      const result = await db.imam.deleteMany({})
      return successResponse({
        message: `Deleted ${result.count} imam records`,
        count: result.count
      })
    }

    return errorResponse('Missing action parameter')
  } catch (error) {
    console.error('Error deleting imam data:', error)
    return serverErrorResponse('Failed to clear imam data')
  }
})
