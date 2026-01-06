import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

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

        return NextResponse.json({ success: true, data: paroki })
    } catch (error) {
        console.error('Error fetching paroki:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch paroki' },
            { status: 500 }
        )
    }
}

// Create new paroki
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
        const { nama, alamat, telepon, email, pastorParoki, wilayah, status } = body

        if (!nama) {
            return NextResponse.json(
                { success: false, error: 'Nama paroki wajib diisi' },
                { status: 400 }
            )
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

        return NextResponse.json({ success: true, data: paroki })
    } catch (error) {
        console.error('Error creating paroki:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create paroki' },
            { status: 500 }
        )
    }
}
