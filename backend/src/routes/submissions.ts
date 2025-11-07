import express, { Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { uploadMultipleFiles, FileAttachment } from '../services/fileUpload'
import { evaluateSolution } from '../services/llmEvaluator'
import { checkRateLimit, logRateLimitAction, RATE_LIMITS } from '../utils/rateLimit'

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
const submissionSchema = z.object({
  problemId: z.string(),
  content: z.string().min(10)
})

// Get all submissions (for submissions page)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.query

    const where: any = {}
    if (userId) {
      where.userId = userId
    }

    const submissions = await prisma.submission.findMany({
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

// Submit a submission (with optional file attachments)
router.post('/', authenticateToken, upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    console.log('🔵 [SUBMISSION SUBMIT] Starting submission...')
    console.log('🔵 [SUBMISSION SUBMIT] User:', req.user?.id, req.user?.username)
    console.log('🔵 [SUBMISSION SUBMIT] Body:', { problemId: req.body.problemId, contentLength: req.body.content?.length })
    console.log('🔵 [SUBMISSION SUBMIT] Files:', req.files ? (req.files as any).length : 0)

    if (!req.user) {
      console.log('🔴 [SUBMISSION SUBMIT] No user authenticated')
      return res.status(401).json({ error: 'Authentication required' })
    }

    console.log('🔵 [SUBMISSION SUBMIT] Validating schema...')
    const { problemId, content } = submissionSchema.parse(req.body)
    console.log('🔵 [SUBMISSION SUBMIT] Schema valid. ProblemId:', problemId)

    // Check if problem exists (try by ID first, then by number)
    console.log('🔵 [SUBMISSION SUBMIT] Finding problem by ID:', problemId)
    let problem = await prisma.problem.findUnique({
      where: { id: problemId }
    })

    // If not found by ID, try to find by number (e.g., "LH-001")
    if (!problem) {
      console.log('🔵 [SUBMISSION SUBMIT] Not found by ID, trying by number...')
      problem = await prisma.problem.findUnique({
        where: { number: problemId }
      })
    }

    if (!problem) {
      console.log('🔴 [SUBMISSION SUBMIT] Problem not found:', problemId)
      return res.status(404).json({ error: 'Problem not found' })
    }

    console.log('🔵 [SUBMISSION SUBMIT] Problem found:', problem.id, problem.number)

    // Check rate limit for submissions
    const submissionRateLimit = await checkRateLimit(req.user.id, RATE_LIMITS.SUBMISSION)
    if (submissionRateLimit.limited) {
      await logRateLimitAction(req.user.id, 'submission', true)
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `You can only submit ${RATE_LIMITS.SUBMISSION.maxRequests} times per hour. Please try again later.`,
        remaining: 0,
        resetAt: submissionRateLimit.resetAt
      })
    }

    console.log('🔵 [SUBMISSION SUBMIT] Rate limit OK, proceeding...')

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

    console.log('🔵 [SUBMISSION SUBMIT] Creating submission in database...')
    console.log('🔵 [SUBMISSION SUBMIT] Data:', {
      problemId: problem.id,
      userId: req.user.id,
      contentLength: content.length,
      hasAttachments: !!attachments
    })

    const submission = await prisma.submission.create({
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

    // Log submission action for rate limiting
    await logRateLimitAction(req.user.id, 'submission', false)

    console.log('🔵 [SUBMISSION SUBMIT] Submission created:', submission.id)

    // Update user progress to solved
    console.log('🔵 [SUBMISSION SUBMIT] Updating user progress...')
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

    console.log('🔵 [SUBMISSION SUBMIT] User progress updated')

    // Evaluate submission with LLM if official solution exists
    let evaluationResult = null
    if (problem.officialSolution) {
      // Check rate limit for AI evaluation (separate from submission limit)
      const evalRateLimit = await checkRateLimit(req.user.id, RATE_LIMITS.LLM_EVAL)

      if (evalRateLimit.limited) {
        console.log('⚠️  [SUBMISSION SUBMIT] AI evaluation rate limit exceeded')
        await logRateLimitAction(req.user.id, 'llm_eval', true)

        // Still save the submission, but don't evaluate it
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: 'pending',
            llmFeedback: `Rate limit exceeded. You can only request ${RATE_LIMITS.LLM_EVAL.maxRequests} AI evaluations per hour. Your submission has been saved and will remain pending.`
          }
        })
      } else {
        try {
          console.log('🔵 [SUBMISSION SUBMIT] Starting LLM evaluation...')

          evaluationResult = await evaluateSolution(
            problem.content,
            problem.officialSolution,
            content
          )

          // Log AI evaluation action for rate limiting
          await logRateLimitAction(req.user.id, 'llm_eval', false)

        console.log('🔵 [SUBMISSION SUBMIT] LLM evaluation completed:', {
          score: evaluationResult.totalScore,
          confidence: evaluationResult.confidence,
          cost: evaluationResult.cost
        })

        // Store evaluation results
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            llmScore: evaluationResult.totalScore,
            llmFeedback: evaluationResult.feedback,
            llmConfidence: evaluationResult.confidence,
            isPartialCredit: evaluationResult.totalScore >= 40 && evaluationResult.totalScore < 70
          }
        })

        // Create detailed evaluation record
        await prisma.submissionEvaluation.create({
          data: {
            submissionId: submission.id,
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

          console.log('✅ [SUBMISSION SUBMIT] Evaluation stored')
        } catch (evalError) {
          console.error('🔴 [SUBMISSION SUBMIT] LLM evaluation failed:', evalError)
          // Don't fail the submission if evaluation fails
          // The submission is still saved, just without evaluation
        }
      }
    } else {
      console.log('⚠️  [SUBMISSION SUBMIT] No official solution available, skipping LLM evaluation')
    }

    console.log('✅ [SUBMISSION SUBMIT] Submission complete!')

    // Get updated rate limit info to return to client
    const updatedSubmissionLimit = await checkRateLimit(req.user.id, RATE_LIMITS.SUBMISSION)
    const updatedEvalLimit = await checkRateLimit(req.user.id, RATE_LIMITS.LLM_EVAL)

    res.status(201).json({
      message: 'Submission submitted successfully',
      submission: {
        id: submission.id,
        content: submission.content,
        attachments: submission.attachments,
        createdAt: submission.createdAt,
        user: submission.user,
        llmScore: evaluationResult?.totalScore,
        llmFeedback: evaluationResult?.feedback,
        llmConfidence: evaluationResult?.confidence
      },
      debug: {
        submissionsRemaining: updatedSubmissionLimit.remaining,
        evaluationsRemaining: updatedEvalLimit.remaining,
        problemHasOfficialSolution: !!problem.officialSolution,
        evaluationPerformed: !!evaluationResult
      }
    })
  } catch (error) {
    console.error('🔴 [SUBMISSION SUBMIT] Error caught in handler')
    console.error('🔴 [SUBMISSION SUBMIT] Error type:', error?.constructor?.name)
    console.error('🔴 [SUBMISSION SUBMIT] Error message:', (error as any)?.message)
    console.error('🔴 [SUBMISSION SUBMIT] Full error:', error)

    if (error instanceof z.ZodError) {
      console.error('🔴 [SUBMISSION SUBMIT] Zod validation error:', error.errors)
      return res.status(400).json({ error: error.errors })
    }
    if (error instanceof multer.MulterError) {
      console.error('🔴 [SUBMISSION SUBMIT] Multer error:', error.message)
      return res.status(400).json({ error: `File upload error: ${error.message}` })
    }

    // Log detailed error for debugging
    console.error('🔴 [SUBMISSION SUBMIT] Unhandled error:', JSON.stringify(error, null, 2))
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    })
  }
})

// Edit a submission
router.put('/:id', authenticateToken, upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params
    const { content } = req.body

    if (!content || content.length < 10) {
      return res.status(400).json({ error: 'Submission content must be at least 10 characters' })
    }

    console.log('🔵 [SUBMISSION EDIT] Starting edit for submission:', id)

    // Check if submission exists
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        problem: true
      }
    })

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Only allow the author to edit their submission
    if (submission.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own submissions' })
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

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        content,
        attachments: newAttachments ? JSON.parse(JSON.stringify(newAttachments)) : submission.attachments,
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

    console.log('🔵 [SUBMISSION EDIT] Submission updated, re-evaluating...')

    // Re-evaluate with LLM if official solution exists
    let evaluationResult = null
    if (submission.problem.officialSolution) {
      try {
        console.log('🔵 [SUBMISSION EDIT] Starting LLM re-evaluation...')

        evaluationResult = await evaluateSolution(
          submission.problem.content,
          submission.problem.officialSolution,
          content
        )

        console.log('🔵 [SUBMISSION EDIT] LLM evaluation completed:', {
          score: evaluationResult.totalScore,
          confidence: evaluationResult.confidence
        })

        // Update evaluation results
        await prisma.submission.update({
          where: { id },
          data: {
            llmScore: evaluationResult.totalScore,
            llmFeedback: evaluationResult.feedback,
            llmConfidence: evaluationResult.confidence,
            isPartialCredit: evaluationResult.totalScore >= 40 && evaluationResult.totalScore < 70
          }
        })

        // Delete old evaluation and create new one
        await prisma.submissionEvaluation.deleteMany({
          where: { submissionId: id }
        })

        await prisma.submissionEvaluation.create({
          data: {
            submissionId: id,
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

        console.log('✅ [SUBMISSION EDIT] Re-evaluation stored')
      } catch (evalError) {
        console.error('🔴 [SUBMISSION EDIT] LLM re-evaluation failed:', evalError)
      }
    }

    console.log('✅ [SUBMISSION EDIT] Edit complete!')

    res.json({
      message: 'Submission updated successfully',
      submission: {
        id: updatedSubmission.id,
        content: updatedSubmission.content,
        attachments: updatedSubmission.attachments,
        createdAt: updatedSubmission.createdAt,
        updatedAt: updatedSubmission.updatedAt,
        user: updatedSubmission.user,
        llmScore: evaluationResult?.totalScore,
        llmFeedback: evaluationResult?.feedback,
        llmConfidence: evaluationResult?.confidence
      }
    })
  } catch (error) {
    console.error('🔴 [SUBMISSION EDIT] Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a submission
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params

    const submission = await prisma.submission.findUnique({
      where: { id }
    })

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Only allow the author to delete their submission
    if (submission.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own submissions' })
    }

    // Delete the submission (cascade will handle evaluation deletion)
    await prisma.submission.delete({
      where: { id }
    })

    res.json({ message: 'Submission deleted successfully' })
  } catch (error) {
    console.error('Submission delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router