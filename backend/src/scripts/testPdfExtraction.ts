/**
 * Test script for PDF extraction
 */
import { extractPdfText, generateCloudinaryImageUrl } from '../services/pdfExtractor'

async function testPdfExtraction() {
  console.log('[Test] Starting PDF extraction test...')

  // Test with real Cloudinary PDF URLs
  const pdfUrls = [
    'https://res.cloudinary.com/dvt6h0qgy/raw/upload/v1732075833/olympiad-problems/IOL/by-year/2023/iol-2023-i1.pdf',
    'https://res.cloudinary.com/dvt6h0qgy/raw/upload/v1732075834/olympiad-problems/IOL/by-year/2023/iol-2023-indiv-sol.en.pdf',
  ]

  for (const testPdfUrl of pdfUrls) {
    console.log('\n' + '='.repeat(80))
    console.log('[Test] Testing PDF URL:', testPdfUrl)
    console.log('[Test] Attempting to extract text...')

    const text = await extractPdfText(testPdfUrl, 15000)

    if (text) {
      console.log('[Test] ✅ PDF extraction successful!')
      console.log('[Test] Extracted text length:', text.length, 'characters')
      console.log('[Test] First 300 characters:')
      console.log(text.substring(0, 300))
      console.log('...')
    } else {
      console.log('[Test] ❌ PDF extraction failed - returned null')
      console.log('[Test] This might indicate:')
      console.log('  - PDF URL is not accessible')
      console.log('  - PDF parsing failed')
      console.log('  - Timeout occurred')
      console.log('[Test] Attempting with Cloudinary transformation as fallback...')

      const transformedUrl = generateCloudinaryImageUrl(testPdfUrl)
      console.log('[Test] Transformed URL:', transformedUrl)
    }
  }
}

testPdfExtraction().catch(console.error)
