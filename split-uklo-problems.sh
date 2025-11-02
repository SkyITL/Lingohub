#!/bin/bash
# Split UKLO 2010 problems to separate problem and solution PDFs

UKLO_DIR="/Users/skyliu/Lingohub/frontend/public/olympiad-problems/UKLO/by-year/2010"
cd "$UKLO_DIR"

# For each problem, we need to determine where the solutions start
# Based on the French example: problem is pages 1-2, solutions on page 3

echo "Splitting UKLO 2010 PDFs to separate problems and solutions..."

# French - 3 pages total, solutions on page 3
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=1 -dLastPage=2 \
   -sOutputFile="uklo-2010-french-problem-only.pdf" \
   "uklo-2010-french-French-syntax.pdf"
echo "✅ French: Created problem-only PDF (pages 1-2)"

# Abma - 3 pages total, solutions on page 3
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=1 -dLastPage=2 \
   -sOutputFile="uklo-2010-abma-problem-only.pdf" \
   "uklo-2010-abma-Abma-general.pdf"
echo "✅ Abma: Created problem-only PDF (pages 1-2)"

# Minangkabau - 4 pages, need to check where solutions start
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=1 -dLastPage=2 \
   -sOutputFile="uklo-2010-minangkabau-problem-only.pdf" \
   "uklo-2010-minangkabau-Minangkabau-general.pdf"
echo "✅ Minangkabau: Created problem-only PDF (pages 1-2)"

# Texting - 7 pages, need to check where solutions start
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=1 -dLastPage=4 \
   -sOutputFile="uklo-2010-texting-problem-only.pdf" \
   "uklo-2010-eng-texting-English-code.pdf"
echo "✅ Texting: Created problem-only PDF (pages 1-4)"

# Restaurant - 4 pages, need to check where solutions start
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=1 -dLastPage=2 \
   -sOutputFile="uklo-2010-restaurant-problem-only.pdf" \
   "uklo-2010-eng-restaurant-English-general.pdf"
echo "✅ Restaurant: Created problem-only PDF (pages 1-2)"

echo ""
echo "🎉 Done! Created 5 problem-only PDFs"
echo "Now you should:"
echo "1. Review each PDF to verify solutions are removed"
echo "2. Compress the new PDFs"
echo "3. Update the backend mapping to use -problem-only.pdf files"
