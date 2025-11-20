/**
 * Quick test script to check if Cloudinary PDFs are now publicly accessible
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

async function testPdfAccess() {
  console.log('🧪 Testing Cloudinary PDF public access...\n')

  // Test URLs we've already updated - note the .pdf extension is part of the public_id
  const testPdfs = [
    {
      publicId: 'olympiad-problems/APLO/aplo-2023-p1.pdf',
      description: 'APLO 2023 Problem 1'
    },
    {
      publicId: 'olympiad-problems/IOL/by-year/2023/iol-2023-i1.pdf',
      description: 'IOL 2023 Individual Problem 1'
    },
    {
      publicId: 'olympiad-problems/IOL/by-year/2023/iol-2023-indiv-prob.en.pdf',
      description: 'IOL 2023 Individual Problems (English)'
    }
  ]

  let successCount = 0
  const results: any[] = []

  for (const pdf of testPdfs) {
    console.log(`\nTesting: ${pdf.description}`)
    console.log(`Public ID: ${pdf.publicId}`)

    // Generate public URL
    const url = cloudinary.url(pdf.publicId, {
      resource_type: 'raw',
      type: 'upload',
      secure: true
    })

    console.log(`URL: ${url}`)

    try {
      // Test with HEAD request first
      const headResponse = await fetch(url, { method: 'HEAD' })

      if (headResponse.ok) {
        console.log(`✅ SUCCESS - Status: ${headResponse.status}`)
        successCount++
        results.push({ ...pdf, status: 'success', code: headResponse.status })
      } else {
        console.log(`❌ FAILED - Status: ${headResponse.status}`)

        // Try GET for more details
        const getResponse = await fetch(url)
        const text = await getResponse.text()
        console.log(`Error details: ${text.substring(0, 100)}...`)
        results.push({ ...pdf, status: 'failed', code: headResponse.status, error: text.substring(0, 100) })
      }
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`)
      results.push({ ...pdf, status: 'error', error: error.message })
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Results:')
  console.log(`✅ Success: ${successCount}/${testPdfs.length}`)
  console.log(`❌ Failed: ${testPdfs.length - successCount}/${testPdfs.length}`)

  if (successCount === testPdfs.length) {
    console.log('\n🎉 All tested PDFs are now publicly accessible!')
    console.log('The Admin API update with access_control worked!')
  } else {
    console.log('\n⚠️  Some PDFs are still not accessible.')
    console.log('\nFailed PDFs:')
    results.filter(r => r.status !== 'success').forEach(r => {
      console.log(`- ${r.description}: ${r.error || `Status ${r.code}`}`)
    })
  }

  return successCount === testPdfs.length
}

// Run the test
testPdfAccess()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  })