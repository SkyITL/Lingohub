#!/bin/bash
# Download missing IOL years (2003-2015 and any gaps)

cd /Users/skyliu/Lingohub/olympiad-problems/IOL

echo "📚 Downloading missing IOL years (2003-2024)..."
echo ""

for year in {2003..2024}; do
  echo "→ Checking IOL $year..."

  downloaded=0

  # Individual problems
  if [ ! -f "iol-${year}-indiv-prob.en.pdf" ]; then
    echo "  Downloading individual problems..."
    if curl -s -f -L -A "Mozilla/5.0" -o "iol-${year}-indiv-prob.en.pdf" "https://ioling.org/booklets/iol-${year}-indiv-prob.en.pdf" 2>/dev/null; then
      size=$(ls -lh "iol-${year}-indiv-prob.en.pdf" | awk '{print $5}')
      # Check if it's not an HTML error page
      if head -1 "iol-${year}-indiv-prob.en.pdf" | grep -q "<!doctype html\|<html"; then
        echo "    ✗ Not available (404)"
        rm "iol-${year}-indiv-prob.en.pdf"
      else
        echo "    ✓ Downloaded ($size)"
        downloaded=1
      fi
    else
      echo "    ✗ Not available"
    fi
  else
    echo "  ✓ Individual problems already exists"
  fi

  # Individual solutions
  if [ ! -f "iol-${year}-indiv-sol.en.pdf" ]; then
    echo "  Downloading individual solutions..."
    if curl -s -f -L -A "Mozilla/5.0" -o "iol-${year}-indiv-sol.en.pdf" "https://ioling.org/booklets/iol-${year}-indiv-sol.en.pdf" 2>/dev/null; then
      size=$(ls -lh "iol-${year}-indiv-sol.en.pdf" | awk '{print $5}')
      if head -1 "iol-${year}-indiv-sol.en.pdf" | grep -q "<!doctype html\|<html"; then
        echo "    ✗ Not available (404)"
        rm "iol-${year}-indiv-sol.en.pdf"
      else
        echo "    ✓ Downloaded ($size)"
        downloaded=1
      fi
    else
      echo "    ✗ Not available"
    fi
  else
    echo "  ✓ Individual solutions already exists"
  fi

  # Team problems
  if [ ! -f "iol-${year}-team-prob.en.pdf" ]; then
    echo "  Downloading team problems..."
    if curl -s -f -L -A "Mozilla/5.0" -o "iol-${year}-team-prob.en.pdf" "https://ioling.org/booklets/iol-${year}-team-prob.en.pdf" 2>/dev/null; then
      size=$(ls -lh "iol-${year}-team-prob.en.pdf" | awk '{print $5}')
      if head -1 "iol-${year}-team-prob.en.pdf" | grep -q "<!doctype html\|<html"; then
        echo "    ✗ Not available (404)"
        rm "iol-${year}-team-prob.en.pdf"
      else
        echo "    ✓ Downloaded ($size)"
        downloaded=1
      fi
    else
      echo "    ✗ Not available"
    fi
  else
    echo "  ✓ Team problems already exists"
  fi

  # Team solutions
  if [ ! -f "iol-${year}-team-sol.en.pdf" ]; then
    echo "  Downloading team solutions..."
    if curl -s -f -L -A "Mozilla/5.0" -o "iol-${year}-team-sol.en.pdf" "https://ioling.org/booklets/iol-${year}-team-sol.en.pdf" 2>/dev/null; then
      size=$(ls -lh "iol-${year}-team-sol.en.pdf" | awk '{print $5}')
      if head -1 "iol-${year}-team-sol.en.pdf" | grep -q "<!doctype html\|<html"; then
        echo "    ✗ Not available (404)"
        rm "iol-${year}-team-sol.en.pdf"
      else
        echo "    ✓ Downloaded ($size)"
        downloaded=1
      fi
    else
      echo "    ✗ Not available"
    fi
  else
    echo "  ✓ Team solutions already exists"
  fi

  echo ""

  if [ $downloaded -eq 1 ]; then
    sleep 0.5  # Be polite to the server
  fi
done

echo "=========================================="
echo "Download complete!"
echo ""
echo "Summary:"
for year in {2003..2024}; do
  count=$(find . -name "iol-${year}-*.pdf" 2>/dev/null | wc -l)
  if [ $count -gt 0 ]; then
    echo "$year: $count files"
  fi
done
