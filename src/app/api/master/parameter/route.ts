import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { canManageUsers } from '@/lib/rbac'

// GET - List parameters by tipe
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(req)
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const tipe = searchParams.get('tipe')
        const aktifOnly = searchParams.get('aktif') !== 'false'

        const where: Record<string, unknown> = {}
        if (tipe) where.tipe = tipe
        if (aktifOnly) where.aktif = true

        const parameters = await prisma.masterParameter.findMany({
            where,
            orderBy: [{ tipe: 'asc' }, { urutan: 'asc' }, { nama: 'asc' }]
        })

        return NextResponse.json({ success: true, data: parameters })
    } catch (error) {
        console.error('Error fetching parameters:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch parameters' }, { status: 500 })
    }
}

// POST - Create new parameter
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(req)
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        if (!canManageUsers(user.role)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { tipe, kode, nama, warna, urutan } = body

        if (!tipe || !kode || !nama) {
            return NextResponse.json({ success: false, error: 'Tipe, kode, dan nama wajib diisi' }, { status: 400 })
        }

        const parameter = await prisma.masterParameter.create({
            data: {
                tipe: tipe.toUpperCase(),
                kode: kode.toUpperCase(),
                nama,
                warna,
                urutan: urutan || 0,
                aktif: true
            }
        })

        return NextResponse.json({ success: true, data: parameter }, { status: 201 })
    } catch (error: unknown) {
        console.error('Error creating parameter:', error)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ success: false, error: 'Parameter dengan kode tersebut sudah ada' }, { status: 400 })
        }
        return NextResponse.json({ success: false, error: 'Failed to create parameter' }, { status: 500 })
    }
}
