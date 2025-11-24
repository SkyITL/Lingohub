/**
 * PDF Content Transformer Service
 * Converts PDFs to images for multimodal LLM evaluation
 * For linguistics problems, visual representation preserves formatting, IPA symbols, tables
 */

/**
 * Convert PDF to image using Cloudinary transformation
 * Transforms PDF to PNG for LLM vision processing
 * @param pdfUrl - Cloudinary PDF URL
 * @returns Transformed image URL
 */
export function transformPdfToImage(pdfUrl: string): string {
  if (!pdfUrl) {
    return ''
  }

  // Check if it's already a Cloudinary-hosted URL (skip transformation)
  if (pdfUrl.includes('res.cloudinary.com') && pdfUrl.includes('/fetch/')) {
    return pdfUrl // Already transformed, return as-is
  }

  try {
    // Cloudinary PDF to image transformation:
    // /fetch/c_scale,h_1200,w_900,f_png,pg_1/ converts first page to PNG at specified dimensions
    // PNG format preserves formatting, tables, IPA symbols, and other complex linguistic notation better than JPG
    // Higher resolution (1200x900) for better LLM vision processing

    // For Cloudinary /fetch/ endpoint, the URL should NOT be URL-encoded
    // Just pass it directly as the last parameter
    const imageUrl = `https://res.cloudinary.com/dvt6h0qgy/fetch/c_scale,h_1200,w_900,f_png,pg_1/${pdfUrl}`

    console.log('[PDF Transformer] Generated Cloudinary PNG transformation URL')
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
