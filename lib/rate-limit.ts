/**
 * Rate Limiting Utilities
 * 
 * Provides rate limiting for API routes, file uploads, and other operations
 */

import { getClientIP } from './security'
import { logger } from './logger'

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Rate limiting configurations
export const RATE_LIMIT_CONFIG = {
  // Login attempts
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // API requests (general)
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // File uploads
  UPLOAD: {
    maxUploads: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // Contact form submissions
  CONTACT: {
    maxSubmissions: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIG

export interface RateLimitResult {
  allowed: boolean
  remaining?: number
  resetAt?: Date
  retryAfter?: number // seconds
}

/**
 * Check rate limit for a given identifier and type
 */
export function checkRateLimit(
  identifier: string,
  type: RateLimitType
): RateLimitResult {
  const config = RATE_LIMIT_CONFIG[type]
  const key = `${type}:${identifier}`
  const now = Date.now()
  
  const record = rateLimitStore.get(key)
  
  const maxLimit = 'maxAttempts' in config ? config.maxAttempts : 
                   'maxRequests' in config ? config.maxRequests :
                   'maxUploads' in config ? config.maxUploads :
                   config.maxSubmissions

  // No record exists, allow request
  if (!record) {
    return {
      allowed: true,
      remaining: maxLimit - 1,
      resetAt: new Date(now + config.windowMs),
    }
  }
  
  // Check if window has expired
  if (now > record.resetAt) {
    // Reset the record
    rateLimitStore.delete(key)
    return {
      allowed: true,
      remaining: maxLimit - 1,
      resetAt: new Date(now + config.windowMs),
    }
  }
  
  // Check if limit exceeded
  if (record.count >= maxLimit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    
    logger.warn('Rate limit exceeded', {
      identifier,
      type,
      count: record.count,
      maxLimit,
    })
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(record.resetAt),
      retryAfter,
    }
  }
  
  // Increment count
  record.count += 1
  rateLimitStore.set(key, record)
  
  return {
    allowed: true,
    remaining: maxLimit - record.count,
    resetAt: new Date(record.resetAt),
  }
}

/**
 * Record a request (increment counter)
 */
export function recordRequest(identifier: string, type: RateLimitType) {
  const config = RATE_LIMIT_CONFIG[type]
  const key = `${type}:${identifier}`
  const now = Date.now()
  
  const record = rateLimitStore.get(key) || {
    count: 0,
    resetAt: now + config.windowMs,
  }
  
  record.count += 1
  rateLimitStore.set(key, record)
  
  // Clean up old records periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupOldRecords()
  }
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string, type: RateLimitType) {
  const key = `${type}:${identifier}`
  rateLimitStore.delete(key)
}

/**
 * Clean up old rate limit records
 */
function cleanupOldRecords() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get rate limit info for an identifier (without incrementing)
 */
export function getRateLimitInfo(
  identifier: string,
  type: RateLimitType
): RateLimitResult {
  const config = RATE_LIMIT_CONFIG[type]
  const key = `${type}:${identifier}`
  const now = Date.now()
  
  const maxLimit = 'maxAttempts' in config ? config.maxAttempts : 
                   'maxRequests' in config ? config.maxRequests :
                   'maxUploads' in config ? config.maxUploads :
                   config.maxSubmissions
  
  const record = rateLimitStore.get(key)
  
  if (!record) {
    return {
      allowed: true,
      remaining: maxLimit,
      resetAt: new Date(now + config.windowMs),
    }
  }
  
  if (now > record.resetAt) {
    return {
      allowed: true,
      remaining: maxLimit,
      resetAt: new Date(now + config.windowMs),
    }
  }
  
  return {
    allowed: record.count < maxLimit,
    remaining: Math.max(0, maxLimit - record.count),
    resetAt: new Date(record.resetAt),
    retryAfter: record.count >= maxLimit
      ? Math.ceil((record.resetAt - now) / 1000)
      : undefined,
  }
}

/**
 * Create rate limit middleware for API routes
 */
export function createRateLimitMiddleware(type: RateLimitType) {
  return async (request: Request): Promise<RateLimitResult> => {
    const ip = getClientIP(request)
    const result = checkRateLimit(ip, type)
    
    if (result.allowed) {
      recordRequest(ip, type)
    }
    
    return result
  }
}

