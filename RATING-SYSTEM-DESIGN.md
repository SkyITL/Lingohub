# LingoHub Rating System Design

## Overview
LingoHub uses an **Elo-like rating system** similar to Codeforces, where users gain or lose rating points based on solving problems of varying difficulty. This creates a competitive, gamified experience that motivates users to solve harder problems.

## Key Design Decisions

### ✅ **Solution Verification: Hybrid Approach**
Since linguistics problems are open-ended (no test cases), we use:
- **High-stakes problems** (>40 rating gain): Community voting required (+5 upvotes from users rated >1400)
- **Low-stakes problems** (≤40 rating gain): Auto-approved with basic checks + spot audits
- **Provisional ratings** shown immediately, finalized after verification

### ✅ **Anti-Cheat: Name Color System (Luogu-inspired)**
- Users get **color-coded names** based on rating tier (Green → Black/Gold)
- Cheaters get **🟤 BROWN** name for 6 months (or permanently)
- Brown users: rating frozen, excluded from leaderboard, solutions marked as suspicious
- **Deterrent through public shame** + rating penalties

### ✅ **Detection Mechanisms**
1. **Plagiarism detection**: Text similarity scoring (>85% = flagged)
2. **Behavioral analysis**: Time tracking, solve patterns, progression anomalies
3. **Community reporting**: Users can flag suspicious solutions
4. **Automatic checks**: Solution length, time spent, viewing patterns

### ✅ **Penalty System**
- Minor offense: Warning → -100 rating → 1 week brown
- Major offense (plagiarism): -300 rating + 1 month brown → -500 + 6 months → Permanent
- Severe (multiple accounts): Permanent ban

## Current Implementation Status

### ✅ Existing Infrastructure
- **User Model**: `rating` field (default: 1200)
- **Problem Model**:
  - `difficulty` (1-5 stars, visual indicator)
  - `rating` (1000-2400, complexity score)
- **UserProgress Model**: Tracks problem status (unsolved/solved/bookmarked)

### ❌ Missing Components (To Be Implemented)
- Rating calculation algorithm
- Rating history tracking
- Leaderboard system
- Rating update API endpoints
- Frontend rating displays

---

## Solution Verification & Anti-Cheat

### **The Challenge: Linguistics Problems Are Open-Ended**

Unlike algorithmic problems with test cases, linguistics olympiad problems often have:
- Multiple valid approaches
- Explanations that can't be auto-verified
- Partial credit scenarios
- Subjective evaluation of reasoning quality

### **Verification Strategy: Community + Automatic Checks**

#### **Option A: Trusted Community Voting (Recommended for MVP)**
1. User submits solution with detailed explanation
2. Solution becomes visible to community after submission
3. Other users can upvote/downvote solutions
4. **Solution is "verified" when**:
   - Gets +5 net upvotes from users with rating > 1400, OR
   - Gets +10 net upvotes from any users, OR
   - Gets manually approved by moderator/admin
5. Rating updates only after verification (prevents fake solves)

**Pros:**
- Community-driven quality control
- Scales well as user base grows
- Encourages high-quality explanations
- Natural anti-cheat (community spots plagiarism)

**Cons:**
- Delay between submission and rating update
- Requires active community

#### **Option B: Auto-Verification + Spot Checks**
1. User submits solution
2. Automatic checks:
   - Solution length > 100 characters (prevents empty submissions)
   - Time spent on problem > 5 minutes (prevents instant fake solves)
   - Check for plagiarism against other solutions (text similarity)
3. Solution auto-approved if passes checks
4. Random 10% sample manually reviewed by moderators
5. If caught cheating → rating rollback + penalty

**Pros:**
- Instant rating updates
- Better user experience (immediate feedback)
- Less reliance on community

**Cons:**
- Can be gamed by sophisticated cheaters
- Requires moderator resources

#### **Proposed Hybrid Approach** ✅

**For High-Stakes Problems (rating gain > 40)**:
- Require community verification (+5 upvotes)
- Show "Pending Verification" badge
- Provisional rating update (shown in gray)
- Finalize after verification

**For Low-Stakes Problems (rating gain ≤ 40)**:
- Auto-approve if passes basic checks
- Spot check 20% randomly
- Community can flag suspicious solutions

---

## Anti-Cheat System

### **1. Name Color System (Inspired by Luogu)**

User display names are color-coded by status:

| Color | Status | Condition |
|-------|--------|-----------|
| 🟢 **Green** | Newbie | Rating 0-1199 |
| 🔵 **Blue** | Pupil | Rating 1200-1399 |
| 🟣 **Purple** | Specialist | Rating 1400-1599 |
| 🟡 **Yellow** | Expert | Rating 1600-1899 |
| 🟠 **Orange** | Candidate Master | Rating 1900-2199 |
| 🔴 **Red** | Master | Rating 2200-2499 |
| ⚫ **Black/Gold** | Grandmaster | Rating 2500+ |
| 🟤 **BROWN** | **Cheater** | Caught cheating |

**Brown Name Penalties:**
- Permanent brown color for 6 months (or permanently for repeated offenses)
- Rating frozen at time of detection
- Solutions marked as "From Flagged Account"
- Cannot gain rating until probation ends
- Excluded from leaderboard
- Public shame (cheating record visible on profile)

### **2. Cheating Detection Mechanisms**

#### **A. Plagiarism Detection**
```typescript
// Check text similarity between solutions
function detectPlagiarism(newSolution: string, existingSolutions: string[]): number {
  // Use algorithms like:
  // 1. Levenshtein distance
  // 2. Cosine similarity on word vectors
  // 3. Check for unusual phrase matching

  const similarityThreshold = 0.85 // 85% similar = flagged
  return maxSimilarity
}
```

**Triggers:**
- Solution is >85% similar to another user's solution
- Solution is >80% similar to official solution (paraphrasing)
- Multiple users submit near-identical solutions within short timeframe

#### **B. Behavioral Analysis**
Track suspicious patterns:
- ⚠️ Solving hard problems (>1800 rating) with no progression
- ⚠️ Very short time to solve complex problems (<5 minutes)
- ⚠️ Unusual solve order (hardest problems first)
- ⚠️ Multiple accounts from same IP
- ⚠️ Copy-paste patterns (rapid submission after viewing others' solutions)

#### **C. Community Reporting**
- Users can flag solutions as "plagiarized" or "incorrect"
- Flagged solutions reviewed by moderators
- False flagging penalized (reduces reporter's credibility)

#### **D. Time-Based Validation**
```typescript
interface SolutionSubmission {
  problemId: string
  userId: string
  content: string
  timeSpent: number // milliseconds on problem page
  viewedOfficialSolution: boolean
  viewedCommunitySolutions: string[] // IDs of solutions viewed
}
```

**Red flags:**
- Time spent < 5 minutes on hard problems
- Submitted immediately after viewing solution
- Suspiciously consistent solve times across all problems

### **3. Penalty System**

| Offense | First | Second | Third+ |
|---------|-------|--------|--------|
| **Minor** (suspicious pattern) | Warning | -100 rating | 1 week brown |
| **Major** (confirmed plagiarism) | -300 rating + 1 month brown | -500 rating + 6 months brown | Permanent brown + rating reset |
| **Severe** (multiple accounts, selling solutions) | Permanent ban | - | - |

### **4. Appeal System**
- Users can appeal brown status
- Provide evidence of original work
- Moderators review within 7 days
- If successful: status restored, rating restored

---

## Rating System Mechanics

### 1. **Rating Scale**
- **User Rating Range**: 0 - 3500 (no upper limit in theory)
- **Problem Rating Range**: 1000 - 2400 (based on difficulty labels)
- **Starting Rating**: 1200 (default for new users)

### 2. **Rating Calculation Formula**

We use a modified Elo system similar to competitive programming platforms:

```
ΔRating = K × (ActualPerformance - ExpectedPerformance)
```

Where:
- **K** = Rating change coefficient (depends on user rating)
  - K = 60 for rating < 1500
  - K = 40 for rating 1500-2000
  - K = 20 for rating > 2000

- **ExpectedPerformance** = Probability of solving the problem
  ```
  P(solve) = 1 / (1 + 10^((ProblemRating - UserRating) / 400))
  ```

- **ActualPerformance**:
  - 1.0 if solved correctly
  - 0.0 if not solved (we don't penalize for attempts)

- **Penalty for viewing solution**:
  - If user views official solution before solving: ΔRating × 0.3
  - Encourages independent problem-solving

### 3. **Rating Update Triggers**

Rating updates occur when:
1. ✅ **User solves a problem** (status changes to "solved")
2. ✅ **User submits a solution** that gets approved
3. ❌ **User views official solution** (marks problem with penalty flag)

**Important Rules:**
- Each problem contributes to rating **only once** (first solve)
- Viewing solution before solving reduces rating gain to 30%
- No rating loss for failed attempts (encourages exploration)
- Re-solving a problem doesn't change rating

### 4. **Example Calculations**

#### Example 1: Beginner solves easy problem
- User Rating: 1000
- Problem Rating: 1200
- Expected Performance: P(solve) = 1 / (1 + 10^((1200-1000)/400)) = 1 / (1 + 10^0.5) ≈ 0.24
- K = 60 (user rating < 1500)
- ΔRating = 60 × (1.0 - 0.24) = 60 × 0.76 ≈ **+46 points**

#### Example 2: Intermediate solves hard problem
- User Rating: 1600
- Problem Rating: 2000
- Expected Performance: P(solve) = 1 / (1 + 10^((2000-1600)/400)) = 1 / (1 + 10^1) ≈ 0.09
- K = 40 (user rating 1500-2000)
- ΔRating = 40 × (1.0 - 0.09) = 40 × 0.91 ≈ **+36 points**

#### Example 3: Expert solves medium problem
- User Rating: 2200
- Problem Rating: 1600
- Expected Performance: P(solve) = 1 / (1 + 10^((1600-2200)/400)) = 1 / (1 + 10^-1.5) ≈ 0.97
- K = 20 (user rating > 2000)
- ΔRating = 20 × (1.0 - 0.97) = 20 × 0.03 ≈ **+1 point**

#### Example 4: User views solution before solving
- User Rating: 1400
- Problem Rating: 1800
- Expected Performance: P(solve) ≈ 0.14
- K = 60
- Base ΔRating = 60 × (1.0 - 0.14) = 51.6
- **With penalty**: 51.6 × 0.3 ≈ **+15 points** (70% penalty)

---

## Database Schema Changes

### New Table: `RatingHistory`
Track all rating changes for transparency and analytics.

```prisma
model RatingHistory {
  id          String   @id @default(cuid())
  userId      String
  problemId   String
  oldRating   Int
  newRating   Int
  change      Int      // Can be negative
  problemRating Int    // Problem rating at time of solve
  viewedSolution Boolean @default(false)
  verified    Boolean  @default(false) // NEW: solution verification status
  createdAt   DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([problemId])
  @@map("rating_history")
}
```

### Updated `User` Model
Add anti-cheat fields.

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique @db.VarChar(50)
  email     String   @unique @db.VarChar(255)
  password  String
  rating    Int      @default(1200)

  // NEW: Anti-cheat fields
  isCheater Boolean  @default(false)
  cheaterUntil DateTime? // null = permanent, date = temporary ban
  cheatingStrikes Int @default(0) // Track number of offenses

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  solutions   Solution[]
  discussions Discussion[]
  progress    UserProgress[]
  votes       SolutionVote[]
  ratingHistory RatingHistory[]
  solutionFlags SolutionFlag[] // NEW
  receivedFlags SolutionFlag[] @relation("FlaggedUser") // NEW

  @@map("users")
}
```

### Updated `Solution` Model
Add verification and anti-cheat tracking.

```prisma
model Solution {
  id        String   @id @default(cuid())
  problemId String
  userId    String
  content   String   @db.Text
  voteScore Int      @default(0)
  status    String   @default("pending") // NEW: pending, verified, flagged, approved

  // NEW: Anti-cheat fields
  timeSpent Int      @default(0) // milliseconds spent on problem before submission
  viewedSolutions String[] @default([]) // IDs of solutions user viewed before submitting
  similarityScore Float?   // Plagiarism detection score (0-1)
  flagCount Int      @default(0) // Number of times flagged

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  problem Problem        @relation(fields: [problemId], references: [id], onDelete: Cascade)
  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  votes   SolutionVote[]
  flags   SolutionFlag[] // NEW

  @@map("solutions")
}
```

### New Table: `SolutionFlag`
Track community reports of plagiarism/cheating.

```prisma
model SolutionFlag {
  id         String   @id @default(cuid())
  solutionId String
  reporterId String
  flaggedUserId String // User who submitted the flagged solution
  reason     String   @db.VarChar(50) // "plagiarism", "incorrect", "spam"
  details    String?  @db.Text
  status     String   @default("pending") // pending, reviewed, confirmed, rejected
  reviewedBy String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  solution     Solution @relation(fields: [solutionId], references: [id], onDelete: Cascade)
  reporter     User     @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  flaggedUser  User     @relation("FlaggedUser", fields: [flaggedUserId], references: [id], onDelete: Cascade)

  @@index([solutionId])
  @@index([flaggedUserId])
  @@map("solution_flags")
}
```

### Updated `UserProgress` Model
Add field to track if rating was already gained from this problem.

```prisma
model UserProgress {
  userId         String
  problemId      String
  status         String   @default("unsolved")
  viewedSolution Boolean  @default(false)
  ratingGained   Boolean  @default(false) // NEW: prevent duplicate rating gains
  startedAt      DateTime? // NEW: when user first opened problem
  lastAttempt    DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)

  @@id([userId, problemId])
  @@map("user_progress")
}
```

---

## API Endpoints

### 1. **GET /api/users/:id/rating-history**
Get user's rating change history.

**Response:**
```json
{
  "rating": 1456,
  "history": [
    {
      "id": "...",
      "problemNumber": "LH-IOL-2023-1",
      "problemTitle": "IOL 2023 Problem 1",
      "oldRating": 1200,
      "newRating": 1246,
      "change": +46,
      "problemRating": 1400,
      "viewedSolution": false,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 2. **POST /api/problems/:id/submit-solution**
Submit solution and update rating.

**Request:**
```json
{
  "content": "Solution explanation...",
  "viewedSolution": false
}
```

**Response:**
```json
{
  "success": true,
  "solution": { ... },
  "ratingChange": {
    "oldRating": 1200,
    "newRating": 1246,
    "change": +46,
    "viewedSolution": false
  }
}
```

### 3. **PUT /api/problems/:id/view-solution**
Mark that user viewed the official solution.

**Response:**
```json
{
  "success": true,
  "viewedSolution": true,
  "warning": "Solving this problem will now give reduced rating (+30%)"
}
```

### 4. **GET /api/leaderboard**
Get top users by rating (excludes cheaters).

**Query params:**
- `limit` (default: 100)
- `page` (default: 1)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "linguistics_master",
      "rating": 2450,
      "ratingTier": "master",
      "isCheater": false,
      "solveCount": 156
    }
  ],
  "pagination": { ... }
}
```

### 5. **POST /api/solutions/:id/flag**
Flag a solution as plagiarized or incorrect.

**Request:**
```json
{
  "reason": "plagiarism", // or "incorrect", "spam"
  "details": "This solution is nearly identical to user123's solution..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solution flagged for review",
  "flagId": "..."
}
```

### 6. **POST /api/problems/:id/track-time**
Track time spent on problem (called periodically from frontend).

**Request:**
```json
{
  "action": "start" | "update" | "end",
  "timeSpent": 60000 // milliseconds
}
```

**Response:**
```json
{
  "success": true,
  "totalTime": 120000
}
```

### 7. **GET /api/admin/flags**
Get pending solution flags for moderation (admin only).

**Response:**
```json
{
  "flags": [
    {
      "id": "...",
      "solution": { ... },
      "reporter": { username: "user1" },
      "flaggedUser": { username: "user2", rating: 1500 },
      "reason": "plagiarism",
      "details": "...",
      "status": "pending",
      "createdAt": "..."
    }
  ]
}
```

### 8. **PUT /api/admin/flags/:id/review**
Review and resolve a flag (admin only).

**Request:**
```json
{
  "action": "confirm" | "reject",
  "penaltyType": "minor" | "major" | "severe",
  "notes": "Confirmed plagiarism from official solution"
}
```

**Response:**
```json
{
  "success": true,
  "penaltyApplied": {
    "userId": "...",
    "oldRating": 1500,
    "newRating": 1200,
    "isCheater": true,
    "cheaterUntil": "2025-07-01T00:00:00Z"
  }
}
```

---

## Frontend Components

### 1. **User Profile Rating Display**
```tsx
<div className="rating-badge">
  <span className="rating-number">{user.rating}</span>
  <span className="rating-tier">{getRatingTier(user.rating)}</span>
</div>
```

**Rating Tiers** (color-coded):
- 🟢 Newbie: 0-1199 (green)
- 🔵 Pupil: 1200-1399 (blue)
- 🟣 Specialist: 1400-1599 (purple)
- 🟡 Expert: 1600-1899 (yellow)
- 🟠 Candidate Master: 1900-2199 (orange)
- 🔴 Master: 2200-2499 (red)
- ⚫ Grandmaster: 2500+ (black/gold)

### 2. **Problem Page Rating Info**
```tsx
<div className="problem-rating-info">
  <div className="problem-rating">
    <span className="label">Problem Rating:</span>
    <span className="value">{problem.rating}</span>
  </div>
  <div className="expected-gain">
    <span className="label">Expected gain:</span>
    <span className="value">+{calculateExpectedGain(user.rating, problem.rating)}</span>
  </div>
</div>
```

### 3. **Rating History Chart**
Display user's rating over time with a line chart (use recharts or similar).

### 4. **Leaderboard Page**
Table showing top users with:
- Rank
- Username
- Rating (color-coded by tier)
- Problems Solved
- Recent activity

---

## Implementation Plan

### Phase 1: Database & Backend (Week 1)
- [ ] Create migration for `RatingHistory` table
- [ ] Update `UserProgress` model with `ratingGained` field
- [ ] Implement rating calculation utility functions
- [ ] Create rating update API endpoints
- [ ] Add leaderboard API endpoint

### Phase 2: Frontend Integration (Week 2)
- [ ] Update shared types with rating-related interfaces
- [ ] Create rating badge component
- [ ] Add rating display to user profiles
- [ ] Show expected rating gain on problem pages
- [ ] Implement rating history page

### Phase 3: Leaderboard & Social (Week 3)
- [ ] Create leaderboard page
- [ ] Add rating tier badges throughout UI
- [ ] Implement rating change notifications
- [ ] Add "solution viewed" warnings

### Phase 4: Testing & Refinement (Week 4)
- [ ] Test rating calculations with various scenarios
- [ ] Verify no duplicate rating gains
- [ ] Balance K-factor values based on user feedback
- [ ] Add analytics for rating distribution

---

## Open Questions

1. **Should we show rating changes immediately or batch them?**
   - Proposal: Show immediately for instant feedback

2. **Should we have a provisional rating period for new users?**
   - Proposal: First 10 problems have higher K-factor (80) for faster calibration

3. **Should we penalize viewing community solutions?**
   - Proposal: No penalty for community solutions, only official solutions

4. **Should we have rating decay for inactive users?**
   - Proposal: No decay for now, but track "active rating" for leaderboard

5. **Should rating affect problem recommendations?**
   - Proposal: Yes, suggest problems ±200 rating points from user rating

---

## Success Metrics

- **User Engagement**: Track daily active users and problem solve rate
- **Rating Distribution**: Aim for normal distribution centered around 1400
- **Leaderboard Activity**: Monitor top 100 user activity weekly
- **Problem Coverage**: Ensure all difficulty ranges get solved regularly

---

## References

- [Codeforces Rating System](https://codeforces.com/blog/entry/20762)
- [Elo Rating System](https://en.wikipedia.org/wiki/Elo_rating_system)
- [LeetCode Contest Rating](https://leetcode.com/discuss/general-discussion/468851/)
