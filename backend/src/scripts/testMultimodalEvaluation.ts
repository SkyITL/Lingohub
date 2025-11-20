/**
 * Test multimodal AI evaluation with Cloudinary PDFs
 */

import { evaluateSolution } from '../services/llmEvaluator'
import { config } from 'dotenv'
import * as path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '../../.env') })

async function testMultimodalEvaluation() {
  console.log('🧪 Testing Multimodal AI Evaluation with PDFs\n')
  console.log('=' + '='.repeat(50))

  // Test problem with PDF URLs
  const problemContent = `
IOL 2023 Problem 1: Language Analysis

Analyze the patterns in the following language data and answer the questions.
(See PDF for full problem details)
  `.trim()

  const officialSolution = `
The solution involves identifying morphological patterns.
(See PDF for complete solution)
  `.trim()

  const userSolution = `
Based on the data provided, I can see that this language uses agglutination
with clear morphological markers for tense and plurality.
  `.trim()

  // Use actual Cloudinary URLs that are now public
  const problemPdfUrl = 'https://res.cloudinary.com/dvt6h0qgy/raw/upload/v1732075833/olympiad-problems/IOL/by-year/2023/iol-2023-i1.pdf'
  const solutionPdfUrl = 'https://res.cloudinary.com/dvt6h0qgy/raw/upload/v1732075834/olympiad-problems/IOL/by-year/2023/iol-2023-indiv-sol.en.pdf'

  try {
    console.log('\n📄 Problem PDF URL:')
    console.log(`   ${problemPdfUrl}`)
    console.log('\n📄 Solution PDF URL:')
    console.log(`   ${solutionPdfUrl}`)

    console.log('\n🤖 Calling GPT-4o with multimodal support...\n')

    const result = await evaluateSolution(
      problemContent,
      officialSolution,
      userSolution,
      'openai/gpt-4o', // Use GPT-4o for multimodal
      problemPdfUrl,
      solutionPdfUrl
    )

    console.log('\n✅ Evaluation Complete!\n')
    console.log('📊 Results:')
    console.log(`- Total Score: ${result.totalScore}/100`)
    console.log(`- Confidence: ${result.confidence}`)
    console.log(`- Model Used: ${result.modelUsed}`)
    console.log(`- Tokens Used: ${result.tokensUsed}`)
    console.log(`- Cost: $${result.cost.toFixed(6)}`)

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
    console.log('🎉 Multimodal evaluation with PDFs is working!')

    return true
  } catch (error: any) {
    console.error('\n❌ Evaluation failed:', error.message)

    if (error.message.includes('401')) {
      console.log('\n⚠️  PDFs may still have access issues')
    } else if (error.message.includes('model')) {
      console.log('\n⚠️  Model configuration issue')
    }

    return false
  }
}

// Run the test
testMultimodalEvaluation()
  .then((success) => {
    console.log(`\n${success ? '✅' : '❌'} Test ${success ? 'passed' : 'failed'}`)
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })