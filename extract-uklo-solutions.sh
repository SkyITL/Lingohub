#!/bin/bash
# Extract solution pages from UKLO 2010 problems

UKLO_DIR="/Users/skyliu/Lingohub/frontend/public/olympiad-problems/UKLO/by-year/2010"
cd "$UKLO_DIR"

echo "Extracting UKLO 2010 solution pages..."

# French - solutions on page 3
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=3 -dLastPage=3 \
   -sOutputFile="uklo-2010-french-solution.pdf" \
   "uklo-2010-french-French-syntax.pdf"
echo "✅ French: Extracted solution (page 3)"

# Abma - solutions on page 3
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=3 -dLastPage=3 \
   -sOutputFile="uklo-2010-abma-solution.pdf" \
   "uklo-2010-abma-Abma-general.pdf"
echo "✅ Abma: Extracted solution (page 3)"

# Minangkabau - solutions on pages 3-4
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=3 -dLastPage=4 \
   -sOutputFile="uklo-2010-minangkabau-solution.pdf" \
   "uklo-2010-minangkabau-Minangkabau-general.pdf"
echo "✅ Minangkabau: Extracted solution (pages 3-4)"

# Texting - solutions on pages 5-7
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=5 -dLastPage=7 \
   -sOutputFile="uklo-2010-texting-solution.pdf" \
   "uklo-2010-eng-texting-English-code.pdf"
echo "✅ Texting: Extracted solution (pages 5-7)"

# Restaurant - solutions on pages 3-4
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=3 -dLastPage=4 \
   -sOutputFile="uklo-2010-restaurant-solution.pdf" \
   "uklo-2010-eng-restaurant-English-general.pdf"
echo "✅ Restaurant: Extracted solution (pages 3-4)"

# Compress all solution PDFs
echo ""
echo "Compressing solution PDFs..."
for pdf in *-solution.pdf; do
    gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
       -dNOPAUSE -dQUIET -dBATCH \
       -sOutputFile="${pdf%.pdf}-compressed.pdf" "$pdf"
    mv "${pdf%.pdf}-compressed.pdf" "$pdf"
done

echo ""
echo "🎉 Done! Created 5 solution PDFs"
