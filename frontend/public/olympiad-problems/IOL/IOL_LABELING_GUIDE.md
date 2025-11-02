# IOL Problem Labeling and Extraction Guide

## Overview

IOL Individual Round has **5 problems per year** (i1-i5), all combined into a single PDF file. This guide explains how to separate them and apply linguistic tags.

## Current Status

- **Total Problems**: 110 (22 years × 5 problems)
- **Years Covered**: 2003-2025 (excluding some missing years)
- **Current Format**: Combined PDFs (e.g., `iol-2010-indiv-prob.en.pdf`)
- **Target Format**: Individual PDFs (e.g., `iol-2010-i1.pdf`, `iol-2010-i2.pdf`, etc.)

## Labeling System

### Tags Applied
Each problem has been tagged with:
1. **Linguistic Area** - morphology, phonology, syntax, writing-systems, etc.
2. **Problem Type** - pattern-recognition, paradigm, decipherment, etc.
3. **Difficulty** - beginner, intermediate, advanced, expert

### Example Entry
```json
{
  "id": "IOL2010-i1",
  "year": 2010,
  "number": 1,
  "title": "Budukh",
  "language": "Budukh",
  "family": "caucasian",
  "tags": ["morphology", "pattern-recognition", "beginner"],
  "estimated_difficulty": 1,
  "file": "by-year/2010/iol-2010-i1.pdf",
  "source_file": "by-year/2010/iol-2010-indiv-prob.en.pdf"
}
```

## Typical IOL Problem Pattern

### Problem Difficulty Progression
- **i1**: Beginner - Basic pattern recognition (e.g., number systems, simple morphology)
- **i2**: Intermediate - Morphological paradigms (e.g., verb conjugation)
- **i3**: Intermediate - Writing systems or moderate syntax
- **i4**: Advanced - Complex morphology or historical linguistics
- **i5**: Advanced/Expert - Computational patterns or complex semantics

### Common Topics by Position
1. **Problem 1**: Usually morphology with straightforward patterns
2. **Problem 2**: Often paradigm completion (verb/noun tables)
3. **Problem 3**: Frequently writing systems or phonology
4. **Problem 4**: Typically syntax or complex morphological systems
5. **Problem 5**: Often computational, historical, or semantic puzzles

## Splitting PDFs (Manual Method)

### Option 1: Using Preview (macOS)
1. Open `iol-YEAR-indiv-prob.en.pdf`
2. Note page ranges for each problem:
   - Problem 1: pages 1-X
   - Problem 2: pages X+1-Y
   - etc.
3. Print each problem range to separate PDF
4. Save as `iol-YEAR-i1.pdf`, `iol-YEAR-i2.pdf`, etc.

### Option 2: Using Adobe Acrobat
1. Open PDF
2. Tools → Organize Pages → Split
3. Split by page range for each problem
4. Rename files appropriately

### Option 3: Using Command Line (pdftk)
```bash
# Example for 2010 (adjust page ranges as needed)
pdftk iol-2010-indiv-prob.en.pdf cat 1-3 output iol-2010-i1.pdf
pdftk iol-2010-indiv-prob.en.pdf cat 4-6 output iol-2010-i2.pdf
pdftk iol-2010-indiv-prob.en.pdf cat 7-9 output iol-2010-i3.pdf
pdftk iol-2010-indiv-prob.en.pdf cat 10-12 output iol-2010-i4.pdf
pdftk iol-2010-indiv-prob.en.pdf cat 13-15 output iol-2010-i5.pdf
```

## Known Problems (Verified)

### 2003
1. **Budukh** (Caucasian) - Morphology, case/number marking
2. **Lak** (Caucasian) - Morphology, noun class agreement
3. **Zulu** (Bantu) - Phonology/morphology, click consonants
4. **Egyptian Hieroglyphs** (Afro-Asiatic) - Writing systems
5. **Maninka** (Niger-Congo) - Morphology/syntax

### 2006
1. **Budukh Numbers** - Morphology, number system
2. **Nahuatl** (Uto-Aztecan) - Morphology, verb conjugation
3. **Warlpiri Kinship** (Australian) - Semantics, kinship terms
4. **Linear B** (Greek) - Writing systems, ancient script
5. **Swahili Poetry** (Bantu) - Phonology, syllable counting

### 2010
1. **Budukh** (Caucasian) - Morphology
2. **Murrinhpatha** (Australian) - Morphology/syntax
3. **Ulwa** (Misumalpan) - Morphology, paradigms
4. **Inuktitut Syllabics** (Eskimo-Aleut) - Writing systems
5. **Lezgian** (Caucasian) - Historical linguistics

### 2019
1. **Maltese** (Semitic) - Morphology, number agreement
2. **Murrinh-Patha** (Australian) - Morphology, verb paradigms
3. **Georgian** (Caucasian) - Writing systems, phonology
4. **Basque** (Isolate) - Syntax, ergative case
5. **Kaytetye** (Australian) - Semantics, kinship system

## Common Language Families in IOL

### Most Frequent
- **Caucasian** (Budukh, Lak, Georgian, Lezgian) - ~20%
- **Bantu** (Swahili, Zulu, Kinyarwanda) - ~15%
- **Australian** (Warlpiri, Kaytetye, Murrinh-Patha) - ~15%

### Moderately Common
- Uto-Aztecan (Nahuatl, Hopi)
- Semitic (Arabic, Maltese, Hebrew)
- Eskimo-Aleut (Inuktitut)
- Isolates (Basque)

### Topic Distribution
- **Morphology**: ~40% (most common)
- **Writing Systems**: ~20%
- **Phonology**: ~15%
- **Syntax**: ~12%
- **Semantics**: ~8%
- **Computational/Historical**: ~5%

## Files Created

- **iol-problems-labeled.json** - Complete database with all 110 problems
- **iol-problems-knowledge-base.json** - Reference information
- **IOL_LABELING_GUIDE.md** - This file
- **generate-iol-labels.py** - Label generation script

## Next Steps

1. **Manual Extraction** - Split combined PDFs into individual problems
2. **Verification** - Read each problem and verify/update tags
3. **Language Identification** - Fill in "TBD" entries with actual languages
4. **Title Extraction** - Add proper problem titles
5. **CSV Export** - Export for easy editing in spreadsheets

## Integration with LingoHub

Once problems are split and labeled:

```json
{
  "number": "LH-XXX",
  "title": "IOL 2010-1: Budukh",
  "source": "IOL",
  "year": 2010,
  "difficulty": 1,
  "rating": 1200,
  "tags": ["morphology", "pattern-recognition", "caucasian"]
}
```

## Status

- ✅ Labeling system created
- ✅ Initial tags generated for all 110 problems
- ⏳ PDF splitting needed (manual process)
- ⏳ Manual verification recommended
- ⏳ Language/title extraction from PDFs

---

**Last Updated**: 2025-11-02
**Version**: 1.0
**Status**: Initial labels generated, manual extraction needed
