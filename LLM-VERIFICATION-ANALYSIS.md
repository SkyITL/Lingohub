# LLM-Based Solution Verification Analysis

## The Problem with Pure Community Voting

**Issues:**
- ⏱️ **Slow**: Need to wait for 5-10 upvotes from qualified users
- 🐣 **Cold start**: New platforms lack active reviewers
- 📉 **Decreasing engagement**: As problems age, fewer people review solutions
- 🎯 **Uneven coverage**: Popular problems get reviewed, obscure ones don't

## LLM API Verification Approach

### **Concept: AI as First-Pass Reviewer**

Send solution to LLM (GPT-4, Claude, etc.) with:
1. Problem statement
2. Official solution (as reference)
3. User's submitted solution
4. Evaluation rubric

LLM provides:
- ✅/❌ Pass/Fail judgment
- 📊 Score (0-100)
- 💬 Detailed feedback on what's wrong/right
- 🎯 Specific issues to address

---

## Proposed Hybrid System: LLM + Community

### **Tier 1: LLM Auto-Verification (Fast Path)**
```
User submits → LLM evaluates → If score ≥ 70% → Auto-approve
                              → If score < 70% → Send to community review
```

**LLM Evaluation Criteria:**
1. **Correctness** (40%): Did they find the right patterns/rules?
2. **Reasoning** (30%): Is the explanation logical and complete?
3. **Coverage** (20%): Did they address all parts of the problem?
4. **Clarity** (10%): Is the solution well-written and understandable?

**Prompt Template:**
```
You are evaluating a solution to a linguistics olympiad problem.

PROBLEM:
{problem_statement}

OFFICIAL SOLUTION (Reference):
{official_solution}

USER SOLUTION:
{user_solution}

Evaluate the user's solution on these criteria:
1. Correctness (40%): Did they identify the correct linguistic patterns/rules?
2. Reasoning (30%): Is their explanation logical and well-supported?
3. Coverage (20%): Did they address all parts of the problem?
4. Clarity (10%): Is the solution clear and well-organized?

Provide:
1. Overall score (0-100)
2. Pass/Fail (pass if ≥70)
3. Specific feedback on errors or missing elements
4. Suggestions for improvement

Format your response as JSON:
{
  "score": 85,
  "passed": true,
  "correctness": 38,
  "reasoning": 25,
  "coverage": 15,
  "clarity": 7,
  "feedback": "Your analysis correctly identifies...",
  "errors": ["Missing discussion of...", "Incorrect claim about..."],
  "strengths": ["Good pattern recognition", "Clear examples"]
}
```

### **Tier 2: Community Verification (Fallback)**
If LLM score < 70% or flagged as uncertain:
- Send to community review queue
- Needs +3 upvotes from users with rating >1400 (lower threshold since LLM pre-filtered)
- Show LLM feedback to reviewers as guidance

### **Tier 3: Manual Review (Edge Cases)**
If community disagrees with LLM (user contests decision):
- Moderator/admin manually reviews
- Final decision
- Update LLM evaluation criteria based on learnings

---

## Advantages of LLM Verification

### ✅ **Pros:**
1. **Instant feedback** - No waiting for community votes
2. **Detailed explanations** - Users learn what they got wrong
3. **Consistency** - Same criteria applied to all solutions
4. **Scalability** - Can handle thousands of submissions
5. **24/7 availability** - No timezone or activity issues
6. **Educational value** - Specific feedback helps users improve

### ❌ **Cons:**
1. **Cost** - API calls cost money (~$0.01-0.05 per evaluation)
2. **Accuracy concerns** - LLMs can make mistakes, especially on:
   - Novel linguistic phenomena
   - Creative/alternative solutions
   - Ambiguous problems
3. **Consistency issues** - Same solution might get different scores on re-evaluation
4. **Prompt engineering needed** - Requires careful tuning
5. **Gaming potential** - Users might learn to write "LLM-friendly" solutions
6. **Dependency** - Reliant on external API availability

---

## Mitigation Strategies for LLM Weaknesses

### **1. Confidence Scoring**
Ask LLM to rate its own confidence:
```json
{
  "score": 75,
  "confidence": "medium", // low, medium, high
  "uncertain_aspects": ["Part 3 analysis is ambiguous"]
}
```

If confidence < "high" → send to community review

### **2. Multiple LLM Consensus**
For high-stakes problems (rating gain >50):
- Evaluate with 2-3 different LLMs (GPT-4, Claude, Gemini)
- If they agree → accept consensus
- If they disagree → send to community

**Cost optimization:**
- Use cheaper model for first pass (GPT-4-mini, ~$0.005/eval)
- Use expensive model only for disagreements (GPT-4, ~$0.03/eval)

### **3. Calibration Dataset**
Build dataset of manually-reviewed solutions:
- 100-200 human-verified correct/incorrect solutions
- Test LLM accuracy against this dataset
- Aim for >85% accuracy before deploying
- Continuously update based on contested decisions

### **4. User Appeal Process**
If user disagrees with LLM verdict:
- Allow one appeal per problem
- Send to community review queue (priority)
- If community overturns LLM → adjust prompts
- Track overturn rate as quality metric

### **5. Partial Credit System**
Instead of binary pass/fail:
- 0-40: Fail (no rating)
- 40-70: Partial pass (50% rating)
- 70-85: Pass (100% rating)
- 85-100: Excellent (100% rating + featured solution)

This reduces impact of LLM scoring variance.

---

## Cost Analysis

### **Scenario: 1000 daily submissions**

**Option A: Pure LLM (Single pass)**
- Cost per evaluation: $0.01 (GPT-4-mini)
- Daily cost: $10
- Monthly cost: $300
- **Pros**: Instant feedback
- **Cons**: Higher error rate

**Option B: LLM + Community Hybrid (Recommended)**
- 80% auto-approved by LLM: 800 × $0.01 = $8
- 20% sent to community: free
- Daily cost: $8
- Monthly cost: $240
- **Pros**: Best balance of speed and accuracy
- **Cons**: Some delays for edge cases

**Option C: Multi-LLM Consensus (High stakes only)**
- 90% single LLM pass: 900 × $0.01 = $9
- 10% need consensus: 100 × $0.05 = $5
- Daily cost: $14
- Monthly cost: $420
- **Pros**: Highest accuracy
- **Cons**: Highest cost

**Recommendation**: Start with Option B, upgrade to Option C as revenue grows

---

## Implementation Architecture

```typescript
// Solution submission flow
async function evaluateSolution(solution: Solution, problem: Problem) {
  // Step 1: Basic checks (instant)
  if (!passesBasicChecks(solution)) {
    return { approved: false, reason: "Too short / plagiarized" }
  }

  // Step 2: LLM evaluation (2-5 seconds)
  const llmResult = await evaluateWithLLM(solution, problem)

  // Step 3: Decision logic
  if (llmResult.score >= 70 && llmResult.confidence === "high") {
    // Auto-approve
    await approveSolution(solution, llmResult)
    await updateUserRating(solution.userId, calculateRatingChange(...))
    return {
      approved: true,
      rating_change: +46,
      feedback: llmResult.feedback
    }
  } else if (llmResult.score >= 40 && llmResult.score < 70) {
    // Partial credit
    await approveSolution(solution, llmResult, { partial: true })
    await updateUserRating(solution.userId, calculateRatingChange(...) * 0.5)
    return {
      approved: true,
      rating_change: +23,
      feedback: llmResult.feedback,
      note: "Partial credit - see feedback for improvements"
    }
  } else {
    // Send to community review
    await queueForCommunityReview(solution, llmResult)
    return {
      approved: false,
      pending_review: true,
      feedback: llmResult.feedback,
      note: "Your solution needs community verification"
    }
  }
}

async function evaluateWithLLM(solution: Solution, problem: Problem) {
  const prompt = buildEvaluationPrompt(solution, problem)

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Cheap and fast
    messages: [
      { role: "system", content: EVALUATOR_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3, // Lower temp for consistency
  })

  return JSON.parse(response.choices[0].message.content)
}
```

---

## Evaluation Metrics

Track these to measure system health:

1. **LLM Auto-Approval Rate**: Should be 70-80%
2. **Community Overturn Rate**: Should be <10%
3. **User Appeal Rate**: Should be <5%
4. **Average Time to Verdict**: Target <30 seconds
5. **Cost per Evaluation**: Target <$0.02
6. **User Satisfaction**: Survey users on feedback quality

---

## Gradual Rollout Plan

### **Phase 1: Shadow Mode (Week 1-2)**
- Run LLM evaluation in background
- Don't affect user ratings
- Compare LLM scores vs manual reviews
- Tune prompts for 85%+ accuracy

### **Phase 2: Soft Launch (Week 3-4)**
- Enable LLM for low-stakes problems only (rating gain <30)
- Allow user appeals
- Monitor overturn rate
- Collect user feedback on LLM feedback quality

### **Phase 3: Full Rollout (Week 5+)**
- Enable for all problems
- Implement multi-LLM consensus for high-stakes
- Add partial credit system
- Optimize prompts based on data

### **Phase 4: Advanced Features (Month 2+)**
- Personalized feedback based on user's rating/history
- Automated hint generation for failed solutions
- Difficulty adjustment based on success rates
- ML model to predict which solutions need human review

---

## Alternative: Fine-Tuned Model

Instead of GPT-4 API, train custom model:

**Pros:**
- Lower cost per evaluation ($0.001 vs $0.01)
- No API dependency
- Faster inference
- Better privacy

**Cons:**
- Requires 1000+ labeled examples
- Training cost (~$500-1000)
- Maintenance overhead
- Less flexible than prompting

**Recommendation**: Start with GPT-4 API, consider fine-tuning if:
- Volume exceeds 10,000 evals/month
- API costs become significant
- Have sufficient training data

---

## Decision Matrix

| Approach | Speed | Accuracy | Cost | Maintenance | Recommendation |
|----------|-------|----------|------|-------------|----------------|
| **Pure Community** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Too slow |
| **Pure LLM** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⚠️ Risky |
| **LLM + Community Hybrid** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ **Best** |
| **Multi-LLM Consensus** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⚠️ Expensive |
| **Fine-Tuned Model** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | 🔮 Future |

---

## Recommended Approach

**🏆 LLM + Community Hybrid with Confidence Gating**

1. **Instant LLM evaluation** for all submissions
2. **Auto-approve** if score ≥70% AND confidence is high
3. **Partial credit** if score 40-70%
4. **Community review** if score <40% OR confidence is low
5. **User appeal** process for contested decisions
6. **Continuous learning** from overturn cases

This provides:
- ⚡ Fast feedback (80% of cases)
- 🎯 High accuracy (community backup)
- 💰 Reasonable cost ($200-300/month at scale)
- 📚 Educational value (detailed feedback)
- 🛡️ Safety net (human oversight)

**Next Steps:**
1. Prototype LLM evaluation with 20 sample problems
2. Test accuracy against manual reviews
3. Estimate costs based on expected traffic
4. Implement basic version with GPT-4-mini
5. Iterate based on user feedback
