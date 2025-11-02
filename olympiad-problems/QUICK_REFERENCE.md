# Quick Reference Card

## Download Commands

```bash
# Download IOL & APLO
./download-problems.sh

# Download NACLO (300+ problems)
./download-naclo.sh

# Download UKLO (50+ problems + archives)
./download-uklo.sh

# Download everything
./download-problems.sh && ./download-naclo.sh && ./download-uklo.sh
```

## File Naming Conventions

### IOL
```
iol-YEAR-indiv-prob.en.pdf       # Individual problems
iol-YEAR-indiv-sol.en.pdf        # Individual solutions
iol-YEAR-team-prob.en.pdf        # Team problems
iol-YEAR-team-sol.en.pdf         # Team solutions
```

### APLO
```
aplo-YEAR-prob.en.pdf            # Problems
aplo-YEAR-sol.en.pdf             # Solutions
```

### NACLO
```
naclo-YEAR-LETTER-problem.pdf    # Individual problem (e.g., naclo-2023-A-problem.pdf)
naclo-YEAR-LETTER-solution.pdf   # Individual solution
naclo-YEAR-round1-booklet.pdf    # Combined Round 1 booklet
naclo-YEAR-round2-booklet.pdf    # Combined Round 2 booklet
```

### UKLO
```
uklo-YEAR-round1-breakthrough.pdf   # Round 1 Breakthrough level
uklo-YEAR-round1-advanced.pdf       # Round 1 Advanced level
uklo-YEAR-round2-advanced.pdf       # Round 2 Advanced level
uklo-benchmarks-database.xlsx       # Excel database with all problems
```

## Problem Counts

| Competition | Years     | Problem Count | File Count |
|------------|-----------|---------------|------------|
| IOL        | 2015-2024 | ~60 problems  | ~40 PDFs   |
| APLO       | 2019-2024 | ~30 problems  | ~12 PDFs   |
| NACLO      | 2007-2025 | ~300 problems | ~350 PDFs  |
| UKLO       | 2010-2022 | ~150 problems | ~100 PDFs  |
| **Total**  | -         | **~540**      | **~500**   |

## Most Useful Files

### For Beginners
- `UKLO/special-collections/breakthrough-workout.pdf`
- `NACLO/samples/sample-*.pdf`
- Any NACLO problems from 2007-2010 (fewer, easier problems)

### For Practice
- `NACLO/` - Largest collection with solutions
- `UKLO/benchmarks/` - Organized by difficulty
- `UKLO/uklo-benchmarks-database.xlsx` - Searchable problem database

### For Advanced Study
- `IOL/iol-*-team-prob.en.pdf` - Team problems (hardest)
- `UKLO/special-collections/champion-problems.pdf`
- Recent years (2020-2024) from any competition

## Tips

1. **Start with NACLO samples** - Best for learning problem-solving strategies
2. **Use UKLO database** - Search problems by difficulty and topic
3. **Study solutions** - All competitions provide detailed solutions
4. **Progress gradually** - Start with earlier years (generally easier)
5. **Try team problems** - Great for group study

## Download Stats

- **Total Size**: ~500-800 MB
- **Download Time**: 5-10 minutes
- **Files Created**: ~500 PDFs + 1 Excel file + archives

## Troubleshooting

```bash
# Make scripts executable
chmod +x *.sh

# Check if curl is installed
which curl

# Check if unzip is installed (needed for UKLO)
which unzip

# View download progress
tail -f download.log   # if redirecting output to log file
```

## Official Websites

- IOL: https://ioling.org/problems/
- APLO: https://aplo.asia/problems/
- NACLO: https://naclo.org/practice.php
- UKLO: https://archives.uklo.org/problems

---

**Need more help?** See `DOWNLOAD_SUMMARY.md` for detailed information.
