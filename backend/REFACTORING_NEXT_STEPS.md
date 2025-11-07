# Submissions vs Solutions Refactoring - Phase 2 TODO

## Current Status (Phase 1 Complete ✅)

### Database Migration
- ✅ Renamed `solutions` table → `submissions`
- ✅ Renamed `solution_evaluations` → `submission_evaluations`
- ✅ Renamed `solution_flags` → `submission_flags`
- ✅ Created new empty `solutions` table for write-ups (题解)
- ✅ All existing data preserved in `submissions` table
- ✅ Migration deployed to production successfully

### Schema Updated
- ✅ Submission model: Private attempts with AI judging
- ✅ Solution model: Public write-ups/tutorials
- ✅ Prisma client generated

## ⚠️ Breaking Changes

**The app is currently BROKEN because routes still reference the old `Solution` model.**

## Phase 2 Tasks (Backend Routes)

### 1. Update `src/routes/submissions.ts` (~600 lines)

**Find/Replace all occurrences:**
- `prisma.solution` → `prisma.submission`
- `Solution` → `Submission` (TypeScript types)
- `solutionId` → `submissionId` (parameter names)
- `SolutionVote` → No voting on submissions (remove)
- `SolutionEvaluation` → `SubmissionEvaluation`

**Remove from submissions:**
- Voting endpoints (`POST /:id/vote`) - submissions don't have votes
- Public discovery endpoint - submissions are private

**Keep in submissions:**
- `GET /submissions` - List all submissions (with privacy filtering)
- `POST /` - Submit solution attempt
- `PUT /:id` - Edit submission
- `DELETE /:id` - Delete submission
- `GET /:id` - Get single submission (own only)

### 2. Create new `src/routes/solutions.ts` for 题解

**New endpoints needed:**
```typescript
// GET /solutions/problem/:problemId - Get all solutions for a problem
// POST /solutions - Create new solution write-up
// PUT /solutions/:id - Edit solution
// DELETE /solutions/:id - Delete solution
// POST /solutions/:id/vote - Vote on solution
// GET /solutions/:id - Get single solution (public)
```

**Solution model fields:**
- title: String (required)
- content: Text/Markdown
- problemId: Foreign key
- userId: Author
- voteScore: Int
- viewCount: Int

### 3. Update `src/server.ts`

**Current:**
```typescript
import solutionsRouter from './routes/solutions'
app.use('/api/solutions', solutionsRouter)
```

**Change to:**
```typescript
import submissionsRouter from './routes/submissions'
import solutionsRouter from './routes/solutions'

app.use('/api/submissions', submissionsRouter)
app.use('/api/solutions', solutionsRouter)
```

## Phase 3 Tasks (Frontend)

### 1. Update `frontend/src/lib/api.ts`

**Rename and separate:**
```typescript
// Submissions API (private attempts)
export const submissionsApi = {
  getAll: () => api.get('/submissions'),
  getById: (id) => api.get(`/submissions/${id}`),
  submit: (problemId, content, files?) => api.post('/submissions', ...),
  edit: (id, content, files?) => api.put(`/submissions/${id}`, ...),
  delete: (id) => api.delete(`/submissions/${id}`)
}

// Solutions API (public write-ups)
export const solutionsApi = {
  getByProblem: (problemId) => api.get(`/solutions/problem/${problemId}`),
  create: (problemId, title, content) => api.post('/solutions', ...),
  edit: (id, title, content) => api.put(`/solutions/${id}`, ...),
  delete: (id) => api.delete(`/solutions/${id}`),
  vote: (id, vote) => api.post(`/solutions/${id}/vote`, ...)
}
```

### 2. Update `/submissions` page

**Current path:** `/frontend/src/app/submissions/page.tsx`

**Changes needed:**
- Use `submissionsApi.getAll()` instead of `solutionsApi.getAllSubmissions()`
- Update API response handling

### 3. Update Problem Page

**File:** `/frontend/src/app/problems/[id]/ProblemPageClient.tsx`

**Current tabs:**
- Problem
- Submit Solution → Change to "Submit Attempt" (提交)
- Solutions → Keep but show 题解 instead

**Changes:**
- Submission form calls `submissionsApi.submit()`
- After submit, redirect to `/submissions`
- Solutions tab loads public write-ups via `solutionsApi.getByProblem()`
- Add "Write Solution (写题解)" button → opens form to create tutorial

### 4. Create Solution Write-up Form

**New component or modal:**
- Title input
- Markdown editor for content
- Preview
- Submit button calls `solutionsApi.create()`

## Testing Checklist

After Phase 2 & 3:

Backend:
- [ ] Can submit new attempt
- [ ] Submission appears in /submissions list
- [ ] AI evaluation works
- [ ] Can edit/delete own submission
- [ ] Cannot see others' submission content
- [ ] Can create new solution write-up
- [ ] Can vote on solutions

Frontend:
- [ ] Submit form works
- [ ] Redirects to /submissions
- [ ] Submissions page loads all records
- [ ] Can filter My Submissions
- [ ] Solutions tab shows write-ups
- [ ] Can create new solution write-up
- [ ] Can vote on solutions

## Key Differences Summary

| Feature | Submissions (提交) | Solutions (题解) |
|---------|-------------------|-----------------|
| **Purpose** | Solve the problem | Explain approach |
| **Privacy** | Private (own only) | Public (all users) |
| **Content** | Answer attempt | Tutorial/explanation |
| **AI Judge** | ✅ Yes | ❌ No |
| **Voting** | ❌ No | ✅ Yes |
| **Title** | ❌ No | ✅ Yes |
| **Edit** | ✅ Yes | ✅ Yes |
| **View Count** | ❌ No | ✅ Yes |
| **Attachments** | ✅ Yes (images/PDFs) | ❌ No (markdown only) |

## Estimated Work

- Backend routes update: ~2 hours
- Frontend API update: ~30 min
- Frontend UI update: ~2 hours
- Testing: ~1 hour

**Total: ~5-6 hours**

## Notes

- Keep both endpoints separate: `/api/submissions` vs `/api/solutions`
- Submissions page shows status/scores of attempts
- Solutions page shows community write-ups/tutorials
- User can have multiple submissions but should write one quality solution
