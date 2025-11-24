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
 * Convert Cloudinary PDF URL to image using Cloudinary transformation
 * Transforms PDF to PNG for LLM vision processing
 * @param cloudinaryPdfUrl - Cloudinary PDF URL like https://res.cloudinary.com/.../raw/upload/...pdf
 * @returns Transformed image URL with PNG conversion
 */
export function transformCloudinaryPdfToImage(cloudinaryPdfUrl: string): string {
  if (!cloudinaryPdfUrl) {
    return ''
  }

  try {
    // For Cloudinary PDFs stored in /raw/upload/, add transformation parameters
    // Replace /raw/upload/ with /raw/upload/c_scale,h_1200,w_900,f_png,pg_1/
    // This tells Cloudinary to: scale to 1200x900, convert first page to PNG format

    if (!cloudinaryPdfUrl.includes('/raw/upload/')) {
      // Already transformed or not a raw Cloudinary file
      return cloudinaryPdfUrl
    }

    const transformedUrl = cloudinaryPdfUrl.replace(
      '/raw/upload/',
      '/raw/upload/c_scale,h_1200,w_900,f_png,pg_1/'
    )

    console.log('[PDF Transformer] Transformed Cloudinary PDF to image')
    console.log('[PDF Transformer] Source:', cloudinaryPdfUrl.substring(0, 80))
    console.log('[PDF Transformer] Transformed:', transformedUrl.substring(0, 100))
    return transformedUrl
  } catch (error: any) {
    console.log('[PDF Transformer] Failed to transform URL:', error.message)
    return cloudinaryPdfUrl
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
