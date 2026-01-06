/**
 * Digital Signature Service
 * 
 * Service untuk membuat dan memverifikasi tanda tangan digital pada dokumen.
 * Menggunakan SHA-256 hash untuk integrity dan unik QR code untuk verifikasi.
 */

import { createHash, randomBytes } from 'crypto'
import { prisma } from './db'

// ============================================
// HASH GENERATION
// ============================================

/**
 * Generate SHA-256 hash dari konten dokumen
 */
export function generateDocumentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex')
}

/**
 * Generate unique signature hash
 */
export function generateSignatureHash(): string {
    const timestamp = Date.now().toString()
    const random = randomBytes(16).toString('hex')
    return createHash('sha256').update(`${timestamp}-${random}`).digest('hex').substring(0, 32)
}

/**
 * Generate short verification code (untuk display)
 */
export function generateVerificationCode(): string {
    return randomBytes(4).toString('hex').toUpperCase()
}

// ============================================
// SIGNING OPERATIONS
// ============================================

interface SignDocumentParams {
    suratId: string
    signerId: string
    signerName: string
    signerRole: string
    signerJabatan?: string
    signatureImage?: string
    baseUrl: string
    ipAddress?: string
    userAgent?: string
}

interface SignResult {
    success: boolean
    signature?: {
        id: string
        documentHash: string
        signatureHash: string
        verificationUrl: string
        qrCodeData: string
    }
    error?: string
}

/**
 * Sign a document (Surat)
 */
export async function signDocument(params: SignDocumentParams): Promise<SignResult> {
    const {
        suratId,
        signerId,
        signerName,
        signerRole,
        signerJabatan,
        signatureImage,
        baseUrl,
        ipAddress,
        userAgent
    } = params

    try {
        // Get surat
        const surat = await prisma.surat.findUnique({
            where: { id: suratId },
            include: { signature: true }
        })

        if (!surat) {
            return { success: false, error: 'Surat tidak ditemukan' }
        }

        if (surat.isSigned || surat.signature) {
            return { success: false, error: 'Surat sudah ditandatangani' }
        }

        // Generate hashes
        const documentContent = `${surat.nomor}|${surat.judul}|${surat.isi || ''}|${surat.tanggal}`
        const documentHash = generateDocumentHash(documentContent)
        const signatureHash = generateSignatureHash()

        // Generate verification URL
        const verificationUrl = `${baseUrl}/verify/${signatureHash}`

        // Generate QR code data (JSON yang akan di-encode ke QR)
        const qrCodeData = JSON.stringify({
            type: 'KEUSKUPAN_SBY_DOC',
            hash: signatureHash,
            doc: surat.nomor,
            signer: signerName,
            date: new Date().toISOString(),
            url: verificationUrl
        })

        // Create signature in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update surat
            await tx.surat.update({
                where: { id: suratId },
                data: {
                    isSigned: true,
                    signedAt: new Date(),
                    signedBy: signerId,
                    status: 'Ditandatangani'
                }
            })

            // Create digital signature
            const signature = await tx.digitalSignature.create({
                data: {
                    suratId,
                    documentHash,
                    signatureHash,
                    qrCodeData,
                    signerId,
                    signerName,
                    signerRole,
                    signerJabatan,
                    signatureImage,
                    verificationUrl,
                    ipAddress,
                    userAgent
                }
            })

            return signature
        })

        return {
            success: true,
            signature: {
                id: result.id,
                documentHash: result.documentHash,
                signatureHash: result.signatureHash,
                verificationUrl: result.verificationUrl,
                qrCodeData: result.qrCodeData
            }
        }

    } catch (error) {
        console.error('Sign document error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Gagal menandatangani dokumen'
        }
    }
}

// ============================================
// VERIFICATION OPERATIONS
// ============================================

interface VerificationResult {
    isValid: boolean
    document?: {
        nomor: string
        judul: string
        tanggal: string
    }
    signer?: {
        name: string
        role: string
        jabatan?: string
    }
    signedAt?: Date
    revokedAt?: Date
    revokedReason?: string
    error?: string
}

/**
 * Verify a signature by hash
 */
export async function verifySignature(signatureHash: string): Promise<VerificationResult> {
    try {
        const signature = await prisma.digitalSignature.findUnique({
            where: { signatureHash },
            include: {
                surat: true
            }
        })

        if (!signature) {
            return {
                isValid: false,
                error: 'Tanda tangan tidak ditemukan dalam sistem'
            }
        }

        // Check if revoked
        if (!signature.isValid || signature.revokedAt) {
            return {
                isValid: false,
                document: {
                    nomor: signature.surat.nomor,
                    judul: signature.surat.judul,
                    tanggal: signature.surat.tanggal
                },
                revokedAt: signature.revokedAt || undefined,
                revokedReason: signature.revokedReason || 'Dokumen telah dicabut',
                error: 'Tanda tangan telah dicabut/tidak valid'
            }
        }

        // Valid signature
        return {
            isValid: true,
            document: {
                nomor: signature.surat.nomor,
                judul: signature.surat.judul,
                tanggal: signature.surat.tanggal
            },
            signer: {
                name: signature.signerName,
                role: signature.signerRole,
                jabatan: signature.signerJabatan || undefined
            },
            signedAt: signature.createdAt
        }

    } catch (error) {
        console.error('Verify signature error:', error)
        return {
            isValid: false,
            error: 'Gagal memverifikasi tanda tangan'
        }
    }
}

/**
 * Revoke a signature
 */
export async function revokeSignature(
    signatureHash: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.digitalSignature.update({
            where: { signatureHash },
            data: {
                isValid: false,
                revokedAt: new Date(),
                revokedReason: reason
            }
        })

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Gagal mencabut tanda tangan'
        }
    }
}

/**
 * Get signature by surat ID
 */
export async function getSignatureBySurat(suratId: string) {
    return prisma.digitalSignature.findUnique({
        where: { suratId }
    })
}
