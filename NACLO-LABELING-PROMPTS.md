# NACLO Problem Labeling Prompts

This document contains batch-specific prompts for labeling NACLO problems (2008-2024). Each prompt is self-contained and can be used in a separate Claude Code session.

---

## General Instructions (Read First)

**Required Files:**
- `/Users/skyliu/Lingohub/PROBLEM-CATEGORIES.md` - Category taxonomy
- `/Users/skyliu/Lingohub/DIFFICULTY-LEVELING-STRATEGY.md` - Difficulty rating guide
- `/Users/skyliu/Lingohub/LABELING-INSTRUCTIONS.md` - Workflow guide
- `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-YYYY.csv` - CSV file to edit

**CSV Format:**
Each row needs these columns filled:
- `new_difficulty` (1-5)
- `primary_category` (one of 11 categories)
- `secondary_tags` (2-5 tags, comma-separated)
- `notes` (optional, but recommended)

**Reference Examples:**
- IOL problems: See `/Users/skyliu/Lingohub/labeling-splits/LABELS-IOL-*.csv`
- APLO problems: See `/Users/skyliu/Lingohub/labeling-splits/LABELS-APLO-*.csv`
- NACLO 2007: See `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2007.csv`

---

## NACLO 2008 Labeling Prompt

**Task:** Label all 16 NACLO 2008 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2008.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2008/naclo-2008-[A-P]-problem.pdf`

**Steps:**
1. Read the reference files:
   - `PROBLEM-CATEGORIES.md`
   - `DIFFICULTY-LEVELING-STRATEGY.md`
   - `LABELING-INSTRUCTIONS.md`

2. Read NACLO 2007 completed labels for consistency:
   - `labeling-splits/LABELS-NACLO-2007.csv`

3. For each problem A through P:
   - Read the PDF at the path specified in the CSV
   - Analyze what linguistic skill is being tested
   - Determine primary category (exactly one)
   - Assign difficulty (1-5 stars) based on:
     - Time to solve (5-10 min = 1★, 90+ min = 5★)
     - Complexity of pattern
     - Number of interacting features
     - Dataset size
   - Choose 2-5 secondary tags
   - Write a concise note explaining your reasoning

4. Update the CSV file with all labels

5. Quality check:
   - All 16 problems have all required fields
   - Difficulty distribution is reasonable (not all 3★)
   - Categories and tags match the taxonomy exactly (no typos)
   - Tags are comma-separated without spaces

**NACLO-Specific Patterns:**
- NACLO problems tend to be 2-3★ difficulty (more uniform than IOL)
- Often focus on computational/logical aspects
- Many problems involve pattern recognition and rule discovery
- Common categories: semantics, morphology-noun, morphology-verb, writing-systems, syntax
- Rare to see 1★ or 5★ problems in NACLO

---

## NACLO 2009 Labeling Prompt

**Task:** Label all 16 NACLO 2009 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2009.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2009/naclo-2009-[A-P]-problem.pdf`

**Steps:**
1. Read the reference files:
   - `PROBLEM-CATEGORIES.md`
   - `DIFFICULTY-LEVELING-STRATEGY.md`
   - `LABELING-INSTRUCTIONS.md`

2. Read NACLO 2007-2008 completed labels for consistency

3. For each problem A through P:
   - Read the PDF
   - Analyze linguistic content
   - Determine primary category
   - Assign difficulty (1-5★)
   - Choose 2-5 secondary tags
   - Write explanatory note

4. Update CSV file

5. Quality check all fields

**Year-Specific Notes:**
- NACLO 2009 may introduce new problem types
- Continue using 2-3★ as baseline for NACLO
- Compare difficulty with 2007-2008 problems for calibration

---

## NACLO 2010 Labeling Prompt

**Task:** Label all 16 NACLO 2010 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2010.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2010/naclo-2010-[A-P]-problem.pdf`

**Steps:**
1. Read reference files (categories, difficulty, instructions)
2. Read NACLO 2007-2009 for consistency
3. Label each problem A-P
4. Update CSV
5. Quality check

**Calibration:**
By 2010, you should have established patterns for NACLO. Use 2007-2009 as baseline for difficulty comparison.

---

## NACLO 2011 Labeling Prompt

**Task:** Label all 16 NACLO 2011 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2011.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2011/naclo-2011-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2010 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2012 Labeling Prompt

**Task:** Label all 16 NACLO 2012 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2012.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2012/naclo-2012-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2011 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2013 Labeling Prompt

**Task:** Label all 16 NACLO 2013 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2013.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2013/naclo-2013-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2012 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2014 Labeling Prompt

**Task:** Label all 16 NACLO 2014 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2014.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2014/naclo-2014-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2013 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2015 Labeling Prompt

**Task:** Label all 16 NACLO 2015 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2015.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2015/naclo-2015-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2014 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2016 Labeling Prompt

**Task:** Label all 16 NACLO 2016 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2016.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2016/naclo-2016-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2015 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2017 Labeling Prompt

**Task:** Label all 16 NACLO 2017 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2017.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2017/naclo-2017-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2016 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2018 Labeling Prompt

**Task:** Label all 16 NACLO 2018 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2018.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2018/naclo-2018-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2017 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2019 Labeling Prompt

**Task:** Label all 16 NACLO 2019 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2019.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2019/naclo-2019-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2018 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2020 Labeling Prompt

**Task:** Label all 16 NACLO 2020 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2020.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2020/naclo-2020-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2019 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2021 Labeling Prompt

**Task:** Label all 16 NACLO 2021 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2021.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2021/naclo-2021-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2020 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

**Note:** 2021 was during COVID-19 pandemic; format may have changed.

---

## NACLO 2022 Labeling Prompt

**Task:** Label all 16 NACLO 2022 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2022.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2022/naclo-2022-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2021 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2023 Labeling Prompt

**Task:** Label all 16 NACLO 2023 problems (Problems A-P)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2023.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2023/naclo-2023-[A-P]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2022 patterns
3. Label each problem A-P
4. Update CSV
5. Quality check

---

## NACLO 2024 Labeling Prompt

**Task:** Label all 20 NACLO 2024 problems (Problems A-T)

**File to edit:** `/Users/skyliu/Lingohub/labeling-splits/LABELS-NACLO-2024.csv`

**PDF locations:** `/Users/skyliu/Lingohub/olympiad-problems/NACLO/by-year/2024/naclo-2024-[A-T]-problem.pdf`

**Steps:**
1. Read reference files
2. Review NACLO 2007-2023 patterns
3. Label each problem A-T (NOTE: 20 problems this year, not 16!)
4. Update CSV
5. Quality check

**Special Note:** NACLO 2024 has 20 problems instead of the usual 16. Make sure to label all A-T.

---

## Quality Check Checklist (For All Batches)

After completing each year, verify:

✓ **Completeness:**
- [ ] Every problem has `new_difficulty` (1-5)
- [ ] Every problem has `primary_category` (valid code)
- [ ] Every problem has `secondary_tags` (2-5 tags)
- [ ] Notes are present and descriptive

✓ **Format:**
- [ ] Tags are comma-separated without spaces: `tag1,tag2,tag3`
- [ ] No typos in category codes (match `PROBLEM-CATEGORIES.md` exactly)
- [ ] Difficulty values are 1, 2, 3, 4, or 5 only

✓ **Content:**
- [ ] Difficulty distribution is reasonable (not all 3★)
- [ ] Categories match the actual linguistic content
- [ ] Tags are relevant and specific
- [ ] Consistent with previous NACLO years

✓ **CSV Integrity:**
- [ ] File has same number of rows as before (no rows deleted)
- [ ] Header row is unchanged
- [ ] All commas are properly escaped in notes field

---

## Batch Processing Strategy

**Option 1: Sequential (Recommended for Quality)**
Do years in order: 2008 → 2009 → 2010 → ... → 2024

Benefits:
- Maintain consistency across years
- Learn patterns progressively
- Easier to calibrate difficulty

**Option 2: Parallel (Faster, Multiple Sessions)**
Divide years among multiple Claude Code sessions:
- Session 1: 2008-2012 (5 years, 80 problems)
- Session 2: 2013-2017 (5 years, 80 problems)
- Session 3: 2018-2022 (5 years, 80 problems)
- Session 4: 2023-2024 (2 years, 36 problems)

Benefits:
- Faster completion
- Can run in parallel

Drawback:
- May have slight inconsistency between sessions
- Need final consistency pass

---

## Time Estimates

Per problem:
- Fast: 30 seconds = **8 minutes per year** (16 problems)
- Careful: 2 minutes = **32 minutes per year**

Total NACLO 2008-2024:
- Fast: **2.3 hours** (17 files × 8 min)
- Careful: **9 hours** (17 files × 32 min)
- Realistic with breaks: **6-8 hours**

---

## Example Complete Workflow for One Year

```bash
# Example: NACLO 2013

# 1. Navigate to project
cd /Users/skyliu/Lingohub

# 2. Read reference materials
cat PROBLEM-CATEGORIES.md
cat DIFFICULTY-LEVELING-STRATEGY.md

# 3. Open CSV for editing
# Read: labeling-splits/LABELS-NACLO-2013.csv

# 4. For each problem A-P:
#    - Read PDF
#    - Analyze content
#    - Fill in: new_difficulty, primary_category, secondary_tags, notes

# 5. Save CSV

# 6. Quality check
#    - Count rows: should be 17 (header + 16 problems)
#    - Verify no empty required fields
#    - Check for typos in categories
```

---

## Common NACLO Categories (Based on 2007 Analysis)

Most frequent categories:
1. **semantics** - Logic puzzles, semantic relationships
2. **morphology-noun** - Noun declensions, case systems
3. **morphology-verb** - Verb conjugations, TAM systems
4. **writing-systems** - Scripts, orthography, encoding
5. **syntax** - Word order, sentence structure
6. **phonology** - Sound patterns, phonological rules
7. **other** - Computational, text processing, cryptography

Common secondary tags:
- `pattern-recognition` - Almost all NACLO problems
- `logical-reasoning` - Many NACLO problems
- `beginner-friendly` - For 1-2★ problems
- `multi-step` - For 3-4★ problems
- Language families: `indo-european`, `sino-tibetan`, `niger-congo`, etc.
- Regions: `asia`, `africa`, `americas`, `europe`, `oceania`

---

## Final Merge Instructions

After all NACLO years are labeled, merge all split files:

```bash
cd /Users/skyliu/Lingohub

# Run merge script (to be created)
python3 merge-labels.py

# Output: PROBLEM-LABELS-COMPLETE.csv (432 rows + header)
```

---

## Support Resources

If you encounter issues:
1. Check `LABELING-INSTRUCTIONS.md` for common mistakes
2. Review completed examples in `LABELS-IOL-*.csv` and `LABELS-APLO-*.csv`
3. Consult `DIFFICULTY-LEVELING-STRATEGY.md` decision tree
4. Look at `PROBLEM-CATEGORIES.md` for category examples

---

Good luck with the labeling! 🎯
