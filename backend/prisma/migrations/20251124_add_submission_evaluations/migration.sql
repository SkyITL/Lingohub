-- CreateTable
CREATE TABLE "submission_evaluations" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "correctness" INTEGER NOT NULL,
    "reasoning" INTEGER NOT NULL,
    "coverage" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "confidence" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modelUsed" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "evaluationTime" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submission_evaluations_submissionId_key" ON "submission_evaluations"("submissionId");

-- AddForeignKey
ALTER TABLE "submission_evaluations" ADD CONSTRAINT "submission_evaluations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
