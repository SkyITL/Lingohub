import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

async function clearExistingProblems() {
  console.log('🗑️  Clearing existing problems...');

  // Delete in correct order due to foreign key constraints
  await prisma.solutionVote.deleteMany({});
  console.log('   ✓ Cleared solution votes');

  await prisma.solution.deleteMany({});
  console.log('   ✓ Cleared solutions');

  await prisma.discussion.deleteMany({});
  console.log('   ✓ Cleared discussions');

  await prisma.userProgress.deleteMany({});
  console.log('   ✓ Cleared user progress');

  const deletedCount = await prisma.problem.deleteMany({});
  console.log(`   ✓ Cleared ${deletedCount.count} problems`);

  console.log('✅ All existing problems cleared!\n');
}

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

async function importProblems(testMode = false) {
  const filename = testMode ? 'lingohub-test-upload.json' : 'lingohub-olympiad-problems.json';
  const filePath = path.join(__dirname, '../../../olympiad-problems', filename);

  console.log(`📁 Loading problems from: ${filename}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const problems: OlympiadProblem[] = data.problems;

  console.log(`📊 Found ${problems.length} problems to import\n`);

  let imported = 0;
  let failed = 0;

  for (const problem of problems) {
    try {
      // Ensure all tags exist and get their IDs
      const tagIds = await ensureTagsExist(problem.tags);

      // Create problem with tag relationships
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
      if (imported % 10 === 0) {
        console.log(`   ✓ Imported ${imported}/${problems.length} problems...`);
      }
    } catch (error: any) {
      console.error(`   ✗ Failed to import ${problem.number}:`, error.message);
      failed++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${problems.length}`);
}

async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const skipClear = args.includes('--no-clear');

  console.log('='.repeat(70));
  console.log('📚 LingoHub Olympiad Problems Import');
  console.log('='.repeat(70));
  console.log(`Mode: ${testMode ? 'TEST (20 problems)' : 'FULL (620 problems)'}`);
  console.log(`Clear existing: ${skipClear ? 'NO' : 'YES'}`);
  console.log('='.repeat(70) + '\n');

  try {
    if (!skipClear) {
      await clearExistingProblems();
    }

    await importProblems(testMode);

    // Verify
    const count = await prisma.problem.count();
    console.log(`\n📊 Database now contains ${count} problems`);

    // Show sample
    const samples = await prisma.problem.findMany({
      take: 3,
      orderBy: { year: 'asc' }
    });

    console.log(`\n📝 Sample problems:`);
    samples.forEach(p => {
      console.log(`   ${p.number} - ${p.title} (${p.source} ${p.year}, ${p.difficulty}★)`);
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Import process complete!');
  console.log('='.repeat(70) + '\n');
}

main();
