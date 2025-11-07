-- Step 1: Rename solutions table to submissions
ALTER TABLE "solutions" RENAME TO "submissions";

-- Step 1b: Rename primary key constraint
ALTER INDEX "solutions_pkey" RENAME TO "submissions_pkey";

-- Step 2: Rename solution_evaluations to submission_evaluations (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solution_evaluations') THEN
        ALTER TABLE "solution_evaluations" RENAME TO "submission_evaluations";
        ALTER TABLE "submission_evaluations" RENAME COLUMN "solutionId" TO "submissionId";
    END IF;
END $$;

-- Step 3: Rename solution_flags to submission_flags (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solution_flags') THEN
        ALTER TABLE "solution_flags" RENAME TO "submission_flags";
        ALTER TABLE "submission_flags" RENAME COLUMN "solutionId" TO "submissionId";
    END IF;
END $$;

-- Step 4: Clear solution_votes table (will be used for new Solutions write-ups)
TRUNCATE TABLE "solution_votes";

-- Step 7: Create new solutions table for write-ups (题解)
CREATE TABLE "solutions" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "voteScore" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("id")
);

-- Step 8: Add foreign key constraints for new solutions table
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Create indexes
CREATE INDEX "solutions_problemId_idx" ON "solutions"("problemId");
CREATE INDEX "solutions_userId_idx" ON "solutions"("userId");
