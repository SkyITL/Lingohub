# Problem Labeling System - Complete Package

## 📋 What's Ready

Your other Claude Code instance now has everything needed to label all 432 problems!

## 📁 Files Created

### 1. Work File (TO BE FILLED)
**`PROBLEM-LABELS-TEMPLATE.csv`** (432 rows)
- Contains all problem data
- Empty columns for: `new_difficulty`, `primary_category`, `secondary_tags`, `notes`
- When complete, save as: `PROBLEM-LABELS-COMPLETE.csv`

### 2. Reference Documents
- **`PROBLEM-CATEGORIES.md`** - Complete 11-category taxonomy with examples
- **`DIFFICULTY-LEVELING-STRATEGY.md`** - Detailed 1-5★ difficulty guide with decision tree
- **`LABELING-INSTRUCTIONS.md`** - Step-by-step workflow and examples

### 3. Source Data
- **`olympiad-problems/`** - All PDFs organized by source
- **`olympiad-problems/UKLO/database/uklo-problem-area-diff-table.xlsx`** - UKLO difficulty reference

---

## 🎯 Labeling Task

For each of 432 problems, fill in:

1. **`new_difficulty`** (1-5):
   - 1★ = Introductory (5-10 min, 80-95% success)
   - 2★ = Easy (10-20 min, 60-80% success)
   - 3★ = Medium (20-40 min, 40-60% success)
   - 4★ = Hard (40-90 min, 20-40% success)
   - 5★ = Expert (90+ min, <20% success)

2. **`primary_category`** (choose exactly ONE):
   - `writing-systems` - Scripts, alphabets
   - `phonetics` - Physical sounds
   - `phonology` - Sound patterns
   - `morphology-noun` - Noun structure
   - `morphology-verb` - Verb structure
   - `syntax` - Sentence structure
   - `semantics` - Meaning
   - `number-systems` - Counting
   - `kinship` - Family terms
   - `orientation-spatial` - Directional systems
   - `other` - Doesn't fit above

3. **`secondary_tags`** (2-5 tags, comma-separated):
   - Linguistic features (e.g., `pattern-recognition`, `logical-reasoning`)
   - Language families (e.g., `indo-european`, `sino-tibetan`)
   - Regions (e.g., `africa`, `asia`, `europe`)
   - Special features (e.g., `rare-language`, `ancient`, `beginner-friendly`)

4. **`notes`** (optional):
   - Any observations or reasoning

---

## ⚡ Quick Start

```bash
cd /Users/skyliu/Lingohub

# Open the template
open PROBLEM-LABELS-TEMPLATE.csv

# Reference these while labeling:
# - PROBLEM-CATEGORIES.md
# - DIFFICULTY-LEVELING-STRATEGY.md
# - LABELING-INSTRUCTIONS.md
```

---

## 🔍 Example Labeling

### IOL 2003 Problem 3: Zulu
```csv
...,2,/olympiad-problems/IOL/...,2,morphology-noun,"pattern-recognition,niger-congo,africa,beginner-friendly","Classic noun class problem"
```

### IOL 2006 Problem 5: Swahili  
```csv
...,4,/olympiad-problems/IOL/...,5,morphology-verb,"niger-congo,africa,complex-data,multi-step","Olympic final, 40+ verb forms"
```

---

## 📊 Current Distribution

Existing difficulty distribution (to calibrate against):
- 1★: 5% (21 problems) 
- 2★: 28% (122 problems)
- 3★: 36% (154 problems)
- 4★: 31% (132 problems)
- 5★: <1% (3 problems)

Target distribution (ideal):
- 1★: 15-20%
- 2★: 30-35%
- 3★: 25-30%
- 4★: 15-20%
- 5★: 5-10%

---

## ✅ Quality Checks

Before considering complete:
- [ ] All 432 rows have `new_difficulty` (1-5)
- [ ] All 432 rows have `primary_category` (valid code)
- [ ] All 432 rows have `secondary_tags` (2-5 tags, comma-separated)
- [ ] No typos in category codes
- [ ] Difficulty progression makes sense (Problem 1 < Problem 5)
- [ ] Distribution is reasonable (not all 3★)

---

## ⏱️ Estimated Time

- **Fast pass**: ~30 seconds/problem = 3.6 hours
- **Careful pass**: ~2 minutes/problem = 14.4 hours  
- **Realistic**: 4-8 hours with breaks

**Strategy**: 
- Batch by source (all IOL 2020, then NACLO 2021, etc.)
- Use problem numbers as hints (Problem 1 = easier)
- Skim PDF, don't solve completely

---

## 🚀 When Complete

1. Save as: `PROBLEM-LABELS-COMPLETE.csv`
2. Verify all required fields filled
3. Spot check 30 random problems
4. Ready for database import!

---

## 📚 Key Resources

**Category Reference**:
See `PROBLEM-CATEGORIES.md` for:
- Full taxonomy with descriptions
- Example problems for each category
- Tagging guidelines
- Color coding scheme

**Difficulty Reference**:
See `DIFFICULTY-LEVELING-STRATEGY.md` for:
- Detailed criteria for each star level
- Decision tree flowchart
- Calibration examples
- Adjustment factors
- Source-specific patterns

**Instructions**:
See `LABELING-INSTRUCTIONS.md` for:
- Step-by-step workflow
- Quick reference tables
- Common mistakes to avoid
- Tips for efficiency

---

## 💡 Tips for Success

1. **Start with easy sources**: IOL has clear patterns (1→2→3→4→5)
2. **Use problem titles**: Often hint at category
3. **Skim PDFs quickly**: Don't solve, just identify what it tests
4. **Batch similar problems**: All writing-systems together
5. **Use existing difficulty as baseline**: Adjust if clearly wrong
6. **When in doubt, round down**: Better too easy than too hard
7. **Take breaks**: Mental fatigue leads to inconsistency

---

Good luck with the labeling! 🎯
