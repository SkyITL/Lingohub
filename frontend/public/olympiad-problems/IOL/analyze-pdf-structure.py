#!/usr/bin/env python3
"""
Analyze IOL PDF structure to understand how to split problems
"""

import pypdf
import sys

if len(sys.argv) < 2:
    print("Usage: python3 analyze-pdf-structure.py <pdf-file>")
    sys.exit(1)

pdf_file = sys.argv[1]

print(f"Analyzing: {pdf_file}")
print("=" * 80)

reader = pypdf.PdfReader(pdf_file)
print(f"Total pages: {len(reader.pages)}")
print()

# Extract text from each page to understand structure
for i, page in enumerate(reader.pages, 1):
    text = page.extract_text()
    lines = text.split('\n')

    print(f"--- Page {i} ---")
    # Print first 10 lines to see headers/problem numbers
    for line in lines[:15]:
        if line.strip():
            print(f"  {line[:100]}")

    # Look for problem markers
    for line in lines:
        line_lower = line.lower()
        if 'problem' in line_lower and any(str(n) in line for n in range(1, 6)):
            print(f"  >>> FOUND PROBLEM MARKER: {line}")

    print()

print("=" * 80)
print("Done analyzing")
