-- AlterTable for UserProgress
ALTER TABLE "user_progress" ADD COLUMN IF NOT EXISTS "ratingGained" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);

-- AlterTable for RatingHistory
ALTER TABLE "rating_history" ADD COLUMN IF NOT EXISTS "viewedSolution" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;
