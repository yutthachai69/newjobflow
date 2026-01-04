/**
 * Security utilities for rate limiting, logging, and incident response
 */

// In-memory store for rate limiting (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>()

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5, // Maximum failed login attempts
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  WINDOW_DURATION: 60 * 60 * 1000, // 1 hour window for rate limiting
}

/**
 * Check if IP/username is rate limited
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number; lockoutUntil?: Date } {
  const record = loginAttempts.get(identifier)
  
  if (!record) {
    return { allowed: true }
  }

  // Check if account is locked
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    return { 
      allowed: false, 
      lockoutUntil: record.lockedUntil 
    }
  }

  // Reset if lockout period has passed
  if (record.lockedUntil && record.lockedUntil <= new Date()) {
    loginAttempts.delete(identifier)
    return { allowed: true }
  }

  // Check if too many attempts in time window
  const timeSinceFirstAttempt = Date.now() - record.lastAttempt.getTime()
  if (record.count >= RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS) {
    // Lock the account
    const lockoutUntil = new Date(Date.now() + RATE_LIMIT_CONFIG.LOCKOUT_DURATION)
    record.lockedUntil = lockoutUntil
    loginAttempts.set(identifier, record)
    
    // Log security event
    logSecurityEvent('ACCOUNT_LOCKED', { identifier, lockoutUntil })
    
    return { 
      allowed: false, 
      lockoutUntil 
    }
  }

  return { 
    allowed: true, 
    remainingAttempts: RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS - record.count 
  }
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(identifier: string) {
  const record = loginAttempts.get(identifier) || { count: 0, lastAttempt: new Date() }
  
  record.count += 1
  record.lastAttempt = new Date()
  
  loginAttempts.set(identifier, record)
  
  // Log security event
  logSecurityEvent('FAILED_LOGIN', { identifier, attemptCount: record.count })
  
  // Clean up old records (older than 24 hours)
  cleanupOldRecords()
}

/**
 * Clear failed login attempts (on successful login)
 */
export function clearFailedLogins(identifier: string) {
  loginAttempts.delete(identifier)
}

/**
 * Clean up old rate limit records
 */
function cleanupOldRecords() {
  const now = Date.now()
  for (const [key, record] of loginAttempts.entries()) {
    if (now - record.lastAttempt.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
      loginAttempts.delete(key)
    }
  }
}

/**
 * Security event logging
 */
export function logSecurityEvent(eventType: string, details: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    eventType,
    details,
  }
  
  // In production, log to a secure logging service (e.g., CloudWatch, Datadog, etc.)
  console.error(`[SECURITY] ${timestamp} - ${eventType}:`, JSON.stringify(details))
  
  // TODO: In production, send to:
  // - Security Information and Event Management (SIEM) system
  // - Database for audit trail
  // - Alert system (email, SMS, Slack, etc.)
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request | null): string {
  if (!request) return 'unknown'
  
  // Check various headers for IP (behind proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Check if password has been compromised (basic check)
 */
export function isPasswordCompromised(password: string): boolean {
  // Common weak passwords
  const weakPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'abc123', 'admin', 'admin123', 'letmein', 'welcome',
  ]
  
  return weakPasswords.includes(password.toLowerCase())
}

/**
 * Generate secure random token for password reset
 */
export function generateSecureToken(): string {
  // In production, use crypto.randomBytes
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
