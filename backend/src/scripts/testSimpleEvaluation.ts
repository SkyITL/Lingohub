/**
 * Test simple AI evaluation without PDFs using free model
 */

import { evaluateSolution } from '../services/llmEvaluator'
import { config } from 'dotenv'
import * as path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '../../.env') })

async function testSimpleEvaluation() {
  console.log('🧪 Testing AI Evaluation with Free Model (no PDFs)\n')
  console.log('=' + '='.repeat(50))

  const problemContent = `
Examine the following data from a language and answer the questions below:

1. mano = hand
2. manos = hands
3. libro = book
4. libros = books
5. casa = house
6. casas = houses

Question: How do you form the plural in this language?
  `.trim()

  const officialSolution = `
To form the plural in this language (Spanish), add -s to words ending in a vowel.
All singular forms end in -o or -a (vowels), and the plural is formed by adding -s.
  `.trim()

  const userSolution = `
The plural is formed by adding an 's' to the end of the singular form.
Looking at the pattern: mano→manos, libro→libros, casa→casas.
  `.trim()

  try {
    console.log('\n🤖 Testing with OpenRouter Auto (FREE model)...\n')

    const result = await evaluateSolution(
      problemContent,
      officialSolution,
      userSolution,
      'openrouter/auto' // Use the free auto-routing model
    )

    console.log('\n✅ Evaluation Complete!\n')
    console.log('📊 Results:')
    console.log(`- Total Score: ${result.totalScore}/100`)
    console.log(`- Confidence: ${result.confidence}`)
    console.log(`- Model Used: ${result.modelUsed}`)
    console.log(`- Tokens Used: ${result.tokensUsed}`)
    console.log(`- Cost: $${result.cost.toFixed(6)} (should be $0.00!)`)

    console.log('\n📝 Scores Breakdown:')
    console.log(`- Correctness: ${result.scores.correctness}/40`)
    console.log(`- Reasoning: ${result.scores.reasoning}/30`)
    console.log(`- Coverage: ${result.scores.coverage}/20`)
    console.log(`- Clarity: ${result.scores.clarity}/10`)

    console.log('\n💬 Feedback:', result.feedback)

    if (result.strengths.length > 0) {
      console.log('\n✅ Strengths:')
      result.strengths.forEach(s => console.log(`  - ${s}`))
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(e => console.log(`  - ${e}`))
    }

    if (result.suggestions.length > 0) {
      console.log('\n💡 Suggestions:')
      result.suggestions.forEach(s => console.log(`  - ${s}`))
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 FREE model evaluation is working!')
    console.log('💰 Cost savings: Using free models instead of GPT-4o saves $5-15 per 1M tokens!')

    return true
  } catch (error: any) {
    console.error('\n❌ Evaluation failed:', error.message)
    return false
  }
}

// Run the test
testSimpleEvaluation()
  .then((success) => {
    console.log(`\n${success ? '✅' : '❌'} Test ${success ? 'passed' : 'failed'}`)
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })