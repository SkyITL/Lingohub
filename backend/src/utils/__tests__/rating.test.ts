/**
 * Unit tests for rating calculation utilities
 * Run with: npm test rating.test.ts
 */

import {
  calculateExpectedPerformance,
  getKFactor,
  calculateRatingChange,
  getRatingTier,
  getSubmissionLimits,
  validateEvaluationScores,
  calculateTotalScore,
  shouldAutoApprove,
  isPartialCredit,
  needsCommunityReview,
} from '../rating'

describe('Rating Calculations', () => {
  describe('calculateExpectedPerformance', () => {
    it('should return 0.5 when user and problem ratings are equal', () => {
      const result = calculateExpectedPerformance(1500, 1500)
      expect(result).toBeCloseTo(0.5, 2)
    })

    it('should return higher probability for easier problems', () => {
      const result = calculateExpectedPerformance(1500, 1200)
      expect(result).toBeGreaterThan(0.5)
      expect(result).toBeCloseTo(0.85, 2)
    })

    it('should return lower probability for harder problems', () => {
      const result = calculateExpectedPerformance(1500, 1800)
      expect(result).toBeLessThan(0.5)
      expect(result).toBeCloseTo(0.15, 2)
    })

    it('should handle extreme rating differences', () => {
      // Beginner vs very hard problem
      const veryLow = calculateExpectedPerformance(1000, 2400)
      expect(veryLow).toBeLessThan(0.1)

      // Expert vs very easy problem
      const veryHigh = calculateExpectedPerformance(2400, 1000)
      expect(veryHigh).toBeGreaterThan(0.9)
    })
  })

  describe('getKFactor', () => {
    it('should return 60 for beginners', () => {
      expect(getKFactor(1000)).toBe(60)
      expect(getKFactor(1499)).toBe(60)
    })

    it('should return 40 for intermediate players', () => {
      expect(getKFactor(1500)).toBe(40)
      expect(getKFactor(1999)).toBe(40)
    })

    it('should return 20 for experts', () => {
      expect(getKFactor(2000)).toBe(20)
      expect(getKFactor(2500)).toBe(20)
    })
  })

  describe('calculateRatingChange', () => {
    it('should give positive rating for solving harder problems', () => {
      const result = calculateRatingChange(1500, 1800, false, 1.0)
      expect(result.change).toBeGreaterThan(0)
      expect(result.change).toBeCloseTo(34, 0) // ~34 points
      expect(result.newRating).toBe(1500 + result.change)
    })

    it('should give smaller rating for solving easier problems', () => {
      const result = calculateRatingChange(1500, 1200, false, 1.0)
      expect(result.change).toBeGreaterThan(0)
      expect(result.change).toBeLessThan(15) // Less than 15 points
    })

    it('should apply penalty for viewing solution', () => {
      const withoutViewing = calculateRatingChange(1500, 1800, false, 1.0)
      const withViewing = calculateRatingChange(1500, 1800, true, 1.0)

      expect(withViewing.change).toBeLessThan(withoutViewing.change)
      expect(withViewing.change).toBeCloseTo(withoutViewing.change * 0.3, 0)
    })

    it('should handle partial credit correctly', () => {
      const fullCredit = calculateRatingChange(1500, 1800, false, 1.0)
      const partialCredit = calculateRatingChange(1500, 1800, false, 0.5)

      expect(partialCredit.change).toBeLessThan(fullCredit.change)
      // Partial credit may be rounded differently, so just check it's roughly half
      expect(Math.abs(partialCredit.change - fullCredit.change * 0.5)).toBeLessThanOrEqual(3)
    })

    it('should respect K-factor boundaries', () => {
      const beginner = calculateRatingChange(1200, 1400, false, 1.0)
      const expert = calculateRatingChange(2200, 2400, false, 1.0)

      // Beginner changes should be larger
      expect(Math.abs(beginner.change)).toBeGreaterThan(Math.abs(expert.change))
    })
  })

  describe('getRatingTier', () => {
    it('should return correct tiers for each rating range', () => {
      expect(getRatingTier(1000).name).toBe('Newbie')
      expect(getRatingTier(1000).color).toBe('green')

      expect(getRatingTier(1250).name).toBe('Pupil')
      expect(getRatingTier(1250).color).toBe('blue')

      expect(getRatingTier(1450).name).toBe('Specialist')
      expect(getRatingTier(1450).color).toBe('purple')

      expect(getRatingTier(1700).name).toBe('Expert')
      expect(getRatingTier(1700).color).toBe('yellow')

      expect(getRatingTier(2000).name).toBe('Candidate Master')
      expect(getRatingTier(2000).color).toBe('orange')

      expect(getRatingTier(2300).name).toBe('Master')
      expect(getRatingTier(2300).color).toBe('red')

      expect(getRatingTier(2600).name).toBe('Grandmaster')
      expect(getRatingTier(2600).color).toBe('black')
    })

    it('should return tier at boundary ratings', () => {
      expect(getRatingTier(1199).name).toBe('Newbie')
      expect(getRatingTier(1200).name).toBe('Pupil')
      expect(getRatingTier(1400).name).toBe('Specialist')
      expect(getRatingTier(2500).name).toBe('Grandmaster')
    })
  })

  describe('getSubmissionLimits', () => {
    it('should return base limits for low-rated users', () => {
      const limits = getSubmissionLimits(1000)
      expect(limits.hourly).toBe(5)
      expect(limits.daily).toBe(20)
      expect(limits.cooldown).toBe(60000)
    })

    it('should return progressive limits for higher-rated users', () => {
      const specialist = getSubmissionLimits(1400)
      expect(specialist.hourly).toBe(6)
      expect(specialist.daily).toBe(25)

      const expert = getSubmissionLimits(1600)
      expect(expert.hourly).toBe(8)
      expect(expert.daily).toBe(30)

      const master = getSubmissionLimits(2000)
      expect(master.hourly).toBe(10)
      expect(master.daily).toBe(40)
    })
  })
})

describe('LLM Evaluation Helpers', () => {
  describe('validateEvaluationScores', () => {
    it('should accept valid scores', () => {
      const valid = {
        correctness: 35,
        reasoning: 25,
        coverage: 18,
        clarity: 9,
      }
      expect(validateEvaluationScores(valid)).toBe(true)
    })

    it('should reject scores exceeding maximums', () => {
      const invalid = {
        correctness: 45, // Max is 40
        reasoning: 25,
        coverage: 18,
        clarity: 9,
      }
      expect(validateEvaluationScores(invalid)).toBe(false)
    })

    it('should reject negative scores', () => {
      const invalid = {
        correctness: -5,
        reasoning: 25,
        coverage: 18,
        clarity: 9,
      }
      expect(validateEvaluationScores(invalid)).toBe(false)
    })
  })

  describe('calculateTotalScore', () => {
    it('should sum all component scores', () => {
      const scores = {
        correctness: 35,
        reasoning: 25,
        coverage: 18,
        clarity: 9,
      }
      expect(calculateTotalScore(scores)).toBe(87)
    })

    it('should handle perfect scores', () => {
      const perfect = {
        correctness: 40,
        reasoning: 30,
        coverage: 20,
        clarity: 10,
      }
      expect(calculateTotalScore(perfect)).toBe(100)
    })

    it('should handle zero scores', () => {
      const zero = {
        correctness: 0,
        reasoning: 0,
        coverage: 0,
        clarity: 0,
      }
      expect(calculateTotalScore(zero)).toBe(0)
    })
  })

  describe('shouldAutoApprove', () => {
    it('should approve high scores with high confidence', () => {
      expect(shouldAutoApprove(85, 'high')).toBe(true)
      expect(shouldAutoApprove(70, 'high')).toBe(true)
    })

    it('should not approve low scores', () => {
      expect(shouldAutoApprove(65, 'high')).toBe(false)
      expect(shouldAutoApprove(40, 'high')).toBe(false)
    })

    it('should not approve without high confidence', () => {
      expect(shouldAutoApprove(85, 'medium')).toBe(false)
      expect(shouldAutoApprove(85, 'low')).toBe(false)
    })
  })

  describe('isPartialCredit', () => {
    it('should identify partial credit range', () => {
      expect(isPartialCredit(40)).toBe(true)
      expect(isPartialCredit(55)).toBe(true)
      expect(isPartialCredit(69)).toBe(true)
    })

    it('should not give partial credit for high scores', () => {
      expect(isPartialCredit(70)).toBe(false)
      expect(isPartialCredit(85)).toBe(false)
    })

    it('should not give partial credit for very low scores', () => {
      expect(isPartialCredit(39)).toBe(false)
      expect(isPartialCredit(20)).toBe(false)
    })
  })

  describe('needsCommunityReview', () => {
    it('should require review for low scores', () => {
      expect(needsCommunityReview(30, 'high')).toBe(true)
      expect(needsCommunityReview(39, 'high')).toBe(true)
    })

    it('should require review for low confidence', () => {
      expect(needsCommunityReview(85, 'low')).toBe(true)
      expect(needsCommunityReview(70, 'low')).toBe(true)
    })

    it('should not require review for good scores with high confidence', () => {
      expect(needsCommunityReview(70, 'high')).toBe(false)
      expect(needsCommunityReview(85, 'high')).toBe(false)
      expect(needsCommunityReview(50, 'high')).toBe(false) // Partial credit
    })
  })
})

describe('Example Scenarios', () => {
  it('Scenario 1: Beginner solves easy problem', () => {
    const result = calculateRatingChange(1000, 1200, false, 1.0)
    console.log('Beginner (1000) solves 1200-rated problem:', result)
    expect(result.change).toBeGreaterThan(40)
    expect(result.change).toBeLessThan(50)
  })

  it('Scenario 2: Intermediate solves hard problem', () => {
    const result = calculateRatingChange(1600, 2000, false, 1.0)
    console.log('Intermediate (1600) solves 2000-rated problem:', result)
    expect(result.change).toBeGreaterThan(30)
    expect(result.change).toBeLessThan(40)
  })

  it('Scenario 3: Expert solves medium problem', () => {
    const result = calculateRatingChange(2200, 1600, false, 1.0)
    console.log('Expert (2200) solves 1600-rated problem:', result)
    expect(result.change).toBeGreaterThan(0)
    expect(result.change).toBeLessThan(5)
  })

  it('Scenario 4: User views solution before solving', () => {
    const withoutViewing = calculateRatingChange(1400, 1800, false, 1.0)
    const withViewing = calculateRatingChange(1400, 1800, true, 1.0)
    console.log('Without viewing solution:', withoutViewing)
    console.log('With viewing solution:', withViewing)
    // Allow rounding difference of 1 point
    expect(Math.abs(withViewing.change - withoutViewing.change * 0.3)).toBeLessThan(1)
  })
})
