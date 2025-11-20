/**
 * Generate signed URLs for Cloudinary resources
 * This allows temporary access to private resources
 */

import { v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'

// Load environment variables
config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Generate a signed URL for a Cloudinary resource
 * @param url - The Cloudinary URL (can be unsigned)
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL with temporary access
 */
export function generateSignedUrl(url: string, expiresIn: number = 3600): string | null {
  if (!url) return null

  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url // Return as-is if not a Cloudinary URL
  }

  try {
    // Extract the public ID from the URL
    // Format: https://res.cloudinary.com/{cloud}/raw/upload/{version}/olympiad-problems/...
    const match = url.match(/\/v\d+\/(.+)$/) || url.match(/\/upload\/(.+)$/)

    if (!match || !match[1]) {
      console.error('Could not extract public ID from URL:', url)
      return url
    }

    let publicId = match[1]

    // Remove file extension if present (Cloudinary doesn't need it in public_id)
    publicId = publicId.replace(/\.[^/.]+$/, '')

    console.log('Generating signed URL for public_id:', publicId)

    // Generate signed URL with expiration
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn
    })

    console.log('Generated signed URL:', signedUrl)
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return url // Return original URL as fallback
  }
}

/**
 * Generate signed URLs for problem and solution PDFs
 * @param problemPdfUrl - Problem PDF URL
 * @param solutionPdfUrl - Solution PDF URL
 * @returns Object with signed URLs
 */
export function generateSignedPdfUrls(
  problemPdfUrl?: string,
  solutionPdfUrl?: string
): {
  problemPdfSignedUrl?: string
  solutionPdfSignedUrl?: string
} {
  return {
    problemPdfSignedUrl: problemPdfUrl ? generateSignedUrl(problemPdfUrl) || undefined : undefined,
    solutionPdfSignedUrl: solutionPdfUrl ? generateSignedUrl(solutionPdfUrl) || undefined : undefined
  }
}