/**
 * Update production database with Cloudinary URLs
 * Replaces local /olympiad-problems paths with Cloudinary CDN URLs
 */

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dvt6h0qgy/raw/upload'

/**
 * Convert local path to Cloudinary URL
 * Example: /olympiad-problems/IOL/by-year/2004/iol-2004-i1.pdf
 * -> https://res.cloudinary.com/dvt6h0qgy/raw/upload/v1762495026/olympiad-problems/IOL/by-year/2004/iol-2004-i1.pdf
 */
function convertToCloudinaryUrl(localPath: string): string | null {
  if (!localPath || !localPath.startsWith('/olympiad-problems/')) {
    return null
  }

  // For now, we'll use a version-less URL and let Cloudinary serve the latest
  // The version number changes with each upload, so we use the base URL pattern
  const pathWithoutLeadingSlash = localPath.substring(1) // Remove leading /

  // Try to construct URL - Cloudinary will auto-redirect to latest version
  return `${CLOUDINARY_BASE_URL}/${pathWithoutLeadingSlash}`
}

async function main() {
  console.log('🚀 Updating database with Cloudinary URLs...\n')

  // Get all problems with PDF URLs
  const problems = await prisma.problem.findMany({
    where: {
      OR: [
        { pdfUrl: { not: null } },
        { solutionUrl: { not: null } }
      ]
    },
    select: {
      id: true,
      number: true,
      pdfUrl: true,
      solutionUrl: true
    }
  })

  console.log(`📊 Found ${problems.length} problems with PDF URLs\n`)

  let updateCount = 0
  let skipCount = 0

  for (const problem of problems) {
    const updates: any = {}

    // Update pdfUrl if it's a local path
    if (problem.pdfUrl && problem.pdfUrl.startsWith('/olympiad-problems/')) {
      const cloudinaryUrl = convertToCloudinaryUrl(problem.pdfUrl)
      if (cloudinaryUrl) {
        updates.pdfUrl = cloudinaryUrl
        console.log(`📝 ${problem.number}: Updating pdfUrl`)
        console.log(`   ${problem.pdfUrl}`)
        console.log(`   → ${cloudinaryUrl}`)
      }
    }

    // Update solutionUrl if it's a local path
    if (problem.solutionUrl && problem.solutionUrl.startsWith('/olympiad-problems/')) {
      const cloudinaryUrl = convertToCloudinaryUrl(problem.solutionUrl)
      if (cloudinaryUrl) {
        updates.solutionUrl = cloudinaryUrl
        console.log(`📝 ${problem.number}: Updating solutionUrl`)
        console.log(`   ${problem.solutionUrl}`)
        console.log(`   → ${cloudinaryUrl}`)
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.problem.update({
        where: { id: problem.id },
        data: updates
      })
      updateCount++
    } else {
      skipCount++
    }
  }

  console.log(`\n📊 Update Summary:`)
  console.log(`✅ Updated: ${updateCount} problems`)
  console.log(`⏭️  Skipped: ${skipCount} problems (already using Cloudinary or no PDFs)`)
  console.log(`📝 Total: ${problems.length} problems`)

  console.log('\n🎉 Done!\n')

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
