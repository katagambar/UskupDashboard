import bcrypt from 'bcryptjs'

/**
 * Password utilities for secure authentication
 */

const SALT_ROUNDS = 12

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }

  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a plain text password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {

    return false
  }

  try {
    const result = await bcrypt.compare(password, hash)
    return result
  } catch (error) {
    return false
  }
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns Random secure password
 */
export function generateSecurePassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return password
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check if password needs to be upgraded (e.g., from plain text to hash)
 * @param password - Password to check
 * @returns True if password appears to be plain text
 */
export function isPlainTextPassword(password: string): boolean {
  // Simple check for common development passwords
  const commonPasswords = ['uskup2025', 'password', '123456', 'admin']
  return commonPasswords.includes(password)
}