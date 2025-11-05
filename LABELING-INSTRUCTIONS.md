# Labeling Instructions for LingoHub Problems

## Overview
You need to label **432 linguistics olympiad problems** with:
1. **Primary category** (1 of 11 categories)
2. **Secondary tags** (2-5 tags)
3. **New difficulty rating** (1-5 stars)
4. **Optional notes**

## Files You Need

### 1. Work File
**`PROBLEM-LABELS-TEMPLATE.csv`** - Fill in these columns:
- `new_difficulty` (1-5)
- `primary_category` (choose from 11)
- `secondary_tags` (comma-separated, 2-5 tags)
- `notes` (optional observations)

### 2. Reference Files
- **`PROBLEM-CATEGORIES.md`** - Complete category taxonomy with examples
- **`DIFFICULTY-LEVELING-STRATEGY.md`** - Detailed difficulty rating guide
- **PDF files** - Located at path in `pdfUrl` column

### 3. Output
Save completed CSV as: **`PROBLEM-LABELS-COMPLETE.csv`**

---

## Labeling Workflow

### Step 1: For Each Problem

1. **Open the PDF** (path in `pdfUrl` column)
2. **Skim the problem** (don't solve it fully)
3. **Identify what it's testing**:
   - Writing system?
   - Sound patterns?
   - Word structure?
   - Sentence structure?
   - Meaning?
   - Number system?
   - Something else?

4. **Label all three fields**:
   - `new_difficulty`: 1-5
   - `primary_category`: one category code
   - `secondary_tags`: 2-5 tags, comma-separated
   - `notes`: optional

### Step 2: Quick Reference Tables

#### Primary Categories (choose exactly ONE)
```
writing-systems        - Scripts, alphabets, orthography
phonetics              - Physical sounds, articulation
phonology              - Sound patterns, phonological rules
morphology-noun        - Noun structure, cases, classifiers
morphology-verb        - Verb structure, tense/aspect/mood
syntax                 - Sentence structure, word order
semantics              - Meaning, logic problems
number-systems         - Counting, numerals
kinship                - Family terminology
orientation-spatial    - Directional systems
other                  - Doesn't fit above
```

#### Common Secondary Tags
**Linguistic Features**:
`pattern-recognition`, `logical-reasoning`, `segmentation`, `translation`, `correspondence`, `rule-discovery`, `comparative-method`, `reconstruction`, `minimal-pairs`

**Language Families** (20+ available, use as needed):
`indo-european`, `sino-tibetan`, `afro-asiatic`, `niger-congo`, `austronesian`, `uralic`, `turkic`, `caucasian`, `dravidian`, `native-american`, `aboriginal-australian`, `papuan`, `hmong-mien`, `tai-kadai`, `isolate`, `constructed`, `sign-language`

**Regions**:
`africa`, `americas`, `asia`, `europe`, `oceania`, `middle-east`

**Special**:
`rare-language`, `unusual-feature`, `extinct`, `ancient`, `cipher`, `beginner-friendly`, `complex-data`, `multi-step`, `cultural-context`

#### Difficulty Quick Guide
```
1★ - Beginner (5-10 min, 80-95% success)
     • Obvious pattern, 4-8 examples, direct mapping
     • Example: "Match 6 words to translations"

2★ - Easy (10-20 min, 60-80% success)
     • 2-3 steps, 8-15 examples, minor exceptions
     • Example: "Verb conjugation (3 tenses)"

3★ - Medium (20-40 min, 40-60% success)
     • 3-4 interacting features, 15-25 examples
     • Example: "Complex morphology, phonological processes"

4★ - Hard (40-90 min, 20-40% success)
     • 5+ features, 25-40+ examples, subtle patterns
     • Example: "TAM + evidentiality + agreement"

5★ - Expert (90+ min, <20% success)
     • 7+ rules, 40+ examples, Olympic-level insight
     • Example: "Olympic final problems"
```

---

## Examples

### Example 1: IOL 2003 Problem 3: Zulu
**PDF shows**: Zulu noun phrases with agreement patterns

**Labels**:
- `new_difficulty`: 2
- `primary_category`: morphology-noun
- `secondary_tags`: pattern-recognition, niger-congo, africa, beginner-friendly
- `notes`: Classic noun class problem, well-structured data

**Reasoning**:
- **Category**: It's about noun classes → `morphology-noun`
- **Difficulty**: Clear pattern, 10-12 examples, 2-3 classes → 2★
- **Tags**:
  - Requires pattern recognition
  - Zulu is Niger-Congo family
  - From Africa region
  - Good for beginners

---

### Example 2: IOL 2006 Problem 5: Swahili
**PDF shows**: Complex Swahili verb system with many affixes

**Labels**:
- `new_difficulty`: 5
- `primary_category`: morphology-verb
- `secondary_tags`: niger-congo, africa, complex-data, multi-step
- `notes`: Olympic final level, 40+ verb forms, multiple derivational processes

**Reasoning**:
- **Category**: Verb morphology → `morphology-verb`
- **Difficulty**: 40+ forms, 7+ affix slots, Olympic final → 5★
- **Tags**:
  - Niger-Congo family
  - Africa
  - Large dataset
  - Multiple solution steps

---

### Example 3: UKLO "Armenian Script"
**PDF shows**: Deciphering Armenian alphabet

**Labels**:
- `new_difficulty`: 3
- `primary_category`: writing-systems
- `secondary_tags`: pattern-recognition, indo-european, asia, ancient
- `notes`: Alphabet with some non-obvious correspondences

**Reasoning**:
- **Category**: Script decipherment → `writing-systems`
- **Difficulty**: Not trivial alphabet, requires analysis → 3★
- **Tags**:
  - Pattern recognition needed
  - Armenian is Indo-European
  - From Asia (Caucasus)
  - Historical script

---

## Tips for Efficiency

### Speed Labeling
1. **Start with source patterns**:
   - IOL Problem 1 → Usually 1-2★
   - IOL Problem 5 → Usually 4-5★
   - NACLO → Usually 2-3★
   - APLO Problems 1-2 → Usually 2-3★

2. **Look for keywords in title**:
   - "Script", "Braille", "Alphabet" → `writing-systems`
   - "Numbers", "Counting" → `number-systems`
   - "Verb" → `morphology-verb`
   - "Noun" → `morphology-noun`
   - "Word order" → `syntax`

3. **Skim PDF for clues**:
   - See a table of verb forms → `morphology-verb`
   - See characters/symbols → `writing-systems`
   - See numbers → `number-systems`
   - See sentences → `syntax` or `semantics`

4. **Use problem number as difficulty hint**:
   - Problem 1 in any contest → probably 1-2★
   - Problem 3 → probably 2-3★
   - Problem 5 → probably 4-5★

5. **Batch similar problems**:
   - Label all IOL 2020 together (progression pattern)
   - Label all writing-systems together
   - Label all number-systems together

---

## Quality Checks

### Before Saving
✓ Every problem has all three fields filled:
  - `new_difficulty` (1-5)
  - `primary_category` (valid code)
  - `secondary_tags` (2-5 tags)

✓ No typos in category codes (use exact spelling from list)

✓ Tags are comma-separated, no spaces: `tag1,tag2,tag3`

✓ Difficulty distribution is reasonable:
  - Not all 3★
  - Some 1-2★ for beginners
  - Some 4-5★ for advanced

✓ Same-source problems have logical progression:
  - IOL 2020-1 (easy) → IOL 2020-5 (hard)

---

## Common Pitfalls

### ❌ Mistake 1: Wrong Category
**Problem**: Verb conjugation in sentences
**Wrong**: `syntax` (because it's in sentences)
**Right**: `morphology-verb` (it's testing verb structure)

### ❌ Mistake 2: Overrating Difficulty
**Problem**: Simple number system (1-10, base 10)
**Wrong**: 3★ (looks like lots of examples)
**Right**: 1★ or 2★ (pattern is obvious)

### ❌ Mistake 3: Too Few Tags
**Problem**: Japanese classifier system
**Wrong**: `morphology-noun,pattern-recognition` (only 2)
**Better**: `morphology-noun,pattern-recognition,asia,cultural-context` (4)

### ❌ Mistake 4: Too Many Tags
**Problem**: Simple French syntax
**Wrong**: `syntax,indo-european,europe,pattern-recognition,beginner-friendly,translation,multi-step` (7 tags!)
**Right**: `syntax,indo-european,europe,pattern-recognition` (4 is enough)

---

## When You're Unsure

### For Category:
1. Check `PROBLEM-CATEGORIES.md` examples
2. Ask: "What's the PRIMARY thing being tested?"
3. If truly mixed → use `other`

### For Difficulty:
1. Check `DIFFICULTY-LEVELING-STRATEGY.md` decision tree
2. Compare to similar problems
3. When in doubt → **round DOWN** (better too easy than too hard)

### For Tags:
1. Start with 2-3 obvious tags
2. Add language family (look up if needed)
3. Add region (continent)
4. Add special feature if applicable
5. Stop at 5 tags

---

## Progress Tracking

Track your progress:
- [ ] APLO (30 problems)
- [ ] IOL (110 problems)
- [ ] NACLO (292 problems)

Total: 432 problems

**Estimated time**:
- Fast labeling: ~30 seconds per problem = 3.6 hours
- Careful labeling: ~2 minutes per problem = 14.4 hours
- Realistic: ~4-8 hours with breaks

---

## Final Steps

When complete:
1. **Save as**: `PROBLEM-LABELS-COMPLETE.csv`
2. **Verify format**:
   - Same column structure as template
   - All 432 rows have data
   - No empty required fields
3. **Spot check**:
   - First 10 problems
   - Last 10 problems
   - 10 random problems in middle
4. **Ready for import** into database!

---

## Need Help?

Reference materials:
- **Categories**: See `PROBLEM-CATEGORIES.md` - has full taxonomy
- **Difficulty**: See `DIFFICULTY-LEVELING-STRATEGY.md` - has decision tree
- **PDFs**: All available in `/olympiad-problems/` folders

Questions to ask yourself:
1. "What linguistic skill is this testing?"
2. "How long would this take an intermediate solver?"
3. "What makes this problem unique?"

Good luck! 🎯
