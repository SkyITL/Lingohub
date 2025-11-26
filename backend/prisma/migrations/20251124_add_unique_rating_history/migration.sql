-- DeleteIndex
DROP INDEX IF EXISTS "rating_history_userId_idx";
DROP INDEX IF EXISTS "rating_history_problemId_idx";

-- Delete duplicate rating history entries, keeping only the latest for each user-problem pair
DELETE FROM "rating_history" 
WHERE "id" NOT IN (
  SELECT DISTINCT ON ("userId", "problemId") "id" 
  FROM "rating_history" 
  ORDER BY "userId", "problemId", "createdAt" DESC
);

-- CreateIndex
CREATE UNIQUE INDEX "rating_history_userId_problemId_key" ON "rating_history"("userId", "problemId");

-- CreateIndex  
CREATE INDEX "rating_history_userId_idx" ON "rating_history"("userId");

-- CreateIndex
CREATE INDEX "rating_history_problemId_idx" ON "rating_history"("problemId");
