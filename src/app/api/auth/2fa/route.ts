import { NextRequest } from 'next/server'
import { 
  setup2FA, 
  enable2FA, 
  disable2FA, 
  verify2FALogin,
  is2FAEnabled,
  getBackupCodesCount,
  regenerateBackupCodes,
} from '@/lib/two-factor-auth'
import { 
  withAuth, 
  successResponse, 
  errorResponse, 
  serverErrorResponse 
} from '@/lib/api-helpers'

/**
 * GET /api/auth/2fa - Check 2FA status
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const enabled = is2FAEnabled(user.id)
    const backupCodesRemaining = enabled ? getBackupCodesCount(user.id) : 0

    return successResponse({
      enabled,
      backupCodesRemaining,
    })
  } catch (error) {
    console.error('2FA status error:', error)
    return serverErrorResponse('Failed to get 2FA status')
  }
})

/**
 * POST /api/auth/2fa - Setup or verify 2FA
 * 
 * Actions:
 * - { action: 'setup' } - Start 2FA setup, returns QR code and backup codes
 * - { action: 'verify', code: '123456' } - Verify and enable 2FA
 * - { action: 'disable', code: '123456' } - Disable 2FA
 * - { action: 'regenerate-backup' } - Regenerate backup codes
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { action, code } = body

    if (!action) {
      return errorResponse('Action required')
    }

    // Setup 2FA
    if (action === 'setup') {
      const result = await setup2FA(user.id, user.email)
      
      return successResponse({
        message: 'Scan QR code dengan aplikasi authenticator Anda',
        secret: result.secret,
        qrCodeUrl: result.qrCodeUrl,
        backupCodes: result.backupCodes,
        instructions: [
          '1. Buka aplikasi authenticator (Google Authenticator, Authy, dll)',
          '2. Scan QR code atau masukkan secret key secara manual',
          '3. Masukkan 6-digit kode yang muncul untuk verifikasi',
          '4. Simpan backup codes di tempat yang aman',
        ],
      })
    }

    // Verify and enable 2FA
    if (action === 'verify') {
      if (!code) {
        return errorResponse('Verification code required')
      }

      const result = await enable2FA(user.id, code)

      if (!result.success) {
        return errorResponse(result.error || 'Verification failed')
      }

      return successResponse({
        message: '2FA berhasil diaktifkan!',
        enabled: true,
      })
    }

    // Disable 2FA
    if (action === 'disable') {
      if (!code) {
        return errorResponse('Verification code required to disable 2FA')
      }

      // Verify current code first
      const verifyResult = await verify2FALogin(user.id, code)
      if (!verifyResult.success) {
        return errorResponse('Invalid verification code')
      }

      const disabled = await disable2FA(user.id)

      return successResponse({
        message: '2FA berhasil dinonaktifkan',
        disabled,
      })
    }

    // Regenerate backup codes
    if (action === 'regenerate-backup') {
      if (!code) {
        return errorResponse('Verification code required')
      }

      // Verify current code first
      const verifyResult = await verify2FALogin(user.id, code)
      if (!verifyResult.success) {
        return errorResponse('Invalid verification code')
      }

      const newCodes = regenerateBackupCodes(user.id)

      if (!newCodes) {
        return errorResponse('2FA not enabled')
      }

      return successResponse({
        message: 'Backup codes regenerated. Simpan di tempat aman!',
        backupCodes: newCodes,
      })
    }

    return errorResponse('Invalid action')

  } catch (error) {
    console.error('2FA action error:', error)
    return serverErrorResponse('Failed to process 2FA action')
  }
})
