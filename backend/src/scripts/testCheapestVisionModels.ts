/**
 * Test multiple cheap vision models to find the best cost-effective option
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Models to test (ordered by expected cheapness)
const VISION_MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct', // Should be very cheap
  'qwen/qwen2.5-vl-32b-instruct', // Another cheap option
  'nvidia/nemotron-nano-12b-v2-vl:free', // Free if available
  'meta-llama/llama-3.2-11b-vision-instruct', // Meta's vision model
  'google/gemini-2.0-flash', // Google flash model (fast and cheap)
]

async function testModel(modelName: string): Promise<{ model: string; success: boolean; duration: number; cost?: number; error?: string }> {
  console.log(`\n🧪 Testing ${modelName}...`)

  const requestBody = {
    model: modelName,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe what you see. Is this image visible to you?',
          },
          {
            type: 'image_url',
            image_url: {
              url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 100,
  }

  try {
    const startTime = Date.now()

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://lingohub.vercel.app',
        'X-Title': 'LingoHub-Cost-Test',
      },
      body: JSON.stringify(requestBody),
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      const error = await response.text()
      const errorMsg = error.substring(0, 100)
      console.log(`   ❌ Failed: ${errorMsg}`)
      return {
        model: modelName,
        success: false,
        duration,
        error: errorMsg,
      }
    }

    const result = await response.json()
    const responseText = result.choices[0].message.content

    // Calculate cost based on OpenRouter pricing
    const inputTokens = result.usage.prompt_tokens
    const outputTokens = result.usage.completion_tokens

    console.log(`   ✅ Success! Duration: ${duration}ms`)
    console.log(`   Tokens: ${inputTokens} input + ${outputTokens} output`)
    console.log(`   Response: "${responseText.substring(0, 60)}..."`)

    return {
      model: modelName,
      success: true,
      duration,
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`)
    return {
      model: modelName,
      success: false,
      duration: 0,
      error: error.message,
    }
  }
}

async function main() {
  console.log('🧪 Testing cheapest vision models on OpenRouter\n')
  console.log('Models to test:')
  VISION_MODELS.forEach((m, i) => console.log(`${i + 1}. ${m}`))

  if (!OPENROUTER_API_KEY) {
    console.error('\n❌ ERROR: OPENROUTER_API_KEY not set')
    process.exit(1)
  }

  const results = []
  for (const model of VISION_MODELS) {
    const result = await testModel(model)
    results.push(result)

    // Small delay between requests
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n' + '='.repeat(80))
  console.log('📊 Results Summary:')
  console.log('='.repeat(80))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  if (successful.length > 0) {
    console.log('\n✅ Working Models:')
    successful.forEach(r => {
      console.log(`   • ${r.model}`)
      console.log(`     Duration: ${r.duration}ms`)
    })

    console.log('\n🏆 Recommended (fastest):')
    const fastest = successful.sort((a, b) => a.duration - b.duration)[0]
    console.log(`   ${fastest.model}`)
    console.log(`   Response time: ${fastest.duration}ms`)
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Models:')
    failed.forEach(r => {
      console.log(`   • ${r.model}`)
      console.log(`     Error: ${r.error}`)
    })
  }

  process.exit(successful.length > 0 ? 0 : 1)
}

main()
