/**
 * LLM-powered solution evaluation service
 * Uses OpenRouter API to evaluate linguistics problem solutions
 */

import { transformPdfToImage } from './pdfExtractor'

export interface EvaluationScores {
  correctness: number // 0-40 points
  reasoning: number // 0-30 points
  coverage: number // 0-20 points
  clarity: number // 0-10 points
}

export interface EvaluationResult {
  totalScore: number // 0-100
  scores: EvaluationScores
  confidence: 'low' | 'medium' | 'high'
  feedback: string
  errors: string[]
  strengths: string[]
  suggestions: string[]
  modelUsed: string
  tokensUsed: number
  cost: number // in USD
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Use OpenRouter Auto - FREE! Automatically routes to the best available model
// Input: $0 per 1M tokens, Output: $0 per 1M tokens
// Intelligently selects the best model based on your request
const DEFAULT_MODEL = 'openrouter/auto'

interface LLMResponse {
  id: string
  choices: Array<{
    message: {
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
}

/**
 * Build evaluation prompt for LLM (with optional PDF URLs)
 */
function buildEvaluationPrompt(
  problemContent: string,
  officialSolution: string,
  userSolution: string,
  problemPdfUrl?: string,
  solutionPdfUrl?: string
): string {
  let problemSection = `# PROBLEM\n${problemContent}`
  if (problemPdfUrl) {
    problemSection = `# PROBLEM\nSee the problem PDF for full details. The problem statement is also provided below for reference:\n${problemContent}`
  }

  let solutionSection = `# OFFICIAL SOLUTION\n${officialSolution}`
  if (solutionPdfUrl) {
    solutionSection = `# OFFICIAL SOLUTION\nRefer to the solution PDF for the complete official solution.`
  }

  return `You are an expert linguistics problem evaluator. Evaluate the following user solution to a linguistics olympiad problem.

${problemSection}

${solutionSection}

# USER SOLUTION
${userSolution}

# EVALUATION RUBRIC
Evaluate the user solution on these criteria (total 100 points):

1. **Correctness (0-40 points)**: Are the answers/patterns identified correct?
2. **Reasoning (0-30 points)**: Is the linguistic reasoning sound and well-explained?
3. **Coverage (0-20 points)**: Does it address all parts of the problem?
4. **Clarity (0-10 points)**: Is the explanation clear and well-organized?

# CONFIDENCE ASSESSMENT
Rate your confidence in this evaluation:
- **high**: Solution is clearly correct/incorrect, objective answer verification possible
- **medium**: Subjective elements present, but main points are clear
- **low**: Highly subjective, ambiguous, or requires expert human judgment

# IMPORTANT GUIDELINES
1. **Err on the side of generosity**: If a solution demonstrates understanding but uses different wording/approach than the official solution, still award points
2. **Alternative valid approaches**: Linguistics problems often have multiple valid solution methods - accept any logically sound approach
3. **Minor errors tolerance**: Small notation differences or formatting issues should not significantly impact scores
4. **When uncertain**: If you're unsure whether an answer is correct, mark confidence as "low" or "medium" rather than scoring harshly
5. **Partial credit**: Award partial points for partially correct work - don't give 0 unless the answer is completely wrong
6. **Scoring guide**:
   - 0-20: Fundamentally misunderstands the problem
   - 21-40: Shows some understanding but major errors
   - 41-60: Reasonable attempt with some correct insights
   - 61-75: Good solution with minor gaps
   - 76-85: Very good solution, mostly complete and correct
   - 86-100: Excellent solution, comprehensive and accurate

# RESPONSE FORMAT
Respond with a JSON object (no markdown, just pure JSON):

{
  "scores": {
    "correctness": <0-40>,
    "reasoning": <0-30>,
    "coverage": <0-20>,
    "clarity": <0-10>
  },
  "confidence": "<low|medium|high>",
  "feedback": "<mandatory: provide at least 1 clear sentence explaining the score, highlighting what went right or wrong>",
  "errors": ["<specific error 1>", "<specific error 2>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "suggestions": ["<improvement 1>", "<improvement 2>"]
}

CRITICAL: Always provide feedback explaining your score. If score is low, explain why. If score is high, explain what was good.
Be strict but fair. Award full points only for truly excellent work. Typical good solutions should score 70-85.
ALWAYS include at least one sentence in the feedback field explaining your evaluation.`
}

/**
 * Calculate cost based on token usage
 */
function calculateCost(
  promptTokens: number,
  completionTokens: number,
  model: string
): number {
  // Pricing per 1M tokens (as of 2025)
  const pricing: Record<string, { input: number; output: number }> = {
    'openrouter/auto': { input: 0, output: 0 }, // Free auto-routing
    'x-ai/grok-4.1-fast': { input: 0, output: 0 }, // Free
    'nvidia/nemotron-nano-12b-v2-vl:free': { input: 0, output: 0 }, // Free
    'google/gemini-2.0-flash-exp:free': { input: 0, output: 0 }, // Free tier
    'google/gemini-flash-1.5': { input: 0.075, output: 0.3 },
    'google/gemini-2.0-flash-001': { input: 0.10, output: 0.40 },
    'google/gemini-2.5-flash': { input: 0.30, output: 2.50 },
    'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 },
    'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
    'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
    'openai/gpt-4o': { input: 5.00, output: 15.00 },
  }

  const modelPricing = pricing[model] || pricing['google/gemini-2.0-flash-001']
  const inputCost = (promptTokens / 1_000_000) * modelPricing.input
  const outputCost = (completionTokens / 1_000_000) * modelPricing.output

  return inputCost + outputCost
}

/**
 * Call OpenRouter API to evaluate solution (with optional PDF URLs and user attachments)
 */
async function callOpenRouter(
  prompt: string,
  model: string,
  problemPdfUrl?: string,
  solutionPdfUrl?: string,
  userAttachments?: any
): Promise<LLMResponse> {
  // Transform PDFs to images for multimodal evaluation (preserves formatting, IPA symbols, tables)
  const problemImageUrl = problemPdfUrl ? transformPdfToImage(problemPdfUrl) : undefined
  const solutionImageUrl = solutionPdfUrl ? transformPdfToImage(solutionPdfUrl) : undefined

  if (problemImageUrl) {
    console.log('[LLM Evaluator] Transformed problem PDF to image:', problemImageUrl)
  }
  if (solutionImageUrl) {
    console.log('[LLM Evaluator] Transformed solution PDF to image:', solutionImageUrl)
  }

  if (userAttachments && userAttachments.length > 0) {
    console.log('[LLM Evaluator] Including', userAttachments.length, 'user attachments')
  }

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable not set')
  }

  console.log('[LLM Evaluator] Using model:', model)
  console.log('[LLM Evaluator] Prompt length:', prompt.length, 'chars')

  // Build multimodal content with text, PDFs, and user attachments
  const messageContent: any[] = [
    {
      type: 'text',
      text: prompt,
    },
  ]

  console.log('[LLM Evaluator] Building multimodal content...')

  if (problemImageUrl) {
    console.log('[LLM Evaluator] Adding problem PDF image')
    messageContent.push({
      type: 'image',
      source: {
        type: 'url',
        url: problemImageUrl,
      },
    })
  }

  if (solutionImageUrl) {
    console.log('[LLM Evaluator] Adding solution PDF image')
    messageContent.push({
      type: 'image',
      source: {
        type: 'url',
        url: solutionImageUrl,
      },
    })
  }

  // Add user's uploaded attachments (images)
  if (userAttachments && Array.isArray(userAttachments)) {
    console.log('[LLM Evaluator] Processing', userAttachments.length, 'user attachments')
    for (let i = 0; i < userAttachments.length; i++) {
      const attachment = userAttachments[i]
      console.log(`[LLM Evaluator] Attachment ${i + 1}:`, {
        hasUrl: !!attachment.url,
        urlPrefix: attachment.url ? attachment.url.substring(0, 50) : 'N/A',
        size: attachment.size ? (attachment.size / 1024).toFixed(1) + 'KB' : 'unknown',
        fullAttachment: JSON.stringify(attachment).substring(0, 200)
      })

      if (attachment.url) {
        // Optimize image for faster LLM processing: compress and resize
        // Add Cloudinary transformation to the URL to reduce file size
        let optimizedUrl = attachment.url
        if (attachment.url.includes('cloudinary.com')) {
          // Insert Cloudinary transformation: compress to 60% quality, max width 800px
          // Format: /image/upload/c_scale,w_800,q_60/...
          optimizedUrl = attachment.url.replace(
            '/image/upload/',
            '/image/upload/c_scale,w_800,q_60/'
          )
          console.log(`[LLM Evaluator] Optimized attachment ${i + 1} for faster processing (width: 800px, quality: 60%)`)
        }

        console.log(`[LLM Evaluator] Adding user attachment ${i + 1} to content`)
        messageContent.push({
          type: 'image',
          source: {
            type: 'url',
            url: optimizedUrl,
          },
        })
      }
    }
  } else {
    console.log('[LLM Evaluator] No user attachments provided')
  }

  console.log('[LLM Evaluator] Final content items:', messageContent.length, '(1 text + images)')

  console.log('[LLM Evaluator] Building request body with', messageContent.length, 'content items')
  console.log('[LLM Evaluator] Content item types:', messageContent.map((item: any) => item.type).join(', '))

  const requestBody = {
    model,
    messages: [
      {
        role: 'user',
        content: messageContent,
      },
    ],
    temperature: 0.3, // Lower temperature for more consistent evaluations
    max_tokens: 1000,
  }

  console.log('[LLM Evaluator] Request body created')
  console.log('[LLM Evaluator] Message content structure:', {
    textItems: messageContent.filter((c: any) => c.type === 'text').length,
    imageItems: messageContent.filter((c: any) => c.type === 'image').length,
  })

  // Create abort controller with timeout
  const abortController = new AbortController()
  const startTime = Date.now()
  // Vercel serverless timeout: 900 seconds (15 minutes) for Pro, use 480s (8 min) to be safe
  // Multimodal requests with multiple images can be slow on OpenRouter
  const timeoutMs = 480000 // 480 second timeout for multimodal image requests

  console.log('[LLM Evaluator] Starting OpenRouter API call...')
  console.log('[LLM Evaluator] Timeout set to:', timeoutMs / 1000, 'seconds')
  console.log('[LLM Evaluator] Request body has', messageContent.length, 'content items')

  const timeoutId = setTimeout(() => {
    const elapsed = Date.now() - startTime
    console.log('[LLM Evaluator] Timeout triggered after', elapsed, 'ms')
    abortController.abort()
  }, timeoutMs)

  try {
    console.log('[LLM Evaluator] Sending request to OpenRouter API...')
    console.log('[LLM Evaluator] API URL:', OPENROUTER_API_URL)

    // Debug: Log the actual request body structure
    console.log('[LLM Evaluator] Request body structure:')
    console.log({
      model: requestBody.model,
      messagesCount: requestBody.messages.length,
      firstMessageRole: requestBody.messages[0].role,
      firstMessageContentLength: requestBody.messages[0].content.length,
      contentItems: requestBody.messages[0].content.map((item: any, idx: number) => ({
        index: idx,
        type: item.type,
        hasSource: item.type === 'image' ? !!item.source : 'N/A',
        sourceType: item.type === 'image' ? item.source?.type : 'N/A',
        url: item.type === 'image' ? item.source?.url?.substring(0, 50) : 'N/A'
      }))
    })

    const fetchStartTime = Date.now()

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://lingohub.vercel.app',
        'X-Title': 'LingoHub',
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    })

    const fetchEndTime = Date.now()
    const fetchDuration = fetchEndTime - fetchStartTime
    console.log('[LLM Evaluator] ✅ Received response after', fetchDuration, 'ms')
    console.log('[LLM Evaluator] Response status:', response.status)

    if (fetchDuration > 30000) {
      console.warn('[LLM Evaluator] ⚠️  OpenRouter took', (fetchDuration / 1000).toFixed(1), 'seconds - this is slow!')
    }

    if (!response.ok) {
      const error = await response.text()
      console.error('[LLM Evaluator] API error response:', error.substring(0, 500))
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    console.log('[LLM Evaluator] Parsing JSON response...')
    const result = (await response.json()) as LLMResponse
    const totalTime = Date.now() - startTime
    console.log('[LLM Evaluator] ✅ Successfully parsed response after', totalTime, 'ms total')
    console.log('[LLM Evaluator] Response structure:', {
      hasChoices: !!result.choices,
      choicesLength: result.choices?.length,
      hasMessage: !!result.choices?.[0]?.message,
      messageType: typeof result.choices?.[0]?.message,
      contentLength: result.choices?.[0]?.message?.content?.length
    })
    console.log('[LLM Evaluator] Model used:', result.model)
    console.log('[LLM Evaluator] Tokens used:', result.usage.total_tokens)
    console.log('[LLM Evaluator] First 300 chars of response content:')
    console.log(result.choices[0].message.content.substring(0, 300))

    return result
  } catch (fetchError: any) {
    const totalTime = Date.now() - startTime
    console.error('[LLM Evaluator] Fetch error after', totalTime, 'ms:')
    console.error('[LLM Evaluator] Error type:', fetchError.name)
    console.error('[LLM Evaluator] Error message:', fetchError.message)

    if (fetchError.name === 'AbortError') {
      console.error('[LLM Evaluator] Request was aborted (timeout exceeded)')
    }

    throw fetchError
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Parse LLM response and validate scores
 */
function parseLLMResponse(responseText: string, modelUsed: string, usage: any): EvaluationResult {
  try {
    console.log('[LLM Evaluator] Parsing LLM response text...')
    console.log('[LLM Evaluator] Response text length:', responseText.length)
    console.log('[LLM Evaluator] Response text preview:', responseText.substring(0, 200))

    // Remove markdown code blocks if present
    const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    console.log('[LLM Evaluator] After cleaning:', cleanText.substring(0, 200))

    const parsed = JSON.parse(cleanText)
    console.log('[LLM Evaluator] ✅ Successfully parsed JSON')
    console.log('[LLM Evaluator] Parsed object keys:', Object.keys(parsed))
    console.log('[LLM Evaluator] Scores:', parsed.scores)
    console.log('[LLM Evaluator] Confidence:', parsed.confidence)
    console.log('[LLM Evaluator] Feedback preview:', parsed.feedback?.substring(0, 100))

    // Validate scores
    const scores: EvaluationScores = {
      correctness: Math.max(0, Math.min(40, parsed.scores.correctness || 0)),
      reasoning: Math.max(0, Math.min(30, parsed.scores.reasoning || 0)),
      coverage: Math.max(0, Math.min(20, parsed.scores.coverage || 0)),
      clarity: Math.max(0, Math.min(10, parsed.scores.clarity || 0)),
    }

    const totalScore = scores.correctness + scores.reasoning + scores.coverage + scores.clarity

    const confidence = ['low', 'medium', 'high'].includes(parsed.confidence)
      ? parsed.confidence
      : 'medium'

    const cost = calculateCost(usage.prompt_tokens, usage.completion_tokens, modelUsed)

    // Ensure feedback is never empty
    let feedback = parsed.feedback || ''
    if (!feedback || feedback.trim().length === 0) {
      // Generate minimal feedback based on score if not provided
      if (totalScore >= 80) {
        feedback = 'Excellent work on this problem.'
      } else if (totalScore >= 60) {
        feedback = 'Good attempt with mostly correct insights.'
      } else if (totalScore >= 40) {
        feedback = 'Reasonable effort but needs improvement in accuracy.'
      } else {
        feedback = 'This solution needs significant revision to address the key concepts.'
      }
      console.log('[LLM Evaluator] Generated feedback due to empty response:', feedback)
    }

    return {
      totalScore,
      scores,
      confidence,
      feedback: feedback.trim(),
      errors: Array.isArray(parsed.errors) ? parsed.errors : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      modelUsed,
      tokensUsed: usage.total_tokens,
      cost,
    }
  } catch (error) {
    console.error('Failed to parse LLM response:', error)
    console.error('Raw response:', responseText)
    throw new Error('Failed to parse LLM evaluation response')
  }
}

/**
 * Evaluate a user's solution using LLM
 * Can accept text solutions, PDF URLs, and user attachments for multimodal evaluation
 */
export async function evaluateSolution(
  problemContent: string,
  officialSolution: string,
  userSolution: string,
  model: string = DEFAULT_MODEL,
  problemPdfUrl?: string,
  solutionPdfUrl?: string,
  userAttachments?: any
): Promise<EvaluationResult> {
  try {
    // Build prompt
    const prompt = buildEvaluationPrompt(
      problemContent,
      officialSolution,
      userSolution,
      problemPdfUrl,
      solutionPdfUrl
    )

    // Call LLM with PDF URLs and user attachments if provided
    const response = await callOpenRouter(prompt, model, problemPdfUrl, solutionPdfUrl, userAttachments)

    // Parse and validate response
    const result = parseLLMResponse(
      response.choices[0].message.content,
      response.model,
      response.usage
    )

    // Safety check: If score is low but model is uncertain, downgrade confidence
    // This prevents false negatives from auto-failing solutions
    if (result.totalScore < 40 && result.confidence === 'high') {
      console.warn(
        '[LLM Evaluator] Warning: Low score with high confidence - this may be a false negative'
      )
      // Lower confidence to trigger community review as safeguard
      result.confidence = 'medium'
    }

    console.log('='.repeat(80))
    console.log(
      `[LLM Evaluator] ✅ FINAL SCORE: ${result.totalScore}/100`
    )
    console.log(
      `[LLM Evaluator] Confidence: ${result.confidence}, Cost: $${result.cost.toFixed(6)}`
    )
    console.log('[LLM Evaluator] Breakdown:', {
      correctness: result.scores.correctness,
      reasoning: result.scores.reasoning,
      coverage: result.scores.coverage,
      clarity: result.scores.clarity
    })
    console.log('[LLM Evaluator] Feedback:', result.feedback)
    console.log('='.repeat(80))

    return result
  } catch (error) {
    console.error('[LLM Evaluator] Error:', error)
    throw error
  }
}

/**
 * Check if daily budget has been exceeded
 */
export async function checkDailyBudget(): Promise<{
  exceeded: boolean
  used: number
  limit: number
}> {
  const dailyBudget = parseFloat(process.env.LLM_DAILY_BUDGET || '20')

  try {
    if (!OPENROUTER_API_KEY) {
      return { exceeded: false, used: 0, limit: dailyBudget }
    }

    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
    })

    const data = (await response.json()) as any
    const usedToday = data.data?.usage_daily || 0

    return {
      exceeded: usedToday >= dailyBudget,
      used: usedToday,
      limit: dailyBudget,
    }
  } catch (error) {
    console.error('[LLM Evaluator] Budget check failed:', error)
    // Fail open - allow requests if budget check fails
    return { exceeded: false, used: 0, limit: dailyBudget }
  }
}
