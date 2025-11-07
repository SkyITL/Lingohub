import express, { Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const solutionSchema = z.object({
  problemId: z.string(),
  title: z.string().min(5).max(255),
  content: z.string().min(50) // Require substantial explanation
})

const voteSchema = z.object({
  vote: z.number().min(-1).max(1)
})

// Get all solutions for a problem (public write-ups/题解)
router.get('/problem/:problemId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params
    const { sortBy = 'votes' } = req.query

    // Find problem by ID or number
    let problem = await prisma.problem.findUnique({
      where: { id: problemId }
    })

    if (!problem) {
      problem = await prisma.problem.findUnique({
        where: { number: problemId }
      })
    }

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    let orderBy: any = { voteScore: 'desc' }

    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'views':
        orderBy = { viewCount: 'desc' }
        break
    }

    const solutions = await prisma.solution.findMany({
      where: {
        problemId: problem.id
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

    const transformedSolutions = solutions.map((solution: any) => ({
      id: solution.id,
      title: solution.title,
      content: solution.content,
      voteScore: solution.voteScore,
      viewCount: solution.viewCount,
      createdAt: solution.createdAt,
      updatedAt: solution.updatedAt,
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

// Get single solution by ID (public)
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rating: true
          }
        },
        problem: {
          select: {
            id: true,
            number: true,
            title: true
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
      }
    })

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' })
    }

    // Increment view count
    await prisma.solution.update({
      where: { id },
      data: {
        viewCount: { increment: 1 }
      }
    })

    const solutionData: any = solution

    res.json({
      solution: {
        id: solution.id,
        title: solution.title,
        content: solution.content,
        voteScore: solution.voteScore,
        viewCount: solution.viewCount + 1, // Return incremented count
        createdAt: solution.createdAt,
        updatedAt: solution.updatedAt,
        user: solution.user,
        problem: solution.problem,
        userVote: req.user && solutionData.votes.length > 0 ? solutionData.votes[0].vote : 0,
        voteCount: solution._count.votes
      }
    })
  } catch (error) {
    console.error('Solution fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new solution write-up (题解)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔵 [SOLUTION CREATE] Starting solution creation...')
    console.log('🔵 [SOLUTION CREATE] User:', req.user?.id, req.user?.username)

    if (!req.user) {
      console.log('🔴 [SOLUTION CREATE] No user authenticated')
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { problemId, title, content } = solutionSchema.parse(req.body)
    console.log('🔵 [SOLUTION CREATE] Data validated')

    // Check if problem exists
    let problem = await prisma.problem.findUnique({
      where: { id: problemId }
    })

    if (!problem) {
      problem = await prisma.problem.findUnique({
        where: { number: problemId }
      })
    }

    if (!problem) {
      console.log('🔴 [SOLUTION CREATE] Problem not found:', problemId)
      return res.status(404).json({ error: 'Problem not found' })
    }

    console.log('🔵 [SOLUTION CREATE] Problem found:', problem.id)

    // Check if user already created a solution for this problem
    const existingSolution = await prisma.solution.findFirst({
      where: {
        problemId: problem.id,
        userId: req.user.id
      }
    })

    if (existingSolution) {
      console.log('🔴 [SOLUTION CREATE] Solution already exists:', existingSolution.id)
      return res.status(400).json({ error: 'You have already written a solution for this problem. Please edit your existing solution instead.' })
    }

    // Create the solution
    const solution = await prisma.solution.create({
      data: {
        problemId: problem.id,
        userId: req.user.id,
        title,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rating: true
          }
        },
        problem: {
          select: {
            id: true,
            number: true,
            title: true
          }
        }
      }
    })

    console.log('✅ [SOLUTION CREATE] Solution created:', solution.id)

    res.status(201).json({
      message: 'Solution created successfully',
      solution: {
        id: solution.id,
        title: solution.title,
        content: solution.content,
        voteScore: solution.voteScore,
        viewCount: solution.viewCount,
        createdAt: solution.createdAt,
        user: solution.user,
        problem: solution.problem
      }
    })
  } catch (error) {
    console.error('🔴 [SOLUTION CREATE] Error:', error)

    if (error instanceof z.ZodError) {
      console.error('🔴 [SOLUTION CREATE] Validation error:', error.errors)
      return res.status(400).json({ error: error.errors })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
})

// Edit a solution
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params
    const { title, content } = req.body

    if (!title || title.length < 5 || title.length > 255) {
      return res.status(400).json({ error: 'Title must be between 5 and 255 characters' })
    }

    if (!content || content.length < 50) {
      return res.status(400).json({ error: 'Content must be at least 50 characters' })
    }

    console.log('🔵 [SOLUTION EDIT] Starting edit for solution:', id)

    // Check if solution exists
    const solution = await prisma.solution.findUnique({
      where: { id }
    })

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' })
    }

    // Only allow the author to edit their solution
    if (solution.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own solutions' })
    }

    // Update solution
    const updatedSolution = await prisma.solution.update({
      where: { id },
      data: {
        title,
        content,
        updatedAt: new Date()
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

    console.log('✅ [SOLUTION EDIT] Solution updated')

    res.json({
      message: 'Solution updated successfully',
      solution: {
        id: updatedSolution.id,
        title: updatedSolution.title,
        content: updatedSolution.content,
        voteScore: updatedSolution.voteScore,
        viewCount: updatedSolution.viewCount,
        createdAt: updatedSolution.createdAt,
        updatedAt: updatedSolution.updatedAt,
        user: updatedSolution.user
      }
    })
  } catch (error) {
    console.error('🔴 [SOLUTION EDIT] Error:', error)
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

    // Delete all votes associated with this solution first (handled by cascade)
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

// Vote on a solution
router.post('/:id/vote', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id: solutionId } = req.params
    const { vote } = voteSchema.parse(req.body)

    // Check if solution exists
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId }
    })

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' })
    }

    // Cannot vote on your own solution
    if (solution.userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot vote on your own solution' })
    }

    // Check if user has already voted
    const existingVote = await prisma.solutionVote.findUnique({
      where: {
        userId_solutionId: {
          userId: req.user.id,
          solutionId
        }
      }
    })

    let voteChange = vote

    if (existingVote) {
      // Update existing vote
      voteChange = vote - existingVote.vote

      if (vote === 0) {
        // Remove vote if new vote is 0
        await prisma.solutionVote.delete({
          where: {
            userId_solutionId: {
              userId: req.user.id,
              solutionId
            }
          }
        })
      } else {
        // Update vote
        await prisma.solutionVote.update({
          where: {
            userId_solutionId: {
              userId: req.user.id,
              solutionId
            }
          },
          data: { vote }
        })
      }
    } else if (vote !== 0) {
      // Create new vote
      await prisma.solutionVote.create({
        data: {
          userId: req.user.id,
          solutionId,
          vote
        }
      })
    }

    // Update solution vote score
    const updatedSolution = await prisma.solution.update({
      where: { id: solutionId },
      data: {
        voteScore: {
          increment: voteChange
        }
      }
    })

    res.json({
      message: 'Vote recorded',
      voteScore: updatedSolution.voteScore,
      userVote: vote
    })
  } catch (error) {
    console.error('Vote error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
