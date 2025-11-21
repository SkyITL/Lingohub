/**
 * PDF Content Extractor Service
 * Downloads PDFs and extracts text for LLM evaluation
 */

import * as https from 'https'
import * as http from 'http'
import * as pdfParse from 'pdf-parse'

/**
 * Download PDF from URL and extract text
 */
export async function extractPdfText(pdfUrl: string, timeoutMs: number = 10000): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('[PDF Extractor] PDF download timeout:', pdfUrl)
      resolve(null)
    }, timeoutMs)

    try {
      const protocol = pdfUrl.startsWith('https') ? https : http

      protocol.get(pdfUrl, async (response) => {
        const chunks: Buffer[] = []

        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          clearTimeout(timeout)
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            const text = await extractPdfText(redirectUrl, timeoutMs)
            resolve(text)
          } else {
            resolve(null)
          }
          return
        }

        if (response.statusCode !== 200) {
          clearTimeout(timeout)
          console.log('[PDF Extractor] Failed to download PDF:', pdfUrl, 'Status:', response.statusCode)
          resolve(null)
          return
        }

        response.on('data', (chunk) => {
          chunks.push(chunk)
        })

        response.on('end', async () => {
          clearTimeout(timeout)
          try {
            const buffer = Buffer.concat(chunks)
            const data = await pdfParse(buffer)
            const text = data.text || ''

            console.log('[PDF Extractor] Successfully extracted text from PDF:', pdfUrl, `(${text.length} chars from ${data.numpages} pages)`)
            resolve(text)
          } catch (parseError: any) {
            console.log('[PDF Extractor] Failed to parse PDF:', pdfUrl, parseError.message)
            resolve(null)
          }
        })

        response.on('error', (error) => {
          clearTimeout(timeout)
          console.log('[PDF Extractor] Error downloading PDF:', pdfUrl, error.message)
          resolve(null)
        })
      }).on('error', (error) => {
        clearTimeout(timeout)
        console.log('[PDF Extractor] HTTP error downloading PDF:', pdfUrl, error.message)
        resolve(null)
      })
    } catch (error: any) {
      clearTimeout(timeout)
      console.log('[PDF Extractor] Exception downloading PDF:', pdfUrl, error.message)
      resolve(null)
    }
  })
}

/**
 * Convert PDF to image using Cloudinary
 * This converts first page of PDF to JPG for better model handling
 */
export function generateCloudinaryImageUrl(pdfUrl: string): string {
  if (!pdfUrl.includes('cloudinary.com')) {
    return pdfUrl // Not a Cloudinary URL, return as-is
  }

  // Transform the Cloudinary PDF URL to JPG image
  try {
    // Cloudinary PDF to image transformation:
    // /fetch/c_scale,h_800,w_600,f_jpg,pg_1/ before the full resource path
    // This tells Cloudinary to fetch the URL and convert to JPG

    // Format: /fetch/transformations/https://...
    const encodedUrl = encodeURIComponent(pdfUrl)
    const imageUrl = `https://res.cloudinary.com/dvt6h0qgy/fetch/c_scale,h_800,w_600,f_jpg,pg_1/${encodedUrl}`

    console.log('[PDF Extractor] Generated Cloudinary fetch/transform URL for PDF')
    return imageUrl
  } catch (error: any) {
    console.log('[PDF Extractor] Failed to transform Cloudinary URL:', error.message)
  }

  return pdfUrl
}
