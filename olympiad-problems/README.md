# Linguistics Olympiad Problems Collection

This directory contains downloaded problem sets from major international linguistics olympiads.

## Quick Start

### Automated Downloads

**All Competitions (IOL & APLO):**
```bash
./download-problems.sh
```

This will automatically download problems from:
- **IOL** (2015-2024): ~40 PDF files
- **APLO** (2019-2024): ~12 PDF files

**NACLO (North American Computational Linguistics Olympiad):**
```bash
./download-naclo.sh
```

This will automatically download:
- Individual problems (2007-2025): ~300+ problem PDFs with solutions
- Combined Round 1 & Round 2 booklets (2024-2025)
- Sample practice problems (~20 problems)
- Student-contributed problems

**UKLO (UK Linguistics Olympiad):**
```bash
./download-uklo.sh
```

This will automatically download:
- Bulk benchmark problems archive (all individual problems)
- Annual test papers (2010-2022): Round 1 & Round 2
- Benchmark database (Excel file with difficulty ratings)
- Special collections: Breakthrough Workout, Champion Problems, Seasonal Puzzles
- Training materials (PowerPoint presentation)

### Download All at Once
```bash
./download-problems.sh && ./download-naclo.sh && ./download-uklo.sh
```

## Directory Structure

```
olympiad-problems/
├── IOL/                     # International Linguistics Olympiad (2003-2025)
├── APLO/                    # Asia-Pacific Linguistics Olympiad (2019-2025)
├── NACLO/                   # North American Computational Linguistics Olympiad (2007-2025)
│   ├── samples/             # Sample practice problems
│   ├── student-problems/    # Student-contributed problems
│   └── annual-papers/       # Individual problems and booklets by year
├── UKLO/                    # UK Linguistics Olympiad (2010-2022)
│   ├── benchmarks/          # All benchmark problems (extracted)
│   ├── annual-papers/       # Test papers by year
│   └── special-collections/ # Breakthrough, Champion, Seasonal problems
├── download-problems.sh     # Download IOL & APLO
├── download-naclo.sh        # Download NACLO problems
├── download-uklo.sh         # Download UKLO problems
├── DOWNLOAD_GUIDE.md        # Comprehensive download instructions
└── README.md                # This file
```

## Problem Statistics

| Competition | Years Available | Est. Problems | Languages |
|------------|----------------|---------------|-----------|
| IOL | 2003-2025 | ~280 | 15-25 |
| APLO | 2019-2025 | ~35 | 10+ |
| NACLO | 2007-2025 | ~350 | English |
| UKLO | 2010-2022 | ~200 | English |
| **Total** | - | **~865** | - |

## Next Steps

After downloading PDFs:

1. **Extract Content**
   - Use PDF readers or OCR tools
   - Convert to markdown format
   - Preserve tables and special characters

2. **Format for LingoHub**
   - Follow the structure in `backend/src/scripts/seed.ts`
   - Include: title, content, solution, source, year, difficulty
   - Add appropriate tags

3. **Add to Database**
   - Update `backend/src/scripts/seed.ts`
   - Update `frontend/src/data/problems.json`
   - Run `npm run generate-problems` in frontend

## Resources

- **Detailed Guide**: See `DOWNLOAD_GUIDE.md`
- **IOL Official**: https://ioling.org/problems/
- **NACLO Official**: https://naclo.org/
- **UKLO Archives**: https://archives.uklo.org/problems
- **APLO Official**: https://aplo.asia/problems/

## Copyright

All problems are copyrighted by their respective organizations and are used here for educational purposes. Always credit the original source.
