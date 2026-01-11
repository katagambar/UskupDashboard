/**
 * Password Reset Token Storage
 * 
 * Uses in-memory storage for reset tokens.
 * Tokens expire after 1 hour.
 */

interface ResetToken {
  userId: string
  email: string
  token: string
  expiresAt: Date
  used: boolean
}

const resetTokens = new Map<string, ResetToken>()

// Generate secure random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Create a reset token for a user
export function createResetToken(userId: string, email: string): string {
  // Invalidate any existing tokens for this user
  for (const [key, value] of resetTokens.entries()) {
    if (value.userId === userId) {
      resetTokens.delete(key)
    }
  }

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  resetTokens.set(token, {
    userId,
    email,
    token,
    expiresAt,
    used: false,
  })

  // Cleanup expired tokens
  cleanupExpiredTokens()

  return token
}

// Validate a reset token
export function validateResetToken(token: string): ResetToken | null {
  const resetToken = resetTokens.get(token)

  if (!resetToken) {
    return null
  }

  if (resetToken.used) {
    return null
  }

  if (new Date() > resetToken.expiresAt) {
    resetTokens.delete(token)
    return null
  }

  return resetToken
}

// Mark token as used
export function markTokenUsed(token: string): boolean {
  const resetToken = resetTokens.get(token)
  if (resetToken) {
    resetToken.used = true
    return true
  }
  return false
}

// Delete a token
export function deleteResetToken(token: string): void {
  resetTokens.delete(token)
}

// Cleanup expired tokens
function cleanupExpiredTokens(): void {
  const now = new Date()
  for (const [key, value] of resetTokens.entries()) {
    if (value.expiresAt < now) {
      resetTokens.delete(key)
    }
  }
}

// Get token info (for admin/debug)
export function getTokenInfo(token: string): Omit<ResetToken, 'token'> | null {
  const resetToken = resetTokens.get(token)
  if (!resetToken) return null
  
  return {
    userId: resetToken.userId,
    email: resetToken.email,
    expiresAt: resetToken.expiresAt,
    used: resetToken.used,
  }
}
