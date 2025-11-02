# Linguistics Olympiad Problems Download Summary

This directory now has **comprehensive automated download scripts** for all four major linguistics olympiads.

## Download Scripts

### 1. IOL & APLO (Already Working)
```bash
./download-problems.sh
```

**Downloads:**
- IOL problems (2015-2024): Individual & Team problems + solutions
- APLO problems (2019-2024): Problems + solutions
- Total: ~52 PDFs

### 2. NACLO (NEW - Comprehensive)
```bash
./download-naclo.sh
```

**Downloads:**
- **Individual Problems (2007-2025)**: ~300+ PDFs
  - Each year has A-R problems (varies by year)
  - Each problem comes with a solution PDF
  - Format: `naclo-YEAR-LETTER-problem.pdf` and `naclo-YEAR-LETTER-solution.pdf`
  - Example: `naclo-2023-A-problem.pdf`, `naclo-2023-A-solution.pdf`

- **Combined Booklets (2024-2025)**:
  - Round 1 and Round 2 complete booklets
  - Format: `naclo-YEAR-round1-booklet.pdf`

- **Sample Problems**: ~20 practice problems in `NACLO/samples/`

- **Student-Contributed Problems** in `NACLO/student-problems/`:
  - Hebrew
  - Japanese
  - Tamil
  - Welsh
  - Yers

**Problem Counts by Year:**
- 2007: 8 problems (A-H)
- 2008: 12 problems (A-L)
- 2009: 13 problems (A-M)
- 2010: 16 problems (A-P)
- 2011: 14 problems (A-N)
- 2012-2013: 18 problems (A-R)
- 2014: 17 problems (A-Q)
- 2015: 16 problems (A-P)
- 2016-2020: 18 problems (A-R)
- 2021: 19 problems (A-S)
- 2022: 18 problems (A-R)
- 2023: 17 problems (A-Q)
- 2024: Booklets only
- 2025: 16 problems (A-P)

### 3. UKLO (NEW - Comprehensive)
```bash
./download-uklo.sh
```

**Downloads:**

- **Bulk Benchmark Archive**: All individual problems in one ZIP
  - Automatically extracted to `UKLO/benchmarks/`
  - Contains all problems used in UKLO classified by difficulty

- **Benchmark Database**: Excel file (`uklo-benchmarks-database.xlsx`)
  - Lists all problems with difficulty ratings
  - Useful for selecting problems by level

- **Annual Test Papers (2010-2022)** in `UKLO/annual-papers/`:
  - Round 1 Breakthrough (Foundation) papers
  - Round 1 Advanced papers
  - Round 2 Advanced papers
  - Combined booklets where available
  - Format: `uklo-YEAR-round1-breakthrough.pdf`

- **Special Collections** in `UKLO/special-collections/`:
  - **Breakthrough Workout**: Easy problems suitable for beginners
  - **Champion Problems**: Problems created by past UKLO champions
  - **Seasonal Puzzles**: Holiday and seasonal-themed problems
  - **Training PowerPoint**: UKLO training presentation

## Download All at Once

To download everything from all four olympiads:

```bash
./download-problems.sh && ./download-naclo.sh && ./download-uklo.sh
```

Estimated time: 5-10 minutes depending on connection speed

## Expected Output

### Total File Counts (Approximate)
- **IOL**: 40-50 PDFs
- **APLO**: 12-15 PDFs
- **NACLO**: 300-350+ PDFs
- **UKLO**: 50-100+ PDFs (plus extracted benchmark archive)
- **Grand Total**: ~500+ PDF files

### Directory Structure After Download

```
olympiad-problems/
├── IOL/
│   ├── iol-2015-indiv-prob.en.pdf
│   ├── iol-2015-indiv-sol.en.pdf
│   ├── iol-2015-team-prob.en.pdf
│   ├── iol-2015-team-sol.en.pdf
│   └── ... (40+ files)
│
├── APLO/
│   ├── aplo-2019-prob.en.pdf
│   ├── aplo-2019-sol.en.pdf
│   └── ... (12+ files)
│
├── NACLO/
│   ├── naclo-2007-A-problem.pdf
│   ├── naclo-2007-A-solution.pdf
│   ├── ... (300+ files)
│   ├── naclo-2024-round1-booklet.pdf
│   ├── naclo-2025-round2-booklet.pdf
│   ├── samples/
│   │   ├── sample-1.pdf
│   │   └── ... (~20 files)
│   └── student-problems/
│       ├── hebrew.pdf
│       ├── japanese.pdf
│       ├── tamil.pdf
│       ├── welsh.pdf
│       └── yers.pdf
│
└── UKLO/
    ├── uklo-benchmarks-all.zip
    ├── uklo-benchmarks-database.xlsx
    ├── benchmarks/
    │   └── ... (extracted benchmark problems)
    ├── annual-papers/
    │   ├── uklo-2010-round1-breakthrough.pdf
    │   ├── uklo-2010-round1-advanced.pdf
    │   └── ... (50+ files)
    └── special-collections/
        ├── breakthrough-workout.pdf
        ├── champion-problems.pdf
        ├── seasonal-puzzles.pdf
        └── uklo-training.pptx
```

## Troubleshooting

### Script Permission Issues
If you get "Permission denied" errors:
```bash
chmod +x download-problems.sh download-naclo.sh download-uklo.sh
```

### Missing Dependencies
All scripts require:
- `curl` (for downloading)
- `unzip` (for UKLO benchmark archive)

These are pre-installed on macOS and most Linux distributions.

### Download Failures
If some files fail to download:
- Check your internet connection
- The URLs may have changed - check the official websites
- Some older problems may no longer be available

### Rate Limiting
All scripts include `sleep` commands to be polite to servers. If you experience rate limiting:
- Increase the sleep duration in the scripts
- Run scripts at different times

## What's Next?

After downloading, you can:

1. **Browse Problems**: All PDFs are organized by competition and year

2. **Extract Content**: Use PDF tools to extract text for processing

3. **Add to LingoHub Database**:
   - Parse PDF content into markdown
   - Add to `backend/src/data/problems.ts`
   - Run seed script to populate database
   - Generate frontend pages

4. **Analyze Difficulty**: Use UKLO's benchmark database to understand relative difficulty

5. **Create Practice Sets**: Organize problems by topic, difficulty, or year

## Resources

- **IOL**: https://ioling.org/problems/
- **APLO**: https://aplo.asia/problems/
- **NACLO Practice**: https://naclo.org/practice.php
- **UKLO Archives**: https://archives.uklo.org/problems

## Notes

- All problems are copyrighted by their respective organizations
- Use for educational purposes only
- Always credit the original source when using problems
- Scripts are compatible with macOS bash (version 3.2+)
- Total download size: ~500-800 MB

---

**Last Updated**: 2025-11-01
**Status**: All four olympiad download scripts are fully operational
