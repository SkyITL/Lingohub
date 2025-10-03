import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Admin-only endpoint to delete all solutions
// WARNING: This will delete ALL solutions from the database
router.delete('/solutions/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // TODO: Add admin check here
    // For now, any authenticated user can use this endpoint
    // In production, you should check if user has admin role

    console.log('Deleting all solutions and votes...')

    // Delete all solution votes first (foreign key constraint)
    const deletedVotes = await prisma.solutionVote.deleteMany()
    console.log(`Deleted ${deletedVotes.count} solution votes`)

    // Delete all solutions
    const deletedSolutions = await prisma.solution.deleteMany()
    console.log(`Deleted ${deletedSolutions.count} solutions`)

    res.json({
      message: 'All solutions deleted successfully',
      deletedVotes: deletedVotes.count,
      deletedSolutions: deletedSolutions.count
    })
  } catch (error) {
    console.error('Admin delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
