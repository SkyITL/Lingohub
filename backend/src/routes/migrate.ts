import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Run database migrations via raw SQL - ONLY call this after deploying schema changes
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    console.log('🔧 Running database migrations...')

    // Apply the pdfUrl and solutionUrl migration
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "problems"
      ADD COLUMN IF NOT EXISTS "pdfUrl" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "solutionUrl" VARCHAR(500);
    `)

    console.log('✅ Migration applied: Added pdfUrl and solutionUrl columns')

    res.json({
      success: true,
      message: 'Migrations applied successfully!',
      columns: ['pdfUrl', 'solutionUrl']
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    res.status(500).json({
      error: 'Migration failed',
      details: error.message
    })
  }
})

export default router
