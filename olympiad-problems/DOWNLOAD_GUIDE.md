# Linguistics Olympiad Problems - Download Guide

This guide provides all the sources and instructions for downloading linguistics olympiad problems from the major international competitions.

## Directory Structure

```
olympiad-problems/
├── IOL/          # International Linguistics Olympiad
├── NACLO/        # North American Computational Linguistics Olympiad
├── UKLO/         # UK Linguistics Olympiad
├── APLO/         # Asia-Pacific Linguistics Olympiad
└── DOWNLOAD_GUIDE.md (this file)
```

---

## 1. IOL (International Linguistics Olympiad)

### Years Available
2003-2025 (23 years of competitions)

### Download Source
**Main URL:** https://ioling.org/problems/by_year/

### What's Available
- **Individual Contest Problems** - 5-6 problems per year
- **Team Contest Problems** - 1 collaborative problem per year
- **Solutions** - Complete solutions for all problems
- **Multiple Languages** - Problems available in 15-25 languages per year

### PDF Naming Convention
```
Individual Problems: https://ioling.org/booklets/iol-[YEAR]-indiv-prob.en.pdf
Individual Solutions: https://ioling.org/booklets/iol-[YEAR]-indiv-sol.en.pdf
Team Problems: https://ioling.org/booklets/iol-[YEAR]-team-prob.en.pdf
Team Solutions: https://ioling.org/booklets/iol-[YEAR]-team-sol.en.pdf
```

### Download Instructions
```bash
cd olympiad-problems/IOL

# Example: Download 2024 problems (English)
curl -O https://ioling.org/booklets/iol-2024-indiv-prob.en.pdf
curl -O https://ioling.org/booklets/iol-2024-indiv-sol.en.pdf
curl -O https://ioling.org/booklets/iol-2024-team-prob.en.pdf
curl -O https://ioling.org/booklets/iol-2024-team-sol.en.pdf

# For all years (2003-2025), repeat with different years
# Example script to download recent years:
for year in {2020..2025}; do
  curl -O "https://ioling.org/booklets/iol-${year}-indiv-prob.en.pdf"
  curl -O "https://ioling.org/booklets/iol-${year}-indiv-sol.en.pdf"
  curl -O "https://ioling.org/booklets/iol-${year}-team-prob.en.pdf"
  curl -O "https://ioling.org/booklets/iol-${year}-team-sol.en.pdf"
done
```

### Notable Years
- **2003** - First IOL (Borovets, Bulgaria)
- **2024** - Most recent (Brasília, Brazil)
- **2025** - Upcoming (Taipei, Taiwan)

---

## 2. NACLO (North American Computational Linguistics Olympiad)

### Years Available
2007-2025 (19 years of competitions)

### Download Source
**Main URL:** https://naclo.org/past_competitions.php

### What's Available
- **Open Round Problems** (January) - ~10 problems
- **Invitational Round Problems** (March) - Advanced problems
- **Solutions** - Complete explanations
- **Online Practice System** - Over 1,000 interactive problems

### Access Methods

#### Method 1: Individual Year Pages
Visit year-specific pages for PDFs:
```
https://naclo.org/naclo2024.php
https://naclo.org/naclo2023.php
https://naclo.org/naclo2022.php
... (pattern continues for each year)
```

#### Method 2: Practice Problems Portal
**URL:** https://naclo.org/practice.php
- Interactive online system
- Automatic scoring
- Problems from all past years
- Filterable by difficulty and topic

### Download Instructions
```bash
cd olympiad-problems/NACLO

# You'll need to visit each year's page manually to get the PDF links
# Example for 2024:
# Visit https://naclo.org/naclo2024.php
# Download the "Open Round" and "Invitational Round" PDFs
# (Direct PDF URLs vary by year)
```

### Special Resources
- **Student Handbook:** https://naclo.org/2026/2026NACLOStudentHandbook.pdf
- **Princeton Archive:** https://sites.google.com/princeton.edu/nacloprinceton/linguistic-puzzles

---

## 3. UKLO (UK Linguistics Olympiad)

### Years Available
2010-2022 (13 years of competitions)

### Download Source
**Archive URL:** https://archives.uklo.org/problems
**Current URL:** https://www.uklo.org/past-exam-papers/

### What's Available
- **Round 1 Problems** - Breakthrough and Advanced levels
- **Round 2 Problems** - Advanced level only
- **Individual Problem Database** - All problems categorized by difficulty
- **Bulk Download** - Zipped file containing all PDFs

### Problem Levels
- **Breakthrough Level** - For beginners
- **Advanced Level** - For experienced participants

### Download Instructions
```bash
cd olympiad-problems/UKLO

# Option 1: Bulk Download (recommended)
# Visit https://archives.uklo.org/problems
# Download the "zipped file containing pdfs of all the problems"

# Option 2: Individual Papers
# Visit https://www.uklo.org/past-exam-papers/
# Download specific year/round combinations
```

### Special Features
- Database file with difficulty classifications
- Problems from international competitions (IOL, NACLO)
- Training PowerPoint presentation
- Seasonal puzzles

---

## 4. APLO (Asia-Pacific Linguistics Olympiad)

### Years Available
2019-2025 (7 years of competitions)

### Download Source
**Main URL:** https://aplo.asia/problems/problems-by-year/

### What's Available
- **Individual Contest Problems** - ~5 problems per year
- **Solutions** - Complete explanations
- **Multiple Languages** - Available in 10+ languages including:
  - English, Chinese, Japanese, Korean
  - Spanish, Russian, Bengali
  - Czech, Hungarian, Finnish, Persian

### PDF Naming Convention
```
Problems: https://aplo.asia/booklets/aplo-[YEAR]-prob.en.pdf
Solutions: https://aplo.asia/booklets/aplo-[YEAR]-sol.en.pdf
```

### Download Instructions
```bash
cd olympiad-problems/APLO

# Download all years (English versions)
for year in {2019..2025}; do
  curl -O "https://aplo.asia/booklets/aplo-${year}-prob.en.pdf"
  curl -O "https://aplo.asia/booklets/aplo-${year}-sol.en.pdf"
done

# For other languages, replace 'en' with language code:
# ja (Japanese), zh (Chinese), ko (Korean), es (Spanish), etc.
```

### Special Notes
- Competition typically held March-April each year
- 2021 and 2022 marked with asterisks (may have special circumstances)
- Newer competition (started 2019)

---

## Summary Statistics

| Competition | Years | Total Problems | Languages | Start Year |
|------------|-------|---------------|-----------|-----------|
| IOL | 2003-2025 | ~280 individual + ~46 team | 15-25 | 2003 |
| NACLO | 2007-2025 | ~350+ | 1 (English) | 2007 |
| UKLO | 2010-2022 | ~200+ | 1 (English) | 2010 |
| APLO | 2019-2025 | ~35 | 10+ | 2019 |

**Total Available:** 800+ unique linguistics problems!

---

## Quick Download Script (All Competitions)

To download the most recent problems from all competitions:

```bash
#!/bin/bash
# Download recent linguistics olympiad problems

cd olympiad-problems

# IOL 2020-2024
cd IOL
for year in {2020..2024}; do
  curl -O "https://ioling.org/booklets/iol-${year}-indiv-prob.en.pdf"
  curl -O "https://ioling.org/booklets/iol-${year}-indiv-sol.en.pdf"
done
cd ..

# APLO 2019-2024
cd APLO
for year in {2019..2024}; do
  curl -O "https://aplo.asia/booklets/aplo-${year}-prob.en.pdf"
  curl -O "https://aplo.asia/booklets/aplo-${year}-sol.en.pdf"
done
cd ..

# NACLO and UKLO require manual download from their websites
echo "Visit https://naclo.org/past_competitions.php for NACLO problems"
echo "Visit https://archives.uklo.org/problems for UKLO bulk download"
```

---

## Next Steps After Downloading

1. **Organize by difficulty** - Sort problems by 1-5 star rating
2. **Extract to markdown** - Convert PDF content to markdown format
3. **Add to seed script** - Include in `backend/src/scripts/seed.ts`
4. **Generate pages** - Run `npm run generate-problems` in frontend
5. **Test rendering** - Verify tables, IPA symbols, and formatting

---

## Copyright Notice

All problems are copyrighted by their respective competitions:
- IOL problems: © International Linguistics Olympiad
- NACLO problems: © North American Computational Linguistics Olympiad
- UKLO problems: © UK Linguistics Olympiad
- APLO problems: © Asia-Pacific Linguistics Olympiad

These problems are free to use for educational purposes. Always credit the original source when using problems on LingoHub.

---

## Additional Resources

- **IOL Problem Browser:** https://ioling.org/problems/
- **NACLO Practice Portal:** https://naclo.org/practice.php
- **Onling (Online Olympiad):** https://onling.org/resources/
- **Problem-Solving Resources:** Various linguistics departments host practice sessions
