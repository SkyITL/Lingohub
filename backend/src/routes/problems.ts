import express, { Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { optionalAuth } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const problemFiltersSchema = z.object({
  source: z.string().optional(),
  year: z.string().optional(),
  difficulty: z.string().optional(),
  tags: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional()
})

// Get all problems with filtering
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      source,
      year,
      difficulty,
      tags,
      status,
      search,
      page = '1',
      limit = '12',
      sortBy = 'difficulty'
    } = problemFiltersSchema.parse(req.query)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    if (source) {
      // Handle multiple sources
      const sources = source.includes(',') ? source.split(',') : [source]
      where.source = sources.length === 1 ? sources[0] : { in: sources }
    }

    if (year) {
      const [startYear, endYear] = year.split('-').map(Number)
      where.year = {
        gte: startYear || 2000,
        lte: endYear || new Date().getFullYear()
      }
    }

    if (difficulty) {
      // Handle multiple difficulties
      const difficulties = difficulty.includes(',') 
        ? difficulty.split(',').map(d => parseInt(d.trim()))
        : [parseInt(difficulty)]
      where.difficulty = difficulties.length === 1 ? difficulties[0] : { in: difficulties }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tags) {
      const tagNames = tags.split(',')
      where.tags = {
        some: {
          tag: {
            name: { in: tagNames }
          }
        }
      }
    }

    // User-specific filtering
    if (status && req.user) {
      where.progress = {
        some: {
          userId: req.user.id,
          status: status
        }
      }
    }

    // Build sort order
    let orderBy: any = { difficulty: 'asc' }
    
    switch (sortBy) {
      case 'year-desc':
        orderBy = { year: 'desc' }
        break
      case 'year-asc':
        orderBy = { year: 'asc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        select: {
          id: true,
          number: true,
          title: true,
          source: true,
          year: true,
          difficulty: true,
          rating: true,
          createdAt: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true
                }
              }
            }
          },
          progress: req.user ? {
            where: { userId: req.user.id },
            select: { status: true }
          } : false,
          _count: {
            select: {
              progress: {
                where: { status: 'solved' }
              }
            }
          }
        },
        orderBy,
        skip: offset,
        take: limitNum
      }),
      prisma.problem.count({ where })
    ])

    // Transform data
    const transformedProblems = problems.map(problem => ({
      id: problem.id,
      number: problem.number,
      title: problem.title,
      source: problem.source,
      year: problem.year,
      difficulty: problem.difficulty,
      rating: problem.rating,
      solveCount: problem._count.progress,
      tags: problem.tags.map(pt => pt.tag.name),
      userStatus: req.user && problem.progress.length > 0 ? problem.progress[0].status : 'unsolved'
    }))

    res.json({
      problems: transformedProblems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Problems fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single problem
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        progress: req.user ? {
          where: { userId: req.user.id }
        } : false,
        _count: {
          select: {
            progress: {
              where: { status: 'solved' }
            },
            solutions: true,
            discussions: true
          }
        }
      }
    })

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    const transformedProblem = {
      id: problem.id,
      number: problem.number,
      title: problem.title,
      source: problem.source,
      year: problem.year,
      difficulty: problem.difficulty,
      rating: problem.rating,
      content: problem.content,
      officialSolution: problem.officialSolution,
      tags: problem.tags.map(pt => pt.tag.name),
      stats: {
        solveCount: problem._count.progress,
        solutionCount: problem._count.solutions,
        discussionCount: problem._count.discussions
      },
      userStatus: req.user && problem.progress.length > 0 ? problem.progress[0].status : 'unsolved'
    }

    res.json(transformedProblem)
  } catch (error) {
    console.error('Problem fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get problem statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const [
      totalProblems,
      totalSolutions,
      totalUsers,
      sourceStats
    ] = await Promise.all([
      prisma.problem.count(),
      prisma.solution.count(),
      prisma.user.count(),
      prisma.problem.groupBy({
        by: ['source'],
        _count: {
          id: true
        }
      })
    ])

    res.json({
      totalProblems,
      totalSolutions,
      totalUsers,
      sourceBreakdown: sourceStats.reduce((acc, stat) => {
        acc[stat.source] = stat._count.id
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router