/**
 * Check which PDFs failed to upload by comparing against all local PDFs
 */

import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'fs'
import * as path from 'path'

config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function findAllPdfs(dir: string): string[] {
  const pdfs: string[] = []

  function scan(currentDir: string) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name)

      if (item.isDirectory()) {
        scan(fullPath)
      } else if (item.isFile() && item.name.endsWith('.pdf')) {
        pdfs.push(fullPath)
      }
    }
  }

  scan(dir)
  return pdfs
}

async function checkPdfExists(localPath: string): Promise<boolean> {
  try {
    // Convert local path to Cloudinary public_id
    // /Users/skyliu/Lingohub/olympiad-problems/IOL/by-year/2004/iol-2004-i1.pdf
    // -> olympiad-problems/IOL/by-year/2004/iol-2004-i1
    const relativePath = localPath.replace(/.*olympiad-problems\//, 'olympiad-problems/')
    const publicId = relativePath.replace(/\.pdf$/, '')

    const result = await cloudinary.api.resource(publicId, { resource_type: 'raw' })
    return !!result
  } catch (error: any) {
    if (error.error && error.error.http_code === 404) {
      return false
    }
    throw error
  }
}

async function main() {
  console.log('🔍 Checking for failed PDF uploads...\n')

  const olympiadProblemsDir = path.join(__dirname, '../../../olympiad-problems')

  if (!fs.existsSync(olympiadProblemsDir)) {
    console.error('❌ olympiad-problems directory not found')
    process.exit(1)
  }

  const allPdfs = findAllPdfs(olympiadProblemsDir)
  console.log(`📊 Found ${allPdfs.length} local PDF files\n`)

  const failed: string[] = []
  let checked = 0

  for (const pdf of allPdfs) {
    checked++
    if (checked % 50 === 0) {
      console.log(`⏳ Checked ${checked}/${allPdfs.length}...`)
    }

    const exists = await checkPdfExists(pdf)
    if (!exists) {
      failed.push(pdf)
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`✅ Successfully uploaded: ${allPdfs.length - failed.length}`)
  console.log(`❌ Failed to upload: ${failed.length}`)

  if (failed.length > 0) {
    console.log(`\n❌ Failed PDFs:`)
    for (const pdf of failed) {
      const relativePath = pdf.replace(/.*olympiad-problems\//, '')
      console.log(`   - ${relativePath}`)
    }
  }
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
