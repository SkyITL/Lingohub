/**
 * Test script for PDF transformation
 */
import { transformPdfToImage } from '../services/pdfExtractor'

async function testPdfTransformation() {
  console.log('[Test] Starting PDF to image transformation test...')

  // Test with real Cloudinary PDF URLs
  const pdfUrls = [
    'https://res.cloudinary.com/dvt6h0qgy/raw/upload/v1732075833/olympiad-problems/IOL/by-year/2023/iol-2023-i1.pdf',
    'https://res.cloudinary.com/dvt6h0qgy/raw/upload/v1732075834/olympiad-problems/IOL/by-year/2023/iol-2023-indiv-sol.en.pdf',
  ]

  for (const testPdfUrl of pdfUrls) {
    console.log('\n' + '='.repeat(80))
    console.log('[Test] Testing PDF URL:', testPdfUrl)
    console.log('[Test] Transforming to PNG image...')

    const imageUrl = transformPdfToImage(testPdfUrl)

    if (imageUrl && imageUrl !== testPdfUrl) {
      console.log('[Test] ✅ PDF transformation successful!')
      console.log('[Test] Transformed Image URL:')
      console.log(imageUrl)
    } else {
      console.log('[Test] ⚠️  Transformation returned original URL')
      console.log('[Test] URL:', imageUrl)
    }
  }
}

testPdfTransformation().catch(console.error)
