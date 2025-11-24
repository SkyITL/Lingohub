/**
 * Test script to verify multimodal OpenRouter API calls work correctly
 * Tests the exact request format we're using for evaluation
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

async function testMultimodalRequest() {
  console.log('🧪 Testing multimodal OpenRouter API call...\n')

  if (!OPENROUTER_API_KEY) {
    console.error('❌ ERROR: OPENROUTER_API_KEY environment variable not set')
    process.exit(1)
  }

  console.log('✅ API key found')
  console.log('📍 API URL:', OPENROUTER_API_URL)
  console.log('🤖 Model: meta-llama/llama-3.2-90b-vision-instruct (vision model)\n')

  // Test with a simple 1x1 red pixel image (base64)
  const redPixelBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
  const bluePixelBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+8/wHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='

  const requestBody = {
    model: 'meta-llama/llama-3.2-90b-vision-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe what you see in these images. Are they visible and readable?',
          },
          {
            type: 'image_url',
            image_url: {
              url: redPixelBase64,
            },
          },
          {
            type: 'image_url',
            image_url: {
              url: bluePixelBase64,
            },
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  }

  console.log('📨 Request body structure:')
  console.log(JSON.stringify(requestBody, null, 2))
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
    console.log('📝 LLM Response:\n')
    console.log(result.choices[0].message.content)
    console.log('='.repeat(80) + '\n')

    if (result.choices[0].message.content.toLowerCase().includes('not provide')) {
      console.log(
        '⚠️  WARNING: LLM says content/images were not provided!\n' +
        'This suggests the image_url format may not be working with OpenRouter.\n'
      )
    } else if (
      result.choices[0].message.content.toLowerCase().includes('see') ||
      result.choices[0].message.content.toLowerCase().includes('image')
    ) {
      console.log('✅ SUCCESS: LLM appears to have received and processed the images!\n')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Fetch error:', error)
    process.exit(1)
  }
}

testMultimodalRequest()
