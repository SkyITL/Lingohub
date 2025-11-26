import express, { Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { uploadMultipleFiles, FileAttachment } from '../services/fileUpload'
import { evaluateSolution } from '../services/llmEvaluator'
import { checkRateLimit, logRateLimitAction, RATE_LIMITS } from '../utils/rateLimit'
import { calculateRatingChange } from '../utils/rating'

const router = express.Router()
const prisma = new PrismaClient()

// Async function to evaluate submission in background with retry logic
async function evaluateSubmissionAsync(
  submissionId: string,
  problem: any,
  content: string,
  userId: string,
  attachments?: any,
  maxRetries: number = 3
) {
  const retryWithDelay = async (fn: () => Promise<any>, retries: number): Promise<any> => {
    try {
      return await fn()
    } catch (error: any) {
      if (retries > 0 && error.code === 'P2024') {
        // Connection pool timeout - retry with exponential backoff
        const delay = (3 - retries + 1) * 1000
        console.log(`⏳ [ASYNC EVAL] Connection pool timeout, retrying in ${delay}ms (${retries} retries left)`)
        await new Promise(r => setTimeout(r, delay))
        return retryWithDelay(fn, retries - 1)
      }
      throw error
    }
  }

  try {
    console.log('🔵 [ASYNC EVAL] Starting evaluation for submission:', submissionId)

    // Use text solution as fallback if no PDF, or empty string if only PDF
    const officialSolutionText = problem.officialSolution || 'See PDF for official solution'

    // Construct full URLs for PDFs
    const baseUrl = process.env.BACKEND_URL || 'https://lingohub-backend.vercel.app'
    const problemPdfUrl = problem.pdfUrl
      ? (problem.pdfUrl.startsWith('http://') || problem.pdfUrl.startsWith('https://'))
        ? problem.pdfUrl
        : `${baseUrl}${problem.pdfUrl}`
      : undefined
    const solutionPdfUrl = problem.solutionUrl
      ? (problem.solutionUrl.startsWith('http://') || problem.solutionUrl.startsWith('https://'))
        ? problem.solutionUrl
        : `${baseUrl}${problem.solutionUrl}`
      : undefined

    console.log('🔵 [ASYNC EVAL] URLs:')
    console.log('  - Problem PDF:', problemPdfUrl || 'None')
    console.log('  - Solution PDF:', solutionPdfUrl || 'None')

    const evaluationResult = await evaluateSolution(
      problem.content,
      officialSolutionText,
      content,
      undefined, // model (use default - now OpenRouter Auto for FREE!)
      problemPdfUrl,
      solutionPdfUrl,
      attachments // Include user's uploaded attachments
    )

    // Log AI evaluation action for rate limiting (with retry)
    await retryWithDelay(
      () => logRateLimitAction(userId, 'llm_eval', false),
      maxRetries
    )

    console.log('🔵 [ASYNC EVAL] Evaluation completed:', {
      score: evaluationResult.totalScore,
      confidence: evaluationResult.confidence,
      cost: evaluationResult.cost
    })

    // Store evaluation results (with retry)
    await retryWithDelay(
      () => prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'evaluated',
          llmScore: evaluationResult.totalScore,
          llmFeedback: evaluationResult.feedback,
          llmConfidence: evaluationResult.confidence,
          isPartialCredit: evaluationResult.totalScore >= 40 && evaluationResult.totalScore < 70
        }
      }),
      maxRetries
    )

    // Create detailed evaluation record (with retry)
    // Note: This table may not exist in production yet, so wrap in try-catch
    try {
      await retryWithDelay(
        () => prisma.submissionEvaluation.create({
          data: {
            submissionId: submissionId,
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
        }),
        maxRetries
      )
      console.log('🔵 [ASYNC EVAL] Detailed evaluation record created')
    } catch (evalTableError: any) {
      console.warn('⚠️  [ASYNC EVAL] Could not create detailed evaluation record (table may not exist yet):')
      console.warn('⚠️  [ASYNC EVAL] Error:', evalTableError.message)
      console.log('🔵 [ASYNC EVAL] Score is saved in submission table, detailed record skipped')
    }

    console.log('🔵 [ASYNC EVAL] Results saved to database')

    // Calculate and apply rating changes
    try {
      const user = await retryWithDelay(
        () => prisma.user.findUnique({
          where: { id: userId }
        }),
        maxRetries
      )

      if (!user) {
        console.warn('⚠️  [ASYNC EVAL] User not found for rating update')
      } else {
        console.log('🔵 [ASYNC EVAL] Calculating rating change...')

        // Determine actual performance based on score
        // >= 70 = correct (1.0), 40-69 = partial (0.5), < 40 = incorrect (0.0)
        const actualPerformance = evaluationResult.totalScore >= 70 ? 1.0 :
                                 evaluationResult.totalScore >= 40 ? 0.5 : 0.0

        const ratingChange = calculateRatingChange(
          user.rating,
          problem.rating,
          false, // viewedSolution - set to false for now (would need to track this)
          actualPerformance
        )

        console.log('🔵 [ASYNC EVAL] Rating change:', {
          oldRating: ratingChange.oldRating,
          newRating: ratingChange.newRating,
          change: ratingChange.change,
          expectedPerformance: ratingChange.expectedPerformance.toFixed(3),
          actualPerformance
        })

        // Update user rating
        await retryWithDelay(
          () => prisma.user.update({
            where: { id: userId },
            data: {
              rating: ratingChange.newRating
            }
          }),
          maxRetries
        )

        // Create or update rating history record (one entry per user-problem pair)
        // Note: This table may not exist in production yet, so wrap in try-catch
        try {
          await retryWithDelay(
            () => prisma.ratingHistory.upsert({
              where: {
                userId_problemId: {
                  userId,
                  problemId: problem.id
                }
              },
              update: {
                oldRating: ratingChange.oldRating,
                newRating: ratingChange.newRating,
                change: ratingChange.change,
                verified: evaluationResult.totalScore >= 70
              },
              create: {
                userId,
                problemId: problem.id,
                oldRating: ratingChange.oldRating,
                newRating: ratingChange.newRating,
                change: ratingChange.change,
                problemRating: problem.rating,
                viewedSolution: false,
                verified: evaluationResult.totalScore >= 70
              }
            }),
            maxRetries
          )
          console.log('🔵 [ASYNC EVAL] ✅ Rating updated:', ratingChange.change > 0 ? `+${ratingChange.change}` : ratingChange.change)
        } catch (historyError: any) {
          console.warn('⚠️  [ASYNC EVAL] Could not create/update rating history record (table may not exist yet):')
          console.warn('⚠️  [ASYNC EVAL] Error:', historyError.message)
          console.log('🔵 [ASYNC EVAL] User rating updated in users table, rating history record skipped')
        }
      }
    } catch (ratingError: any) {
      console.error('❌ [ASYNC EVAL] Error calculating/updating rating:', ratingError)
      // Don't fail the whole evaluation if rating update fails
    }

  } catch (error: any) {
    console.error('❌ [ASYNC EVAL] Error:', error)

    // Try to update submission with error status (with retry)
    try {
      const retryFn = async (retries: number): Promise<void> => {
        try {
          await prisma.submission.update({
            where: { id: submissionId },
            data: {
              status: 'error',
              llmFeedback: 'AI evaluation failed. Your submission has been saved and may be reviewed manually.'
            }
          })
        } catch (updateError: any) {
          if (retries > 0 && updateError.code === 'P2024') {
            const delay = 1000
            await new Promise(r => setTimeout(r, delay))
            return retryFn(retries - 1)
          }
          throw updateError
        }
      }

      await retryFn(2)
    } catch (finalError) {
      console.error('❌ [ASYNC EVAL] Failed to update submission error status:', finalError)
    }
  }
}

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

// Get single submission by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params

    const submission = await prisma.submission.findUnique({
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
        }
      }
    })

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Only allow viewing own submissions
    if (submission.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own submissions' })
    }

    res.json({
      submission: {
        id: submission.id,
        problemId: submission.problemId,
        problemNumber: submission.problem.number,
        problemTitle: submission.problem.title,
        userId: submission.userId,
        username: submission.user.username,
        content: submission.content,
        llmScore: submission.llmScore,
        llmFeedback: submission.llmFeedback,
        llmConfidence: submission.llmConfidence,
        status: submission.status,
        createdAt: submission.createdAt,
        attachments: submission.attachments
      }
    })
  } catch (error) {
    console.error('Submission fetch error:', error)
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
        status: 'pending', // Use 'pending' as initial status
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

    // Evaluate submission with LLM if official solution exists (text or PDF)
    let evaluationResult = null
    const hasOfficialSolution = problem.officialSolution || problem.solutionUrl

    console.log('🔵 [SUBMISSION SUBMIT] Solution check:')
    console.log('  - problem.officialSolution:', problem.officialSolution ? 'YES' : 'NO')
    console.log('  - problem.solutionUrl:', problem.solutionUrl || 'NONE')
    console.log('  - hasOfficialSolution:', hasOfficialSolution)

    // Start async evaluation but don't wait for it
    if (hasOfficialSolution) {
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
        // Start async evaluation - don't await it
        console.log('🔵 [SUBMISSION SUBMIT] Starting async LLM evaluation...')

        // Fire and forget - evaluation happens in background
        evaluateSubmissionAsync(submission.id, problem, content, req.user.id, attachments).catch(error => {
          console.error('❌ [SUBMISSION SUBMIT] Async evaluation error:', error)
        })

        // Mark submission as evaluating
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: 'evaluating',
            llmFeedback: 'AI evaluation in progress. This may take 10-30 seconds. Please refresh the page to see results.'
          }
        })
      }
    } else {
      console.log('⚠️  [SUBMISSION SUBMIT] No official solution available, skipping LLM evaluation')
      // Mark submission as accepted when no official solution exists
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: 'accepted',
          llmFeedback: 'No official solution available for automatic evaluation.'
        }
      })
    }

    console.log('✅ [SUBMISSION SUBMIT] Submission complete!')

    // Get updated rate limit info to return to client
    const updatedSubmissionLimit = await checkRateLimit(req.user.id, RATE_LIMITS.SUBMISSION)
    const updatedEvalLimit = await checkRateLimit(req.user.id, RATE_LIMITS.LLM_EVAL)

    res.status(201).json({
      message: 'Submission submitted successfully',
      submissionId: submission.id, // For redirect to submission page
      submission: {
        id: submission.id,
        content: submission.content,
        attachments: submission.attachments,
        createdAt: submission.createdAt,
        status: 'evaluating', // Show current status
        user: submission.user,
        llmScore: null,
        llmFeedback: 'AI evaluation in progress. Please refresh the page to see results.',
        llmConfidence: null
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

// Get rating history for a user
router.get('/user/:userId/rating-history', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0

    // Check if user is requesting their own data or if they have permission
    if (req.user && userId !== req.user.id) {
      // For now, allow viewing other users' rating history (public)
    }

    const ratingHistory = await prisma.ratingHistory.findMany({
      where: { userId },
      include: {
        problem: {
          select: {
            id: true,
            number: true,
            title: true,
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    res.json({
      ratingHistory,
      limit,
      offset,
      count: ratingHistory.length
    })
  } catch (error) {
    console.error('Rating history fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Flag a submission for human review
router.post('/:id/flag', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.params
    const { reason, details } = req.body

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' })
    }

    // Validate reason
    const validReasons = ['plagiarism', 'incorrect', 'spam']
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid reason. Must be one of: plagiarism, incorrect, spam' })
    }

    // Check if submission exists
    const submission = await prisma.submission.findUnique({
      where: { id }
    })

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Create flag record
    const flag = await prisma.submissionFlag.create({
      data: {
        submissionId: id,
        reporterId: req.user.id,
        flaggedUserId: submission.userId,
        reason,
        details: details || undefined,
        status: 'pending'
      }
    })

    // Increment flag count on submission
    await prisma.submission.update({
      where: { id },
      data: {
        flagCount: { increment: 1 }
      }
    })

    res.status(201).json({
      message: 'Submission flagged successfully for review',
      flag: {
        id: flag.id,
        reason: flag.reason,
        status: flag.status,
        createdAt: flag.createdAt
      }
    })
  } catch (error) {
    console.error('Submission flag error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router