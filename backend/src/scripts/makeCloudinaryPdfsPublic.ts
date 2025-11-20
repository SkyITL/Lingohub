/**
 * Update all Cloudinary PDFs to have public access
 * This fixes the 401 errors when AI models try to access the PDFs
 */

import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import * as path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '../../.env') })

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * List all PDFs in Cloudinary and update their access mode
 */
async function makeAllPdfsPublic() {
  console.log('🔍 Fetching all PDFs from Cloudinary...\n')

  try {
    let allResources: any[] = []
    let nextCursor: string | undefined = undefined

    // Fetch all resources in the olympiad-problems folder
    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'olympiad-problems',
        resource_type: 'raw',
        max_results: 500,
        next_cursor: nextCursor
      })

      allResources = allResources.concat(result.resources)
      nextCursor = result.next_cursor

      console.log(`📦 Fetched ${result.resources.length} resources (Total: ${allResources.length})`)
    } while (nextCursor)

    console.log(`\n✅ Found ${allResources.length} total resources\n`)

    // Filter for PDFs
    const pdfResources = allResources.filter(r =>
      r.format === 'pdf' || r.public_id.endsWith('.pdf') || r.url.includes('.pdf')
    )

    console.log(`📄 Found ${pdfResources.length} PDF files\n`)

    if (pdfResources.length === 0) {
      console.log('No PDFs found to update.')
      return
    }

    // Update each PDF to have public access
    console.log('🔧 Updating PDFs to public access...\n')

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const pdf of pdfResources) {
      try {
        // Update the resource to have public access
        await cloudinary.api.update(pdf.public_id, {
          resource_type: 'raw',
          access_mode: 'public'
        })

        // Also update access control to allow anonymous access
        await cloudinary.uploader.explicit(pdf.public_id, {
          type: 'upload',
          resource_type: 'raw',
          access_mode: 'public',
          access_control: [{ access_type: 'anonymous' }]
        })

        successCount++
        console.log(`✅ Updated: ${pdf.public_id}`)
      } catch (error: any) {
        errorCount++
        const errorMsg = `❌ Failed to update ${pdf.public_id}: ${error.message}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Summary:')
    console.log(`✅ Successfully updated: ${successCount} PDFs`)
    console.log(`❌ Failed: ${errorCount} PDFs`)

    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.forEach(err => console.log(err))
    }

    // Test a sample URL to verify public access
    if (pdfResources.length > 0) {
      console.log('\n🧪 Testing sample PDF access...')
      const samplePdf = pdfResources[0]
      const publicUrl = cloudinary.url(samplePdf.public_id, {
        resource_type: 'raw',
        secure: true
      })

      console.log(`Sample URL: ${publicUrl}`)

      // Test if the URL is accessible
      const response = await fetch(publicUrl, { method: 'HEAD' })
      if (response.ok) {
        console.log('✅ Sample PDF is publicly accessible!')
      } else {
        console.log(`⚠️  Sample PDF returned status: ${response.status}`)
      }
    }

  } catch (error) {
    console.error('Error listing/updating resources:', error)
  }
}

// Also create a function to re-upload a specific PDF with public access
async function reuploadAsPublic(localPath: string, publicId: string) {
  try {
    console.log(`📤 Re-uploading ${localPath} as public...`)

    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      resource_type: 'raw',
      type: 'upload',
      access_mode: 'public',
      overwrite: true,
      invalidate: true // Invalidate CDN cache
    })

    console.log(`✅ Re-uploaded with public access: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error(`❌ Failed to re-upload: ${error}`)
    throw error
  }
}

// Run the script
if (require.main === module) {
  makeAllPdfsPublic()
    .then(() => {
      console.log('\n✨ Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error)
      process.exit(1)
    })
}

export { makeAllPdfsPublic, reuploadAsPublic }