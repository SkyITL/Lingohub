#!/usr/bin/env python3
"""
Merge all split label CSV files into PROBLEM-LABELS-COMPLETE.csv

Usage:
    python3 merge-labels.py

Output:
    PROBLEM-LABELS-COMPLETE.csv - All 432 labeled problems in one file

Quality checks performed:
- Validates all required fields are filled
- Checks for duplicate problem IDs
- Verifies category codes are valid
- Reports difficulty distribution
- Checks tag format
"""

import csv
import os
import sys
from collections import defaultdict, Counter
from pathlib import Path

# Valid category codes from PROBLEM-CATEGORIES.md
VALID_CATEGORIES = {
    'writing-systems',
    'phonetics',
    'phonology',
    'morphology-noun',
    'morphology-verb',
    'syntax',
    'semantics',
    'number-systems',
    'kinship',
    'orientation-spatial',
    'other'
}

def validate_row(row, row_num, filename):
    """Validate a single problem row. Returns list of errors."""
    errors = []

    # Check required fields
    required_fields = ['new_difficulty', 'primary_category', 'secondary_tags']
    for field in required_fields:
        if not row.get(field) or row[field].strip() == '':
            errors.append(f"Row {row_num} in {filename}: Missing {field}")

    # Validate difficulty
    if row.get('new_difficulty'):
        try:
            diff = int(row['new_difficulty'])
            if diff not in [1, 2, 3, 4, 5]:
                errors.append(f"Row {row_num} in {filename}: Invalid difficulty {diff} (must be 1-5)")
        except ValueError:
            errors.append(f"Row {row_num} in {filename}: Difficulty must be a number")

    # Validate category
    if row.get('primary_category'):
        if row['primary_category'] not in VALID_CATEGORIES:
            errors.append(f"Row {row_num} in {filename}: Invalid category '{row['primary_category']}'")

    # Validate tags format
    if row.get('secondary_tags'):
        tags = row['secondary_tags'].split(',')
        if len(tags) < 2:
            errors.append(f"Row {row_num} in {filename}: Need at least 2 tags, got {len(tags)}")
        if len(tags) > 5:
            errors.append(f"Row {row_num} in {filename}: Too many tags ({len(tags)}), max is 5")

        # Check for spaces (common error)
        if ', ' in row['secondary_tags']:
            errors.append(f"Row {row_num} in {filename}: Tags should be comma-separated without spaces")

    return errors

def main():
    base_dir = Path('/Users/skyliu/Lingohub')
    splits_dir = base_dir / 'labeling-splits'
    output_file = base_dir / 'PROBLEM-LABELS-COMPLETE.csv'

    print("=" * 60)
    print("MERGING PROBLEM LABELS")
    print("=" * 60)

    # Find all split files
    split_files = sorted(splits_dir.glob('LABELS-*.csv'))

    if not split_files:
        print(f"ERROR: No split files found in {splits_dir}")
        sys.exit(1)

    print(f"\nFound {len(split_files)} split files to merge:")
    for f in split_files:
        print(f"  - {f.name}")

    # Data structures
    all_problems = []
    seen_ids = set()
    errors = []

    # Statistics
    stats = {
        'total_problems': 0,
        'by_source': Counter(),
        'by_difficulty': Counter(),
        'by_category': Counter(),
        'incomplete': 0
    }

    # Read all split files
    print("\nReading and validating split files...")
    header = None

    for split_file in split_files:
        filename = split_file.name
        print(f"  Processing {filename}...", end=' ')

        with open(split_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            # Store header from first file
            if header is None:
                header = reader.fieldnames

            file_problems = 0
            for row_num, row in enumerate(reader, start=2):  # start=2 because of header
                # Check for duplicate IDs
                problem_id = row['id']
                if problem_id in seen_ids:
                    errors.append(f"Duplicate problem ID: {problem_id} in {filename}")
                seen_ids.add(problem_id)

                # Validate row
                row_errors = validate_row(row, row_num, filename)
                errors.extend(row_errors)

                # Collect statistics
                stats['total_problems'] += 1
                stats['by_source'][row['source']] += 1

                if row.get('new_difficulty'):
                    stats['by_difficulty'][row['new_difficulty']] += 1
                else:
                    stats['incomplete'] += 1

                if row.get('primary_category'):
                    stats['by_category'][row['primary_category']] += 1

                # Add to results
                all_problems.append(row)
                file_problems += 1

            print(f"{file_problems} problems")

    # Report errors
    print("\n" + "=" * 60)
    print("VALIDATION RESULTS")
    print("=" * 60)

    if errors:
        print(f"\n❌ Found {len(errors)} errors:\n")
        for error in errors[:20]:  # Show first 20 errors
            print(f"  • {error}")
        if len(errors) > 20:
            print(f"\n  ... and {len(errors) - 20} more errors")
        print("\n⚠️  Please fix errors before continuing!")
        sys.exit(1)
    else:
        print("\n✅ All validation checks passed!")

    # Report statistics
    print("\n" + "=" * 60)
    print("STATISTICS")
    print("=" * 60)

    print(f"\n📊 Total problems: {stats['total_problems']}")

    print(f"\n📁 By source:")
    for source, count in sorted(stats['by_source'].items()):
        pct = (count / stats['total_problems']) * 100
        print(f"  {source:10s}: {count:3d} problems ({pct:5.1f}%)")

    print(f"\n⭐ By difficulty:")
    for diff in ['1', '2', '3', '4', '5']:
        count = stats['by_difficulty'][diff]
        pct = (count / stats['total_problems']) * 100 if stats['total_problems'] > 0 else 0
        stars = '★' * int(diff)
        print(f"  {diff}★ {stars:5s}: {count:3d} problems ({pct:5.1f}%)")

    if stats['incomplete'] > 0:
        print(f"\n⚠️  Incomplete: {stats['incomplete']} problems missing difficulty")

    print(f"\n📂 By category:")
    for category, count in stats['by_category'].most_common():
        pct = (count / stats['total_problems']) * 100
        print(f"  {category:25s}: {count:3d} ({pct:5.1f}%)")

    # Write merged file
    print("\n" + "=" * 60)
    print("WRITING OUTPUT")
    print("=" * 60)

    print(f"\nWriting to {output_file}...")

    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(all_problems)

    print(f"✅ Successfully wrote {len(all_problems)} problems to {output_file.name}")

    # Final summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    print(f"""
✅ Merge completed successfully!

📄 Output file: {output_file.name}
🔢 Total problems: {stats['total_problems']}
📁 Split files merged: {len(split_files)}
❌ Validation errors: 0

Next steps:
1. Open {output_file.name} and spot-check random problems
2. Verify the difficulty distribution looks reasonable
3. Check that all categories are spelled correctly
4. Ready to import into database!
""")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
