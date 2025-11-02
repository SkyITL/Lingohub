#!/usr/bin/env python3
"""
Download missing UKLO problems based on the database Excel file
and rename them with language and area information
"""

import pandas as pd
import os
import re
import subprocess
import time

# Read the Excel database
df = pd.read_excel('database/uklo-problem-area-diff-table.xlsx')

# Get all existing files (case-insensitive)
existing_files = set()
for root, dirs, files in os.walk('by-year'):
    for file in files:
        if file.endswith(('.pdf', '.doc', '.docx')):
            # Store both the filename and the full path
            existing_files.add(file.lower())

print(f"Total problems in database: {len(df)}")
print(f"Total existing files: {len(existing_files)}")
print()

# Track downloads
downloaded = 0
failed = 0
skipped = 0

# Process each row
for idx, row in df.iterrows():
    url = row['download']
    year = int(row['year']) if not pd.isna(row['year']) else 0
    name = row['number, name']
    language = row['language'] if not pd.isna(row['language']) else 'unknown'
    area = row['area'] if not pd.isna(row['area']) else 'unknown'

    if pd.isna(url) or not url:
        skipped += 1
        continue

    # Extract original filename from URL
    orig_filename = url.split('/')[-1]

    # Clean language and area names for filename
    lang_clean = re.sub(r'[^\w\s-]', '', language).strip().replace(' ', '-')
    area_clean = re.sub(r'[^\w\s-]', '', area).strip().replace(' ', '-')

    # Create new filename with language and area
    # Format: uklo-YEAR-original-name-LANGUAGE-AREA.ext
    ext = os.path.splitext(orig_filename)[1]
    base_name = os.path.splitext(orig_filename)[0]

    # Check if this file already exists (case-insensitive match)
    if any(orig_filename.lower() in f or f in orig_filename.lower() for f in existing_files):
        skipped += 1
        continue

    # New filename with metadata
    new_filename = f"uklo-{year}-{base_name}-{lang_clean}-{area_clean}{ext}"

    # Determine year folder
    year_folder = f"by-year/{year}"
    if not os.path.exists(year_folder):
        os.makedirs(year_folder, exist_ok=True)

    # Full path
    filepath = os.path.join(year_folder, new_filename)

    # Download the file
    print(f"Downloading: {name} ({language} - {area})")
    print(f"  URL: {url}")
    print(f"  -> {filepath}")

    try:
        result = subprocess.run([
            'curl', '-s', '-f', '-L', '-A', 'Mozilla/5.0',
            '-o', filepath, url
        ], capture_output=True, timeout=30)

        if result.returncode == 0 and os.path.exists(filepath):
            file_size = os.path.getsize(filepath)
            if file_size > 500:  # More than 500 bytes (not an error page)
                print(f"  ✓ Downloaded ({file_size} bytes)")
                downloaded += 1
                existing_files.add(new_filename.lower())
            else:
                print(f"  ⚠️  File too small (likely error page), removing")
                os.remove(filepath)
                failed += 1
        else:
            print(f"  ✗ Failed to download")
            failed += 1
    except Exception as e:
        print(f"  ✗ Error: {e}")
        failed += 1

    # Be polite to the server
    time.sleep(0.5)

    # Progress update every 10 files
    if (downloaded + failed + skipped) % 10 == 0:
        print(f"\nProgress: {downloaded} downloaded, {failed} failed, {skipped} skipped\n")

print("\n" + "="*60)
print("Download Summary")
print("="*60)
print(f"Downloaded: {downloaded}")
print(f"Failed: {failed}")
print(f"Skipped: {skipped}")
print(f"Total: {downloaded + failed + skipped}")
