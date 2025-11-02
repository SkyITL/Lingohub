#!/bin/bash
# Extract individual solution pages from all IOL aggregate solution files

BASE_DIR="/Users/skyliu/Lingohub/frontend/public/olympiad-problems/IOL/by-year"

echo "Extracting IOL solution pages for all years..."
echo ""

total_extracted=0

for year in {2003..2025}; do
    IOL_DIR="$BASE_DIR/$year"

    # Skip if directory doesn't exist
    if [ ! -d "$IOL_DIR" ]; then
        continue
    fi

    # Find the solution file for this year
    sol_file=$(ls "$IOL_DIR"/iol-$year-indiv-sol*.pdf 2>/dev/null | head -1)

    if [ ! -f "$sol_file" ]; then
        continue
    fi

    # Get number of pages in solution file
    pages=$(python3 -c "import pypdf; print(len(pypdf.PdfReader('$sol_file').pages))")

    echo "=== IOL $year ($pages pages) ==="
    cd "$IOL_DIR"

    # Extract individual solution pages (1 page per problem, typically 5 problems)
    # If solution file has fewer pages than problems, some problems share a page
    for i in 1 2 3 4 5; do
        # Use page number = problem number, but cap at total pages
        page=$i
        if [ $page -gt $pages ]; then
            page=$pages
        fi

        # Skip if solution already exists
        if [ -f "iol-$year-i$i-solution.pdf" ]; then
            echo "  ✓ Problem $i solution already exists"
            continue
        fi

        gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -dQUIET \
           -dFirstPage=$page -dLastPage=$page \
           -sOutputFile="iol-$year-i$i-solution.pdf" \
           "$sol_file" 2>/dev/null

        if [ -f "iol-$year-i$i-solution.pdf" ]; then
            echo "  ✅ Problem $i: Extracted solution (page $page)"
            ((total_extracted++))
        else
            echo "  ❌ Problem $i: Failed to extract"
        fi
    done

    # Compress all newly created solution PDFs for this year
    for pdf in iol-$year-i*-solution.pdf; do
        if [ -f "$pdf" ] && [ ! -f "${pdf}.compressed" ]; then
            gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
               -dNOPAUSE -dQUIET -dBATCH \
               -sOutputFile="${pdf}.tmp" "$pdf" 2>/dev/null
            mv "${pdf}.tmp" "$pdf"
            touch "${pdf}.compressed"  # Mark as compressed
        fi
    done

    # Clean up compression markers
    rm -f *.compressed

    echo ""
done

echo "🎉 Done! Extracted $total_extracted solution PDFs across all IOL years"
