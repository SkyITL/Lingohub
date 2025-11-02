import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { problems as realProblems } from '../data/problems'

const router = express.Router()
const prisma = new PrismaClient()

// Clear all problems and related data
router.post('/clear', async (req: Request, res: Response) => {
  try {
    console.log('🗑️  Clearing database...')

    // Delete in order to respect foreign key constraints
    await prisma.problemTag.deleteMany({})
    await prisma.userProgress.deleteMany({})
    await prisma.discussion.deleteMany({})
    await prisma.solutionVote.deleteMany({})
    await prisma.solution.deleteMany({})
    await prisma.problem.deleteMany({})
    await prisma.tag.deleteMany({})

    console.log('✅ Database cleared')

    res.json({
      success: true,
      message: 'Database cleared successfully'
    })
  } catch (error) {
    console.error('Clear error:', error)
    res.status(500).json({ error: 'Clear failed', details: error })
  }
})

// Batch seed endpoint - processes problems in batches to avoid timeout
// Query params: ?batch=0&size=50 (batch number and batch size)
router.post('/run', async (req: Request, res: Response) => {
  try {
    const batchNum = parseInt(req.query.batch as string) || 0
    const batchSize = parseInt(req.query.size as string) || 50

    console.log(`🌱 Starting database seed (batch ${batchNum}, size ${batchSize})...`)

    // Create sample users (only on first batch)
    if (batchNum === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10)

      await prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
          username: 'alice_linguist',
          email: 'alice@example.com',
          password: hashedPassword,
          rating: 1850
        }
      })

      console.log('✅ Created/verified sample users')
    }

    // Calculate batch range
    const startIdx = batchNum * batchSize
    const endIdx = Math.min(startIdx + batchSize, realProblems.length)
    const batchProblems = realProblems.slice(startIdx, endIdx)

    console.log(`Processing problems ${startIdx + 1} to ${endIdx} of ${realProblems.length}`)

    let createdCount = 0
    let updatedCount = 0

    // Create problems with tags
    for (const problemData of batchProblems) {
      const { tags, ...problemInfo } = problemData

      // Check if problem already exists
      const existing = await prisma.problem.findUnique({
        where: { number: problemData.number }
      })

      const problem = await prisma.problem.upsert({
        where: { number: problemData.number },
        update: problemInfo,
        create: problemInfo
      })

      if (existing) {
        updatedCount++
      } else {
        createdCount++
      }

      // Create tags
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName, category: 'topic' }
        })

        await prisma.problemTag.upsert({
          where: {
            problemId_tagId: {
              problemId: problem.id,
              tagId: tag.id
            }
          },
          update: {},
          create: {
            problemId: problem.id,
            tagId: tag.id
          }
        })
      }
    }

    const hasMore = endIdx < realProblems.length
    const nextBatch = hasMore ? batchNum + 1 : null

    console.log(`✅ Seeded batch ${batchNum}: ${batchProblems.length} problems (${createdCount} new, ${updatedCount} updated)`)

    res.json({
      success: true,
      message: `Batch ${batchNum} seeded successfully!`,
      batch: {
        number: batchNum,
        size: batchProblems.length,
        start: startIdx,
        end: endIdx
      },
      problems: {
        total: realProblems.length,
        processed: endIdx,
        remaining: realProblems.length - endIdx,
        created: createdCount,
        updated: updatedCount
      },
      hasMore,
      nextBatch,
      users: batchNum === 0 ? 1 : 0
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Seed failed', details: error })
  }
})

export default router