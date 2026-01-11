import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parsePaginationParams, createPaginatedResponse, getPrismaPageOptions } from '@/lib/pagination'
import { withRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { createSuratSchema, validateInput, formatZodErrors } from '@/lib/validation-schemas'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

// Get all surat or filter by query (with pagination)
export async function GET(request: NextRequest) {
  const rateLimitResponse = withRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis')
    const status = searchParams.get('status')
    const prioritas = searchParams.get('prioritas')
    const search = searchParams.get('search')
    const all = searchParams.get('all') === 'true'

    const paginationParams = parsePaginationParams(request)
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

    const total = await db.surat.count({ where })

    const surat = await db.surat.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        signature: true
      },
      orderBy: {
        tanggal: 'desc'
      },
      ...(all ? {} : getPrismaPageOptions(paginationParams))
    })

    const headers = getRateLimitHeaders(request)

    if (all) {
      return NextResponse.json({ success: true, data: surat }, { headers })
    }

    return NextResponse.json(
      createPaginatedResponse(surat, total, paginationParams),
      { headers }
    )
  } catch (error) {
    console.error('Error fetching surat:', error)
    return serverErrorResponse('Failed to fetch surat')
  }
}


// Create new surat - using withAuth wrapper
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    
    // Validate with Zod schema
    const validation = validateInput(createSuratSchema, body)
    if (!validation.success) {
      return errorResponse(formatZodErrors(validation.error))
    }

    const { nomor, jenis, judul, pengirim, penerima, tanggal, isi, prioritas } = validation.data

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

    return successResponse(surat, 201)
  } catch (error) {
    console.error('Error creating surat:', error)
    return serverErrorResponse('Failed to create surat')
  }
})
