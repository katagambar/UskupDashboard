import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get single surat by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const surat = await db.surat.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!surat) {
            return NextResponse.json(
                { success: false, error: 'Surat not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: surat })
    } catch (error) {
        console.error('Error fetching surat:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch surat' },
            { status: 500 }
        )
    }
}

// Update surat
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { nomor, jenis, judul, pengirim, penerima, tanggal, isi, status, prioritas, lampiran } = body

        // Check if surat exists
        const existingSurat = await db.surat.findUnique({
            where: { id }
        })

        if (!existingSurat) {
            return NextResponse.json(
                { success: false, error: 'Surat not found' },
                { status: 404 }
            )
        }

        const updatedSurat = await db.surat.update({
            where: { id },
            data: {
                nomor: nomor || undefined,
                jenis: jenis || undefined,
                judul: judul || undefined,
                pengirim: pengirim || undefined,
                penerima: penerima || undefined,
                tanggal: tanggal || undefined,
                isi: isi || undefined,
                status: status || undefined,
                prioritas: prioritas || undefined,
                lampiran: lampiran || undefined
            }
        })

        return NextResponse.json({ success: true, data: updatedSurat })
    } catch (error) {
        console.error('Error updating surat:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update surat' },
            { status: 500 }
        )
    }
}

// Delete surat
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params

        // Check if surat exists
        const existingSurat = await db.surat.findUnique({
            where: { id }
        })

        if (!existingSurat) {
            return NextResponse.json(
                { success: false, error: 'Surat not found' },
                { status: 404 }
            )
        }

        await db.surat.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Surat deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting surat:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete surat' },
            { status: 500 }
        )
    }
}
