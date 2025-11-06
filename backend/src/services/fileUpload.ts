import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export interface FileAttachment {
  url: string
  type: 'image' | 'pdf'
  filename: string
  size: number
}

/**
 * Upload a file to Cloudinary
 * @param fileBuffer - File buffer
 * @param filename - Original filename
 * @param mimetype - File MIME type
 * @returns File URL and metadata
 */
export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
): Promise<FileAttachment> {
  return new Promise((resolve, reject) => {
    // Determine resource type
    const isPDF = mimetype === 'application/pdf'
    const resourceType = isPDF ? 'raw' : 'image'
    const fileType: 'image' | 'pdf' = isPDF ? 'pdf' : 'image'

    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'lingohub-solutions',
        resource_type: resourceType,
        public_id: `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        // For images, add transformations
        ...(resourceType === 'image' && {
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        })
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error)
          reject(new Error(`File upload failed: ${error.message}`))
        } else if (result) {
          console.log('✅ File uploaded:', result.secure_url)
          resolve({
            url: result.secure_url,
            type: fileType,
            filename: filename,
            size: fileBuffer.length
          })
        } else {
          reject(new Error('Upload failed: No result returned'))
        }
      }
    )

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = Readable.from(fileBuffer)
    bufferStream.pipe(uploadStream)
  })
}

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of file objects with buffer, filename, and mimetype
 * @returns Array of file URLs and metadata
 */
export async function uploadMultipleFiles(
  files: Array<{ buffer: Buffer; filename: string; mimetype: string }>
): Promise<FileAttachment[]> {
  const uploadPromises = files.map(file =>
    uploadFile(file.buffer, file.filename, file.mimetype)
  )

  return Promise.all(uploadPromises)
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID extracted from URL
 */
export async function deleteFile(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
    console.log('🗑️  File deleted:', publicId)
  } catch (error) {
    console.error('❌ File deletion error:', error)
    throw error
  }
}
