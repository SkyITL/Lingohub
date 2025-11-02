#!/bin/bash
# Fix broken IOL files (HTML error pages instead of PDFs)

cd /Users/skyliu/Lingohub/olympiad-problems/IOL

echo "Finding broken IOL files (< 20KB)..."
echo ""

# Find and process broken files
find . -type f -size -20k -name "*.pdf" | while read file; do
  filename=$(basename "$file")

  # Check if it's actually an HTML file
  if head -1 "$file" | grep -q "<!doctype html\|<html"; then
    echo "❌ Broken: $filename (HTML error page)"

    # Extract year and type from filename
    # Format: iol-YEAR-TYPE-CATEGORY.LANG.pdf
    year=$(echo "$filename" | grep -oE '20[0-9]{2}')

    if echo "$filename" | grep -q "indiv-prob"; then
      type="indiv"
      category="prob"
    elif echo "$filename" | grep -q "indiv-sol"; then
      type="indiv"
      category="sol"
    elif echo "$filename" | grep -q "team-prob"; then
      type="team"
      category="prob"
    elif echo "$filename" | grep -q "team-sol"; then
      type="team"
      category="sol"
    else
      echo "  ⚠️  Cannot determine type/category, skipping"
      continue
    fi

    # Construct the correct URL
    # IOL URLs: https://ioling.org/booklets/iol-YEAR/LANG/iol-YEAR-TYPE-CATEGORY.LANG.pdf
    url="https://ioling.org/booklets/iol-${year}/en/iol-${year}-${type}-${category}.en.pdf"

    echo "  Deleting broken file..."
    rm "$file"

    echo "  Re-downloading from: $url"
    if curl -s -f -L -A "Mozilla/5.0" -o "$filename" "$url" 2>/dev/null; then
      size=$(ls -lh "$filename" | awk '{print $5}')
      echo "  ✓ Downloaded successfully ($size)"
    else
      echo "  ✗ Failed to download"
    fi

    echo ""
    sleep 0.5
  fi
done

echo ""
echo "Checking for remaining broken files..."
broken_count=$(find . -type f -size -20k -name "*.pdf" | wc -l)
echo "Broken files remaining: $broken_count"

if [ $broken_count -eq 0 ]; then
  echo "✅ All files fixed!"
else
  echo "⚠️  Some files may still be broken. Manual review needed."
fi
