import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

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

        return NextResponse.json({ success: true, data: templates })
    } catch (error) {
        console.error('Error fetching templates:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch templates' },
            { status: 500 }
        )
    }
}

// Create new template
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
        const { nama, kategori, deskripsi, konten, status } = body

        if (!nama || !kategori || !konten) {
            return NextResponse.json(
                { success: false, error: 'Nama, kategori, dan konten wajib diisi' },
                { status: 400 }
            )
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

        return NextResponse.json({ success: true, data: template })
    } catch (error) {
        console.error('Error creating template:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create template' },
            { status: 500 }
        )
    }
}
