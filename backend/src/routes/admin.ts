import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Admin-only endpoint to delete all solutions
// WARNING: This will delete ALL solutions from the database
router.delete('/solutions/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // TODO: Add admin check here
    // For now, any authenticated user can use this endpoint
    // In production, you should check if user has admin role

    console.log('Deleting all solutions and votes...')

    // Delete all solution votes first (foreign key constraint)
    const deletedVotes = await prisma.solutionVote.deleteMany()
    console.log(`Deleted ${deletedVotes.count} solution votes`)

    // Delete all solutions
    const deletedSolutions = await prisma.solution.deleteMany()
    console.log(`Deleted ${deletedSolutions.count} solutions`)

    res.json({
      message: 'All solutions deleted successfully',
      deletedVotes: deletedVotes.count,
      deletedSolutions: deletedSolutions.count
    })
  } catch (error) {
    console.error('Admin delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete problems without pdfUrl (old UKLO problems from previous seeds)
router.delete('/problems/without-pdf', async (req: Request, res: Response) => {
  try {
    console.log('Finding problems without PDF URLs...')

    // Find problems without pdfUrl
    const problemsWithoutPdf = await prisma.problem.findMany({
      where: {
        pdfUrl: null
      },
      select: {
        id: true,
        number: true,
        title: true
      }
    })

    console.log(`Found ${problemsWithoutPdf.length} problems without PDF URLs`)

    if (problemsWithoutPdf.length === 0) {
      return res.json({
        message: 'No problems to delete',
        deleted: 0
      })
    }

    const problemIds = problemsWithoutPdf.map(p => p.id)

    // Delete related data first (respecting foreign keys)
    await prisma.problemTag.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.userProgress.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.discussion.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.solutionVote.deleteMany({
      where: {
        solution: {
          problemId: { in: problemIds }
        }
      }
    })

    await prisma.solution.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    // Now delete the problems
    const deleted = await prisma.problem.deleteMany({
      where: {
        pdfUrl: null
      }
    })

    console.log(`Deleted ${deleted.count} problems without PDF URLs`)

    // Get remaining count
    const remaining = await prisma.problem.count()

    res.json({
      message: 'Problems without PDF URLs deleted successfully',
      deleted: deleted.count,
      problems: problemsWithoutPdf.map(p => ({ number: p.number, title: p.title })),
      remaining
    })
  } catch (error) {
    console.error('Admin delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update problem titles to remove ": TBD" suffix
router.put('/problems/fix-tbd-titles', async (req: Request, res: Response) => {
  try {
    console.log('Finding problems with TBD in title...')

    // Find problems with ": TBD" in title
    const tbdProblems = await prisma.problem.findMany({
      where: {
        title: {
          contains: ': TBD'
        }
      },
      select: {
        id: true,
        number: true,
        title: true
      }
    })

    console.log(`Found ${tbdProblems.length} problems with TBD`)

    if (tbdProblems.length === 0) {
      return res.json({
        message: 'No TBD problems to fix',
        updated: 0
      })
    }

    // Update each problem to remove ": TBD"
    const updates = await Promise.all(
      tbdProblems.map(problem =>
        prisma.problem.update({
          where: { id: problem.id },
          data: {
            title: problem.title.replace(': TBD', '')
          }
        })
      )
    )

    console.log(`Updated ${updates.length} problem titles`)

    res.json({
      message: 'TBD titles fixed successfully',
      updated: updates.length,
      problems: tbdProblems.map(p => ({
        number: p.number,
        oldTitle: p.title,
        newTitle: p.title.replace(': TBD', '')
      }))
    })
  } catch (error) {
    console.error('Admin fix error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete placeholder problems with "TBD" in title (DEPRECATED - use fix-tbd-titles instead)
router.delete('/problems/placeholders', async (req: Request, res: Response) => {
  try {
    console.log('Finding placeholder problems with TBD...')

    // Find problems with TBD in title
    const placeholderProblems = await prisma.problem.findMany({
      where: {
        title: {
          contains: 'TBD'
        }
      },
      select: {
        id: true,
        number: true,
        title: true
      }
    })

    console.log(`Found ${placeholderProblems.length} placeholder problems`)

    if (placeholderProblems.length === 0) {
      return res.json({
        message: 'No placeholder problems to delete',
        deleted: 0
      })
    }

    const problemIds = placeholderProblems.map(p => p.id)

    // Delete related data first (respecting foreign keys)
    await prisma.problemTag.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.userProgress.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.discussion.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    await prisma.solutionVote.deleteMany({
      where: {
        solution: {
          problemId: { in: problemIds }
        }
      }
    })

    await prisma.solution.deleteMany({
      where: { problemId: { in: problemIds } }
    })

    // Now delete the problems
    const deleted = await prisma.problem.deleteMany({
      where: {
        title: {
          contains: 'TBD'
        }
      }
    })

    console.log(`Deleted ${deleted.count} placeholder problems`)

    // Get remaining count
    const remaining = await prisma.problem.count()

    res.json({
      message: 'Placeholder problems deleted successfully',
      deleted: deleted.count,
      problems: placeholderProblems.map(p => ({ number: p.number, title: p.title })),
      remaining
    })
  } catch (error) {
    console.error('Admin delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Upload problem labels from CSV
router.post('/problems/upload-labels', async (req: Request, res: Response) => {
  try {
    const { labels } = req.body

    if (!labels || !Array.isArray(labels)) {
      return res.status(400).json({ error: 'labels array required' })
    }

    console.log(`Uploading labels for ${labels.length} problems...`)

    let updated = 0
    let notFound = 0
    const errors: string[] = []

    for (const label of labels) {
      try {
        const { number, new_difficulty, primary_category, secondary_tags } = label

        if (!number) {
          errors.push(`Missing problem number in label`)
          continue
        }

        // Find problem by number
        const problem = await prisma.problem.findUnique({
          where: { number }
        })

        if (!problem) {
          notFound++
          errors.push(`Problem ${number} not found in database`)
          continue
        }

        // Map new_difficulty (1-5) to rating (1000-2400)
        const difficultyToRating: { [key: string]: number } = {
          '1': 1000,
          '2': 1200,
          '3': 1400,
          '4': 1600,
          '5': 2000
        }

        const updates: any = {}

        if (new_difficulty) {
          const difficulty = parseInt(new_difficulty)
          if (difficulty >= 1 && difficulty <= 5) {
            updates.difficulty = difficulty
            updates.rating = difficultyToRating[new_difficulty]
          }
        }

        // Update problem
        if (Object.keys(updates).length > 0) {
          await prisma.problem.update({
            where: { id: problem.id },
            data: updates
          })
        }

        // Handle tags - parse secondary_tags and create/link them
        if (primary_category || secondary_tags) {
          // Remove existing tags for this problem
          await prisma.problemTag.deleteMany({
            where: { problemId: problem.id }
          })

          // Tags that are too common (appear in >30% of problems) - filter them out
          const EXCLUDED_TAGS = ['pattern-recognition', 'logical-reasoning']

          const tagNames: string[] = []

          if (primary_category) {
            tagNames.push(primary_category)
          }

          if (secondary_tags) {
            const tags = secondary_tags.split(',')
              .map((t: string) => t.trim())
              .filter((t: string) => t && !EXCLUDED_TAGS.includes(t))
            tagNames.push(...tags)
          }

          // Create/find tags and link them
          for (const tagName of tagNames) {
            // Find or create tag
            let tag = await prisma.tag.findUnique({
              where: { name: tagName }
            })

            if (!tag) {
              // Determine category based on tag name
              let category = 'other'
              if (tagName === primary_category) {
                category = 'primary'
              } else if (tagName.includes('-')) {
                category = 'language-feature'
              } else {
                category = 'attribute'
              }

              tag = await prisma.tag.create({
                data: {
                  name: tagName,
                  category
                }
              })
            }

            // Link tag to problem
            await prisma.problemTag.create({
              data: {
                problemId: problem.id,
                tagId: tag.id
              }
            })
          }
        }

        updated++
      } catch (error) {
        errors.push(`Error updating ${label.number}: ${error}`)
      }
    }

    console.log(`Upload complete: ${updated} updated, ${notFound} not found`)

    res.json({
      message: 'Labels uploaded successfully',
      updated,
      notFound,
      total: labels.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })
  } catch (error) {
    console.error('Upload labels error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Remove language names from IOL problem titles (e.g., "IOL 2003 Problem 1: Budukh" -> "IOL 2003 Problem 1")
router.put('/problems/clean-iol-titles', async (req: Request, res: Response) => {
  try {
    console.log('Finding IOL problems with language names in titles...')

    // Find IOL problems with ": " in title (indicating language name)
    const iolProblems = await prisma.problem.findMany({
      where: {
        AND: [
          { number: { startsWith: 'LH-IOL-' } },
          { title: { contains: ': ' } }
        ]
      },
      select: {
        id: true,
        number: true,
        title: true
      }
    })

    console.log(`Found ${iolProblems.length} IOL problems with language names`)

    if (iolProblems.length === 0) {
      return res.json({
        message: 'No IOL problems with language names to clean',
        updated: 0
      })
    }

    // Update each problem to remove language name
    const updates = await Promise.all(
      iolProblems.map(problem => {
        // Remove everything after ": " (including the colon and space)
        const cleanTitle = problem.title.split(':')[0].trim()

        return prisma.problem.update({
          where: { id: problem.id },
          data: { title: cleanTitle }
        })
      })
    )

    console.log(`Updated ${updates.length} IOL problem titles`)

    res.json({
      message: 'IOL problem titles cleaned successfully',
      updated: updates.length,
      problems: iolProblems.map(p => ({
        number: p.number,
        oldTitle: p.title,
        newTitle: p.title.split(':')[0].trim()
      }))
    })
  } catch (error) {
    console.error('Clean IOL titles error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Remove excluded tags (pattern-recognition, logical-reasoning) from all problems
router.delete('/problems/clean-excluded-tags', async (req: Request, res: Response) => {
  try {
    console.log('Finding problems with excluded tags...')

    const EXCLUDED_TAGS = ['pattern-recognition', 'logical-reasoning']

    // Find the tag IDs for excluded tags
    const excludedTagRecords = await prisma.tag.findMany({
      where: {
        name: { in: EXCLUDED_TAGS }
      },
      select: {
        id: true,
        name: true
      }
    })

    if (excludedTagRecords.length === 0) {
      return res.json({
        message: 'No excluded tags found in database',
        deleted: 0
      })
    }

    console.log(`Found ${excludedTagRecords.length} excluded tags: ${excludedTagRecords.map(t => t.name).join(', ')}`)

    const excludedTagIds = excludedTagRecords.map(t => t.id)

    // Delete all ProblemTag entries linking to these tags
    const deletedLinks = await prisma.problemTag.deleteMany({
      where: {
        tagId: { in: excludedTagIds }
      }
    })

    console.log(`Deleted ${deletedLinks.count} problem-tag links`)

    // Optionally delete the tags themselves if they have no more links
    const deletedTags = await prisma.tag.deleteMany({
      where: {
        id: { in: excludedTagIds }
      }
    })

    console.log(`Deleted ${deletedTags.count} tags`)

    res.json({
      message: 'Excluded tags cleaned successfully',
      deletedLinks: deletedLinks.count,
      deletedTags: deletedTags.count,
      tags: excludedTagRecords.map(t => t.name)
    })
  } catch (error) {
    console.error('Clean excluded tags error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
