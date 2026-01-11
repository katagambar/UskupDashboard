/**
 * Google Drive File Storage Service
 * 
 * File storage using Google Drive (via Google Workspace non-profit).
 * Uses existing Service Account from Google Calendar integration.
 * 
 * Use cases:
 * - Lampiran surat (PDF, Word, images)
 * - Lampiran notulensi
 * - Tanda tangan digital
 * - Dokumen laporan
 * - Foto profil
 */

import { google, drive_v3 } from 'googleapis'
import { Readable } from 'stream'

// ============================================
// CONFIGURATION
// ============================================

const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || ''
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
// For domain-wide delegation, impersonate a Workspace user
const GOOGLE_IMPERSONATE_USER = process.env.GOOGLE_IMPERSONATE_USER || ''

// ============================================
// FILE CATEGORIES & FOLDERS
// ============================================

export type FileCategory = 
  | 'surat'           // Lampiran surat
  | 'notulensi'       // Lampiran notulensi
  | 'signature'       // Tanda tangan digital
  | 'report'          // Dokumen laporan
  | 'profile'         // Foto profil

const FOLDER_MAPPING: Record<FileCategory, string> = {
  surat: 'Surat-Lampiran',
  notulensi: 'Notulensi-Lampiran',
  signature: 'Tanda-Tangan',
  report: 'Laporan-Dokumen',
  profile: 'Profil-Foto',
}

// ============================================
// GOOGLE DRIVE CLIENT
// ============================================

let driveClient: drive_v3.Drive | null = null

function getDriveClient(): drive_v3.Drive {
  if (driveClient) return driveClient

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Drive credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env')
  }

  // Create JWT auth with optional user impersonation for domain-wide delegation
  const authOptions: any = {
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  }

  // Add subject (impersonated user) if domain-wide delegation is configured
  if (GOOGLE_IMPERSONATE_USER) {
    authOptions.subject = GOOGLE_IMPERSONATE_USER
  }

  const auth = new google.auth.JWT(authOptions)

  driveClient = google.drive({ version: 'v3', auth })
  return driveClient
}

// ============================================
// UPLOAD
// ============================================

export interface UploadResult {
  success: boolean
  fileId: string
  fileName: string
  fileUrl: string
  downloadUrl: string
  mimeType: string
  size: number
}

/**
 * Upload file to Google Drive
 */
export async function uploadFile(
  file: Buffer | Readable,
  fileName: string,
  mimeType: string,
  category: FileCategory
): Promise<UploadResult> {
  const drive = getDriveClient()
  const folderName = FOLDER_MAPPING[category]

  // Get or create folder
  const folderId = await getOrCreateFolder(folderName)

  // Upload file
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: file instanceof Buffer ? Readable.from(file) : file,
    },
    fields: 'id, name, mimeType, size, webViewLink',
  })

  const fileData = response.data

  // Make file accessible via link
  await drive.permissions.create({
    fileId: fileData.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return {
    success: true,
    fileId: fileData.id!,
    fileName: fileData.name!,
    fileUrl: fileData.webViewLink!,
    downloadUrl: `https://drive.google.com/uc?id=${fileData.id}&export=download`,
    mimeType: fileData.mimeType!,
    size: parseInt(fileData.size || '0'),
  }
}

// ============================================
// GET FILE
// ============================================

/**
 * Get file download URL
 */
export function getDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?id=${fileId}&export=download`
}

/**
 * Get file view URL
 */
export function getViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<{
  id: string
  name: string
  mimeType: string
  size: number
  createdTime: string
  webViewLink: string
} | null> {
  try {
    const drive = getDriveClient()
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, webViewLink',
    })
    
    return {
      id: response.data.id!,
      name: response.data.name!,
      mimeType: response.data.mimeType!,
      size: parseInt(response.data.size || '0'),
      createdTime: response.data.createdTime!,
      webViewLink: response.data.webViewLink!,
    }
  } catch {
    return null
  }
}

// ============================================
// DELETE
// ============================================

/**
 * Delete file from Google Drive
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    const drive = getDriveClient()
    await drive.files.delete({ fileId })
    return true
  } catch (error) {
    console.error('[FileStorage] Delete error:', error)
    return false
  }
}

// ============================================
// LIST FILES
// ============================================

/**
 * List files in a category
 */
export async function listFiles(category: FileCategory, limit: number = 20): Promise<{
  id: string
  name: string
  mimeType: string
  size: number
  createdTime: string
  webViewLink: string
  downloadUrl: string
}[]> {
  const drive = getDriveClient()
  const folderName = FOLDER_MAPPING[category]
  
  // Get folder ID
  const folderId = await getFolderIdByName(folderName)
  if (!folderId) return []

  // List files in folder
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, size, createdTime, webViewLink)',
    pageSize: limit,
    orderBy: 'createdTime desc',
  })

  return (response.data.files || []).map(file => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    size: parseInt(file.size || '0'),
    createdTime: file.createdTime!,
    webViewLink: file.webViewLink!,
    downloadUrl: getDownloadUrl(file.id!),
  }))
}

// ============================================
// FOLDER HELPERS
// ============================================

/**
 * Get folder ID by name
 */
async function getFolderIdByName(folderName: string): Promise<string | null> {
  const drive = getDriveClient()
  const parentId = GOOGLE_DRIVE_FOLDER_ID || 'root'
  
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id)',
  })

  return response.data.files?.[0]?.id || null
}

/**
 * Get or create folder
 */
async function getOrCreateFolder(folderName: string): Promise<string> {
  const existingId = await getFolderIdByName(folderName)
  if (existingId) return existingId

  const drive = getDriveClient()
  const parentId = GOOGLE_DRIVE_FOLDER_ID || 'root'

  const newFolder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })

  return newFolder.data.id!
}

// ============================================
// VALIDATION
// ============================================

const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Text
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(mimeType: string, size: number): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: `Tipe file ${mimeType} tidak diizinkan` }
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File terlalu besar (max 10MB)` }
  }
  return { valid: true }
}

/**
 * Get allowed file extensions for frontend
 */
export function getAllowedExtensions(): string[] {
  return ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt']
}

// ============================================
// HEALTH CHECK
// ============================================

export async function isStorageHealthy(): Promise<{
  healthy: boolean
  message?: string
}> {
  try {
    const drive = getDriveClient()
    await drive.files.list({ pageSize: 1 })
    return { healthy: true }
  } catch (error: any) {
    return { healthy: false, message: error.message }
  }
}

// ============================================
// EXPORTS
// ============================================

const FileStorage = {
  uploadFile,
  getDownloadUrl,
  getViewUrl,
  getFileMetadata,
  deleteFile,
  listFiles,
  validateFile,
  getAllowedExtensions,
  isStorageHealthy,
}

export default FileStorage
