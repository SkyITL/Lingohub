import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface OlympiadProblem {
  number: string;
  title: string;
  source: string;
  year: number;
  difficulty: number;
  rating: number;
  tags: string[];
  content: string;
  solution: string;
  pdfUrl?: string;
  metadata?: any;
}

// Helper function to ensure tags exist
async function ensureTagsExist(tagNames: string[]) {
  const tagIds: string[] = [];

  for (const tagName of tagNames) {
    let tag = await prisma.tag.findUnique({
      where: { name: tagName }
    });

    if (!tag) {
      // Determine category based on tag name
      let category = 'subfield';
      if (['beginner', 'intermediate', 'advanced', 'expert'].includes(tagName)) {
        category = 'difficulty';
      } else if (['pattern-recognition', 'rule-formulation', 'translation', 'reconstruction', 'decipherment', 'paradigm', 'algorithm-design'].includes(tagName)) {
        category = 'type';
      }

      tag = await prisma.tag.create({
        data: {
          name: tagName,
          category: category
        }
      });
    }

    tagIds.push(tag.id);
  }

  return tagIds;
}

// POST /api/olympiad/batch-import - Import olympiad problems
router.post('/batch-import', async (req: Request, res: Response) => {
  try {
    const { problems, clearExisting = false } = req.body;

    if (!problems || !Array.isArray(problems)) {
      return res.status(400).json({ error: 'Invalid request: problems array required' });
    }

    console.log(`📊 Batch import request: ${problems.length} problems, clearExisting: ${clearExisting}`);

    // Clear existing if requested
    if (clearExisting) {
      console.log('🗑️  Clearing existing problems...');
      await prisma.solutionVote.deleteMany({});
      await prisma.solution.deleteMany({});
      await prisma.discussion.deleteMany({});
      await prisma.userProgress.deleteMany({});
      await prisma.problemTag.deleteMany({});
      const deletedCount = await prisma.problem.deleteMany({});
      console.log(`✓ Cleared ${deletedCount.count} problems`);
    }

    let imported = 0;
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const problem of problems as OlympiadProblem[]) {
      try {
        // Check if problem already exists
        const existing = await prisma.problem.findUnique({
          where: { number: problem.number }
        });

        // Ensure all tags exist and get their IDs
        const tagIds = await ensureTagsExist(problem.tags);

        if (existing) {
          // Update existing problem
          await prisma.problem.update({
            where: { number: problem.number },
            data: {
              title: problem.title,
              content: problem.content,
              source: problem.source,
              year: problem.year,
              difficulty: problem.difficulty,
              rating: problem.rating,
              officialSolution: problem.solution,
              tags: {
                deleteMany: {}, // Clear existing tags
                create: tagIds.map(tagId => ({
                  tag: {
                    connect: { id: tagId }
                  }
                }))
              }
            }
          });
          updated++;
        } else {
          // Create new problem
          await prisma.problem.create({
            data: {
              number: problem.number,
              title: problem.title,
              content: problem.content,
              source: problem.source,
              year: problem.year,
              difficulty: problem.difficulty,
              rating: problem.rating,
              officialSolution: problem.solution,
              tags: {
                create: tagIds.map(tagId => ({
                  tag: {
                    connect: { id: tagId }
                  }
                }))
              }
            }
          });
          imported++;
        }

        if ((imported + updated) % 50 === 0) {
          console.log(`Progress: ${imported + updated}/${problems.length}...`);
        }
      } catch (error: any) {
        console.error(`Failed to import ${problem.number}:`, error.message);
        failed++;
        errors.push(`${problem.number}: ${error.message}`);
      }
    }

    // Get final count
    const totalProblems = await prisma.problem.count();

    const result = {
      success: true,
      message: 'Batch import completed',
      stats: {
        imported,
        updated,
        failed,
        total: problems.length,
        databaseTotal: totalProblems
      },
      errors: errors.slice(0, 10) // Return first 10 errors
    };

    console.log('✅ Batch import complete:', result.stats);
    res.json(result);

  } catch (error: any) {
    console.error('❌ Batch import failed:', error);
    res.status(500).json({
      success: false,
      error: 'Batch import failed',
      message: error.message
    });
  }
});

// GET /api/olympiad/stats - Get statistics about olympiad problems
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const total = await prisma.problem.count();

    // Count by source
    const bySource = await prisma.problem.groupBy({
      by: ['source'],
      _count: true
    });

    // Count by difficulty
    const byDifficulty = await prisma.problem.groupBy({
      by: ['difficulty'],
      _count: true
    });

    // Year range
    const problems = await prisma.problem.findMany({
      select: { year: true },
      orderBy: { year: 'asc' }
    });

    const years = problems.map(p => p.year);
    const yearRange = years.length > 0 ? {
      min: Math.min(...years),
      max: Math.max(...years)
    } : null;

    res.json({
      total,
      bySource: bySource.reduce((acc, item) => {
        acc[item.source] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byDifficulty: byDifficulty.reduce((acc, item) => {
        acc[item.difficulty] = item._count;
        return acc;
      }, {} as Record<number, number>),
      yearRange
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
