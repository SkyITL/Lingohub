# LingoHub Improvements TODO

## Current Issues

### 1. Frontend Pagination ⚠️ HIGH PRIORITY
**Problem**: Users only see 12 problems and think that's all we have
**Impact**: Poor UX, users don't know there are 342+ more problems

**Solution**: Add pagination controls to problems page

**Implementation Steps**:
1. Add pagination state to problems page:
```typescript
const [page, setPage] = useState(1)
const limit = 24 // or 12, configurable
```

2. Pass page to API filters:
```typescript
apiFilters.page = page
apiFilters.limit = limit
```

3. Add pagination UI component at bottom of problem list:
```jsx
{apiResponse?.pagination && (
  <div className="flex justify-center gap-2 mt-6">
    <Button 
      disabled={page === 1}
      onClick={() => setPage(p => p - 1)}
    >
      Previous
    </Button>
    <span>Page {page} of {apiResponse.pagination.totalPages}</span>
    <Button 
      disabled={page >= apiResponse.pagination.totalPages}
      onClick={() => setPage(p => p + 1)}
    >
      Next
    </Button>
  </div>
)}
```

4. Show total count:
```jsx
<div className="text-gray-600 mb-4">
  Found {apiResponse?.pagination.total} problems 
  (showing {apiProblems.length})
</div>
```

**Files to modify**:
- `frontend/src/app/problems/page.tsx`

---

### 2. Backend Performance 🐌 MEDIUM PRIORITY
**Problem**: API queries are slow, using too many resources
**Impact**: Slow page loads, high database costs

**Current Issues**:
- Loading all tags for each problem (N+1 query problem)
- Not using database indexes effectively
- No caching

**Solutions**:

#### A. Optimize Database Queries
```typescript
// Current: Separate queries for each problem's tags
// Better: Use Prisma's include with proper eager loading

const problems = await prisma.problem.findMany({
  where,
  select: {
    id: true,
    number: true,
    title: true,
    // ... other fields
    tags: {
      select: {
        tag: {
          select: {
            name: true
          }
        }
      }
    }
  },
  // IMPORTANT: Add take/skip for pagination
  take: limitNum,
  skip: offset,
  orderBy
})
```

#### B. Add Database Indexes
Add to `schema.prisma`:
```prisma
model Problem {
  // ... existing fields
  
  @@index([source])
  @@index([year])
  @@index([difficulty])
  @@index([rating])
  @@index([createdAt])
}

model Tag {
  // ... existing fields
  
  @@index([name])
  @@index([category])
}
```

Then run:
```bash
cd backend
npx prisma migrate dev --name add_performance_indexes
npm run migrate:deploy
```

#### C. Add Response Caching
```typescript
// In problems route
import NodeCache from 'node-cache'
const cache = new NodeCache({ stdTTL: 300 }) // 5 min cache

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  const cacheKey = JSON.stringify(req.query)
  const cached = cache.get(cacheKey)
  
  if (cached) {
    return res.json(cached)
  }
  
  // ... existing query logic
  
  const result = { problems: transformedProblems, pagination }
  cache.set(cacheKey, result)
  res.json(result)
})
```

**Files to modify**:
- `backend/src/routes/problems.ts`
- `backend/prisma/schema.prisma`

---

### 3. Database Cleanup ✅ IN PROGRESS
**Status**: Backend deployed, waiting to delete 90 TBD placeholder problems

**Expected Result**: 432 problems → 342 real problems (after removing TBD)

---

## Performance Metrics

### Current
- **API response time**: ~2-5 seconds (slow!)
- **Problems returned**: 12 per page
- **Total problems**: 432 (90 are placeholders)
- **Database queries**: ~15-20 per request (N+1 problem)

### Target
- **API response time**: <500ms
- **Problems per page**: 24
- **Total real problems**: 342
- **Database queries**: 1-2 per request

---

## Migration to Alicloud (Future)

If performance issues persist on Vercel, consider migrating to Alicloud:

**Benefits**:
- **10x faster** in China
- **No deployment limits**
- **Better database performance** (dedicated PostgreSQL vs serverless)
- **Lower costs** for high traffic

**Cost**: ~¥370-400/month (~$50-55/month)

**Setup time**: 2-3 hours

---

## Quick Wins (Do These First!)

1. **Add pagination UI** (30 minutes)
   - Users can see all problems
   - Immediate UX improvement

2. **Delete TBD problems** (done automatically in 2 min)
   - Cleaner database
   - Accurate problem count

3. **Add database indexes** (15 minutes)
   - 2-3x faster queries
   - No code changes needed

4. **Show total count** (5 minutes)
   - Users know how many problems exist
   - Better transparency

---

**Next Action**: Implement frontend pagination (highest priority)
**Estimated Time**: 30-45 minutes
**Impact**: HIGH - Users will see all problems

