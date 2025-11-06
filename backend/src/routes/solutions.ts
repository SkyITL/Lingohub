import express, { Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { uploadMultipleFiles, FileAttachment } from '../services/fileUpload'
import { evaluateSolution } from '../services/llmEvaluator'

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

// Get all submissions (for submissions page)
router.get('/submissions', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.query

    const where: any = {}
    if (userId) {
      where.userId = userId
    }

    const submissions = await prisma.solution.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to recent 100 submissions
    })

    const transformedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      problemId: submission.problemId,
      problemNumber: submission.problem.number,
      problemTitle: submission.problem.title,
      userId: submission.userId,
      username: submission.user.username,
      llmScore: submission.llmScore,
      llmConfidence: submission.llmConfidence,
      status: submission.status,
      createdAt: submission.createdAt,
      // Only include content if it's the user's own submission
      content: req.user && submission.userId === req.user.id ? submission.content : undefined,
      llmFeedback: req.user && submission.userId === req.user.id ? submission.llmFeedback : undefined,
      attachments: req.user && submission.userId === req.user.id ? submission.attachments : undefined,
      isOwnSubmission: req.user ? submission.userId === req.user.id : false
    }))

    res.json({ submissions: transformedSubmissions })
  } catch (error) {
    console.error('Submissions fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
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
    console.log('🔵 [SOLUTION SUBMIT] Starting submission...')
    console.log('🔵 [SOLUTION SUBMIT] User:', req.user?.id, req.user?.username)
    console.log('🔵 [SOLUTION SUBMIT] Body:', { problemId: req.body.problemId, contentLength: req.body.content?.length })
    console.log('🔵 [SOLUTION SUBMIT] Files:', req.files ? (req.files as any).length : 0)

    if (!req.user) {
      console.log('🔴 [SOLUTION SUBMIT] No user authenticated')
      return res.status(401).json({ error: 'Authentication required' })
    }

    console.log('🔵 [SOLUTION SUBMIT] Validating schema...')
    const { problemId, content } = solutionSchema.parse(req.body)
    console.log('🔵 [SOLUTION SUBMIT] Schema valid. ProblemId:', problemId)

    // Check if problem exists (try by ID first, then by number)
    console.log('🔵 [SOLUTION SUBMIT] Finding problem by ID:', problemId)
    let problem = await prisma.problem.findUnique({
      where: { id: problemId }
    })

    // If not found by ID, try to find by number (e.g., "LH-001")
    if (!problem) {
      console.log('🔵 [SOLUTION SUBMIT] Not found by ID, trying by number...')
      problem = await prisma.problem.findUnique({
        where: { number: problemId }
      })
    }

    if (!problem) {
      console.log('🔴 [SOLUTION SUBMIT] Problem not found:', problemId)
      return res.status(404).json({ error: 'Problem not found' })
    }

    console.log('🔵 [SOLUTION SUBMIT] Problem found:', problem.id, problem.number)

    // Check if user already submitted a solution for this problem
    console.log('🔵 [SOLUTION SUBMIT] Checking for existing solution...')
    const existingSolution = await prisma.solution.findFirst({
      where: {
        problemId: problem.id,
        userId: req.user.id
      }
    })

    if (existingSolution) {
      console.log('🔴 [SOLUTION SUBMIT] Solution already exists:', existingSolution.id)
      return res.status(400).json({ error: 'Solution already submitted for this problem' })
    }

    console.log('🔵 [SOLUTION SUBMIT] No existing solution, proceeding...')

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

    console.log('🔵 [SOLUTION SUBMIT] Creating solution in database...')
    console.log('🔵 [SOLUTION SUBMIT] Data:', {
      problemId: problem.id,
      userId: req.user.id,
      contentLength: content.length,
      hasAttachments: !!attachments
    })

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

    console.log('🔵 [SOLUTION SUBMIT] Solution created:', solution.id)

    // Update user progress to solved
    console.log('🔵 [SOLUTION SUBMIT] Updating user progress...')
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

    console.log('🔵 [SOLUTION SUBMIT] User progress updated')

    // Evaluate solution with LLM if official solution exists
    let evaluationResult = null
    if (problem.officialSolution) {
      try {
        console.log('🔵 [SOLUTION SUBMIT] Starting LLM evaluation...')

        evaluationResult = await evaluateSolution(
          problem.content,
          problem.officialSolution,
          content
        )

        console.log('🔵 [SOLUTION SUBMIT] LLM evaluation completed:', {
          score: evaluationResult.totalScore,
          confidence: evaluationResult.confidence,
          cost: evaluationResult.cost
        })

        // Store evaluation results
        await prisma.solution.update({
          where: { id: solution.id },
          data: {
            llmScore: evaluationResult.totalScore,
            llmFeedback: evaluationResult.feedback,
            llmConfidence: evaluationResult.confidence,
            isPartialCredit: evaluationResult.totalScore >= 40 && evaluationResult.totalScore < 70
          }
        })

        // Create detailed evaluation record
        await prisma.solutionEvaluation.create({
          data: {
            solutionId: solution.id,
            totalScore: evaluationResult.totalScore,
            correctness: evaluationResult.scores.correctness,
            reasoning: evaluationResult.scores.reasoning,
            coverage: evaluationResult.scores.coverage,
            clarity: evaluationResult.scores.clarity,
            confidence: evaluationResult.confidence,
            feedback: evaluationResult.feedback,
            errors: evaluationResult.errors,
            strengths: evaluationResult.strengths,
            suggestions: evaluationResult.suggestions,
            modelUsed: evaluationResult.modelUsed,
            promptVersion: 'v1',
            evaluationTime: 0, // Will be tracked later
            cost: evaluationResult.cost
          }
        })

        console.log('✅ [SOLUTION SUBMIT] Evaluation stored')
      } catch (evalError) {
        console.error('🔴 [SOLUTION SUBMIT] LLM evaluation failed:', evalError)
        // Don't fail the submission if evaluation fails
        // The solution is still saved, just without evaluation
      }
    } else {
      console.log('⚠️  [SOLUTION SUBMIT] No official solution available, skipping LLM evaluation')
    }

    console.log('✅ [SOLUTION SUBMIT] Submission complete!')

    res.status(201).json({
      message: 'Solution submitted successfully',
      solution: {
        id: solution.id,
        content: solution.content,
        attachments: solution.attachments,
        voteScore: solution.voteScore,
        createdAt: solution.createdAt,
        user: solution.user,
        llmScore: evaluationResult?.totalScore,
        llmFeedback: evaluationResult?.feedback,
        llmConfidence: evaluationResult?.confidence
      }
    })
  } catch (error) {
    console.error('🔴 [SOLUTION SUBMIT] Error caught in handler')
    console.error('🔴 [SOLUTION SUBMIT] Error type:', error?.constructor?.name)
    console.error('🔴 [SOLUTION SUBMIT] Error message:', (error as any)?.message)
    console.error('🔴 [SOLUTION SUBMIT] Full error:', error)

    if (error instanceof z.ZodError) {
      console.error('🔴 [SOLUTION SUBMIT] Zod validation error:', error.errors)
      return res.status(400).json({ error: error.errors })
    }
    if (error instanceof multer.MulterError) {
      console.error('🔴 [SOLUTION SUBMIT] Multer error:', error.message)
      return res.status(400).json({ error: `File upload error: ${error.message}` })
    }

    // Log detailed error for debugging
    console.error('🔴 [SOLUTION SUBMIT] Unhandled error:', JSON.stringify(error, null, 2))
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    })
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

// Edit a solution
router.put('/:id', authenticateToken, upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params
    const { content } = req.body

    if (!content || content.length < 10) {
      return res.status(400).json({ error: 'Solution content must be at least 10 characters' })
    }

    console.log('🔵 [SOLUTION EDIT] Starting edit for solution:', id)

    // Check if solution exists
    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        problem: true
      }
    })

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' })
    }

    // Only allow the author to edit their solution
    if (solution.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own solutions' })
    }

    // Handle file uploads if present
    let newAttachments: FileAttachment[] | undefined
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log(`📤 Uploading ${req.files.length} new files...`)

      const filesToUpload = req.files.map((file: Express.Multer.File) => ({
        buffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype
      }))

      try {
        newAttachments = await uploadMultipleFiles(filesToUpload)
        console.log(`✅ Uploaded ${newAttachments.length} files successfully`)
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        return res.status(500).json({ error: 'Failed to upload files. Please try again.' })
      }
    }

    // Update solution
    const updatedSolution = await prisma.solution.update({
      where: { id },
      data: {
        content,
        attachments: newAttachments ? JSON.parse(JSON.stringify(newAttachments)) : solution.attachments,
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

    console.log('🔵 [SOLUTION EDIT] Solution updated, re-evaluating...')

    // Re-evaluate with LLM if official solution exists
    let evaluationResult = null
    if (solution.problem.officialSolution) {
      try {
        console.log('🔵 [SOLUTION EDIT] Starting LLM re-evaluation...')

        evaluationResult = await evaluateSolution(
          solution.problem.content,
          solution.problem.officialSolution,
          content
        )

        console.log('🔵 [SOLUTION EDIT] LLM evaluation completed:', {
          score: evaluationResult.totalScore,
          confidence: evaluationResult.confidence
        })

        // Update evaluation results
        await prisma.solution.update({
          where: { id },
          data: {
            llmScore: evaluationResult.totalScore,
            llmFeedback: evaluationResult.feedback,
            llmConfidence: evaluationResult.confidence,
            isPartialCredit: evaluationResult.totalScore >= 40 && evaluationResult.totalScore < 70
          }
        })

        // Delete old evaluation and create new one
        await prisma.solutionEvaluation.deleteMany({
          where: { solutionId: id }
        })

        await prisma.solutionEvaluation.create({
          data: {
            solutionId: id,
            totalScore: evaluationResult.totalScore,
            correctness: evaluationResult.scores.correctness,
            reasoning: evaluationResult.scores.reasoning,
            coverage: evaluationResult.scores.coverage,
            clarity: evaluationResult.scores.clarity,
            confidence: evaluationResult.confidence,
            feedback: evaluationResult.feedback,
            errors: evaluationResult.errors,
            strengths: evaluationResult.strengths,
            suggestions: evaluationResult.suggestions,
            modelUsed: evaluationResult.modelUsed,
            promptVersion: 'v1',
            evaluationTime: 0,
            cost: evaluationResult.cost
          }
        })

        console.log('✅ [SOLUTION EDIT] Re-evaluation stored')
      } catch (evalError) {
        console.error('🔴 [SOLUTION EDIT] LLM re-evaluation failed:', evalError)
      }
    }

    console.log('✅ [SOLUTION EDIT] Edit complete!')

    res.json({
      message: 'Solution updated successfully',
      solution: {
        id: updatedSolution.id,
        content: updatedSolution.content,
        attachments: updatedSolution.attachments,
        voteScore: updatedSolution.voteScore,
        createdAt: updatedSolution.createdAt,
        updatedAt: updatedSolution.updatedAt,
        user: updatedSolution.user,
        llmScore: evaluationResult?.totalScore,
        llmFeedback: evaluationResult?.feedback,
        llmConfidence: evaluationResult?.confidence
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