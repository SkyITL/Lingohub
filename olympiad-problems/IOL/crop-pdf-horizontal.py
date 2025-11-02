#!/usr/bin/env python3
"""
Crop PDF horizontally - keep everything above or below a certain Y position
Useful for splitting problems that share a page
"""

import pypdf
import sys
import os

def show_page_info(pdf_file, page_num=0):
    """Show page dimensions to help determine crop position"""
    reader = pypdf.PdfReader(pdf_file)
    page = reader.pages[page_num]

    # Get page dimensions
    box = page.mediabox
    width = float(box.width)
    height = float(box.height)

    print(f"PDF: {pdf_file}")
    print(f"Page {page_num + 1} dimensions:")
    print(f"  Width: {width} points")
    print(f"  Height: {height} points")
    print(f"  (1 inch = 72 points)")
    print()
    print("Suggested crop positions:")
    print(f"  Top 1/3: crop_bottom={height * 2/3:.1f}")
    print(f"  Top 1/2: crop_bottom={height / 2:.1f}")
    print(f"  Bottom 1/2: crop_top={height / 2:.1f}")
    print(f"  Bottom 1/3: crop_top={height * 1/3:.1f}")
    print()

def crop_pdf(input_file, output_file, page_num=0, crop_top=None, crop_bottom=None):
    """
    Crop a PDF page horizontally

    Args:
        input_file: Path to input PDF
        output_file: Path to output PDF
        page_num: Page number (0-indexed)
        crop_top: Keep everything below this Y position (from bottom)
        crop_bottom: Keep everything above this Y position (from bottom)

    PDF coordinate system: (0,0) is bottom-left corner
    crop_top cuts from top (higher Y values)
    crop_bottom cuts from bottom (lower Y values)
    """
    reader = pypdf.PdfReader(input_file)
    page = reader.pages[page_num]

    # Get original dimensions
    box = page.mediabox
    original_height = float(box.height)

    print(f"Processing: {input_file} (page {page_num + 1})")
    print(f"Original height: {original_height} points")

    # Apply crops
    if crop_top is not None:
        page.mediabox.upper_right = (
            page.mediabox.upper_right[0],
            crop_top
        )
        print(f"Cropping from top: keeping below Y={crop_top}")

    if crop_bottom is not None:
        page.mediabox.lower_left = (
            page.mediabox.lower_left[0],
            crop_bottom
        )
        print(f"Cropping from bottom: keeping above Y={crop_bottom}")

    new_height = float(page.mediabox.height)
    print(f"New height: {new_height} points ({new_height/original_height*100:.1f}% of original)")

    # Write output
    writer = pypdf.PdfWriter()
    writer.add_page(page)

    with open(output_file, 'wb') as f:
        writer.write(f)

    print(f"✅ Created: {output_file}")
    print()

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  1. Check page dimensions:")
        print("     python3 crop-pdf-horizontal.py <input.pdf> [page_num]")
        print()
        print("  2. Crop PDF (keep top half):")
        print("     python3 crop-pdf-horizontal.py <input.pdf> <output.pdf> --page 0 --crop-bottom 400")
        print()
        print("  3. Crop PDF (keep bottom half):")
        print("     python3 crop-pdf-horizontal.py <input.pdf> <output.pdf> --page 0 --crop-top 400")
        print()
        print("Examples:")
        print("  # Show page info")
        print("  python3 crop-pdf-horizontal.py problem.pdf")
        print()
        print("  # Keep top half (above Y=400)")
        print("  python3 crop-pdf-horizontal.py problem.pdf problem-top.pdf --crop-bottom 400")
        print()
        print("  # Keep bottom half (below Y=400)")
        print("  python3 crop-pdf-horizontal.py problem.pdf problem-bottom.pdf --crop-top 400")
        sys.exit(1)

    input_file = sys.argv[1]

    if not os.path.exists(input_file):
        print(f"Error: File not found: {input_file}")
        sys.exit(1)

    # If only input file given, show page info
    if len(sys.argv) == 2 or (len(sys.argv) == 3 and sys.argv[2].isdigit()):
        page_num = int(sys.argv[2]) - 1 if len(sys.argv) == 3 else 0
        show_page_info(input_file, page_num)
        return

    # Parse arguments for cropping
    output_file = sys.argv[2]
    page_num = 0
    crop_top = None
    crop_bottom = None

    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == '--page':
            page_num = int(sys.argv[i + 1]) - 1
            i += 2
        elif sys.argv[i] == '--crop-top':
            crop_top = float(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--crop-bottom':
            crop_bottom = float(sys.argv[i + 1])
            i += 2
        else:
            i += 1

    crop_pdf(input_file, output_file, page_num, crop_top, crop_bottom)

if __name__ == '__main__':
    main()
