import express, { Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const solutionSchema = z.object({
  problemId: z.string(),
  content: z.string().min(10)
})

const voteSchema = z.object({
  vote: z.number().min(-1).max(1)
})

// Get solutions for a problem
router.get('/problem/:problemId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params
    const { sortBy = 'votes' } = req.query

    let orderBy: any = { voteScore: 'desc' }
    
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
    }

    const solutions = await prisma.solution.findMany({
      where: {
        problemId,
        status: 'submitted' // Only show approved/submitted solutions
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rating: true
          }
        },
        votes: req.user ? {
          where: { userId: req.user.id }
        } : false,
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy
    })

    const transformedSolutions = solutions.map(solution => ({
      id: solution.id,
      content: solution.content,
      voteScore: solution.voteScore,
      createdAt: solution.createdAt,
      user: solution.user,
      userVote: req.user && solution.votes.length > 0 ? solution.votes[0].vote : 0,
      voteCount: solution._count.votes
    }))

    res.json({ solutions: transformedSolutions })
  } catch (error) {
    console.error('Solutions fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Submit a solution
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { problemId, content } = solutionSchema.parse(req.body)

    // Check if problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    })

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    // Check if user already submitted a solution for this problem
    const existingSolution = await prisma.solution.findFirst({
      where: {
        problemId,
        userId: req.user.id
      }
    })

    if (existingSolution) {
      return res.status(400).json({ error: 'Solution already submitted for this problem' })
    }

    const solution = await prisma.solution.create({
      data: {
        problemId,
        userId: req.user.id,
        content,
        status: 'submitted'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rating: true
          }
        }
      }
    })

    // Update user progress to solved
    await prisma.userProgress.upsert({
      where: {
        userId_problemId: {
          userId: req.user.id,
          problemId
        }
      },
      update: {
        status: 'solved',
        lastAttempt: new Date()
      },
      create: {
        userId: req.user.id,
        problemId,
        status: 'solved'
      }
    })

    res.status(201).json({
      message: 'Solution submitted successfully',
      solution: {
        id: solution.id,
        content: solution.content,
        voteScore: solution.voteScore,
        createdAt: solution.createdAt,
        user: solution.user
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Solution submit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Vote on a solution
router.post('/:id/vote', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params
    const { vote } = voteSchema.parse(req.body)

    const solution = await prisma.solution.findUnique({
      where: { id }
    })

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' })
    }

    // Prevent voting on own solution
    if (solution.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot vote on your own solution' })
    }

    // Update or create vote
    const existingVote = await prisma.solutionVote.findUnique({
      where: {
        userId_solutionId: {
          userId: req.user.id,
          solutionId: id
        }
      }
    })

    if (existingVote) {
      // Update existing vote
      await prisma.solutionVote.update({
        where: {
          userId_solutionId: {
            userId: req.user.id,
            solutionId: id
          }
        },
        data: { vote }
      })
    } else {
      // Create new vote
      await prisma.solutionVote.create({
        data: {
          userId: req.user.id,
          solutionId: id,
          vote
        }
      })
    }

    // Recalculate solution vote score
    const voteSum = await prisma.solutionVote.aggregate({
      where: { solutionId: id },
      _sum: { vote: true }
    })

    await prisma.solution.update({
      where: { id },
      data: { voteScore: voteSum._sum.vote || 0 }
    })

    res.json({ message: 'Vote recorded', voteScore: voteSum._sum.vote || 0 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Vote error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a solution
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params

    const solution = await prisma.solution.findUnique({
      where: { id }
    })

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' })
    }

    // Only allow the author to delete their solution
    if (solution.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own solutions' })
    }

    // Delete all votes associated with this solution first
    await prisma.solutionVote.deleteMany({
      where: { solutionId: id }
    })

    // Delete the solution
    await prisma.solution.delete({
      where: { id }
    })

    res.json({ message: 'Solution deleted successfully' })
  } catch (error) {
    console.error('Solution delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router