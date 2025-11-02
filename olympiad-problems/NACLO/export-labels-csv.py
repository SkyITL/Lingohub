#!/usr/bin/env python3
"""
Export NACLO problem labels to CSV for easy viewing and editing
"""

import json
import csv

def export_to_csv():
    """Convert JSON database to CSV format"""

    # Load JSON database
    with open('naclo-problems-labeled.json', 'r', encoding='utf-8') as f:
        db = json.load(f)

    # Export to CSV
    with open('naclo-problems-labels.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)

        # Header
        writer.writerow([
            'Problem ID',
            'Year',
            'Number',
            'Title',
            'Difficulty',
            'Tags',
            'Status',
            'Notes'
        ])

        # Data rows
        for problem in db['problems']:
            writer.writerow([
                problem['id'],
                problem['year'],
                problem['number'],
                problem.get('title', ''),
                problem['estimated_difficulty'],
                ', '.join(problem['tags']),
                problem.get('status', 'auto-generated'),
                problem.get('notes', '')
            ])

    print(f"✅ Exported {len(db['problems'])} problems to naclo-problems-labels.csv")
    print()
    print("You can now:")
    print("  1. Open the CSV in Excel/Google Sheets")
    print("  2. Manually verify and update tags")
    print("  3. Import back to JSON if needed")

def create_summary():
    """Create a summary view by year and difficulty"""

    with open('naclo-problems-labeled.json', 'r', encoding='utf-8') as f:
        db = json.load(f)

    # Group by year and difficulty
    summary = {}
    for problem in db['problems']:
        year = problem['year']
        diff = problem['estimated_difficulty']

        if year not in summary:
            summary[year] = {1: 0, 2: 0, 3: 0, 4: 0}

        summary[year][diff] += 1

    # Write summary
    with open('naclo-problems-summary.txt', 'w', encoding='utf-8') as f:
        f.write("NACLO Problems Summary by Year and Difficulty\n")
        f.write("=" * 60 + "\n\n")

        f.write(f"{'Year':<8} {'Total':<8} {'Beginner':<12} {'Intermediate':<15} {'Advanced':<10}\n")
        f.write("-" * 60 + "\n")

        total_all = 0
        total_by_diff = {1: 0, 2: 0, 3: 0, 4: 0}

        for year in sorted(summary.keys()):
            total_year = sum(summary[year].values())
            total_all += total_year

            for diff in [1, 2, 3, 4]:
                total_by_diff[diff] += summary[year][diff]

            f.write(f"{year:<8} {total_year:<8} {summary[year][1]:<12} {summary[year][2]:<15} {summary[year][3]:<10}\n")

        f.write("-" * 60 + "\n")
        f.write(f"{'TOTAL':<8} {total_all:<8} {total_by_diff[1]:<12} {total_by_diff[2]:<15} {total_by_diff[3]:<10}\n")

    print("✅ Created summary in naclo-problems-summary.txt")

if __name__ == '__main__':
    print("Exporting NACLO problem labels...\n")
    export_to_csv()
    print()
    create_summary()
    print("\nDone!")
