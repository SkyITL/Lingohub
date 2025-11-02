import express, { Request, Response } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'

const router = express.Router()
const execAsync = promisify(exec)

// Run database migrations - ONLY call this after deploying schema changes
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    console.log('🔧 Running database migrations...')

    // Run prisma migrate deploy
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
      cwd: '/var/task',  // Vercel serverless function directory
      env: { ...process.env }
    })

    console.log('Migration stdout:', stdout)
    if (stderr) console.log('Migration stderr:', stderr)

    res.json({
      success: true,
      message: 'Migrations applied successfully!',
      output: stdout
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    res.status(500).json({
      error: 'Migration failed',
      details: error.message,
      stderr: error.stderr
    })
  }
})

export default router
