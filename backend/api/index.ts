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

// Simple test route
app.get('/api/problems', async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: problems })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch problems' })
  }
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app