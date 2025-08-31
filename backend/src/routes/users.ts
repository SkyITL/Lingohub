import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    email: string
    rating: number
  }
}

const router = express.Router()
const prisma = new PrismaClient()

// Get user profile
router.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        rating: true,
        createdAt: true,
        _count: {
          select: {
            solutions: true,
            discussions: true,
            progress: {
              where: { status: 'solved' }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get problem solving statistics
    const progressStats = await prisma.userProgress.groupBy({
      where: { userId: id },
      by: ['status'],
      _count: {
        status: true
      }
    })

    const stats = progressStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    res.json({
      user: {
        id: user.id,
        username: user.username,
        rating: user.rating,
        joinDate: user.createdAt,
        stats: {
          solved: user._count.progress,
          solutions: user._count.solutions,
          discussions: user._count.discussions,
          ...stats
        }
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user progress
router.get('/:id/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    // Only allow users to see their own progress or make it public later
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId: id },
      include: {
        problem: {
          select: {
            id: true,
            number: true,
            title: true,
            source: true,
            year: true,
            difficulty: true,
            tags: {
              include: {
                tag: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { lastAttempt: 'desc' }
    })

    const transformedProgress = progress.map(p => ({
      problemId: p.problemId,
      status: p.status,
      lastAttempt: p.lastAttempt,
      problem: {
        id: p.problem.id,
        number: p.problem.number,
        title: p.problem.title,
        source: p.problem.source,
        year: p.problem.year,
        difficulty: p.problem.difficulty,
        tags: p.problem.tags.map(pt => pt.tag.name)
      }
    }))

    res.json({ progress: transformedProgress })
  } catch (error) {
    console.error('Progress fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update problem status
router.patch('/:id/progress/:problemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id, problemId } = req.params
    const { status } = req.body

    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!['unsolved', 'solved', 'bookmarked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_problemId: {
          userId: id,
          problemId
        }
      },
      update: {
        status,
        lastAttempt: new Date()
      },
      create: {
        userId: id,
        problemId,
        status,
        lastAttempt: new Date()
      }
    })

    res.json({ message: 'Progress updated', progress })
  } catch (error) {
    console.error('Progress update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router