#!/bin/bash
# Organize IOL files by year

cd /Users/skyliu/Lingohub/olympiad-problems/IOL

# Create year directories
for year in {2003..2024}; do
  mkdir -p "by-year/$year"
done

# Move files to year folders
for year in {2003..2024}; do
  mv iol-${year}-*.pdf by-year/$year/ 2>/dev/null
done

echo "Files organized by year!"
echo ""

# Show summary
for year in {2003..2024}; do
  count=$(find by-year/$year -name "*.pdf" 2>/dev/null | wc -l)
  if [ $count -gt 0 ]; then
    echo "$year: $count files"
  fi
done

echo ""
total=$(find by-year -name "*.pdf" | wc -l)
echo "Total: $total files"
