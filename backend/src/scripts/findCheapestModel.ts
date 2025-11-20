/**
 * Find the cheapest working model on OpenRouter
 */

import { config } from 'dotenv'
import * as path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '../../.env') })

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

interface Model {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
}

async function getModels(): Promise<Model[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`
    }
  })

  const data = await response.json() as { data: Model[] }
  return data.data
}

async function testModel(modelId: string): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Say "test"' }],
        max_tokens: 10
      })
    })

    return response.ok
  } catch {
    return false
  }
}

async function main() {
  console.log('🔍 Finding cheapest working models on OpenRouter...\n')

  const models = await getModels()

  // Filter for cheap models with reasonable context
  const cheapModels = models
    .filter(m => {
      const promptPrice = parseFloat(m.pricing.prompt)
      const completionPrice = parseFloat(m.pricing.completion)
      return promptPrice < 1 && completionPrice < 5 && m.context_length >= 8000
    })
    .sort((a, b) => {
      const aPrice = parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion)
      const bPrice = parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion)
      return aPrice - bPrice
    })

  console.log(`Found ${cheapModels.length} cheap models. Testing top 10...\n`)

  const workingModels: Model[] = []

  for (const model of cheapModels.slice(0, 10)) {
    process.stdout.write(`Testing ${model.id}... `)
    const works = await testModel(model.id)

    if (works) {
      console.log('✅')
      workingModels.push(model)
    } else {
      console.log('❌')
    }
  }

  console.log('\n📊 Working Models (sorted by price):')
  console.log('=' + '='.repeat(50))

  for (const model of workingModels) {
    const totalPrice = parseFloat(model.pricing.prompt) + parseFloat(model.pricing.completion)
    console.log(`\n${model.id}`)
    console.log(`  Name: ${model.name}`)
    console.log(`  Input: $${model.pricing.prompt}/1M tokens`)
    console.log(`  Output: $${model.pricing.completion}/1M tokens`)
    console.log(`  Total: $${totalPrice.toFixed(2)}/1M tokens`)
    console.log(`  Context: ${model.context_length.toLocaleString()} tokens`)
  }

  // Recommend the best one
  if (workingModels.length > 0) {
    console.log('\n✨ Recommended model:', workingModels[0].id)
  }
}

main().catch(console.error)