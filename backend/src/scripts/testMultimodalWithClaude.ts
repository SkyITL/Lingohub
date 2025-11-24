/**
 * Test multimodal Claude evaluation with actual student submission images
 */

import * as fs from 'fs'
import * as path from 'path'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

async function testClaudeMultimodal() {
  console.log('🧪 Testing Claude 3.5 Sonnet multimodal evaluation...\n')

  if (!OPENROUTER_API_KEY) {
    console.error('❌ ERROR: OPENROUTER_API_KEY environment variable not set')
    process.exit(1)
  }

  console.log('✅ API key found')
  console.log('📍 API URL:', OPENROUTER_API_URL)
  console.log('🤖 Model: anthropic/claude-3.5-sonnet (supports vision)\n')

  // Load the images
  const image1Path = '/Users/skyliu/Desktop/Weixin Image_20251124155346_24503_16.jpg'
  const image2Path = '/Users/skyliu/Desktop/Weixin Image_20251124155353_24504_16.jpg'

  if (!fs.existsSync(image1Path) || !fs.existsSync(image2Path)) {
    console.error('❌ Image files not found')
    process.exit(1)
  }

  // Read and convert to base64
  console.log('📷 Loading images...')
  const image1Buffer = fs.readFileSync(image1Path)
  const image2Buffer = fs.readFileSync(image2Path)
  const image1Base64 = image1Buffer.toString('base64')
  const image2Base64 = image2Buffer.toString('base64')
  console.log('✅ Images loaded')
  console.log(`   Image 1: ${(image1Buffer.length / 1024).toFixed(1)}KB`)
  console.log(`   Image 2: ${(image2Buffer.length / 1024).toFixed(1)}KB\n`)

  const requestBody = {
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'These are student submission pages for a linguistics olympiad problem. Can you see the content clearly? Describe what you see in these images.',
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

  console.log('📨 Request body structure:')
  console.log({
    model: requestBody.model,
    contentItems: requestBody.messages[0].content.map((item: any) => ({
      type: item.type,
      size: item.type === 'image_url' ? `${item.image_url.url.substring(0, 50)}...` : 'N/A',
    })),
  })
  console.log('\n' + '='.repeat(80) + '\n')

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
    console.log(`⏱️  Response received after ${duration}ms\n`)

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ API Error:', error)
      process.exit(1)
    }

    const result = await response.json()

    console.log('✅ Response parsed successfully\n')
    console.log('📊 Response metadata:')
    console.log({
      model: result.model,
      prompt_tokens: result.usage.prompt_tokens,
      completion_tokens: result.usage.completion_tokens,
      total_tokens: result.usage.total_tokens,
    })

    console.log('\n' + '='.repeat(80))
    console.log('📝 Claude Response:\n')
    const responseText = result.choices[0].message.content
    console.log(responseText)
    console.log('='.repeat(80) + '\n')

    if (responseText.toLowerCase().includes('cannot see') || responseText.toLowerCase().includes('not visible')) {
      console.log('⚠️  WARNING: Claude says images are not visible!\n')
    } else if (
      responseText.toLowerCase().includes('see') ||
      responseText.toLowerCase().includes('image') ||
      responseText.toLowerCase().includes('page')
    ) {
      console.log('✅ SUCCESS: Claude can see and process the images!\n')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Fetch error:', error)
    process.exit(1)
  }
}

testClaudeMultimodal()
