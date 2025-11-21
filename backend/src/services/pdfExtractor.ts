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

  if (!pdfUrl.includes('cloudinary.com')) {
    return pdfUrl // Not a Cloudinary URL, return as-is
  }

  try {
    // Cloudinary PDF to image transformation:
    // /fetch/c_scale,h_1200,w_900,f_png,pg_1/ converts first page to PNG at specified dimensions
    // PNG format preserves formatting, tables, IPA symbols, and other complex linguistic notation better than JPG
    // Higher resolution (1200x900) for better LLM vision processing

    const encodedUrl = encodeURIComponent(pdfUrl)
    const imageUrl = `https://res.cloudinary.com/dvt6h0qgy/fetch/c_scale,h_1200,w_900,f_png,pg_1/${encodedUrl}`

    console.log('[PDF Transformer] Generated Cloudinary PNG transformation URL')
    return imageUrl
  } catch (error: any) {
    console.log('[PDF Transformer] Failed to transform Cloudinary URL:', error.message)
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
