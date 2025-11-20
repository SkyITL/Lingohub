/**
 * Test OpenRouter models for PDF/multimodal support
 */

import { config } from 'dotenv'
import * as path from 'path'

// Load .env from root directory
config({ path: path.join(__dirname, '../../../.env') })

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const TEST_PDF_URL = 'https://res.cloudinary.com/dvt6h0qgy/raw/upload/olympiad-problems/IOL/by-year/2004/iol-2004-i1.pdf'

const MODELS_TO_TEST = [
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-flash',
  'google/gemini-flash-1.5',
  'google/gemini-pro-vision',
  'google/gemini-1.5-flash',
  'google/gemini-1.5-pro'
]

async function testModel(modelName: string) {
  try {
    console.log(`\n🧪 Testing model: ${modelName}`)

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://lingohub.org',
        'X-Title': 'LingoHub Test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What is in this PDF? Just give a brief 1-sentence summary.'
            },
            {
              type: 'image_url',
              image_url: {
                url: TEST_PDF_URL
              }
            }
          ]
        }]
      })
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✅ SUCCESS: ${modelName}`)
      console.log(`   Response: ${data.choices[0].message.content.substring(0, 100)}...`)
      console.log(`   Tokens: ${data.usage?.total_tokens || 'N/A'}`)
      return { model: modelName, success: true, data }
    } else {
      console.log(`❌ FAILED: ${modelName}`)
      console.log(`   Error: ${data.error?.message || JSON.stringify(data)}`)
      return { model: modelName, success: false, error: data.error }
    }
  } catch (error: any) {
    console.log(`❌ ERROR: ${modelName}`)
    console.log(`   ${error.message}`)
    return { model: modelName, success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Testing OpenRouter models for PDF support...')
  console.log(`📄 Test PDF: ${TEST_PDF_URL}\n`)

  const results = []

  for (const model of MODELS_TO_TEST) {
    const result = await testModel(model)
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit delay
  }

  console.log('\n\n📊 Summary:')
  console.log('=' .repeat(60))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  if (successful.length > 0) {
    console.log('\n✅ Working Models:')
    successful.forEach(r => console.log(`   - ${r.model}`))
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Models:')
    failed.forEach(r => console.log(`   - ${r.model}`))
  }

  console.log('\n' + '='.repeat(60))

  if (successful.length > 0) {
    console.log(`\n🎯 Recommended: ${successful[0].model}`)
  } else {
    console.log('\n⚠️  No working models found!')
  }
}

main().catch(console.error)
