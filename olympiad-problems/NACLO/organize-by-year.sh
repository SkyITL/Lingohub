#!/bin/bash
# Organize NACLO PDFs by year

cd /Users/skyliu/Lingohub/olympiad-problems/NACLO

# Create year directories
for year in {2007..2025}; do
  mkdir -p "by-year/$year"
done

# Move files to year folders
for file in naclo-*.pdf; do
  if [ -f "$file" ]; then
    year=$(echo "$file" | grep -oE '20[0-9]{2}')
    if [ ! -z "$year" ]; then
      mv "$file" "by-year/$year/"
      echo "Moved $file -> by-year/$year/"
    fi
  fi
done

# Also move samples and student problems
if [ -d "samples" ]; then
  mv samples/* by-year/ 2>/dev/null || true
fi

if [ -d "student-problems" ]; then
  # Student problems don't have years, keep them separate
  echo "Keeping student-problems folder separate"
fi

echo ""
echo "Done organizing by year!"
echo ""

# Summary
for year in {2007..2025}; do
  count=$(find by-year/$year -name "*.pdf" 2>/dev/null | wc -l)
  if [ $count -gt 0 ]; then
    echo "$year: $count files"
  fi
done
