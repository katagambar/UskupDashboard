import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parsePaginationParams, createPaginatedResponse, getPrismaPageOptions } from '@/lib/pagination'
import { withRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { createTaskSchema, validateInput, formatZodErrors } from '@/lib/validation-schemas'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'


// Get all tasks or filter by query (with pagination)
export async function GET(request: NextRequest) {
  // Rate limiting check
  const rateLimitResponse = withRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const prioritas = searchParams.get('prioritas')
    const status = searchParams.get('status')
    const kategori = searchParams.get('kategori')
    const search = searchParams.get('search')
    const all = searchParams.get('all') === 'true'

    const paginationParams = parsePaginationParams(request)

    const where: any = {}
    
    if (prioritas && prioritas !== 'semua') {
      where.prioritas = prioritas
    }
    
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

    const total = await db.task.count({ where })

    const tasks = await db.task.findMany({
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
      orderBy: [
        { createdAt: 'desc' }
      ],
      ...(all ? {} : getPrismaPageOptions(paginationParams))
    })

    const headers = getRateLimitHeaders(request)

    if (all) {
      return NextResponse.json({ success: true, data: tasks }, { headers })
    }

    return NextResponse.json(
      createPaginatedResponse(tasks, total, paginationParams),
      { headers }
    )
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return serverErrorResponse('Failed to fetch tasks')
  }
}


// Create new task - using withAuth wrapper for clean authentication
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    
    // Validate with Zod schema
    const validation = validateInput(createTaskSchema, body)
    if (!validation.success) {
      return errorResponse(formatZodErrors(validation.error))
    }

    const { judul, deskripsi, prioritas, deadline, kategori, penanggungJawab } = validation.data

    const task = await db.task.create({
      data: {
        judul,
        deskripsi,
        prioritas,
        deadline,
        kategori,
        penanggungJawab,
        createdBy: user.id,
        status: 'Menunggu',
        progress: 0
      }
    })

    return successResponse(task, 201)
  } catch (error) {
    console.error('Error creating task:', error)
    return serverErrorResponse('Failed to create task')
  }
})

