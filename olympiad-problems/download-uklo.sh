#!/bin/bash

# UKLO Problems Download Script
# Downloads problems from the UKLO archives

set -e  # Exit on error

echo "📚 UKLO (UK Linguistics Olympiad) Downloader"
echo "============================================="
echo ""

# Create directory
mkdir -p UKLO
cd UKLO

echo "Downloading UKLO problems from archives..."
echo ""

# Download the bulk zip file with all benchmark problems
echo "  → Downloading bulk benchmark problems archive..."
bulk_url="https://archives.uklo.org/problems/benchmarks.zip"
bulk_file="uklo-benchmarks-all.zip"

if curl -s -f -L -o "$bulk_file" "$bulk_url" 2>/dev/null; then
    echo "    ✓ Downloaded $bulk_file"
    echo "    → Extracting..."
    unzip -q -o "$bulk_file" -d benchmarks
    echo "    ✓ Extracted to benchmarks/"
else
    echo "    ⚠️  Bulk archive not found at expected URL"
fi

echo ""

# Download benchmark database
echo "  → Downloading benchmark database..."
db_url="https://archives.uklo.org/problems/benchmarks.xlsx"
db_file="uklo-benchmarks-database.xlsx"

if curl -s -f -L -o "$db_file" "$db_url" 2>/dev/null; then
    echo "    ✓ Downloaded $db_file"
else
    echo "    ⚠️  Database not found"
fi

echo ""

# Download annual test papers (2010-2022)
echo "  → Downloading annual test papers..."
mkdir -p annual-papers

for year in {2010..2022}; do
    echo "    Downloading $year papers..."

    # Try different possible formats for the annual papers
    # Round 1 - Breakthrough
    r1_bt_url="https://archives.uklo.org/problems/${year}/round1-breakthrough.pdf"
    r1_bt_file="annual-papers/uklo-${year}-round1-breakthrough.pdf"

    # Round 1 - Foundation (older name for Breakthrough)
    r1_found_url="https://archives.uklo.org/problems/${year}/round1-foundation.pdf"
    r1_found_file="annual-papers/uklo-${year}-round1-foundation.pdf"

    # Round 1 - Advanced
    r1_adv_url="https://archives.uklo.org/problems/${year}/round1-advanced.pdf"
    r1_adv_file="annual-papers/uklo-${year}-round1-advanced.pdf"

    # Round 2 - Advanced
    r2_adv_url="https://archives.uklo.org/problems/${year}/round2-advanced.pdf"
    r2_adv_file="annual-papers/uklo-${year}-round2-advanced.pdf"

    # Combined booklet
    combined_url="https://archives.uklo.org/problems/${year}/uklo-${year}.pdf"
    combined_file="annual-papers/uklo-${year}-combined.pdf"

    # Try to download each format
    if curl -s -f -L -o "$r1_bt_file" "$r1_bt_url" 2>/dev/null; then
        echo "      ✓ Round 1 Breakthrough"
    fi

    if curl -s -f -L -o "$r1_found_file" "$r1_found_url" 2>/dev/null; then
        echo "      ✓ Round 1 Foundation"
    fi

    if curl -s -f -L -o "$r1_adv_file" "$r1_adv_url" 2>/dev/null; then
        echo "      ✓ Round 1 Advanced"
    fi

    if curl -s -f -L -o "$r2_adv_file" "$r2_adv_url" 2>/dev/null; then
        echo "      ✓ Round 2 Advanced"
    fi

    if curl -s -f -L -o "$combined_file" "$combined_url" 2>/dev/null; then
        echo "      ✓ Combined booklet"
    fi

    sleep 0.5  # Be polite to the server
done

echo ""

# Download special collections
echo "  → Downloading special collections..."
mkdir -p special-collections

# Breakthrough Workout
bt_workout_url="https://archives.uklo.org/problems/breakthrough-workout.pdf"
bt_workout_file="special-collections/breakthrough-workout.pdf"

if curl -s -f -L -o "$bt_workout_file" "$bt_workout_url" 2>/dev/null; then
    echo "    ✓ Downloaded Breakthrough Workout"
else
    echo "    ⚠️  Breakthrough Workout not found"
fi

# Champion problems
champ_url="https://archives.uklo.org/problems/champion-problems.pdf"
champ_file="special-collections/champion-problems.pdf"

if curl -s -f -L -o "$champ_file" "$champ_url" 2>/dev/null; then
    echo "    ✓ Downloaded Champion Problems"
else
    echo "    ⚠️  Champion Problems not found"
fi

# Seasonal puzzles
seasonal_url="https://archives.uklo.org/problems/seasonal-puzzles.pdf"
seasonal_file="special-collections/seasonal-puzzles.pdf"

if curl -s -f -L -o "$seasonal_file" "$seasonal_url" 2>/dev/null; then
    echo "    ✓ Downloaded Seasonal Puzzles"
else
    echo "    ⚠️  Seasonal Puzzles not found"
fi

# Training PowerPoint
training_url="https://archives.uklo.org/problems/uklo-training.pptx"
training_file="special-collections/uklo-training.pptx"

if curl -s -f -L -o "$training_file" "$training_url" 2>/dev/null; then
    echo "    ✓ Downloaded Training PowerPoint"
else
    echo "    ⚠️  Training PowerPoint not found"
fi

cd ..

# Summary
echo ""
echo "==========================================="
echo "📊 Download Summary"
echo "==========================================="
echo ""

uklo_count=$(find UKLO -name "*.pdf" 2>/dev/null | wc -l)
echo "UKLO PDFs downloaded: $uklo_count"
echo ""

if [ -f "UKLO/uklo-benchmarks-all.zip" ]; then
    echo "Benchmark problems: Extracted to UKLO/benchmarks/"
fi

if [ -f "UKLO/uklo-benchmarks-database.xlsx" ]; then
    echo "Benchmark database: UKLO/uklo-benchmarks-database.xlsx"
fi

echo "Annual papers: UKLO/annual-papers/"
echo "Special collections: UKLO/special-collections/"
echo ""
echo "✨ UKLO download complete!"
