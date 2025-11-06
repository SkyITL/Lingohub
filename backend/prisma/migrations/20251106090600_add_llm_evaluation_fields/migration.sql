-- AlterTable
ALTER TABLE "solutions" ADD COLUMN "llmScore" INTEGER,
ADD COLUMN "llmFeedback" TEXT,
ADD COLUMN "llmConfidence" VARCHAR(255),
ADD COLUMN "isPartialCredit" BOOLEAN NOT NULL DEFAULT false;
