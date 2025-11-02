#!/usr/bin/env python3
"""
Automatically split IOL individual problem PDFs into separate problem files
Detects problem boundaries by finding "Problem N" markers
"""

import pypdf
import sys
import os
import re

def find_problem_boundaries(pdf_file):
    """
    Scan PDF and find which page each problem starts on
    Returns: dict mapping problem number to start page (0-indexed)
    """
    reader = pypdf.PdfReader(pdf_file)
    problem_pages = {}

    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()

        # Look for "Problem N" or "Problem #N" or "Problem №N" markers (N = 1-5)
        for problem_num in range(1, 6):
            # Match patterns like "Problem 1 (20 points)" or "Problem #1" or "Problem №1"
            pattern = rf'Problem\s*[#№]?{problem_num}\s*\('
            if re.search(pattern, text, re.IGNORECASE):
                if problem_num not in problem_pages:
                    problem_pages[problem_num] = page_num
                    print(f"  Problem {problem_num} starts on page {page_num + 1}")

    return problem_pages

def split_pdf(pdf_file, output_dir, year):
    """
    Split a combined IOL PDF into individual problem files
    """
    print(f"\nProcessing: {pdf_file}")
    print(f"Year: {year}")

    # Find problem boundaries
    problem_pages = find_problem_boundaries(pdf_file)

    if not problem_pages:
        print("  ⚠️  No problem markers found! Skipping.")
        return False

    # Sort by problem number
    sorted_problems = sorted(problem_pages.items())

    # Read the original PDF
    reader = pypdf.PdfReader(pdf_file)
    total_pages = len(reader.pages)

    # For each problem, determine page range and split
    for i, (problem_num, start_page) in enumerate(sorted_problems):
        # Find end page (start of next problem, or end of document)
        if i + 1 < len(sorted_problems):
            end_page = sorted_problems[i + 1][1]
        else:
            end_page = total_pages

        # Create a new PDF for this problem
        writer = pypdf.PdfWriter()

        # Add pages for this problem
        for page_num in range(start_page, end_page):
            writer.add_page(reader.pages[page_num])

        # Save the split PDF
        output_file = os.path.join(output_dir, f"iol-{year}-i{problem_num}.pdf")
        with open(output_file, 'wb') as output:
            writer.write(output)

        page_count = end_page - start_page
        print(f"  ✅ Created iol-{year}-i{problem_num}.pdf (pages {start_page + 1}-{end_page}, {page_count} page{'s' if page_count > 1 else ''})")

    return True

def main():
    # Years to process (2003-2025)
    # Note: Some years may be missing (e.g., 2020)
    years = list(range(2003, 2026))

    base_dir = "/Users/skyliu/Lingohub/olympiad-problems/IOL/by-year"

    print("=" * 80)
    print("IOL PDF Splitter - Splitting individual problems (2003-2025)")
    print("=" * 80)

    success_count = 0
    failed_count = 0

    for year in years:
        year_dir = os.path.join(base_dir, str(year))
        pdf_file = os.path.join(year_dir, f"iol-{year}-indiv-prob.en.pdf")

        if not os.path.exists(pdf_file):
            print(f"\n⚠️  {year}: File not found, skipping")
            failed_count += 1
            continue

        try:
            if split_pdf(pdf_file, year_dir, year):
                success_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"\n❌ {year}: Error - {e}")
            failed_count += 1

    print("\n" + "=" * 80)
    print(f"Summary:")
    print(f"  Successfully split: {success_count} years")
    print(f"  Failed: {failed_count} years")
    print(f"  Total problems created: {success_count * 5}")
    print("=" * 80)

if __name__ == '__main__':
    main()
