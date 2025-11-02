#!/bin/bash
# Organize 2010-2020 UKLO PDFs by difficulty

cd /Users/skyliu/Lingohub/olympiad-problems/UKLO

# Process each year from 2010-2020
for year in {2010..2020}; do
  echo "Processing $year..."

  # Find all PDFs and DOC/DOCX in this year
  find "by-year/$year" -type f \( -name "*.pdf" -o -name "*.doc" -o -name "*.docx" \) | while read file; do
    filename=$(basename "$file")

    # Check for R2 first (most specific)
    if echo "$filename" | grep -qiE "(r2|-R2\.|R2-)"; then
      cp "$file" "by-difficulty/round-2/"
      echo "  R2: $filename"
    fi

    # Check for Breakthrough
    if echo "$filename" | grep -qE "(-B-|Breakthrough)"; then
      cp "$file" "by-difficulty/breakthrough/"
      echo "  B: $filename"
    fi

    # Check for Foundation
    if echo "$filename" | grep -qE "(-F-|Foundation)"; then
      cp "$file" "by-difficulty/foundation/"
      echo "  F: $filename"
    fi

    # Check for Intermediate
    if echo "$filename" | grep -qE "(-I-|-I\.|Intermediate)"; then
      cp "$file" "by-difficulty/intermediate/"
      echo "  I: $filename"
    fi

    # Check for Advanced
    if echo "$filename" | grep -qE "(-A-|-A\.|Advanced)"; then
      cp "$file" "by-difficulty/advanced/"
      echo "  A: $filename"
    fi
  done
done

echo ""
echo "Done organizing by difficulty!"
echo ""
echo "Summary:"
echo "Breakthrough: $(ls by-difficulty/breakthrough/*.pdf 2>/dev/null | wc -l)"
echo "Foundation: $(ls by-difficulty/foundation/*.pdf 2>/dev/null | wc -l)"
echo "Intermediate: $(ls by-difficulty/intermediate/*.pdf 2>/dev/null | wc -l)"
echo "Advanced: $(ls by-difficulty/advanced/*.pdf 2>/dev/null | wc -l)"
echo "Round 2: $(ls by-difficulty/round-2/*.pdf 2>/dev/null | wc -l)"
