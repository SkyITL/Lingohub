#!/usr/bin/env python3
"""
Use OCR to analyze scanned PDF structure
"""

import sys
import pypdf
from pdf2image import convert_from_path
import pytesseract
import re

if len(sys.argv) < 2:
    print("Usage: python3 ocr-analyze-pdf.py <pdf-file>")
    sys.exit(1)

pdf_file = sys.argv[1]

print(f"Analyzing scanned PDF with OCR: {pdf_file}")
print("=" * 80)

# Convert PDF pages to images
print("Converting PDF to images...")
images = convert_from_path(pdf_file, dpi=200)

print(f"Total pages: {len(images)}")
print()

problem_markers = {}

for page_num, image in enumerate(images, 1):
    print(f"--- Page {page_num} (OCR) ---")

    # Perform OCR
    text = pytesseract.image_to_string(image)
    lines = text.split('\n')

    # Print first 10 non-empty lines
    line_count = 0
    for line in lines:
        if line.strip() and line_count < 10:
            print(f"  {line[:100]}")
            line_count += 1

    # Look for problem markers
    for line in lines:
        # Look for "Problem N" or "Problem #N" patterns
        match = re.search(r'Problem\s*[#№]?([1-5])', line, re.IGNORECASE)
        if match:
            problem_num = int(match.group(1))
            if problem_num not in problem_markers:
                problem_markers[problem_num] = page_num
                print(f"  >>> FOUND: Problem {problem_num} on page {page_num}")

    print()

print("=" * 80)
print("Summary of detected problems:")
for prob_num in sorted(problem_markers.keys()):
    print(f"  Problem {prob_num}: Page {problem_markers[prob_num]}")
print("=" * 80)
