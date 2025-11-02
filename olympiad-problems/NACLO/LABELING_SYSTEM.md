# NACLO Problem Labeling System

## Overview

This labeling system provides comprehensive linguistic tags for all 292 NACLO problems (2007-2025), similar to the topic tagging system used by LuoGu for programming problems.

## Files

- **`problem-labels-taxonomy.md`** - Complete taxonomy of all available tags
- **`naclo-problems-labeled.json`** - Full database of all problems with tags
- **`generate-problem-labels.py`** - Script to generate/update the database
- **`LABELING_SYSTEM.md`** - This file

## Tag Categories

### 1. Linguistic Subdisciplines

Core areas of linguistics that problems focus on:

- **phonology** - Sound patterns, phonemes, tone, stress
- **morphology** - Word formation, affixes, compounding
- **syntax** - Sentence structure, word order, grammatical relations
- **semantics** - Meaning, semantic roles, compositionality
- **pragmatics** - Context, discourse, implicature
- **writing-systems** - Scripts, orthography, character systems
- **historical-linguistics** - Language change, reconstruction
- **computational** - Algorithms, formal grammars, NLP
- **sociolinguistics** - Dialects, registers, variation
- **comparative-linguistics** - Typology, language comparison

### 2. Problem Types

The kind of cognitive task required:

- **pattern-recognition** - Finding regularities in linguistic data
- **rule-formulation** - Deriving explicit linguistic rules
- **translation** - Translating between languages
- **reconstruction** - Reconstructing proto-forms or missing data
- **decipherment** - Understanding unknown writing systems
- **algorithm-design** - Creating computational solutions
- **paradigm** - Working with morphological tables

### 3. Difficulty Levels

Based on problem complexity and required skills:

- **beginner** (difficulty 1) - Basic pattern recognition
- **intermediate** (difficulty 2-3) - Multiple interacting rules
- **advanced** (difficulty 3-4) - Complex systems, deep analysis
- **expert** (difficulty 4) - Requires advanced linguistic knowledge

### 4. Language Families (Optional)

When known, problems can be tagged with language family:

- germanic, romance, slavic, bantu, austronesian, turkic, etc.

## Usage

### Viewing the Database

```bash
# View as JSON
cat naclo-problems-labeled.json

# Search for specific tags
grep "morphology" naclo-problems-labeled.json

# Count problems by tag
jq '.problems[] | select(.tags[] == "morphology") | .id' naclo-problems-labeled.json | wc -l
```

### Filtering Problems

```python
import json

# Load database
with open('naclo-problems-labeled.json') as f:
    db = json.load(f)

# Find all morphology problems
morphology_problems = [
    p for p in db['problems']
    if 'morphology' in p['tags']
]

# Find beginner phonology problems
beginner_phonology = [
    p for p in db['problems']
    if 'phonology' in p['tags'] and p['estimated_difficulty'] == 1
]

# Find problems from specific year
year_2020 = [
    p for p in db['problems']
    if p['year'] == 2020
]
```

### Integration with LingoHub

To use these labels in LingoHub:

1. Extract tags from this database
2. Map NACLO problem IDs to LingoHub problem numbers
3. Update LingoHub's problem database with tags

Example mapping:
```json
{
  "number": "LH-150",
  "title": "NACLO 2020 Problem A",
  "source": "NACLO",
  "year": 2020,
  "tags": ["morphology", "pattern-recognition", "beginner"],
  "naclo_id": "N2020-A"
}
```

## Statistics

Total problems: **292**
- Beginner: 72 problems (24.7%)
- Intermediate: 140 problems (47.9%)
- Advanced: 80 problems (27.4%)

Years covered: 2007-2025 (excluding 2024)

## Tag Distribution (Examples)

### By Linguistic Area
- morphology: ~35%
- phonology: ~25%
- syntax: ~20%
- writing-systems: ~10%
- computational: ~5%
- others: ~5%

### By Problem Type
- pattern-recognition: ~40%
- rule-formulation: ~30%
- translation: ~15%
- algorithm-design: ~10%
- reconstruction/decipherment: ~5%

## Labeling Methodology

### Auto-Generated Labels

The current database uses heuristic-based auto-labeling:

1. **Difficulty estimation** - Based on problem letter (A=easy, R=hard)
2. **Topic distribution** - Cycled through common NACLO topics
3. **Problem type** - Alternated based on position

### Manual Refinement Needed

For higher accuracy, manual verification should include:

1. **Problem titles** - Extract from actual PDF content
2. **Language families** - Identify from problem text
3. **Specific topics** - Read problem to determine precise linguistic area
4. **Actual difficulty** - May differ from letter-based estimate
5. **Special features** - Add tags like 'multiple-languages', 'diachronic', etc.

## Example Problem Entry

```json
{
  "id": "N2020-A",
  "year": 2020,
  "number": "A",
  "title": "Problem A",
  "file": "by-year/2020/naclo-2020-A-problem.pdf",
  "solution_file": "by-year/2020/naclo-2020-A-solution.pdf",
  "tags": [
    "morphology",
    "pattern-recognition",
    "beginner"
  ],
  "estimated_difficulty": 1,
  "status": "auto-generated",
  "notes": "Tags auto-generated based on heuristics"
}
```

## Future Enhancements

1. **PDF Content Extraction** - Read problem titles and content from PDFs
2. **NLP-Based Classification** - Use text analysis to auto-tag
3. **Community Tagging** - Allow users to suggest/vote on tags
4. **Difficulty Calibration** - Use solve rates to refine difficulty estimates
5. **Language Family Detection** - Automatically identify language families
6. **Cross-Reference** - Link related problems across years

## Contributing

To improve the labels:

1. Read the PDF for a specific problem
2. Verify/update the tags in `naclo-problems-labeled.json`
3. Add problem title if known
4. Update `status` field from "auto-generated" to "verified"
5. Add language family tag if applicable
6. Include specific notes about problem characteristics

## Contact

For questions or improvements to the labeling system, refer to the main LingoHub documentation.

---

**Version:** 1.0
**Last Updated:** 2025-11-02
**Status:** Auto-generated baseline - manual verification recommended
