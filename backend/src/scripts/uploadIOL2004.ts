/**
 * Upload IOL 2004 PDFs to Cloudinary (targeted upload)
 */

import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import * as path from 'path'

// Load environment variables
config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function uploadPdf(filePath: string, publicId: string): Promise<string> {
  try {
    console.log(`📤 Uploading: ${filePath}`)

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'olympiad-problems/IOL/by-year/2004',
      resource_type: 'raw',
      public_id: publicId,
      overwrite: true,
      use_filename: false,
    })

    console.log(`✅ Uploaded: ${result.secure_url}`)
    return result.secure_url
  } catch (error: any) {
    console.error(`❌ Failed:`, error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Uploading IOL 2004 PDFs to Cloudinary...\n')

  const baseDir = path.join(__dirname, '../../../olympiad-problems/IOL/by-year/2004')

  const files = [
    { local: 'iol-2004-i1.pdf', id: 'iol-2004-i1' },
    { local: 'iol-2004-i2.pdf', id: 'iol-2004-i2' },
    { local: 'iol-2004-i3.pdf', id: 'iol-2004-i3' },
    { local: 'iol-2004-i4.pdf', id: 'iol-2004-i4' },
    { local: 'iol-2004-i5.pdf', id: 'iol-2004-i5' },
    { local: 'iol-2004-indiv-prob.en.pdf', id: 'iol-2004-indiv-prob.en' },
    { local: 'iol-2004-indiv-sol.en.pdf', id: 'iol-2004-indiv-sol.en' },
    { local: 'iol-2004-team-prob.en.pdf', id: 'iol-2004-team-prob.en' },
  ]

  const results: Record<string, string> = {}

  for (const file of files) {
    try {
      const filePath = path.join(baseDir, file.local)
      const url = await uploadPdf(filePath, file.id)
      results[file.local] = url
    } catch (error) {
      console.error(`Failed to upload ${file.local}`)
    }
  }

  console.log('\n📊 Upload Summary:')
  console.log(`✅ Success: ${Object.keys(results).length}/${files.length}`)
  console.log('\n📝 Cloudinary URLs:')
  for (const [file, url] of Object.entries(results)) {
    console.log(`${file}: ${url}`)
  }

  console.log('\n🎉 Done!')
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
