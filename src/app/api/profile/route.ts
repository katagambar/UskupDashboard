import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

// Get bishop profile
export async function GET(request: NextRequest) {
    try {
        // Get the first (and should be only) bishop profile
        let profile = await db.bishopProfile.findFirst()

        // If no profile exists, return default empty profile structure
        if (!profile) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No profile found. Please create one.'
            })
        }

        // Parse JSON fields
        const parsedProfile = {
            ...profile,
            pendidikan: profile.pendidikan ? JSON.parse(profile.pendidikan) : [],
            pengalaman: profile.pengalaman ? JSON.parse(profile.pengalaman) : []
        }

        return NextResponse.json({ success: true, data: parsedProfile })
    } catch (error) {
        console.error('Error fetching bishop profile:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch bishop profile' },
            { status: 500 }
        )
    }
}

// Create or Update bishop profile (upsert)
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
        const {
            namaLengkap,
            gelar,
            tanggalLahir,
            tempatLahir,
            foto,
            email,
            telepon,
            alamat,
            website,
            namaKeuskupan,
            tanggalTahbisanUskup,
            jumlahParoki,
            jumlahUmat,
            pendidikan,
            pengalaman,
            totalPertemuanKuria,
            totalPastoralVisitasi,
            totalSuratEdaran,
            totalKeputusanPenting
        } = body

        // Check if profile already exists
        const existingProfile = await db.bishopProfile.findFirst()

        const profileData = {
            namaLengkap: namaLengkap || 'Uskup',
            gelar,
            tanggalLahir,
            tempatLahir,
            foto,
            email,
            telepon,
            alamat,
            website,
            namaKeuskupan: namaKeuskupan || 'Keuskupan',
            tanggalTahbisanUskup,
            jumlahParoki: jumlahParoki || 0,
            jumlahUmat,
            pendidikan: pendidikan ? JSON.stringify(pendidikan) : null,
            pengalaman: pengalaman ? JSON.stringify(pengalaman) : null,
            totalPertemuanKuria: totalPertemuanKuria || 0,
            totalPastoralVisitasi: totalPastoralVisitasi || 0,
            totalSuratEdaran: totalSuratEdaran || 0,
            totalKeputusanPenting: totalKeputusanPenting || 0
        }

        let profile
        if (existingProfile) {
            // Update existing
            profile = await db.bishopProfile.update({
                where: { id: existingProfile.id },
                data: profileData
            })
        } else {
            // Create new
            profile = await db.bishopProfile.create({
                data: profileData
            })
        }

        // Parse JSON fields for response
        const parsedProfile = {
            ...profile,
            pendidikan: profile.pendidikan ? JSON.parse(profile.pendidikan) : [],
            pengalaman: profile.pengalaman ? JSON.parse(profile.pengalaman) : []
        }

        return NextResponse.json({
            success: true,
            data: parsedProfile,
            message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
        })
    } catch (error) {
        console.error('Error saving bishop profile:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to save bishop profile' },
            { status: 500 }
        )
    }
}
