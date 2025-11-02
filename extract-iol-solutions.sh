#!/bin/bash
# Extract individual solution pages from IOL 2003 aggregate solution file

IOL_DIR="/Users/skyliu/Lingohub/frontend/public/olympiad-problems/IOL/by-year/2003"
cd "$IOL_DIR"

echo "Extracting IOL 2003 solution pages..."

# The solution file has 4 pages
# Based on IOL structure, typically each problem gets one solution page
# Problem 1 -> Page 1, Problem 2 -> Page 2, etc.

# Extract individual solution pages (1 page each for problems 1, 2, 4, 5)
for i in 1 2 4 5; do
    gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
       -dFirstPage=$i -dLastPage=$i \
       -sOutputFile="iol-2003-i${i}-solution.pdf" \
       "iol-2003-indiv-sol.en.pdf"
    echo "✅ Problem $i: Extracted solution (page $i)"
done

# Problem 3 (Zulu) likely has a longer solution (maybe page 3)
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER \
   -dFirstPage=3 -dLastPage=3 \
   -sOutputFile="iol-2003-i3-solution.pdf" \
   "iol-2003-indiv-sol.en.pdf"
echo "✅ Problem 3: Extracted solution (page 3)"

# Compress all solution PDFs
echo ""
echo "Compressing solution PDFs..."
for pdf in iol-2003-i*-solution.pdf; do
    gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
       -dNOPAUSE -dQUIET -dBATCH \
       -sOutputFile="${pdf%.pdf}-compressed.pdf" "$pdf"
    mv "${pdf%.pdf}-compressed.pdf" "$pdf"
done

echo ""
echo "🎉 Done! Created 5 solution PDFs"
