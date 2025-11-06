-- AlterTable for UserProgress
ALTER TABLE "user_progress" ADD COLUMN IF NOT EXISTS "ratingGained" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);
