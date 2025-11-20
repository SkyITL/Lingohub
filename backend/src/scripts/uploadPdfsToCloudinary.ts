/**
 * Upload all olympiad problem PDFs to Cloudinary
 * This script will:
 * 1. Find all PDF files in olympiad-problems directory
 * 2. Upload them to Cloudinary
 * 3. Update the database with the new URLs
 */

import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config()

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

interface UploadResult {
  originalPath: string
  cloudinaryUrl: string
  publicId: string
}

/**
 * Upload a single PDF to Cloudinary
 */
async function uploadPdf(filePath: string, folder: string = 'olympiad-problems'): Promise<string> {
  try {
    console.log(`📤 Uploading: ${filePath}`)

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'raw', // PDFs are raw files, not images
      type: 'upload',
      access_mode: 'public', // Make PDFs publicly accessible
      public_id: path.basename(filePath, '.pdf'),
      overwrite: false, // Don't overwrite if already exists
      use_filename: true,
      unique_filename: false
    })

    console.log(`✅ Uploaded: ${result.secure_url}`)
    return result.secure_url
  } catch (error: any) {
    if (error.http_code === 400 && error.message.includes('already exists')) {
      // File already exists, get the URL
      const publicId = `${folder}/${path.basename(filePath, '.pdf')}`
      const url = cloudinary.url(publicId, { resource_type: 'raw' })
      console.log(`ℹ️  Already exists: ${url}`)
      return url
    }
    throw error
  }
}

/**
 * Recursively find all PDF files in a directory
 */
function findPdfs(dir: string): string[] {
  const pdfs: string[] = []

  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`)
    return pdfs
  }

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      pdfs.push(...findPdfs(fullPath))
    } else if (file.endsWith('.pdf')) {
      pdfs.push(fullPath)
    }
  }

  return pdfs
}

/**
 * Main upload function
 */
async function main() {
  console.log('🚀 Starting PDF upload to Cloudinary...\n')

  // Find olympiad-problems directory (could be in root or backend)
  const possibleDirs = [
    path.join(__dirname, '../../../olympiad-problems'),
    path.join(__dirname, '../../olympiad-problems'),
    path.join(process.cwd(), 'olympiad-problems'),
    path.join(process.cwd(), '../olympiad-problems')
  ]

  let olympiadDir: string | null = null
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      olympiadDir = dir
      console.log(`📁 Found olympiad-problems at: ${dir}\n`)
      break
    }
  }

  if (!olympiadDir) {
    console.error('❌ Could not find olympiad-problems directory')
    process.exit(1)
  }

  // Find all PDFs
  const pdfFiles = findPdfs(olympiadDir)
  console.log(`📊 Found ${pdfFiles.length} PDF files\n`)

  if (pdfFiles.length === 0) {
    console.log('No PDFs to upload')
    return
  }

  // Upload all PDFs
  const uploads: UploadResult[] = []
  let successCount = 0
  let failCount = 0

  for (const pdfPath of pdfFiles) {
    try {
      // Get relative path from olympiad-problems directory
      const relativePath = path.relative(olympiadDir, pdfPath)
      const folder = `olympiad-problems/${path.dirname(relativePath)}`.replace(/\\/g, '/')

      const cloudinaryUrl = await uploadPdf(pdfPath, folder)

      uploads.push({
        originalPath: `/olympiad-problems/${relativePath}`.replace(/\\/g, '/'),
        cloudinaryUrl,
        publicId: folder + '/' + path.basename(pdfPath, '.pdf')
      })

      successCount++
    } catch (error) {
      console.error(`❌ Failed to upload ${pdfPath}:`, error)
      failCount++
    }
  }

  console.log(`\n📊 Upload Summary:`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📝 Total: ${pdfFiles.length}\n`)

  // Update database
  console.log('💾 Updating database with new URLs...\n')

  const problems = await prisma.problem.findMany({
    where: {
      OR: [
        { pdfUrl: { not: null } },
        { solutionUrl: { not: null } }
      ]
    }
  })

  let updateCount = 0

  for (const problem of problems) {
    const updates: any = {}

    // Update pdfUrl
    if (problem.pdfUrl) {
      const match = uploads.find(u => u.originalPath === problem.pdfUrl)
      if (match) {
        updates.pdfUrl = match.cloudinaryUrl
        console.log(`📝 Updating ${problem.number} pdfUrl`)
      }
    }

    // Update solutionUrl
    if (problem.solutionUrl) {
      const match = uploads.find(u => u.originalPath === problem.solutionUrl)
      if (match) {
        updates.solutionUrl = match.cloudinaryUrl
        console.log(`📝 Updating ${problem.number} solutionUrl`)
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.problem.update({
        where: { id: problem.id },
        data: updates
      })
      updateCount++
    }
  }

  console.log(`\n✅ Updated ${updateCount} problems in database`)
  console.log('🎉 Done!\n')

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
