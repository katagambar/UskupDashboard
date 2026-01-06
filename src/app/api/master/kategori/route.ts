import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

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

        return NextResponse.json({ success: true, data: kategori })
    } catch (error) {
        console.error('Error fetching kategori:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch kategori' },
            { status: 500 }
        )
    }
}

// Create new kategori
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
        const { nama, tipe, deskripsi, warna, status } = body

        if (!nama || !tipe) {
            return NextResponse.json(
                { success: false, error: 'Nama dan tipe wajib diisi' },
                { status: 400 }
            )
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

        return NextResponse.json({ success: true, data: kategori })
    } catch (error) {
        console.error('Error creating kategori:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create kategori' },
            { status: 500 }
        )
    }
}
