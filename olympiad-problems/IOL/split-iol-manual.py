#!/usr/bin/env python3
"""
Manual page range splitting for IOL PDFs where automatic detection fails
"""

import pypdf
import os

# Manual page ranges for problematic years
# Format: {year: [(problem_num, start_page, end_page), ...]}
# Pages are 1-indexed (human readable)
MANUAL_RANGES = {
    2003: [
        (1, 1, 1),  # Problem 1: page 1
        (2, 2, 2),  # Problem 2: page 2 (shares with P3)
        (3, 2, 2),  # Problem 3: page 2 (shares with P2)
        (4, 3, 3),  # Problem 4: page 3
        (5, 4, 4),  # Problem 5: page 4
    ],
    2005: [
        (1, 1, 1),  # Problem 1: page 1
        (2, 2, 2),  # Problem 2: page 2 (shares with P3)
        (3, 2, 2),  # Problem 3: page 2 (shares with P2)
        (4, 3, 3),  # Problem 4: page 3
        (5, 4, 4),  # Problem 5: page 4
    ],
    2008: [
        (1, 1, 1),  # Problem 1: page 1
        (2, 2, 2),  # Problem 2: page 2
        (3, 3, 3),  # Problem 3: page 3 (shares with P4)
        (4, 3, 3),  # Problem 4: page 3 (shares with P3)
        (5, 4, 4),  # Problem 5: page 4
    ],
    2009: [
        (1, 1, 1),  # Problem 1: page 1
        (2, 2, 2),  # Problem 2: page 2
        (3, 3, 3),  # Problem 3: page 3 (shares with P4)
        (4, 3, 3),  # Problem 4: page 3 (shares with P3)
        (5, 4, 4),  # Problem 5: page 4
    ],
    2010: [
        (1, 1, 1),  # Problem 1: page 1
        (2, 2, 2),  # Problem 2: page 2 (first half)
        (3, 2, 3),  # Problem 3: pages 2-3 (starts on page 2, ends on page 3)
        (4, 3, 3),  # Problem 4: page 3 (second half)
        (5, 4, 4),  # Problem 5: page 4
    ],
    2011: [
        (1, 1, 1),  # Problem 1: page 1
        (2, 2, 2),  # Problem 2: page 2
        (3, 3, 3),  # Problem 3: page 3 (first half)
        (4, 3, 3),  # Problem 4: page 3 (second half)
        (5, 4, 6),  # Problem 5: pages 4-6
    ],
    2012: [
        (1, 1, 2),  # Problem 1: pages 1-2
        (2, 3, 3),  # Problem 2: page 3 (first half)
        (3, 3, 4),  # Problem 3: pages 3-4 (starts on page 3, continues to 4)
        (4, 4, 4),  # Problem 4: page 4 (second half)
        (5, 5, 5),  # Problem 5: page 5
    ],
}

def split_pdf_manual(year, base_dir):
    """
    Split PDF using manual page ranges
    """
    year_dir = os.path.join(base_dir, str(year))
    # Try both .en.pdf and .en-us.pdf versions
    pdf_file = os.path.join(year_dir, f"iol-{year}-indiv-prob.en.pdf")
    if not os.path.exists(pdf_file):
        pdf_file = os.path.join(year_dir, f"iol-{year}-indiv-prob.en-us.pdf")

    if not os.path.exists(pdf_file):
        print(f"❌ {year}: File not found")
        return False

    print(f"\n📄 Processing {year} with manual page ranges...")

    reader = pypdf.PdfReader(pdf_file)
    ranges = MANUAL_RANGES[year]

    for problem_num, start_page, end_page in ranges:
        writer = pypdf.PdfWriter()

        # Add pages (convert from 1-indexed to 0-indexed)
        for page_num in range(start_page - 1, end_page):
            if page_num < len(reader.pages):
                writer.add_page(reader.pages[page_num])

        # Save the split PDF
        output_file = os.path.join(year_dir, f"iol-{year}-i{problem_num}.pdf")
        with open(output_file, 'wb') as output:
            writer.write(output)

        page_count = end_page - start_page + 1
        print(f"  ✅ Created iol-{year}-i{problem_num}.pdf (pages {start_page}-{end_page}, {page_count} page{'s' if page_count > 1 else ''})")

    return True

def main():
    base_dir = "/Users/skyliu/Lingohub/olympiad-problems/IOL/by-year"

    print("=" * 80)
    print("IOL Manual PDF Splitter - Using manual page ranges")
    print("=" * 80)

    success_count = 0

    for year in sorted(MANUAL_RANGES.keys()):
        try:
            if split_pdf_manual(year, base_dir):
                success_count += 1
        except Exception as e:
            print(f"❌ {year}: Error - {e}")

    print("\n" + "=" * 80)
    print(f"Summary: Successfully processed {success_count} year(s)")
    print("=" * 80)

if __name__ == '__main__':
    main()
