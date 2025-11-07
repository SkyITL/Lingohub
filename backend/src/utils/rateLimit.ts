import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RateLimitConfig {
  actionType: string
  maxRequests: number
  windowMinutes: number
}

/**
 * Check if user has exceeded rate limit for a specific action
 * @returns true if rate limit exceeded, false otherwise
 */
export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number; resetAt: Date }> {
  const { actionType, maxRequests, windowMinutes } = config

  // Calculate time window
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

  // Count recent actions
  const recentActions = await prisma.rateLimitLog.count({
    where: {
      userId,
      actionType,
      timestamp: {
        gte: windowStart
      }
    }
  })

  const limited = recentActions >= maxRequests
  const remaining = Math.max(0, maxRequests - recentActions)
  const resetAt = new Date(Date.now() + windowMinutes * 60 * 1000)

  return { limited, remaining, resetAt }
}

/**
 * Log a rate-limited action
 */
export async function logRateLimitAction(
  userId: string,
  actionType: string,
  rateLimitHit: boolean = false
): Promise<void> {
  await prisma.rateLimitLog.create({
    data: {
      userId,
      actionType,
      rateLimitHit,
      timestamp: new Date()
    }
  })
}

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  // Submission creation: 20 per hour
  SUBMISSION: {
    actionType: 'submission',
    maxRequests: 20,
    windowMinutes: 60
  },

  // AI evaluation: 10 per hour (more expensive)
  LLM_EVAL: {
    actionType: 'llm_eval',
    maxRequests: 10,
    windowMinutes: 60
  },

  // Solution write-up creation: 5 per hour
  SOLUTION: {
    actionType: 'solution',
    maxRequests: 5,
    windowMinutes: 60
  }
}
