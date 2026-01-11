/**
 * File Upload API
 * 
 * POST /api/upload - Upload file to Google Drive
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { uploadFile, isConfigured } from '@/lib/google-drive'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Allowed file types for surat attachments
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if Google Drive is configured
    if (!isConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Google Drive tidak dikonfigurasi. Hubungi administrator.' 
        },
        { status: 503 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file melebihi batas maksimum 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipe file tidak diperbolehkan. Gunakan PDF, Word, atau gambar.' 
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`

    // Upload to Google Drive
    const result = await uploadFile(buffer, fileName, file.type)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          fileId: result.fileId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          webViewLink: result.webViewLink,
          webContentLink: result.webContentLink,
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal upload file' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[API] Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal upload file' },
      { status: 500 }
    )
  }
}
