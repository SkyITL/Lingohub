# File Storage Recommendations for LingoHub

## Current Situation

Users can now upload images and PDFs with their solutions. These files need persistent storage.

## Vercel Limitations

**IMPORTANT**: Vercel serverless functions do NOT provide persistent file storage. Files uploaded to serverless functions are lost when the function execution ends.

## Storage Options

### 1. **Cloudinary** (Recommended for Images)
**Free Tier**: 25GB storage, 25GB bandwidth/month

**Pros**:
- Free tier is generous
- Built-in image optimization and transformation
- CDN included
- Easy to integrate
- Automatic format conversion (WebP, AVIF)

**Setup**:
```bash
npm install cloudinary
```

**Environment Variables**:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. **Supabase Storage** (Recommended for PDFs)
**Free Tier**: 1GB storage

**Pros**:
- Integrated with PostgreSQL
- Easy to set up
- Good for PDFs and documents
- Built-in access control

**Setup**:
```bash
npm install @supabase/storage-js
```

### 3. **Vercel Blob** (Paid)
**Pricing**: 
- Free tier: 500MB storage, 50GB bandwidth/month
- Pro: $0.30/GB storage, $0.15/GB bandwidth

**Pros**:
- Native Vercel integration
- Simple API
- Good for production apps

**Setup**:
```bash
npm install @vercel/blob
```

### 4. **AWS S3** (Pay-as-you-go)
**Pricing**: Very cheap (~$0.023/GB/month)

**Pros**:
- Industry standard
- Extremely reliable
- Unlimited scaling
- Very cheap

**Cons**:
- More complex setup
- AWS account required

### 5. **Base64 in Database** (NOT Recommended for Production)
**Free**: Uses existing PostgreSQL database

**Pros**:
- No additional service needed
- Simple implementation

**Cons**:
- Increases database size significantly
- Slower queries
- Not scalable
- Bad for large files

## Current Implementation

### Frontend (Implemented)
- ✅ Client-side image compression (5MB → ~1MB)
- ✅ PDF support (max 10MB)
- ✅ File validation
- ✅ Total upload limit: 15MB per submission
- ✅ Max 5 files per submission

### Backend (Pending)
The backend needs to:
1. Accept multipart/form-data uploads
2. Upload files to chosen storage service
3. Store file URLs in database (not the files themselves)
4. Return URLs with solution data

## Recommended Setup for LingoHub

### Phase 1: MVP (Use Cloudinary Free Tier)
```javascript
// backend/src/services/fileUpload.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadFile(file: Buffer, filename: string) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'lingohub-solutions' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    ).end(file)
  })
}
```

### Phase 2: Production (Separate Images and PDFs)
- **Images**: Cloudinary (optimized delivery)
- **PDFs**: Supabase Storage or S3 (document storage)

## Database Schema Update

Add file URLs to solutions:

```prisma
model Solution {
  id          String   @id @default(cuid())
  content     String
  attachments Json?    // Array of {url: string, type: 'image' | 'pdf', filename: string}
  // ... other fields
}
```

## Cost Estimation

### Free Tier (Cloudinary)
- **Storage**: 25GB (enough for ~25,000 compressed images)
- **Bandwidth**: 25GB/month (enough for ~2,000 solution views/day)
- **Cost**: $0

### Paid Tier (if needed)
- **Cloudinary Plus**: $89/month (up to 75GB bandwidth)
- **Vercel Blob**: ~$15/month (50GB storage + bandwidth)
- **AWS S3**: ~$5/month (100GB storage + transfer)

## Implementation Priority

1. ✅ **Done**: Frontend upload UI with compression
2. **Next**: Backend file upload API (Cloudinary integration)
3. **Next**: Store file URLs in database
4. **Next**: Display files in Solutions tab
5. **Future**: Migrate to hybrid storage (Cloudinary + S3/Supabase)

## Security Considerations

1. **Validate file types** on backend (don't trust frontend)
2. **Scan for malware** (consider ClamAV or VirusTotal API)
3. **Generate unique filenames** to prevent overwrites
4. **Set proper CORS headers** for file access
5. **Implement rate limiting** for uploads
6. **Add file size validation** on backend
