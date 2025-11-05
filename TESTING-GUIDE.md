# Rating System Testing Guide

## Prerequisites

Before testing, ensure you have:
- Node.js installed
- PostgreSQL running (for integration tests)
- Dependencies installed: `cd backend && npm install`

## Unit Tests

### Test Rating Calculations

```bash
cd backend

# Run rating utility tests
npm test -- rating.test.ts

# Run with coverage
npm test -- --coverage rating.test.ts
```

**What gets tested:**
- ✅ Expected performance calculations (Elo formula)
- ✅ K-factor boundaries (60/40/20)
- ✅ Rating change calculations
- ✅ Solution viewing penalties (70% reduction)
- ✅ Partial credit handling
- ✅ Rating tier assignments
- ✅ Submission limit progression
- ✅ LLM evaluation score validation
- ✅ Auto-approval logic
- ✅ Community review routing

**Expected output:**
```
PASS  src/utils/__tests__/rating.test.ts
  Rating Calculations
    ✓ calculateExpectedPerformance (5ms)
    ✓ getKFactor (2ms)
    ✓ calculateRatingChange (3ms)
    ✓ getRatingTier (2ms)
    ✓ getSubmissionLimits (1ms)
  LLM Evaluation Helpers
    ✓ validateEvaluationScores (2ms)
    ✓ calculateTotalScore (1ms)
    ✓ shouldAutoApprove (1ms)
    ✓ isPartialCredit (1ms)
    ✓ needsCommunityReview (1ms)
  Example Scenarios
    ✓ Scenario 1: Beginner solves easy problem (2ms)
    ✓ Scenario 2: Intermediate solves hard problem (1ms)
    ✓ Scenario 3: Expert solves medium problem (1ms)
    ✓ Scenario 4: User views solution before solving (2ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

### Manual Test: Rating Calculations

Create a test script to verify rating calculations:

```bash
cd backend
node -e "
const { calculateRatingChange, getRatingTier } = require('./dist/utils/rating');

// Test scenarios
console.log('=== Rating Calculation Tests ===\n');

// Scenario 1: Beginner solves easy problem
const test1 = calculateRatingChange(1000, 1200, false, 1.0);
console.log('1. Beginner (1000) solves 1200-rated problem:');
console.log('   Change:', test1.change, 'points');
console.log('   New rating:', test1.newRating);
console.log('   Tier:', getRatingTier(test1.newRating).name, '\n');

// Scenario 2: With solution viewing penalty
const test2 = calculateRatingChange(1000, 1200, true, 1.0);
console.log('2. Same but viewed solution first:');
console.log('   Change:', test2.change, 'points (70% penalty)');
console.log('   New rating:', test2.newRating, '\n');

// Scenario 3: Expert solves hard problem
const test3 = calculateRatingChange(2200, 2400, false, 1.0);
console.log('3. Expert (2200) solves 2400-rated problem:');
console.log('   Change:', test3.change, 'points');
console.log('   New rating:', test3.newRating);
console.log('   Tier:', getRatingTier(test3.newRating).name, '\n');

// Scenario 4: Partial credit
const test4 = calculateRatingChange(1500, 1700, false, 0.5);
console.log('4. Intermediate (1500) gets partial credit on 1700:');
console.log('   Change:', test4.change, 'points (50% credit)');
console.log('   New rating:', test4.newRating, '\n');
"
```

## Integration Tests (Future)

### Test Rate Limiting

Once the database is set up:

```bash
# Test rate limit enforcement
curl -X POST http://localhost:4000/api/test/rate-limit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Should succeed 5 times, then return 429
```

### Test Solution Submission Flow

```bash
# Submit a test solution
curl -X POST http://localhost:4000/api/problems/LH-IOL-2023-1/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test solution explanation...",
    "timeSpent": 1800000,
    "viewedOfficialSolution": false
  }'

# Expected response:
{
  "success": true,
  "solution": { "id": "...", ... },
  "evaluation": {
    "totalScore": 75,
    "confidence": "high",
    "feedback": "Your analysis correctly identifies...",
    "approved": true
  },
  "ratingChange": {
    "oldRating": 1200,
    "newRating": 1235,
    "change": +35
  }
}
```

## Manual Testing Checklist

### ✅ Phase 1: Rating Calculations (Completed)

- [ ] Run unit tests for rating utilities
- [ ] Verify K-factor boundaries (1499 → 60, 1500 → 40, 2000 → 20)
- [ ] Test rating tiers at boundaries
- [ ] Verify penalty calculations
- [ ] Test extreme rating differences

### ⏳ Phase 2: Rate Limiting (Ready to Test)

- [ ] Submit 5 solutions rapidly (should succeed)
- [ ] Submit 6th solution (should fail with 429)
- [ ] Wait 1 minute, submit again (should succeed)
- [ ] Submit 21 solutions in a day (should hit daily limit)
- [ ] Test progressive limits with different user ratings

### ⏳ Phase 3: LLM Evaluation (Pending Implementation)

- [ ] Submit solution with LLM API key set
- [ ] Verify score breakdown (correctness, reasoning, coverage, clarity)
- [ ] Test auto-approval (score ≥ 70, confidence = high)
- [ ] Test partial credit (score 40-69)
- [ ] Test community review routing (score < 40 or low confidence)
- [ ] Verify cost tracking

### ⏳ Phase 4: Full Submission Flow (Pending)

- [ ] Submit solution without viewing official solution
- [ ] Verify rating update in database
- [ ] Submit solution after viewing official solution
- [ ] Verify 70% penalty applied
- [ ] Submit multiple solutions to same problem
- [ ] Verify only first submission counts for rating
- [ ] Test rate limit enforcement
- [ ] Verify database transactions (atomic updates)

## Database Inspection

### Check Rating History

```bash
# Connect to PostgreSQL
psql lingohub

# View recent rating changes
SELECT
  u.username,
  p.number as problem,
  rh.old_rating,
  rh.new_rating,
  rh.change,
  rh.viewed_solution,
  rh.created_at
FROM rating_history rh
JOIN users u ON rh.user_id = u.id
JOIN problems p ON rh.problem_id = p.id
ORDER BY rh.created_at DESC
LIMIT 10;
```

### Check Rate Limit Logs

```sql
SELECT
  u.username,
  rl.action_type,
  rl.rate_limit_hit,
  rl.timestamp
FROM rate_limit_logs rl
JOIN users u ON rl.user_id = u.id
ORDER BY rl.timestamp DESC
LIMIT 20;
```

### Check Solution Evaluations

```sql
SELECT
  u.username,
  p.number as problem,
  se.total_score,
  se.confidence,
  se.model_used,
  se.cost,
  s.status
FROM solution_evaluations se
JOIN solutions s ON se.solution_id = s.id
JOIN users u ON s.user_id = u.id
JOIN problems p ON s.problem_id = p.id
ORDER BY se.created_at DESC
LIMIT 10;
```

## Performance Testing

### Rate Limit Cache Performance

```javascript
// Test in-memory cache performance
const { checkRateLimit } = require('./dist/middleware/rateLimit')

console.time('Rate limit check (cached)')
for (let i = 0; i < 1000; i++) {
  await checkRateLimit('test-user-id', 1500)
}
console.timeEnd('Rate limit check (cached)')
// Expected: < 10ms for 1000 checks
```

### Rating Calculation Performance

```javascript
const { calculateRatingChange } = require('./dist/utils/rating')

console.time('Rating calculations')
for (let i = 0; i < 10000; i++) {
  calculateRatingChange(1500, 1700, false, 1.0)
}
console.timeEnd('Rating calculations')
// Expected: < 50ms for 10000 calculations
```

## Debugging Tips

### Enable Verbose Logging

```typescript
// In backend/src/utils/rating.ts
export function calculateRatingChange(...) {
  console.log('Rating calculation:', {
    userRating,
    problemRating,
    expectedPerformance,
    kFactor,
    rawChange,
    finalChange
  })
  // ...
}
```

### Inspect Rate Limit Cache

```typescript
// In backend/src/middleware/rateLimit.ts
export function debugRateLimitCache() {
  console.log('Rate limit cache:', {
    entries: rateLimitCache.size,
    users: Array.from(rateLimitCache.keys()),
  })
}
```

### Test LLM Evaluation (Mock)

```typescript
// Create mock LLM response for testing
const mockEvaluation = {
  totalScore: 75,
  correctness: 32,
  reasoning: 24,
  coverage: 12,
  clarity: 7,
  confidence: 'high',
  feedback: 'Good analysis of morphological patterns.',
  errors: ['Missing discussion of vowel harmony'],
  strengths: ['Clear table organization', 'Correct pattern identification'],
  suggestions: ['Consider phonological context']
}
```

## Common Issues

### Issue 1: Rate limit not enforcing
**Symptom:** Can submit unlimited times
**Fix:** Check auth middleware is attached before rate limit middleware

### Issue 2: Rating calculations seem off
**Symptom:** Unexpected rating changes
**Debug:** Log expected performance and K-factor values

### Issue 3: Tests failing with Prisma errors
**Symptom:** `PrismaClient is not instantiated`
**Fix:** Mock Prisma client in tests or use test database

## Next Steps

Once basic tests pass:

1. **Deploy schema changes** to production database
2. **Add LLM API keys** to environment variables
3. **Implement LLM evaluation service**
4. **Create solution submission endpoint**
5. **Test end-to-end flow** with real problems
6. **Monitor costs** and adjust limits if needed

## Test Data

### Sample Users

| Username | Rating | Tier | Hourly Limit | Daily Limit |
|----------|--------|------|--------------|-------------|
| newbie_test | 1100 | Newbie | 5 | 20 |
| pupil_test | 1300 | Pupil | 5 | 20 |
| specialist_test | 1500 | Specialist | 6 | 25 |
| expert_test | 1700 | Expert | 8 | 30 |
| master_test | 2100 | Master | 10 | 40 |

### Sample Problems

| Number | Title | Rating | Expected Change (1500 user) |
|--------|-------|--------|-----------------------------|
| LH-TEST-EASY | Easy Test | 1200 | +8 points |
| LH-TEST-MED | Medium Test | 1500 | +20 points |
| LH-TEST-HARD | Hard Test | 1800 | +30 points |
| LH-TEST-VHARD | Very Hard | 2100 | +36 points |
