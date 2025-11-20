/**
 * Update Cloudinary PDFs using Admin API's update method with access_control parameter
 * This properly sets public access for all PDFs programmatically
 */

import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import * as path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '../../.env') })

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Update access control for resources using Admin API
 */
async function updateAccessControlByPrefix(prefix: string) {
  console.log(`🔧 Updating access control for prefix: ${prefix}\n`)

  try {
    // Use the Admin API's update_by_prefix method to update all resources with the given prefix
    const result = await cloudinary.api.update_resources_access_mode_by_prefix(
      prefix,
      'public', // Set access mode to public
      {
        resource_type: 'raw', // PDFs are raw resources
        type: 'upload'
      }
    )

    console.log(`✅ Updated ${result.updated} resources with prefix: ${prefix}`)
    return result
  } catch (error: any) {
    // If the above method doesn't exist, try alternative approach
    console.log('Using alternative approach with update_resources method...')

    // First, get all resources with the prefix
    let allResources: string[] = []
    let nextCursor: string | undefined = undefined

    do {
      const listResult: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: prefix,
        resource_type: 'raw',
        max_results: 100,
        next_cursor: nextCursor
      })

      // Extract public IDs
      const publicIds = listResult.resources.map((r: any) => r.public_id)
      allResources = allResources.concat(publicIds)
      nextCursor = listResult.next_cursor

      console.log(`📦 Found ${publicIds.length} resources (Total: ${allResources.length})`)
    } while (nextCursor)

    if (allResources.length === 0) {
      console.log('No resources found with the given prefix')
      return { updated: 0 }
    }

    // Update resources in batches (Cloudinary typically limits to 100 per request)
    const batchSize = 100
    let totalUpdated = 0

    for (let i = 0; i < allResources.length; i += batchSize) {
      const batch = allResources.slice(i, i + batchSize)

      try {
        // Use update_resources to update multiple resources at once
        const updateResult = await (cloudinary.api as any).update_resources_access_mode_by_ids(
          batch,
          'public',
          {
            resource_type: 'raw',
            type: 'upload'
          }
        )

        totalUpdated += batch.length
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: Updated ${batch.length} resources`)
      } catch (batchError: any) {
        console.log(`⚠️  Batch update failed, trying individual updates...`)

        // Fallback to individual updates
        for (const publicId of batch) {
          try {
            // Update individual resource
            await cloudinary.api.update(publicId, {
              resource_type: 'raw',
              access_mode: 'public',
              type: 'upload'
            })

            // Also set access_control for comprehensive update
            await cloudinary.api.update(publicId, {
              resource_type: 'raw',
              access_control: [
                {
                  access_type: 'anonymous'
                }
              ],
              type: 'upload'
            })

            totalUpdated++
            console.log(`✅ Updated: ${publicId}`)
          } catch (individualError: any) {
            console.error(`❌ Failed to update ${publicId}: ${individualError.message}`)
          }
        }
      }
    }

    return { updated: totalUpdated }
  }
}

/**
 * Update resources by tag using Admin API
 */
async function updateAccessControlByTag(tag: string) {
  console.log(`🏷️  Updating access control for tag: ${tag}\n`)

  try {
    const result = await cloudinary.api.update_resources_access_mode_by_tag(
      tag,
      'public',
      {
        resource_type: 'raw',
        type: 'upload'
      }
    )

    console.log(`✅ Updated ${result.updated} resources with tag: ${tag}`)
    return result
  } catch (error: any) {
    console.error(`❌ Failed to update by tag: ${error.message}`)
    return { updated: 0 }
  }
}

/**
 * Add tags to all PDFs for easier management
 */
async function tagAllPdfs(prefix: string, tag: string) {
  console.log(`🏷️  Adding tag "${tag}" to all PDFs with prefix: ${prefix}\n`)

  try {
    let allResources: string[] = []
    let nextCursor: string | undefined = undefined

    // Get all resources
    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: prefix,
        resource_type: 'raw',
        max_results: 100,
        next_cursor: nextCursor
      })

      const publicIds = result.resources.map((r: any) => r.public_id)
      allResources = allResources.concat(publicIds)
      nextCursor = result.next_cursor
    } while (nextCursor)

    // Add tags in batches
    const batchSize = 100
    let totalTagged = 0

    for (let i = 0; i < allResources.length; i += batchSize) {
      const batch = allResources.slice(i, i + batchSize)

      try {
        await (cloudinary.api as any).add_tag(tag, batch, {
          resource_type: 'raw',
          type: 'upload'
        })

        totalTagged += batch.length
        console.log(`✅ Tagged batch ${Math.floor(i/batchSize) + 1}: ${batch.length} resources`)
      } catch (error: any) {
        console.error(`❌ Failed to tag batch: ${error.message}`)
      }
    }

    console.log(`✅ Tagged ${totalTagged} resources with "${tag}"`)
    return totalTagged
  } catch (error: any) {
    console.error(`❌ Failed to tag resources: ${error.message}`)
    return 0
  }
}

/**
 * Test if a sample PDF is publicly accessible
 */
async function testPublicAccess(publicId: string) {
  console.log(`\n🧪 Testing public access for: ${publicId}`)

  const publicUrl = cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    secure: true
  })

  console.log(`📍 URL: ${publicUrl}`)

  try {
    const response = await fetch(publicUrl, { method: 'HEAD' })

    if (response.ok) {
      console.log('✅ PDF is publicly accessible!')
      return true
    } else {
      console.log(`❌ PDF returned status: ${response.status}`)

      // Try to get more details with a GET request
      const getResponse = await fetch(publicUrl)
      if (!getResponse.ok) {
        const text = await getResponse.text()
        console.log(`Error details: ${text.substring(0, 200)}`)
      }
      return false
    }
  } catch (error: any) {
    console.error(`❌ Failed to test access: ${error.message}`)
    return false
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Updating Cloudinary PDFs with Admin API access_control\n')
  console.log('=' + '='.repeat(50))

  const prefix = 'olympiad-problems'
  const tag = 'olympiad-pdf'

  try {
    // Step 1: Tag all PDFs for easier management (optional)
    console.log('\n📌 Step 1: Tagging PDFs for easier management...')
    const taggedCount = await tagAllPdfs(prefix, tag)

    // Step 2: Update access control by prefix
    console.log('\n📌 Step 2: Updating access control by prefix...')
    const prefixResult = await updateAccessControlByPrefix(prefix)

    // Step 3: If we have tags, also try updating by tag
    if (taggedCount > 0) {
      console.log('\n📌 Step 3: Updating access control by tag...')
      const tagResult = await updateAccessControlByTag(tag)
    }

    // Step 4: Test a few sample PDFs
    console.log('\n📌 Step 4: Testing sample PDFs for public access...')
    const samplePublicIds = [
      'olympiad-problems/IOL/by-year/2023/iol-2023-i1',
      'olympiad-problems/IOL/by-year/2023/iol-2023-indiv-prob.en',
      'olympiad-problems/APLO/aplo-2024-p1'
    ]

    let successCount = 0
    for (const publicId of samplePublicIds) {
      const isAccessible = await testPublicAccess(publicId)
      if (isAccessible) successCount++
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Summary:')
    console.log(`✅ Updated ${prefixResult.updated || 'unknown'} resources`)
    console.log(`🧪 ${successCount}/${samplePublicIds.length} sample PDFs are publicly accessible`)

    if (successCount === samplePublicIds.length) {
      console.log('\n🎉 Success! All tested PDFs are now publicly accessible.')
    } else {
      console.log('\n⚠️  Some PDFs may still have access issues. You may need to:')
      console.log('1. Check Cloudinary Dashboard → Settings → Security')
      console.log('2. Ensure "Restricted media types" does NOT include "raw"')
      console.log('3. Check Settings → Upload → Upload Presets (set to unsigned/public)')
      console.log('4. Verify API restrictions are not blocking public access')
    }

  } catch (error: any) {
    console.error('\n❌ Script failed:', error.message)
    console.error(error.stack)
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✨ Script completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Unhandled error:', error)
      process.exit(1)
    })
}

export { updateAccessControlByPrefix, updateAccessControlByTag, testPublicAccess }