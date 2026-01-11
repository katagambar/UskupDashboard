import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { 
  withErrorHandling, 
  handlePrismaError, 
  createSuccessResponse, 
  createCreatedResponse, 
  createValidationError,
  createNotFoundError,
  generateRequestId 
} from '@/lib/errorHandler'
import { parsePaginationParams, createPaginatedResponse, getPrismaPageOptions } from '@/lib/pagination'
import { withRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { createAgendaSchema, validateInput, formatZodErrors } from '@/lib/validation-schemas'

// Get all agenda or filter by query (with pagination)
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting check
  const rateLimitResponse = withRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const jenis = searchParams.get('jenis')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const all = searchParams.get('all') === 'true' // Skip pagination if ?all=true

  // Parse pagination params
  const paginationParams = parsePaginationParams(request)

  // Build where clause with filters
  const where: any = {}
  
  if (jenis) { // Changed from `jenis && jenis !== 'semua'`
    where.jenis = jenis
  }
  
  if (status) { // Changed from `status && status !== 'semua'`
    where.status = status
  }
  
  if (search) {
    where.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
      { lokasi: { contains: search, mode: 'insensitive' } },
      { peserta: { contains: search, mode: 'insensitive' } } // Changed 'deskripsi' to 'peserta' and added mode: 'insensitive'
    ]
  }

  try {
    // Get total count for pagination
    const total = await prisma.agenda.count({ where })

    // Fetch data with pagination (skip if ?all=true for backward compatibility)
    const agenda = await prisma.agenda.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      ...(all ? {} : getPrismaPageOptions(paginationParams))
    })

    // Add rate limit headers
    const headers = getRateLimitHeaders(request)

    // Return paginated or simple response
    if (all) {
      return NextResponse.json(
        { success: true, data: agenda },
        { headers }
      )
    }

    return NextResponse.json(
      createPaginatedResponse(agenda, total, paginationParams),
      { headers }
    )
  } catch (error) {
    const appError = handlePrismaError(error, 'GET /api/agenda')
    
    return NextResponse.json(
      { success: false, error: appError },
      { status: 500 }
    )
  }
}, 'GET /api/agenda')


// Create new agenda
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await getCurrentUserFromRequest(request)
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  const body = await request.json()
  
  // Validate with Zod schema
  const validation = validateInput(createAgendaSchema, body)
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: formatZodErrors(validation.error) } },
      { status: 400 }
    )
  }

  const { judul, tanggal, tanggalAkhir, waktu, waktuAkhir, lokasi, jenis, peserta, deskripsi } = validation.data


  try {
    const agenda = await prisma.agenda.create({
      data: {
        judul,
        tanggal,
        tanggalAkhir: tanggalAkhir || null,
        waktu,
        waktuAkhir: waktuAkhir || null,
        lokasi,
        jenis,
        peserta,
        deskripsi,
        createdBy: user.id,
        status: 'Dijadwalkan'
      }
    })

    return createCreatedResponse(agenda, 'Agenda created successfully')
  } catch (error) {
    const appError = handlePrismaError(error, 'POST /api/agenda')
    
    return NextResponse.json(
      { success: false, error: appError },
      { status: 500 }
    )
  }
}, 'POST /api/agenda')
