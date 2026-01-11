/**
 * Google Drive Service
 * 
 * Handles file uploads to Google Drive using Service Account
 * Uses same credentials as Google Calendar integration
 */

import { google, drive_v3 } from 'googleapis'
import { Readable } from 'stream'

// ============================================
// TYPES
// ============================================

export interface UploadResult {
  success: boolean
  fileId?: string
  webViewLink?: string
  webContentLink?: string
  error?: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string
  webViewLink?: string
  webContentLink?: string
  createdTime?: string
}

// ============================================
// CONFIGURATION
// ============================================

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID // Folder for storing surat attachments
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

// ============================================
// AUTH
// ============================================

function getAuth() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Drive credentials not configured')
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
}

function getDrive(): drive_v3.Drive {
  const auth = getAuth()
  return google.drive({ version: 'v3', auth })
}

// ============================================
// CHECK CONFIGURATION
// ============================================

export function isConfigured(): boolean {
  return !!(SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY)
}

// ============================================
// UPLOAD FILE
// ============================================

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<UploadResult> {
  if (!isConfigured()) {
    return { success: false, error: 'Google Drive not configured' }
  }

  try {
    const drive = getDrive()
    
    // Convert buffer to readable stream
    const stream = new Readable()
    stream.push(fileBuffer)
    stream.push(null)

    const targetFolderId = folderId || FOLDER_ID

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: targetFolderId ? [targetFolderId] : undefined,
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    })

    // Make file publicly accessible
    if (response.data.id) {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          type: 'anyone',
          role: 'reader',
        },
      })
    }

    console.log(`[GoogleDrive] Uploaded file: ${response.data.id}`)
    
    return {
      success: true,
      fileId: response.data.id || undefined,
      webViewLink: response.data.webViewLink || undefined,
      webContentLink: response.data.webContentLink || undefined,
    }
  } catch (error: any) {
    console.error('[GoogleDrive] Upload error:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// DELETE FILE
// ============================================

export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: 'Google Drive not configured' }
  }

  try {
    const drive = getDrive()
    
    await drive.files.delete({
      fileId,
    })

    console.log(`[GoogleDrive] Deleted file: ${fileId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error('[GoogleDrive] Delete error:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// GET FILE INFO
// ============================================

export async function getFileInfo(fileId: string): Promise<DriveFile | null> {
  if (!isConfigured()) {
    return null
  }

  try {
    const drive = getDrive()
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, webViewLink, webContentLink, createdTime',
    })

    return {
      id: response.data.id!,
      name: response.data.name!,
      mimeType: response.data.mimeType!,
      size: response.data.size!,
      webViewLink: response.data.webViewLink || undefined,
      webContentLink: response.data.webContentLink || undefined,
      createdTime: response.data.createdTime || undefined,
    }
  } catch (error: any) {
    console.error('[GoogleDrive] Get file error:', error.message)
    return null
  }
}

// ============================================
// LIST FILES IN FOLDER
// ============================================

export async function listFilesInFolder(folderId?: string): Promise<DriveFile[]> {
  if (!isConfigured()) {
    return []
  }

  try {
    const drive = getDrive()
    const targetFolderId = folderId || FOLDER_ID
    
    const query = targetFolderId 
      ? `'${targetFolderId}' in parents and trashed = false`
      : 'trashed = false'

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    })

    return (response.data.files || []).map(file => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      size: file.size || '0',
      webViewLink: file.webViewLink || undefined,
      webContentLink: file.webContentLink || undefined,
      createdTime: file.createdTime || undefined,
    }))
  } catch (error: any) {
    console.error('[GoogleDrive] List files error:', error.message)
    return []
  }
}
