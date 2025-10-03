import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { problems as realProblems } from '../data/problems'

const router = express.Router()
const prisma = new PrismaClient()

// Simple seed endpoint - safe to run multiple times (idempotent)
// Upserts problems so existing data isn't duplicated
router.post('/run', async (req: Request, res: Response) => {
  try {
    console.log('🌱 Starting database seed...')

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user1 = await prisma.user.upsert({
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

    // Use real problems from problems.ts
    const problems = realProblems
    let createdCount = 0
    let updatedCount = 0

    // Create problems with tags
    for (const problemData of problems) {
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

    console.log(`✅ Seeded ${problems.length} problems (${createdCount} new, ${updatedCount} updated)`)

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      problems: {
        total: problems.length,
        created: createdCount,
        updated: updatedCount
      },
      users: 1
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Seed failed', details: error })
  }
})

export default router