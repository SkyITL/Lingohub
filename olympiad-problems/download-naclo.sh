#!/bin/bash

# NACLO Problems Download Script
# Downloads problems from the NACLO practice page

set -e  # Exit on error

echo "📚 NACLO (North American Computational Linguistics Olympiad) Downloader"
echo "========================================================================"
echo ""

# Create directory
mkdir -p NACLO
cd NACLO

echo "Downloading NACLO problems from practice page..."
echo ""

# Function to convert number to letter
num_to_letter() {
    local num=$1
    printf "\\$(printf '%03o' $((64 + num)))"
}

# Function to get problem count for a year
get_problem_count() {
    case $1 in
        2007) echo 8 ;;   # A-H
        2008) echo 12 ;;  # A-L
        2009) echo 13 ;;  # A-M
        2010) echo 16 ;;  # A-P
        2011) echo 14 ;;  # A-N
        2012) echo 18 ;;  # A-R
        2013) echo 18 ;;  # A-R
        2014) echo 17 ;;  # A-Q
        2015) echo 16 ;;  # A-P
        2016) echo 18 ;;  # A-R
        2017) echo 18 ;;  # A-R
        2018) echo 18 ;;  # A-R
        2019) echo 18 ;;  # A-R
        2020) echo 18 ;;  # A-R
        2021) echo 19 ;;  # A-S
        2022) echo 18 ;;  # A-R
        2023) echo 17 ;;  # A-Q
        2024) echo 0 ;;   # Only booklets available
        2025) echo 16 ;;  # A-P
        *) echo 0 ;;
    esac
}

# Download individual problems
for year in {2007..2023} 2025; do
    count=$(get_problem_count $year)

    if [ $count -eq 0 ]; then
        echo "  → Skipping $year (only booklets available)"
        continue
    fi

    echo "  → Downloading $year problems (A-$(num_to_letter $count))..."

    for i in $(seq 1 $count); do
        letter=$(num_to_letter $i)

        # Problem PDF
        prob_url="https://naclo.org/resources/problems/${year}/N${year}-${letter}.pdf"
        prob_file="naclo-${year}-${letter}-problem.pdf"

        # Solution PDF
        sol_url="https://naclo.org/resources/problems/${year}/N${year}-${letter}S.pdf"
        sol_file="naclo-${year}-${letter}-solution.pdf"

        # Download problem
        if curl -s -f -A "Mozilla/5.0" -o "$prob_file" "$prob_url" 2>/dev/null; then
            echo "    ✓ Downloaded $prob_file"
        else
            echo "    ⚠️  Problem $prob_file not found"
        fi

        # Download solution
        if curl -s -f -A "Mozilla/5.0" -o "$sol_file" "$sol_url" 2>/dev/null; then
            echo "    ✓ Downloaded $sol_file"
        else
            echo "    ⚠️  Solution $sol_file not found"
        fi

        sleep 0.5  # Be polite to the server
    done

    echo ""
done

# Download 2024 and 2025 combined booklets
echo "  → Downloading combined booklets..."

for year in 2024 2025; do
    # Round 1 booklet
    r1_url="https://naclo.org/resources/problems/${year}/NACLO${year}_Round1.pdf"
    r1_file="naclo-${year}-round1-booklet.pdf"

    # Round 2 booklet
    r2_url="https://naclo.org/resources/problems/${year}/NACLO${year}_Round2.pdf"
    r2_file="naclo-${year}-round2-booklet.pdf"

    if curl -s -f -A "Mozilla/5.0" -o "$r1_file" "$r1_url" 2>/dev/null; then
        echo "    ✓ Downloaded $r1_file"
    else
        echo "    ⚠️  Booklet $r1_file not found"
    fi

    if curl -s -f -A "Mozilla/5.0" -o "$r2_file" "$r2_url" 2>/dev/null; then
        echo "    ✓ Downloaded $r2_file"
    else
        echo "    ⚠️  Booklet $r2_file not found"
    fi

    sleep 0.5
done

echo ""

# Download sample practice problems
echo "  → Downloading sample practice problems..."
mkdir -p samples

for i in {1..20}; do
    sample_url="https://naclo.org/resources/practice/sample${i}.pdf"
    sample_file="samples/sample-${i}.pdf"

    if curl -s -f -A "Mozilla/5.0" -o "$sample_file" "$sample_url" 2>/dev/null; then
        echo "    ✓ Downloaded sample-${i}.pdf"
    else
        # Stop when we hit a 404
        break
    fi

    sleep 0.3
done

echo ""

# Download student-contributed problems
echo "  → Downloading student-contributed problems..."
mkdir -p student-problems

student_problems=("hebrew" "japanese" "tamil" "welsh" "yers")

for prob in "${student_problems[@]}"; do
    student_url="https://naclo.org/resources/practice/student-${prob}.pdf"
    student_file="student-problems/${prob}.pdf"

    if curl -s -f -A "Mozilla/5.0" -o "$student_file" "$student_url" 2>/dev/null; then
        echo "    ✓ Downloaded ${prob}.pdf"
    else
        echo "    ⚠️  ${prob}.pdf not found"
    fi

    sleep 0.3
done

cd ..

# Summary
echo ""
echo "==========================================="
echo "📊 Download Summary"
echo "==========================================="
echo ""

naclo_count=$(find NACLO -name "*.pdf" 2>/dev/null | wc -l)
echo "NACLO PDFs downloaded: $naclo_count"
echo ""
echo "✨ NACLO download complete!"
echo ""
echo "Note: Individual problems are stored as: naclo-YEAR-LETTER-problem.pdf"
echo "      Solutions are stored as: naclo-YEAR-LETTER-solution.pdf"
echo "      Combined booklets: naclo-YEAR-round1-booklet.pdf"
echo "      Sample problems: NACLO/samples/"
echo "      Student problems: NACLO/student-problems/"
