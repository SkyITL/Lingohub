/**
 * PDF Content Transformer Service
 * Converts PDFs to images for multimodal LLM evaluation
 * For linguistics problems, visual representation preserves formatting, IPA symbols, tables
 */

import { v2 as cloudinary } from 'cloudinary'
import https from 'https'
import { Readable } from 'stream'

/**
 * Fetch a PDF from the backend and upload it to Cloudinary
 * @param pdfPath - Backend path like /olympiad-problems/IOL/by-year/2025/iol-2025-i1.pdf
 * @returns Cloudinary URL of the uploaded PDF
 */
export async function fetchAndUploadPdfToCloudinary(pdfPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!pdfPath) {
      reject(new Error('PDF path is required'))
      return
    }

    const backendUrl = process.env.BACKEND_URL || 'https://lingohub-backend.vercel.app'
    const fullUrl = `${backendUrl}${pdfPath}`

    console.log('[PDF Fetcher] Fetching PDF from:', fullUrl)

    https.get(fullUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch PDF: ${response.statusCode}`))
        return
      }

      // Extract filename from path for Cloudinary public_id
      const filename = pdfPath.split('/').pop() || 'pdf'

      // Upload the stream directly to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'lingohub-problem-pdfs',
          resource_type: 'raw',
          public_id: filename.replace('.pdf', ''),
          type: 'authenticated',
        },
        (error, result) => {
          if (error) {
            console.error('[PDF Fetcher] Cloudinary upload error:', error)
            reject(error)
          } else if (result) {
            console.log('[PDF Fetcher] ✅ PDF uploaded to Cloudinary:', result.secure_url)
            resolve(result.secure_url)
          } else {
            reject(new Error('Upload failed: No result returned'))
          }
        }
      )

      response.pipe(uploadStream)
    }).on('error', (error) => {
      console.error('[PDF Fetcher] Fetch error:', error)
      reject(error)
    })
  })
}

/**
 * Convert PDF URL to image using Cloudinary transformation
 * Transforms PDF to PNG for LLM vision processing
 * @param pdfUrl - Cloudinary PDF URL
 * @returns Transformed image URL
 */
export function transformPdfToImage(pdfUrl: string): string {
  if (!pdfUrl) {
    return ''
  }

  // Check if it's already a Cloudinary-hosted URL (already transformed, skip)
  if (pdfUrl.includes('res.cloudinary.com') && pdfUrl.includes('/fetch/')) {
    return pdfUrl // Already transformed, return as-is
  }

  try {
    // Cloudinary PDF to image transformation:
    // /fetch/c_scale,h_1200,w_900,f_png,pg_1/ converts first page to PNG at specified dimensions
    // PNG format preserves formatting, tables, IPA symbols, and other complex linguistic notation better than JPG
    // Higher resolution (1200x900) for better LLM vision processing

    let imageUrl: string

    if (pdfUrl.includes('res.cloudinary.com')) {
      // If it's already a Cloudinary URL (e.g., /raw/upload/...), use image transformation endpoint
      // Replace /raw/upload/ with /image/upload/ to apply transformations directly
      // This avoids double-nesting URLs which causes 404 errors
      const transformedUrl = pdfUrl.replace(
        '/raw/upload/',
        '/image/upload/c_scale,h_1200,w_900,f_png,pg_1/'
      )
      imageUrl = transformedUrl
      console.log('[PDF Transformer] Cloudinary internal URL transformed (raw → image with transformations)')
    } else {
      // External URL - use /fetch/ endpoint to fetch and transform
      // For /fetch/ endpoint, the URL should NOT be URL-encoded
      imageUrl = `https://res.cloudinary.com/dvt6h0qgy/fetch/c_scale,h_1200,w_900,f_png,pg_1/${pdfUrl}`
      console.log('[PDF Transformer] External URL transformation using /fetch/')
    }

    console.log('[PDF Transformer] Source URL:', pdfUrl.substring(0, 80))
    console.log('[PDF Transformer] Transformed URL:', imageUrl.substring(0, 100))
    return imageUrl
  } catch (error: any) {
    console.log('[PDF Transformer] Failed to transform URL:', error.message)
    return pdfUrl
  }
}

/**
 * Keep extractPdfText for backward compatibility but mark as deprecated
 * @deprecated Use transformPdfToImage instead for linguistics problems
 */
export async function extractPdfText(pdfUrl: string): Promise<string | null> {
  console.log('[PDF Extractor] extractPdfText is deprecated for linguistics. Use transformPdfToImage instead.')
  return null
}
