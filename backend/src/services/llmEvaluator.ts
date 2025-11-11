/**
 * LLM-powered solution evaluation service
 * Uses OpenRouter API to evaluate linguistics problem solutions
 */

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

// Use Google Gemini Flash 1.5 - cost effective with multimodal support
// Input: $0.075 per 1M tokens, Output: $0.30 per 1M tokens
const DEFAULT_MODEL = 'google/gemini-flash-1.5'

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
  "feedback": "<2-3 sentences of constructive feedback>",
  "errors": ["<specific error 1>", "<specific error 2>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "suggestions": ["<improvement 1>", "<improvement 2>"]
}

Be strict but fair. Award full points only for truly excellent work. Typical good solutions should score 70-85.`
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
    'google/gemini-flash-1.5': { input: 0.075, output: 0.3 },
    'google/gemini-2.0-flash-001': { input: 0.10, output: 0.40 },
    'google/gemini-2.5-flash': { input: 0.30, output: 2.50 },
    'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
    'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  }

  const modelPricing = pricing[model] || pricing['google/gemini-flash-1.5']
  const inputCost = (promptTokens / 1_000_000) * modelPricing.input
  const outputCost = (completionTokens / 1_000_000) * modelPricing.output

  return inputCost + outputCost
}

/**
 * Call OpenRouter API to evaluate solution (with optional PDF URLs)
 */
async function callOpenRouter(
  prompt: string,
  model: string,
  problemPdfUrl?: string,
  solutionPdfUrl?: string
): Promise<LLMResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable not set')
  }

  // Build content array for multimodal input (text + PDFs)
  const contentParts: any[] = [{ type: 'text', text: prompt }]

  // Add problem PDF if provided
  if (problemPdfUrl) {
    contentParts.push({
      type: 'image_url',
      image_url: { url: problemPdfUrl }
    })
  }

  // Add solution PDF if provided
  if (solutionPdfUrl) {
    contentParts.push({
      type: 'image_url',
      image_url: { url: solutionPdfUrl }
    })
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://lingohub.vercel.app',
      'X-Title': 'LingoHub',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: contentParts.length === 1 ? prompt : contentParts,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent evaluations
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  return (await response.json()) as LLMResponse
}

/**
 * Parse LLM response and validate scores
 */
function parseLLMResponse(responseText: string, modelUsed: string, usage: any): EvaluationResult {
  try {
    // Remove markdown code blocks if present
    const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanText)

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

    return {
      totalScore,
      scores,
      confidence,
      feedback: parsed.feedback || 'No feedback provided',
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
 * Can accept either text solutions or PDF URLs for multimodal evaluation
 */
export async function evaluateSolution(
  problemContent: string,
  officialSolution: string,
  userSolution: string,
  model: string = DEFAULT_MODEL,
  problemPdfUrl?: string,
  solutionPdfUrl?: string
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

    // Call LLM with PDF URLs if provided
    const response = await callOpenRouter(prompt, model, problemPdfUrl, solutionPdfUrl)

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

    console.log(
      `[LLM Evaluator] Score: ${result.totalScore}/100, Confidence: ${result.confidence}, Cost: $${result.cost.toFixed(6)}`
    )

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
