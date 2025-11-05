# Problem Labeling Quick Start Guide

## 📋 Current Status (as of now)

✅ **Completed: 148/432 problems (34%)**
- APLO 2019: 30 problems (100%) ✓
- IOL 2003-2025: 110 problems (100%) ✓
- NACLO 2007: 8 problems (100%) ✓

⏳ **Remaining: 284 problems (66%)**
- NACLO 2008-2024: 17 years × ~16 problems each

---

## 🚀 How to Continue Labeling

### Option 1: Use the Batch Prompts (Recommended)

1. **Open the prompt file:**
   ```bash
   open /Users/skyliu/Lingohub/NACLO-LABELING-PROMPTS.md
   ```

2. **Copy the prompt for the year you want to label** (e.g., NACLO 2008)

3. **Paste it into a new Claude Code session**

4. **The prompt contains everything needed:**
   - Which file to edit
   - Where the PDFs are
   - What to fill in
   - Quality checks
   - Examples from completed work

5. **Repeat for each year** (2008 → 2009 → 2010 → ... → 2024)

### Option 2: Do It Yourself Manually

1. **Read the reference files:**
   - `PROBLEM-CATEGORIES.md` - Category definitions
   - `DIFFICULTY-LEVELING-STRATEGY.md` - How to rate difficulty
   - `LABELING-INSTRUCTIONS.md` - Step-by-step workflow

2. **For each year (e.g., 2008):**
   - Open `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2008.csv`
   - Read each PDF at the path specified
   - Fill in: `new_difficulty`, `primary_category`, `secondary_tags`, `notes`
   - Save the CSV

3. **Move to next year**

---

## 📝 What to Fill In

For each problem, you need to fill these 4 columns:

### 1. `new_difficulty` (Required)
**Values:** 1, 2, 3, 4, or 5

| Stars | Level | Time | Success Rate | Example |
|-------|-------|------|--------------|---------|
| 1★ | Intro | 5-10 min | 80-95% | Simple pattern, 4-8 examples |
| 2★ | Easy | 10-20 min | 60-80% | 2-3 steps, 8-15 examples |
| 3★ | Medium | 20-40 min | 40-60% | 3-4 features, 15-25 examples |
| 4★ | Hard | 40-90 min | 20-40% | 5+ features, 25-40+ examples |
| 5★ | Expert | 90+ min | <20% | Olympic-level, 7+ rules |

**NACLO-specific:** Most NACLO problems are 2-3★. Rare to see 1★ or 5★.

### 2. `primary_category` (Required)
**Choose exactly ONE:**

```
writing-systems        - Scripts, alphabets, orthography
phonetics              - Physical sounds, articulation
phonology              - Sound patterns, rules
morphology-noun        - Noun structure, cases, classifiers
morphology-verb        - Verb structure, tense/aspect/mood
syntax                 - Sentence structure, word order
semantics              - Meaning, logic problems
number-systems         - Counting, numerals
kinship                - Family terminology
orientation-spatial    - Directional systems
other                  - Computational, hybrid, unique
```

### 3. `secondary_tags` (Required)
**Choose 2-5 tags, comma-separated (NO SPACES):**

Examples:
- `pattern-recognition,logical-reasoning,beginner-friendly`
- `indo-european,europe,ancient,extinct`
- `morphology-verb,niger-congo,africa,complex-data,multi-step`

**Common tags:**
- **Features:** `pattern-recognition`, `logical-reasoning`, `segmentation`, `translation`
- **Families:** `indo-european`, `sino-tibetan`, `niger-congo`, `austronesian`, `hmong-mien`
- **Regions:** `asia`, `africa`, `americas`, `europe`, `oceania`
- **Special:** `beginner-friendly`, `rare-language`, `ancient`, `extinct`, `complex-data`, `multi-step`

### 4. `notes` (Optional but Recommended)
Brief explanation of your reasoning:

Examples:
- `"Verb conjugation with TAM and tone patterns; Kuria (Eastern Bantu); complex tone assignment rules"`
- `"Two parallel number systems (A and B); mathematical equations; Dzongkha from Bhutan"`
- `"Text corruption/OCR errors; computational linguistics; restore original text"`

---

## ✅ Quality Checks

Before finishing each year, verify:

- [ ] All problems have `new_difficulty` (1-5)
- [ ] All problems have `primary_category` (valid code)
- [ ] All problems have `secondary_tags` (2-5 tags)
- [ ] Tags are formatted correctly: `tag1,tag2,tag3` (no spaces!)
- [ ] No typos in category codes
- [ ] Difficulty distribution is reasonable (not all 3★)
- [ ] CSV file has same number of rows as before

---

## 🔄 After All Labeling is Complete

### Step 1: Merge All Split Files

```bash
cd /Users/skyliu/Lingohub
python3 merge-labels.py
```

This will:
- Read all 46 split CSV files
- Validate all data
- Merge into `PROBLEM-LABELS-COMPLETE.csv`
- Report statistics and errors

### Step 2: Spot Check Results

Open `PROBLEM-LABELS-COMPLETE.csv` and verify:
- 432 total problems (+ 1 header row)
- All required fields filled
- No obvious errors or typos
- Difficulty distribution looks reasonable

### Step 3: Import to Database

(Instructions to be added later for database import)

---

## 📊 Helpful Statistics

### Expected Distributions

**By Source:**
- APLO: 30 problems (7%)
- IOL: 110 problems (25%)
- NACLO: 292 problems (68%)

**Target Difficulty Distribution:**
- 1★: 15-20% (65-86 problems)
- 2★: 30-35% (130-151 problems)
- 3★: 25-30% (108-130 problems)
- 4★: 15-20% (65-86 problems)
- 5★: 5-10% (22-43 problems)

**Common Categories in NACLO:**
1. semantics (~25%)
2. morphology-verb (~20%)
3. morphology-noun (~15%)
4. writing-systems (~12%)
5. syntax (~10%)
6. phonology (~8%)
7. other (~10%)

---

## ⏱️ Time Estimates

### Per Problem
- **Fast** (30 sec/problem): 2.3 hours total for all NACLO
- **Careful** (2 min/problem): 9 hours total for all NACLO
- **Realistic** with breaks: **6-8 hours**

### Per Year (16 problems)
- **Fast**: 8 minutes
- **Careful**: 32 minutes
- **Realistic**: 20-25 minutes

### Parallel Processing

If you split work across multiple sessions:
- **4 sessions** × 4-5 years each = **1.5-2 hours per session**
- **Total time**: Still 6-8 hours, but can be done in parallel

---

## 🎯 Pro Tips

### Efficiency Tips
1. **Batch by source**: Do all of one year at once for consistency
2. **Use problem numbers as hints**: NACLO Problem A is usually easier than Problem P
3. **Skim, don't solve**: You only need to identify what it tests, not solve it completely
4. **Look for patterns**: After a few years, you'll recognize common problem types
5. **Take breaks**: Mental fatigue leads to inconsistent labeling

### Common Mistakes to Avoid
❌ Spaces in tags: `"tag1, tag2, tag3"` → ✅ `"tag1,tag2,tag3"`
❌ Wrong category spelling: `"morphology"` → ✅ `"morphology-noun"` or `"morphology-verb"`
❌ Too few tags: Only 1 tag → ✅ Need 2-5 tags
❌ Wrong difficulty: All problems rated 3★ → ✅ Use full 1-5 range

### When in Doubt
- **Category**: Check `PROBLEM-CATEGORIES.md` for examples
- **Difficulty**: Use the decision tree in `DIFFICULTY-LEVELING-STRATEGY.md`
- **Round down**: Better to underestimate difficulty than overestimate
- **Look at examples**: Check completed IOL, APLO, or NACLO 2007 labels

---

## 📞 Need Help?

### Reference Files (Read These!)
1. **`PROBLEM-CATEGORIES.md`** - Full taxonomy with examples
2. **`DIFFICULTY-LEVELING-STRATEGY.md`** - Detailed difficulty guide
3. **`LABELING-INSTRUCTIONS.md`** - Step-by-step workflow
4. **`NACLO-LABELING-PROMPTS.md`** - Year-specific batch prompts

### Example Completed Work
- **IOL examples:** `labeling-splits/LABELS-IOL-2024.csv`
- **APLO examples:** `labeling-splits/LABELS-APLO-2019.csv`
- **NACLO examples:** `labeling-splits/LABELS-NACLO-2007.csv`

### Tools
- **Merge script:** `merge-labels.py`
- **PDFs:** `olympiad-problems/NACLO/by-year/YYYY/`

---

## 🎉 You're Ready!

Pick a year (2008 recommended to start), grab the prompt from `NACLO-LABELING-PROMPTS.md`, and start labeling!

Good luck! 🚀
