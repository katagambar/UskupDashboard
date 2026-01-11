/**
 * Two-Factor Authentication (2FA) using TOTP
 * 
 * Implements Time-based One-Time Password for enhanced security.
 * Compatible with Google Authenticator, Authy, etc.
 */

import { prisma } from './db'

// ============================================
// TOTP CONFIGURATION
// ============================================

const TOTP_CONFIG = {
  issuer: 'Dashboard Uskup Surabaya',
  digits: 6,
  period: 30, // seconds
  algorithm: 'SHA1',
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a random base32 secret for TOTP
 */
export function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  const randomBytes = new Uint8Array(20)
  crypto.getRandomValues(randomBytes)
  
  for (let i = 0; i < 20; i++) {
    secret += chars[randomBytes[i] % 32]
  }
  
  return secret
}

/**
 * Generate OTP Auth URL for QR code
 */
export function generateOTPAuthURL(
  secret: string,
  email: string
): string {
  const issuer = encodeURIComponent(TOTP_CONFIG.issuer)
  const account = encodeURIComponent(email)
  
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${TOTP_CONFIG.algorithm}&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`
}

/**
 * Base32 decode
 */
function base32Decode(input: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bits: number[] = []
  
  for (const char of input.toUpperCase()) {
    const val = chars.indexOf(char)
    if (val === -1) continue
    bits.push(...val.toString(2).padStart(5, '0').split('').map(Number))
  }
  
  const bytes: number[] = []
  for (let i = 0; i < bits.length - 7; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8).join(''), 2))
  }
  
  return new Uint8Array(bytes)
}

/**
 * HMAC-SHA1 implementation using Web Crypto API
 */
async function hmacSHA1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message.buffer as ArrayBuffer)
  return new Uint8Array(signature)
}

/**
 * Generate TOTP code for a given time
 */
export async function generateTOTP(
  secret: string,
  time?: number
): Promise<string> {
  const period = TOTP_CONFIG.period
  const digits = TOTP_CONFIG.digits
  
  const timeCounter = Math.floor((time || Date.now() / 1000) / period)
  
  // Convert counter to 8-byte big-endian
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setBigUint64(0, BigInt(timeCounter), false)
  
  const key = base32Decode(secret)
  const message = new Uint8Array(buffer)
  
  const hmac = await hmacSHA1(key, message)
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  )
  
  const otp = binary % Math.pow(10, digits)
  return otp.toString().padStart(digits, '0')
}

/**
 * Verify TOTP code
 * Allows 1 period before and after for clock drift
 */
export async function verifyTOTP(
  secret: string,
  code: string,
  window: number = 1
): Promise<boolean> {
  const now = Date.now() / 1000
  const period = TOTP_CONFIG.period
  
  for (let i = -window; i <= window; i++) {
    const time = now + i * period
    const expectedCode = await generateTOTP(secret, time)
    
    if (expectedCode === code) {
      return true
    }
  }
  
  return false
}

// ============================================
// USER 2FA MANAGEMENT
// ============================================

interface TwoFactorData {
  secret: string
  enabled: boolean
  enabledAt?: Date
  backupCodes?: string[]
}

// In-memory storage for 2FA data (keyed by userId)
// In production, store encrypted in database
const twoFactorStore = new Map<string, TwoFactorData>()

/**
 * Start 2FA setup for a user
 */
export async function setup2FA(userId: string, email: string): Promise<{
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}> {
  const secret = generateTOTPSecret()
  const qrCodeUrl = generateOTPAuthURL(secret, email)
  
  // Generate backup codes
  const backupCodes: string[] = []
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    backupCodes.push(code)
  }
  
  // Store pending 2FA setup
  twoFactorStore.set(userId, {
    secret,
    enabled: false,
    backupCodes,
  })
  
  return { secret, qrCodeUrl, backupCodes }
}

/**
 * Verify and enable 2FA
 */
export async function enable2FA(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const data = twoFactorStore.get(userId)
  
  if (!data) {
    return { success: false, error: '2FA setup not found. Start setup first.' }
  }
  
  if (data.enabled) {
    return { success: false, error: '2FA already enabled' }
  }
  
  const isValid = await verifyTOTP(data.secret, code)
  
  if (!isValid) {
    return { success: false, error: 'Invalid verification code' }
  }
  
  data.enabled = true
  data.enabledAt = new Date()
  twoFactorStore.set(userId, data)
  
  return { success: true }
}

/**
 * Verify 2FA code for login
 */
export async function verify2FALogin(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const data = twoFactorStore.get(userId)
  
  if (!data || !data.enabled) {
    return { success: false, error: '2FA not enabled for this user' }
  }
  
  // Check backup codes first
  if (data.backupCodes?.includes(code)) {
    // Remove used backup code
    data.backupCodes = data.backupCodes.filter(c => c !== code)
    twoFactorStore.set(userId, data)
    return { success: true }
  }
  
  // Verify TOTP
  const isValid = await verifyTOTP(data.secret, code)
  
  if (!isValid) {
    return { success: false, error: 'Invalid verification code' }
  }
  
  return { success: true }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: string): Promise<boolean> {
  return twoFactorStore.delete(userId)
}

/**
 * Check if 2FA is enabled for a user
 */
export function is2FAEnabled(userId: string): boolean {
  const data = twoFactorStore.get(userId)
  return data?.enabled ?? false
}

/**
 * Get remaining backup codes count
 */
export function getBackupCodesCount(userId: string): number {
  const data = twoFactorStore.get(userId)
  return data?.backupCodes?.length ?? 0
}

/**
 * Regenerate backup codes
 */
export function regenerateBackupCodes(userId: string): string[] | null {
  const data = twoFactorStore.get(userId)
  
  if (!data || !data.enabled) {
    return null
  }
  
  const backupCodes: string[] = []
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    backupCodes.push(code)
  }
  
  data.backupCodes = backupCodes
  twoFactorStore.set(userId, data)
  
  return backupCodes
}
