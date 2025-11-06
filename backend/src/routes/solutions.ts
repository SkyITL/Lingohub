import express, { Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { uploadMultipleFiles, FileAttachment } from '../services/fileUpload'

const router = express.Router()
const prisma = new PrismaClient()

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max total
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images and PDFs are allowed.`))
    }
  }
})

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
    }

    const solutions = await prisma.solution.findMany({
      where: {
        problemId: problem.id,
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

    const transformedSolutions = solutions.map((solution: any) => ({
      id: solution.id,
      content: solution.content,
      attachments: solution.attachments,
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

// Submit a solution (with optional file attachments)
router.post('/', authenticateToken, upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { problemId, content } = solutionSchema.parse(req.body)

    // Check if problem exists (try by ID first, then by number)
    let problem = await prisma.problem.findUnique({
      where: { id: problemId }
    })

    // If not found by ID, try to find by number (e.g., "LH-001")
    if (!problem) {
      problem = await prisma.problem.findUnique({
        where: { number: problemId }
      })
    }

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    // Check if user already submitted a solution for this problem
    const existingSolution = await prisma.solution.findFirst({
      where: {
        problemId: problem.id,
        userId: req.user.id
      }
    })

    if (existingSolution) {
      return res.status(400).json({ error: 'Solution already submitted for this problem' })
    }

    // Handle file uploads if present
    let attachments: FileAttachment[] | undefined
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log(`📤 Uploading ${req.files.length} files...`)

      const filesToUpload = req.files.map((file: Express.Multer.File) => ({
        buffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype
      }))

      try {
        attachments = await uploadMultipleFiles(filesToUpload)
        console.log(`✅ Uploaded ${attachments.length} files successfully`)
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        return res.status(500).json({ error: 'Failed to upload files. Please try again.' })
      }
    }

    const solution = await prisma.solution.create({
      data: {
        problemId: problem.id,
        userId: req.user.id,
        content,
        status: 'submitted',
        attachments: attachments ? JSON.parse(JSON.stringify(attachments)) : undefined
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
          problemId: problem.id
        }
      },
      update: {
        status: 'solved',
        lastAttempt: new Date()
      },
      create: {
        userId: req.user.id,
        problemId: problem.id,
        status: 'solved'
      }
    })

    res.status(201).json({
      message: 'Solution submitted successfully',
      solution: {
        id: solution.id,
        content: solution.content,
        attachments: solution.attachments,
        voteScore: solution.voteScore,
        createdAt: solution.createdAt,
        user: solution.user
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: `File upload error: ${error.message}` })
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