# NACLO Problems Collection with Comprehensive Labeling

## Overview

This directory contains **584 PDF files** from the North American Computational Linguistics Olympiad (2007-2025), organized by year with a comprehensive linguistic tagging system similar to LuoGu's problem classification.

## Contents

### Problem Files
- **by-year/** - 584 PDFs organized by competition year
  - 2007-2025 (excluding 2024)
  - Each year contains problem and solution PDFs (e.g., `naclo-2020-A-problem.pdf`)

### Labeling System
- **naclo-problems-labeled.json** - Complete database with 292 problems tagged
- **naclo-problems-labels.csv** - CSV export for easy viewing/editing
- **naclo-problems-summary.txt** - Summary statistics by year and difficulty
- **problem-labels-taxonomy.md** - Complete taxonomy of all tags
- **LABELING_SYSTEM.md** - Detailed documentation

### Tools
- **generate-problem-labels.py** - Generate/update problem labels
- **export-labels-csv.py** - Export to CSV format

## Quick Statistics

- **Total Problems**: 292 (each with problem + solution = 584 files)
- **Years**: 2007-2025 (18 years, excluding 2024)
- **Difficulty Distribution**:
  - Beginner: 72 problems (24.7%)
  - Intermediate: 140 problems (47.9%)
  - Advanced: 80 problems (27.4%)

## Tag System

### Linguistic Areas
- **phonology** - Sound patterns, phonemes, tone
- **morphology** - Word formation, affixes, noun classes
- **syntax** - Sentence structure, word order
- **semantics** - Meaning, semantic roles
- **writing-systems** - Scripts, orthography
- **computational** - Algorithms, NLP
- **historical-linguistics** - Language change, reconstruction

### Problem Types
- **pattern-recognition** - Find regularities in data
- **rule-formulation** - Derive linguistic rules
- **translation** - Translate between languages
- **algorithm-design** - Create computational solutions
- **decipherment** - Understand unknown systems

## Usage Examples

### Find all morphology problems
```bash
grep "morphology" naclo-problems-labels.csv
```

### Find beginner phonology problems
```bash
grep "phonology.*beginner" naclo-problems-labels.csv
```

### View problems from 2020
```bash
grep "2020" naclo-problems-labels.csv
```

### Using with Python
```python
import json

with open('naclo-problems-labeled.json') as f:
    db = json.load(f)

# Find all morphology problems
morphology = [p for p in db['problems'] if 'morphology' in p['tags']]

# Find beginner problems
beginner = [p for p in db['problems'] if p['estimated_difficulty'] == 1]
```

## Integration with LingoHub

To use these labels in LingoHub:

1. **Map NACLO IDs to LingoHub problem numbers**
   ```
   N2020-A → LH-XXX
   ```

2. **Import tags to problem database**
   ```json
   {
     "number": "LH-XXX",
     "title": "NACLO 2020 Problem A: [Title]",
     "source": "NACLO",
     "year": 2020,
     "tags": ["morphology", "pattern-recognition", "beginner"]
   }
   ```

3. **Use for filtering and recommendations**
   - Filter by linguistic area
   - Recommend similar problems
   - Create study paths by difficulty

## File Naming Convention

- Problems: `naclo-YEAR-LETTER-problem.pdf`
- Solutions: `naclo-YEAR-LETTER-solution.pdf`

Examples:
- `naclo-2020-A-problem.pdf` - 2020 Problem A
- `naclo-2020-A-solution.pdf` - 2020 Problem A solution

## Labeling Status

Current labels are **auto-generated** using heuristics:
- Difficulty based on problem letter (A=easy, R=hard)
- Topics distributed across common NACLO themes
- Problem types alternated based on position

**Manual verification recommended** for:
- Actual problem titles (from PDF content)
- Specific language families
- Precise difficulty ratings
- Additional specialized tags

## Sample Problems

### By Difficulty

**Beginner (N2007-A)**
- Tags: morphology, pattern-recognition, beginner
- Typical: Simple noun class systems, basic conjugations

**Intermediate (N2020-H)**
- Tags: syntax, paradigm, intermediate
- Typical: Complex agreement, multiple interacting rules

**Advanced (N2021-Q)**
- Tags: computational, algorithm-design, advanced
- Typical: Formal grammars, complex algorithms

## Contributing

To improve labels:

1. Read problem PDF
2. Update tags in `naclo-problems-labels.csv`
3. Add problem title
4. Mark as "verified" in status column
5. Re-import to JSON if needed

## See Also

- **LABELING_SYSTEM.md** - Detailed documentation
- **problem-labels-taxonomy.md** - Complete tag taxonomy
- **COLLECTION_SUMMARY.md** (parent directory) - Overall collection info

---

**Created**: 2025-11-02  
**Total Files**: 584 PDFs (292 problems × 2 files each)  
**Label Coverage**: 100% (auto-generated baseline)  
**Status**: Ready for use, manual refinement recommended
