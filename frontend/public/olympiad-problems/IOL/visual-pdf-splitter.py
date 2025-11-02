#!/usr/bin/env python3
"""
Visual PDF Splitter - Interactive tool to split PDFs by clicking on the page
Shows the PDF page and lets you click where you want to split horizontally
"""

import sys
import os
import pypdf
from pdf2image import convert_from_path
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.widgets import Button
import numpy as np

class PDFSplitter:
    def __init__(self, pdf_file, page_num=0):
        self.pdf_file = pdf_file
        self.page_num = page_num
        self.split_lines = []
        self.reader = pypdf.PdfReader(pdf_file)

        # Convert PDF page to image
        print(f"Loading page {page_num + 1} from {pdf_file}...")
        images = convert_from_path(pdf_file, first_page=page_num + 1, last_page=page_num + 1, dpi=150)
        self.image = images[0]
        self.img_array = np.array(self.image)

        # Get PDF dimensions
        page = self.reader.pages[page_num]
        self.pdf_height = float(page.mediabox.height)
        self.pdf_width = float(page.mediabox.width)
        self.img_height = self.img_array.shape[0]

        # Setup matplotlib figure
        self.fig, self.ax = plt.subplots(figsize=(12, 16))
        self.fig.canvas.manager.set_window_title(f'PDF Splitter - {os.path.basename(pdf_file)} (Page {page_num + 1})')

        # Display the image
        self.ax.imshow(self.img_array)
        self.ax.set_title('Click on the page to add horizontal split lines\nRed lines = where to split',
                         fontsize=14, pad=20)
        self.ax.axis('on')

        # Add instructions
        instructions = (
            "INSTRUCTIONS:\n"
            "• Click anywhere on the page to add a split line\n"
            "• Click 'Clear All' to remove all lines\n"
            "• Click 'Split PDF' to create the separate files\n"
            "• Close window to cancel"
        )
        self.ax.text(0.02, 0.98, instructions, transform=self.ax.transAxes,
                    fontsize=10, verticalalignment='top',
                    bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

        # Connect click event
        self.cid = self.fig.canvas.mpl_connect('button_press_event', self.on_click)

        # Add buttons
        ax_clear = plt.axes([0.3, 0.02, 0.15, 0.04])
        ax_split = plt.axes([0.55, 0.02, 0.15, 0.04])
        self.btn_clear = Button(ax_clear, 'Clear All')
        self.btn_split = Button(ax_split, 'Split PDF')
        self.btn_clear.on_clicked(self.clear_all)
        self.btn_split.on_clicked(self.split_pdf)

    def on_click(self, event):
        """Handle mouse click to add split line"""
        if event.inaxes != self.ax:
            return

        # Don't process clicks on buttons
        if event.y < 50:  # Rough button area
            return

        y_img = event.ydata
        if y_img is None:
            return

        # Convert image Y to PDF Y (PDF origin is bottom-left)
        y_pdf = self.pdf_height * (1 - y_img / self.img_height)

        # Add line
        self.split_lines.append((y_img, y_pdf))

        # Draw the line
        line = self.ax.axhline(y=y_img, color='red', linewidth=2, linestyle='--', alpha=0.7)

        # Add text showing PDF Y coordinate
        self.ax.text(10, y_img - 20, f'Split at Y={y_pdf:.1f}',
                    color='red', fontsize=10, weight='bold',
                    bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

        self.fig.canvas.draw()
        print(f"Added split line at Y={y_pdf:.1f} (image Y={y_img:.1f})")

    def clear_all(self, event):
        """Clear all split lines"""
        self.split_lines = []
        # Redraw image
        self.ax.clear()
        self.ax.imshow(self.img_array)
        self.ax.set_title('Click on the page to add horizontal split lines\nRed lines = where to split',
                         fontsize=14, pad=20)
        instructions = (
            "INSTRUCTIONS:\n"
            "• Click anywhere on the page to add a split line\n"
            "• Click 'Clear All' to remove all lines\n"
            "• Click 'Split PDF' to create the separate files\n"
            "• Close window to cancel"
        )
        self.ax.text(0.02, 0.98, instructions, transform=self.ax.transAxes,
                    fontsize=10, verticalalignment='top',
                    bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
        self.fig.canvas.draw()
        print("Cleared all split lines")

    def split_pdf(self, event):
        """Split the PDF based on the lines"""
        if not self.split_lines:
            print("No split lines defined! Click on the page first.")
            return

        # Sort lines by Y position (top to bottom in image coordinates)
        sorted_lines = sorted(self.split_lines, key=lambda x: x[0])

        print(f"\nSplitting PDF into {len(sorted_lines) + 1} parts...")

        # Define regions
        regions = []

        # First region: top to first line
        regions.append((None, sorted_lines[0][1]))

        # Middle regions
        for i in range(len(sorted_lines) - 1):
            regions.append((sorted_lines[i][1], sorted_lines[i + 1][1]))

        # Last region: last line to bottom
        regions.append((sorted_lines[-1][1], None))

        # Create output files
        base_name = os.path.splitext(self.pdf_file)[0]

        for i, (crop_top, crop_bottom) in enumerate(regions, 1):
            output_file = f"{base_name}-part{i}.pdf"

            # Read page
            page = self.reader.pages[self.page_num]

            # Apply crops
            if crop_top is not None:
                page.mediabox.upper_right = (
                    page.mediabox.upper_right[0],
                    crop_top
                )

            if crop_bottom is not None:
                page.mediabox.lower_left = (
                    page.mediabox.lower_left[0],
                    crop_bottom
                )

            # Write output
            writer = pypdf.PdfWriter()
            writer.add_page(page)

            with open(output_file, 'wb') as f:
                writer.write(f)

            print(f"  ✅ Created: {output_file}")
            if crop_top:
                print(f"      Top: Y={crop_top:.1f}")
            if crop_bottom:
                print(f"      Bottom: Y={crop_bottom:.1f}")

        print(f"\n✅ Split complete! Created {len(regions)} files.")
        plt.close(self.fig)

    def show(self):
        """Show the interactive window"""
        plt.tight_layout()
        plt.show()

def main():
    if len(sys.argv) < 2:
        print("Visual PDF Splitter")
        print("=" * 60)
        print("Usage: python3 visual-pdf-splitter.py <pdf-file> [page-number]")
        print()
        print("Examples:")
        print("  python3 visual-pdf-splitter.py problem.pdf")
        print("  python3 visual-pdf-splitter.py problem.pdf 2")
        print()
        print("This will open a window showing the PDF page.")
        print("Click on the page to add horizontal split lines.")
        print("Then click 'Split PDF' to create the separate files.")
        sys.exit(1)

    pdf_file = sys.argv[1]
    page_num = int(sys.argv[2]) - 1 if len(sys.argv) > 2 else 0

    if not os.path.exists(pdf_file):
        print(f"Error: File not found: {pdf_file}")
        sys.exit(1)

    splitter = PDFSplitter(pdf_file, page_num)
    splitter.show()

if __name__ == '__main__':
    main()
