import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// Root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'LingoHub API is running',
    endpoints: {
      problems: '/api/problems',
      stats: '/api/problems/stats'
    }
  })
})

// Problems endpoints
app.get('/api/problems', async (req, res) => {
  try {
    const { 
      search, 
      source, 
      difficulty, 
      tags,
      year,
      page = '1',
      limit = '50',
      sortBy = 'number'
    } = req.query

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { number: { contains: search as string, mode: 'insensitive' } }
      ]
    }
    
    if (source) {
      where.source = { in: (source as string).split(',') }
    }
    
    if (difficulty) {
      where.difficulty = { in: (difficulty as string).split(',').map(Number) }
    }

    // Get problems with optional filtering
    const problems = await prisma.problem.findMany({
      where,
      orderBy: sortBy === 'year-desc' ? { year: 'desc' } : { number: 'asc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    })

    // Get total count for pagination
    const total = await prisma.problem.count({ where })

    res.json({
      success: true,
      data: {
        problems,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      }
    })
  } catch (error) {
    console.error('Error fetching problems:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch problems' })
  }
})

app.get('/api/problems/stats', async (req, res) => {
  try {
    const [totalProblems, totalUsers, problems, solutions] = await Promise.all([
      prisma.problem.count(),
      prisma.user.count(),
      prisma.problem.findMany({
        select: { source: true, difficulty: true }
      }),
      prisma.solution.count()
    ])

    // Calculate statistics
    const sourceBreakdown = problems.reduce((acc: any, p) => {
      acc[p.source] = (acc[p.source] || 0) + 1
      return acc
    }, {})

    const difficultyBreakdown = problems.reduce((acc: any, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        totalProblems,
        totalSolutions: solutions,
        totalUsers,
        sourceBreakdown,
        difficultyBreakdown
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' })
  }
})

// Solutions endpoints
app.post('/api/solutions', async (req, res) => {
  try {
    const { problemNumber, content, userId } = req.body
    
    if (!problemNumber || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Problem number and content are required' 
      })
    }

    // Find the problem by number
    const problem = await prisma.problem.findFirst({
      where: { number: problemNumber }
    })

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      })
    }

    // Get or create anonymous user if no userId provided
    let user
    if (!userId) {
      user = await prisma.user.findFirst({
        where: { email: 'anonymous@lingohub.com' }
      })
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'anonymous@lingohub.com',
            username: 'Anonymous',
            password: 'not-used',
            rating: 1000
          }
        })
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }
    }

    // Create the solution
    const solution = await prisma.solution.create({
      data: {
        problemId: problem.id,
        userId: user.id,
        content,
        status: 'submitted'
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })

    res.json({ 
      success: true, 
      data: {
        id: solution.id,
        problemNumber,
        content: solution.content,
        userId: solution.userId,
        username: solution.user.username,
        createdAt: solution.createdAt.toISOString(),
        upvotes: 0,
        downvotes: 0
      }
    })
  } catch (error) {
    console.error('Error submitting solution:', error)
    res.status(500).json({ success: false, error: 'Failed to submit solution' })
  }
})

app.get('/api/solutions/problem/:problemNumber', async (req, res) => {
  try {
    const { problemNumber } = req.params
    
    // Find the problem by number
    const problem = await prisma.problem.findFirst({
      where: { number: problemNumber }
    })

    if (!problem) {
      return res.json({ success: true, data: [] })
    }

    // Fetch solutions for this problem
    const solutions = await prisma.solution.findMany({
      where: { 
        problemId: problem.id,
        status: 'submitted'
      },
      include: {
        user: {
          select: {
            username: true
          }
        },
        votes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Calculate vote scores
    const solutionsWithVotes = solutions.map(solution => {
      const upvotes = solution.votes.filter(v => v.vote === 1).length
      const downvotes = solution.votes.filter(v => v.vote === -1).length
      
      return {
        id: solution.id,
        problemNumber,
        content: solution.content,
        userId: solution.userId,
        username: solution.user.username,
        createdAt: solution.createdAt.toISOString(),
        upvotes,
        downvotes
      }
    })
    
    res.json({ success: true, data: solutionsWithVotes })
  } catch (error) {
    console.error('Error fetching solutions:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch solutions' })
  }
})

// Vote on a solution
app.post('/api/solutions/:solutionId/vote', async (req, res) => {
  try {
    const { solutionId } = req.params
    const { userId, vote } = req.body // vote should be -1, 0, or 1
    
    if (!userId || vote === undefined) {
      return res.status(400).json({
        success: false,
        error: 'User ID and vote are required'
      })
    }

    if (vote !== -1 && vote !== 0 && vote !== 1) {
      return res.status(400).json({
        success: false,
        error: 'Vote must be -1, 0, or 1'
      })
    }

    // Check if solution exists
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId }
    })

    if (!solution) {
      return res.status(404).json({
        success: false,
        error: 'Solution not found'
      })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    if (vote === 0) {
      // Remove vote
      await prisma.solutionVote.deleteMany({
        where: {
          userId,
          solutionId
        }
      })
    } else {
      // Upsert vote
      await prisma.solutionVote.upsert({
        where: {
          userId_solutionId: {
            userId,
            solutionId
          }
        },
        update: {
          vote
        },
        create: {
          userId,
          solutionId,
          vote
        }
      })
    }

    // Get updated vote counts
    const votes = await prisma.solutionVote.findMany({
      where: { solutionId }
    })

    const upvotes = votes.filter(v => v.vote === 1).length
    const downvotes = votes.filter(v => v.vote === -1).length

    res.json({
      success: true,
      data: {
        upvotes,
        downvotes
      }
    })
  } catch (error) {
    console.error('Error voting on solution:', error)
    res.status(500).json({ success: false, error: 'Failed to vote on solution' })
  }
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app