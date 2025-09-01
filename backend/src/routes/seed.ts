import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const router = express.Router()
const prisma = new PrismaClient()

// Simple seed endpoint - call once to populate database
router.post('/run', async (req: Request, res: Response) => {
  try {
    console.log('Starting database seed...')

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

    // Create problems
    const problems = [
      {
        number: 'LH-001',
        title: 'Ubykh Verb Morphology',
        content: `# Ubykh Verb Morphology\n\nGiven the following Ubykh verb forms:\n\n| Ubykh | English |\n|-------|---------|\n| sə-q'ʷa | I go |\n| wə-q'ʷa | you go |\n\n**Question**: What would be the Ubykh forms for "they go"?`,
        source: 'IOL',
        year: 2007,
        difficulty: 4,
        rating: 1800,
        officialSolution: 'Based on the patterns: ra-q\'ʷa (they go)',
        tags: ['morphology', 'verbs', 'caucasian']
      },
      {
        number: 'LH-002',
        title: 'Pirahã Number System',
        content: `# Pirahã Number System\n\nPirahã expressions:\n\n| Pirahã | Context |\n|--------|---------|\n| hói | one stick |\n\n**Question**: What can you conclude about the Pirahã number system?`,
        source: 'APLO',
        year: 2008,
        difficulty: 2,
        rating: 1200,
        officialSolution: 'The data suggests Pirahã may have approximate quantity words.',
        tags: ['numbers', 'counting', 'amazonian']
      }
    ]

    // Create problems with tags
    for (const problemData of problems) {
      const { tags, ...problemInfo } = problemData
      
      const problem = await prisma.problem.upsert({
        where: { number: problemData.number },
        update: problemInfo,
        create: problemInfo
      })

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

    res.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      created: {
        problems: problems.length,
        users: 1
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Seed failed', details: error })
  }
})

export default router