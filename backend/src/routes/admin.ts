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

// Delete problems without pdfUrl (old UKLO problems from previous seeds)
router.delete('/problems/without-pdf', async (req: Request, res: Response) => {
  try {
    console.log('Finding problems without PDF URLs...')

    // Find problems without pdfUrl
    const problemsWithoutPdf = await prisma.problem.findMany({
      where: {
        pdfUrl: null
      },
      select: {
        id: true,
        number: true,
        title: true
      }
    })

    console.log(`Found ${problemsWithoutPdf.length} problems without PDF URLs`)

    if (problemsWithoutPdf.length === 0) {
      return res.json({
        message: 'No problems to delete',
        deleted: 0
      })
    }

    const problemIds = problemsWithoutPdf.map(p => p.id)

    // Delete related data first (respecting foreign keys)
    await prisma.problemTag.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.userProgress.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.discussion.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.solutionVote.deleteMany({
      where: {
        solution: {
          problemId: { in: problemIds }
        }
      }
    })

    await prisma.solution.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    // Now delete the problems
    const deleted = await prisma.problem.deleteMany({
      where: {
        pdfUrl: null
      }
    })

    console.log(`Deleted ${deleted.count} problems without PDF URLs`)

    // Get remaining count
    const remaining = await prisma.problem.count()

    res.json({
      message: 'Problems without PDF URLs deleted successfully',
      deleted: deleted.count,
      problems: problemsWithoutPdf.map(p => ({ number: p.number, title: p.title })),
      remaining
    })
  } catch (error) {
    console.error('Admin delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
