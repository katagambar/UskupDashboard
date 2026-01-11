import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get all kategori
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipe = searchParams.get('tipe')
    const status = searchParams.get('status')

    const where: any = {}

    if (tipe && tipe !== 'semua') {
      where.tipe = tipe
    }

    if (status && status !== 'semua') {
      where.status = status
    }

    const kategori = await db.kategori.findMany({
      where,
      orderBy: [{ tipe: 'asc' }, { nama: 'asc' }]
    })

    return successResponse(kategori)
  } catch (error) {
    console.error('Error fetching kategori:', error)
    return serverErrorResponse('Failed to fetch kategori')
  }
}

// Create new kategori - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { nama, tipe, deskripsi, warna, status } = body

    if (!nama || !tipe) {
      return errorResponse('Nama dan tipe wajib diisi')
    }

    const kategori = await db.kategori.create({
      data: {
        nama,
        tipe,
        deskripsi,
        warna,
        status: status || 'Aktif'
      }
    })

    return successResponse(kategori, 201)
  } catch (error) {
    console.error('Error creating kategori:', error)
    return serverErrorResponse('Failed to create kategori')
  }
})
