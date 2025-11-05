/**
 * Rating system utilities for LingoHub
 * Implements Elo-based rating calculations similar to Codeforces
 */

export interface RatingChange {
  oldRating: number
  newRating: number
  change: number
  expectedPerformance: number
  kFactor: number
}

/**
 * Calculate expected performance (probability of solving) using Elo formula
 * Formula: P(solve) = 1 / (1 + 10^((ProblemRating - UserRating) / 400))
 */
export function calculateExpectedPerformance(
  userRating: number,
  problemRating: number
): number {
  const exponent = (problemRating - userRating) / 400
  const expected = 1 / (1 + Math.pow(10, exponent))
  return expected
}

/**
 * Get K-factor based on user rating
 * Higher K-factor for beginners = faster rating adjustments
 */
export function getKFactor(userRating: number): number {
  if (userRating < 1500) return 60 // Beginners
  if (userRating < 2000) return 40 // Intermediate
  return 20 // Experts
}

/**
 * Calculate rating change for solving a problem
 * @param userRating Current user rating
 * @param problemRating Problem difficulty rating
 * @param viewedSolution Whether user viewed official solution before solving
 * @param actualPerformance 1.0 for solved, 0.5 for partial credit
 * @returns Rating change details
 */
export function calculateRatingChange(
  userRating: number,
  problemRating: number,
  viewedSolution: boolean = false,
  actualPerformance: number = 1.0
): RatingChange {
  const expectedPerformance = calculateExpectedPerformance(userRating, problemRating)
  const kFactor = getKFactor(userRating)

  // Base rating change
  let rawChange = kFactor * (actualPerformance - expectedPerformance)

  // Apply penalty for viewing solution (70% penalty)
  if (viewedSolution) {
    rawChange *= 0.3
  }

  // Round to nearest integer
  const change = Math.round(rawChange)
  const newRating = userRating + change

  return {
    oldRating: userRating,
    newRating,
    change,
    expectedPerformance,
    kFactor,
  }
}

/**
 * Get rating tier name and color based on rating
 */
export function getRatingTier(rating: number): {
  name: string
  color: string
  colorCode: string
} {
  if (rating >= 2500) {
    return { name: 'Grandmaster', color: 'black', colorCode: '#000000' }
  }
  if (rating >= 2200) {
    return { name: 'Master', color: 'red', colorCode: '#dc2626' }
  }
  if (rating >= 1900) {
    return { name: 'Candidate Master', color: 'orange', colorCode: '#ea580c' }
  }
  if (rating >= 1600) {
    return { name: 'Expert', color: 'yellow', colorCode: '#eab308' }
  }
  if (rating >= 1400) {
    return { name: 'Specialist', color: 'purple', colorCode: '#9333ea' }
  }
  if (rating >= 1200) {
    return { name: 'Pupil', color: 'blue', colorCode: '#2563eb' }
  }
  return { name: 'Newbie', color: 'green', colorCode: '#16a34a' }
}

/**
 * Get cheater tier (brown name)
 */
export function getCheaterTier(): {
  name: string
  color: string
  colorCode: string
} {
  return { name: 'Cheater', color: 'brown', colorCode: '#92400e' }
}

/**
 * Get submission rate limits based on user rating
 */
export function getSubmissionLimits(userRating: number): {
  hourly: number
  daily: number
  cooldown: number // milliseconds
} {
  if (userRating >= 2000) {
    return { hourly: 10, daily: 40, cooldown: 60000 } // Masters+
  }
  if (userRating >= 1600) {
    return { hourly: 8, daily: 30, cooldown: 60000 } // Experts
  }
  if (userRating >= 1400) {
    return { hourly: 6, daily: 25, cooldown: 60000 } // Specialists
  }
  return { hourly: 5, daily: 20, cooldown: 60000 } // Everyone else
}

/**
 * Calculate LLM evaluation cost
 * @param modelUsed Which LLM model was used
 * @returns Cost in USD
 */
export function calculateEvaluationCost(modelUsed: string): number {
  const costMap: Record<string, number> = {
    'gpt-4o-mini': 0.01,
    'gpt-4o': 0.03,
    'claude-3-haiku': 0.008,
    'claude-3-sonnet': 0.015,
    'claude-3-opus': 0.05,
  }
  return costMap[modelUsed] || 0.01
}

/**
 * Validate LLM evaluation score breakdown
 */
export function validateEvaluationScores(scores: {
  correctness: number
  reasoning: number
  coverage: number
  clarity: number
}): boolean {
  return (
    scores.correctness >= 0 &&
    scores.correctness <= 40 &&
    scores.reasoning >= 0 &&
    scores.reasoning <= 30 &&
    scores.coverage >= 0 &&
    scores.coverage <= 20 &&
    scores.clarity >= 0 &&
    scores.clarity <= 10
  )
}

/**
 * Calculate total score from breakdown
 */
export function calculateTotalScore(scores: {
  correctness: number
  reasoning: number
  coverage: number
  clarity: number
}): number {
  return scores.correctness + scores.reasoning + scores.coverage + scores.clarity
}

/**
 * Determine if solution should auto-approve based on LLM evaluation
 */
export function shouldAutoApprove(
  totalScore: number,
  confidence: string
): boolean {
  return totalScore >= 70 && confidence === 'high'
}

/**
 * Determine if solution qualifies for partial credit
 */
export function isPartialCredit(totalScore: number): boolean {
  return totalScore >= 40 && totalScore < 70
}

/**
 * Determine if solution needs community review
 */
export function needsCommunityReview(
  totalScore: number,
  confidence: string
): boolean {
  return totalScore < 40 || confidence === 'low'
}
