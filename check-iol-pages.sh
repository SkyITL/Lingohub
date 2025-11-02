#!/bin/bash
# Check page counts for all IOL solution files

cd /Users/skyliu/Lingohub/frontend/public/olympiad-problems/IOL/by-year

for sol in */iol-*-indiv-sol*.pdf; do
    year="${sol%%/*}"
    pages=$(python3 -c "import pypdf; print(len(pypdf.PdfReader('$sol').pages))")
    echo "$year: $pages pages"
done
