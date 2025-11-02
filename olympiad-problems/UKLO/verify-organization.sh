#!/bin/bash
# Verify UKLO organization

cd /Users/skyliu/Lingohub/olympiad-problems/UKLO

echo "=== UKLO Organization Summary ==="
echo ""
echo "By Year:"
for year in {2010..2022}; do
  count=$(find by-year/$year -type f \( -name "*.pdf" -o -name "*.doc" -o -name "*.docx" \) 2>/dev/null | wc -l)
  echo "  $year: $count files"
done

echo ""
echo "By Difficulty:"
echo "  Breakthrough: $(find by-difficulty/breakthrough -type f 2>/dev/null | wc -l) files"
echo "  Foundation: $(find by-difficulty/foundation -type f 2>/dev/null | wc -l) files"
echo "  Intermediate: $(find by-difficulty/intermediate -type f 2>/dev/null | wc -l) files"
echo "  Advanced: $(find by-difficulty/advanced -type f 2>/dev/null | wc -l) files"
echo "  Round 2: $(find by-difficulty/round-2 -type f 2>/dev/null | wc -l) files"

echo ""
echo "Special Collections:"
echo "  Model Problems: $(ls model-problems/*.pdf 2>/dev/null | wc -l) PDFs"
echo "  Seasonal Puzzles: $(find seasonal-puzzles -name "*.pdf" 2>/dev/null | wc -l) PDFs"
echo "  Breakthrough Workout: $(ls special-collections/*.pdf 2>/dev/null | wc -l) PDFs"
echo "  Database: $(ls database/*.xlsx 2>/dev/null | wc -l) files"

echo ""
total_by_year=$(find by-year -type f \( -name "*.pdf" -o -name "*.doc" -o -name "*.docx" \) | wc -l)
total_pdfs=$(find by-year -type f -name "*.pdf" | wc -l)
total_docs=$(find by-year -type f \( -name "*.doc" -o -name "*.docx" \) | wc -l)
echo "Total files in by-year: $total_by_year"
echo "  - PDFs: $total_pdfs"
echo "  - DOC/DOCX: $total_docs"
echo ""
echo "✅ Organization complete!"
