#!/bin/bash

# Linguistics Olympiad Problems Download Script
# This script downloads problem PDFs from IOL and APLO competitions

set -e  # Exit on error

echo "🌍 Linguistics Olympiad Problems Downloader"
echo "=========================================="
echo ""

# Create directories if they don't exist
mkdir -p IOL APLO NACLO UKLO

# IOL Downloads
echo "📚 Downloading IOL (International Linguistics Olympiad) problems..."
echo "Years: 2003-2024"
cd IOL

for year in {2003..2024}; do
  echo "  → Downloading IOL $year..."

  # Individual problems
  curl -s -f -O "https://ioling.org/booklets/iol-${year}-indiv-prob.en.pdf" || echo "    ⚠️  Individual problems not found for $year"

  # Individual solutions
  curl -s -f -O "https://ioling.org/booklets/iol-${year}-indiv-sol.en.pdf" || echo "    ⚠️  Individual solutions not found for $year"

  # Team problems
  curl -s -f -O "https://ioling.org/booklets/iol-${year}-team-prob.en.pdf" || echo "    ⚠️  Team problems not found for $year"

  # Team solutions
  curl -s -f -O "https://ioling.org/booklets/iol-${year}-team-sol.en.pdf" || echo "    ⚠️  Team solutions not found for $year"

  sleep 1  # Be polite to the server
done

cd ..
echo "✅ IOL downloads complete!"
echo ""

# APLO Downloads
echo "📚 Downloading APLO (Asia-Pacific Linguistics Olympiad) problems..."
echo "Years: 2019-2024"
cd APLO

for year in {2019..2024}; do
  echo "  → Downloading APLO $year..."

  # Problems
  curl -s -f -O "https://aplo.asia/booklets/aplo-${year}-prob.en.pdf" || echo "    ⚠️  Problems not found for $year"

  # Solutions
  curl -s -f -O "https://aplo.asia/booklets/aplo-${year}-sol.en.pdf" || echo "    ⚠️  Solutions not found for $year"

  sleep 1  # Be polite to the server
done

cd ..
echo "✅ APLO downloads complete!"
echo ""

# NACLO and UKLO instructions
echo "📝 Manual Downloads Required:"
echo ""
echo "NACLO (North American Computational Linguistics Olympiad):"
echo "  → Visit: https://naclo.org/past_competitions.php"
echo "  → Download PDFs for each year (2007-2024)"
echo "  → Save to: ./NACLO/"
echo ""
echo "UKLO (UK Linguistics Olympiad):"
echo "  → Visit: https://archives.uklo.org/problems"
echo "  → Download the bulk ZIP file"
echo "  → Extract to: ./UKLO/"
echo ""

# Summary
echo "=========================================="
echo "📊 Download Summary"
echo "=========================================="
echo ""

iol_count=$(find IOL -name "*.pdf" 2>/dev/null | wc -l)
aplo_count=$(find APLO -name "*.pdf" 2>/dev/null | wc -l)
naclo_count=$(find NACLO -name "*.pdf" 2>/dev/null | wc -l)
uklo_count=$(find UKLO -name "*.pdf" 2>/dev/null | wc -l)

echo "IOL PDFs downloaded:   $iol_count"
echo "APLO PDFs downloaded:  $aplo_count"
echo "NACLO PDFs downloaded: $naclo_count (requires manual download)"
echo "UKLO PDFs downloaded:  $uklo_count (requires manual download)"
echo ""
echo "Total PDFs: $((iol_count + aplo_count + naclo_count + uklo_count))"
echo ""
echo "✨ Download complete! Check the directories for your files."
echo ""
echo "Next steps:"
echo "1. Review DOWNLOAD_GUIDE.md for manual download instructions"
echo "2. Convert PDFs to markdown format"
echo "3. Add problems to LingoHub database"
