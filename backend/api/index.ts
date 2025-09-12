import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'LingoHub API',
    version: '1.0.0',
    status: 'Ready',
    endpoints: {
      health: '/api/health',
      problems: '/api/problems',
      auth: '/api/auth'
    }
  })
})

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      timestamp: new Date().toISOString() 
    })
  }
})

// Get all problems with filtering
app.get('/api/problems', async (req, res) => {
  try {
    const { source, difficulty, year, tags, search, limit = 20, offset = 0 } = req.query
    
    const where: any = {}
    
    if (source) where.source = source
    if (difficulty) where.difficulty = Number(difficulty)
    if (year) where.year = Number(year)
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { number: { contains: String(search), mode: 'insensitive' } }
      ]
    }
    if (tags) {
      where.tags = {
        some: {
          name: { in: String(tags).split(',') }
        }
      }
    }
    
    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        include: {
          tags: true,
          _count: {
            select: { solutions: true }
          }
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.problem.count({ where })
    ])
    
    res.json({ 
      success: true, 
      data: problems,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    })
  } catch (error) {
    console.error('Error fetching problems:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch problems' })
  }
})

// Get single problem by ID
app.get('/api/problems/:id', async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      include: {
        tags: true,
        solutions: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { solutions: true }
        }
      }
    })
    
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' })
    }
    
    res.json({ success: true, data: problem })
  } catch (error) {
    console.error('Error fetching problem:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch problem' })
  }
})

// Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const [totalProblems, totalUsers, totalSolutions] = await Promise.all([
      prisma.problem.count(),
      prisma.user.count(),
      prisma.solution.count()
    ])
    
    res.json({
      success: true,
      data: {
        totalProblems,
        totalUsers,
        totalSolutions,
        activeChallenges: 0
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' })
  }
})

// Solutions endpoints
app.post('/api/solutions', async (req, res) => {
  try {
    const { problemNumber, content, userId = 'anonymous' } = req.body
    
    if (!problemNumber || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Problem number and content are required' 
      })
    }

    // In production, this would save to database
    // For now, just return success
    const solution = {
      id: Date.now().toString(),
      problemNumber,
      content,
      userId,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0
    }

    res.json({ success: true, data: solution })
  } catch (error) {
    console.error('Error submitting solution:', error)
    res.status(500).json({ success: false, error: 'Failed to submit solution' })
  }
})

app.get('/api/solutions/problem/:problemNumber', async (req, res) => {
  try {
    const { problemNumber } = req.params
    
    // In production, fetch from database
    // For now, return mock data
    const solutions = [
      {
        id: '1',
        problemNumber,
        content: 'The key pattern here is the voicing distinction. Notice how the vocal cords vibrate for [b] but not for [p].',
        userId: 'user123',
        username: 'linguist1',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        upvotes: 5,
        downvotes: 1
      }
    ]
    
    res.json({ success: true, data: solutions })
  } catch (error) {
    console.error('Error fetching solutions:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch solutions' })
  }
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app