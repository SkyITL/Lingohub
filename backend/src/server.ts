import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'

import authRoutes from './routes/auth'
import problemRoutes from './routes/problems'
import userRoutes from './routes/users'
import solutionRoutes from './routes/solutions'
import seedRoutes from './routes/seed'

const app = express()
const prisma = new PrismaClient()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: true,
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'LingoHub API',
    version: '1.0.0',
    status: 'Ready',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      problems: '/api/problems',
      users: '/api/users',
      solutions: '/api/solutions'
    }
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/problems', problemRoutes)
app.use('/api/users', userRoutes)
app.use('/api/solutions', solutionRoutes)
app.use('/api/seed', seedRoutes)

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Export for Vercel
module.exports = app
export default app

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000

  const startServer = async () => {
    try {
      await prisma.$connect()
      console.log('Connected to database')
      
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      })
    } catch (error) {
      console.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully')
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully')
    await prisma.$disconnect()
    process.exit(0)
  })

  startServer()
}