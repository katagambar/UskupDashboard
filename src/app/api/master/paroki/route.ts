import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get all paroki
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {}

    if (status && status !== 'semua') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { alamat: { contains: search, mode: 'insensitive' } },
        { pastorParoki: { contains: search, mode: 'insensitive' } }
      ]
    }

    const paroki = await db.paroki.findMany({
      where,
      orderBy: { nama: 'asc' }
    })

    return successResponse(paroki)
  } catch (error) {
    console.error('Error fetching paroki:', error)
    return serverErrorResponse('Failed to fetch paroki')
  }
}

// Create new paroki - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { nama, alamat, telepon, email, pastorParoki, wilayah, status } = body

    if (!nama) {
      return errorResponse('Nama paroki wajib diisi')
    }

    const paroki = await db.paroki.create({
      data: {
        nama,
        alamat,
        telepon,
        email,
        pastorParoki,
        wilayah,
        status: status || 'Aktif'
      }
    })

    return successResponse(paroki, 201)
  } catch (error) {
    console.error('Error creating paroki:', error)
    return serverErrorResponse('Failed to create paroki')
  }
})
