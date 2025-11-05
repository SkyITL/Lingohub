/**
 * Rate limiting middleware for solution submissions
 * Prevents spam and controls LLM API costs
 */

import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { getSubmissionLimits } from '../utils/rating'

const prisma = new PrismaClient()

// In-memory cache for rate limiting (use Redis in production for scalability)
interface RateLimitEntry {
  timestamps: number[]
  lastSubmission: number
}

const rateLimitCache = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000

  for (const [userId, entry] of rateLimitCache.entries()) {
    // Remove timestamps older than 1 hour
    entry.timestamps = entry.timestamps.filter((ts) => ts > oneHourAgo)

    // Remove entry if no recent activity
    if (entry.timestamps.length === 0 && now - entry.lastSubmission > oneHourAgo) {
      rateLimitCache.delete(userId)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitInfo {
  allowed: boolean
  remaining: {
    hourly: number
    daily: number
  }
  retryAfter?: number // seconds until next submission allowed
  limits: {
    hourly: number
    daily: number
    cooldown: number
  }
}

/**
 * Check if user can submit based on rate limits
 */
export async function checkRateLimit(
  userId: string,
  userRating: number,
  actionType: string = 'submission'
): Promise<RateLimitInfo> {
  const limits = getSubmissionLimits(userRating)
  const now = Date.now()

  // Get or create cache entry
  let entry = rateLimitCache.get(userId)
  if (!entry) {
    entry = { timestamps: [], lastSubmission: 0 }
    rateLimitCache.set(userId, entry)
  }

  // Check cooldown
  const timeSinceLastSubmission = now - entry.lastSubmission
  if (timeSinceLastSubmission < limits.cooldown) {
    const retryAfter = Math.ceil((limits.cooldown - timeSinceLastSubmission) / 1000)
    return {
      allowed: false,
      remaining: {
        hourly: 0,
        daily: 0,
      },
      retryAfter,
      limits,
    }
  }

  // Filter to get submissions in last hour and last day
  const oneHourAgo = now - 60 * 60 * 1000
  const oneDayAgo = now - 24 * 60 * 60 * 1000

  const hourlySubmissions = entry.timestamps.filter((ts) => ts > oneHourAgo)
  const dailySubmissions = entry.timestamps.filter((ts) => ts > oneDayAgo)

  // Check hourly limit
  if (hourlySubmissions.length >= limits.hourly) {
    return {
      allowed: false,
      remaining: {
        hourly: 0,
        daily: Math.max(0, limits.daily - dailySubmissions.length),
      },
      retryAfter: Math.ceil((hourlySubmissions[0] + 60 * 60 * 1000 - now) / 1000),
      limits,
    }
  }

  // Check daily limit
  if (dailySubmissions.length >= limits.daily) {
    return {
      allowed: false,
      remaining: {
        hourly: Math.max(0, limits.hourly - hourlySubmissions.length),
        daily: 0,
      },
      retryAfter: Math.ceil((dailySubmissions[0] + 24 * 60 * 60 * 1000 - now) / 1000),
      limits,
    }
  }

  return {
    allowed: true,
    remaining: {
      hourly: limits.hourly - hourlySubmissions.length - 1,
      daily: limits.daily - dailySubmissions.length - 1,
    },
    limits,
  }
}

/**
 * Record a submission in the rate limit cache and database
 */
export async function recordSubmission(
  userId: string,
  actionType: string = 'submission',
  rateLimitHit: boolean = false
): Promise<void> {
  const now = Date.now()

  // Update cache
  let entry = rateLimitCache.get(userId)
  if (!entry) {
    entry = { timestamps: [], lastSubmission: now }
    rateLimitCache.set(userId, entry)
  }

  entry.timestamps.push(now)
  entry.lastSubmission = now

  // Log to database (async, don't await)
  prisma.rateLimitLog
    .create({
      data: {
        userId,
        actionType,
        rateLimitHit,
        timestamp: new Date(now),
      },
    })
    .catch((err) => console.error('Failed to log rate limit:', err))
}

/**
 * Express middleware for rate limiting
 */
export function rateLimitMiddleware(actionType: string = 'submission') {
  return async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore - req.user is set by auth middleware
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    try {
      const rateLimitInfo = await checkRateLimit(user.id, user.rating, actionType)

      if (!rateLimitInfo.allowed) {
        await recordSubmission(user.id, actionType, true)

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message:
            rateLimitInfo.retryAfter && rateLimitInfo.retryAfter < 120
              ? `Please wait ${rateLimitInfo.retryAfter} seconds before submitting again`
              : 'You have reached your submission limit. Please try again later.',
          retryAfter: rateLimitInfo.retryAfter,
          remaining: rateLimitInfo.remaining,
          limits: rateLimitInfo.limits,
        })
      }

      // Attach rate limit info to request for use in route handlers
      // @ts-ignore
      req.rateLimitInfo = rateLimitInfo

      next()
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Allow request on error (fail open to prevent blocking legitimate users)
      next()
    }
  }
}

/**
 * Get rate limit status for a user (for display purposes)
 */
export async function getRateLimitStatus(
  userId: string,
  userRating: number
): Promise<RateLimitInfo> {
  return checkRateLimit(userId, userRating)
}
