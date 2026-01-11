import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get all template surat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get('kategori')
    const status = searchParams.get('status')

    const where: any = {}

    if (kategori && kategori !== 'semua') {
      where.kategori = kategori
    }

    if (status && status !== 'semua') {
      where.status = status
    }

    const templates = await db.templateSurat.findMany({
      where,
      orderBy: [{ kategori: 'asc' }, { nama: 'asc' }]
    })

    return successResponse(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return serverErrorResponse('Failed to fetch templates')
  }
}

// Create new template - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { nama, kategori, deskripsi, konten, status } = body

    if (!nama || !kategori || !konten) {
      return errorResponse('Nama, kategori, dan konten wajib diisi')
    }

    const template = await db.templateSurat.create({
      data: {
        nama,
        kategori,
        deskripsi,
        konten,
        status: status || 'Aktif'
      }
    })

    return successResponse(template, 201)
  } catch (error) {
    console.error('Error creating template:', error)
    return serverErrorResponse('Failed to create template')
  }
})
