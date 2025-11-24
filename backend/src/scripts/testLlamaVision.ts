/**
 * Test Meta Llama 3.2 Vision with actual student submission images
 * This model is cheaper than Claude and should support multimodal well
 */

import * as fs from 'fs'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

async function testLlamaVision() {
  console.log('🧪 Testing Meta Llama 3.2 Vision with student submission images...\n')

  if (!OPENROUTER_API_KEY) {
    console.error('❌ ERROR: OPENROUTER_API_KEY not set')
    process.exit(1)
  }

  console.log('✅ API key found')
  console.log('🤖 Model: meta-llama/llama-3.2-11b-vision-instruct\n')

  // Load the actual student images
  const image1Path = '/Users/skyliu/Desktop/Weixin Image_20251124155346_24503_16.jpg'
  const image2Path = '/Users/skyliu/Desktop/Weixin Image_20251124155353_24504_16.jpg'

  if (!fs.existsSync(image1Path) || !fs.existsSync(image2Path)) {
    console.error('❌ Image files not found')
    process.exit(1)
  }

  console.log('📷 Loading images...')
  const image1Buffer = fs.readFileSync(image1Path)
  const image2Buffer = fs.readFileSync(image2Path)
  const image1Base64 = image1Buffer.toString('base64')
  const image2Base64 = image2Buffer.toString('base64')

  console.log(`✅ Images loaded: ${(image1Buffer.length / 1024).toFixed(1)}KB + ${(image2Buffer.length / 1024).toFixed(1)}KB\n`)

  const requestBody = {
    model: 'meta-llama/llama-3.2-11b-vision-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'These are pages from a student solution to a linguistics olympiad problem. Can you see and read the content clearly? Describe what linguistic patterns or linguistic work you see.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${image1Base64}`,
            },
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${image2Base64}`,
            },
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  }

  try {
    console.log('🚀 Sending request to OpenRouter...')
    const startTime = Date.now()

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://lingohub.vercel.app',
        'X-Title': 'LingoHub-Test',
      },
      body: JSON.stringify(requestBody),
    })

    const duration = Date.now() - startTime
    console.log(`⏱️  Response received after ${(duration / 1000).toFixed(2)}s\n`)

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ API Error:', error)
      process.exit(1)
    }

    const result = await response.json()

    console.log('📊 Response metadata:')
    console.log({
      model: result.model,
      prompt_tokens: result.usage.prompt_tokens,
      completion_tokens: result.usage.completion_tokens,
      total_tokens: result.usage.total_tokens,
    })

    // Estimate cost for Llama 3.2 (very cheap)
    // Typical pricing: ~$0.04/1M input, $0.04/1M output
    const estimatedCost = ((result.usage.prompt_tokens * 0.04 + result.usage.completion_tokens * 0.04) / 1_000_000).toFixed(6)

    console.log(`💰 Estimated cost: $${estimatedCost}\n`)

    console.log('='.repeat(80))
    console.log('📝 Llama Response:\n')
    const responseText = result.choices[0].message.content
    console.log(responseText)
    console.log('\n' + '='.repeat(80) + '\n')

    // Check if it can see images
    const canSee = !responseText.toLowerCase().includes('cannot see') &&
                   !responseText.toLowerCase().includes('not visible') &&
                   !responseText.toLowerCase().includes('unable to view') &&
                   responseText.length > 100

    if (canSee) {
      console.log('✅ SUCCESS: Llama can see and analyze the images!\n')
      console.log('✅ This model is excellent: FAST + CHEAP + WORKS WITH IMAGES')
    } else {
      console.log('⚠️  WARNING: Llama says it cannot see the images\n')
    }

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Fetch error:', error.message)
    process.exit(1)
  }
}

testLlamaVision()
