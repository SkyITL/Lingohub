#!/usr/bin/env python3
"""Export IOL problem labels to CSV"""

import json
import csv

with open('iol-problems-labeled.json', 'r') as f:
    db = json.load(f)

# Export to CSV
with open('iol-problems-labels.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)

    # Header
    writer.writerow([
        'Problem ID',
        'Year',
        'Number',
        'Title',
        'Language',
        'Family',
        'Difficulty',
        'Tags',
        'Source File',
        'Status'
    ])

    # Data
    for p in db['problems']:
        writer.writerow([
            p['id'],
            p['year'],
            p['number'],
            p['title'],
            p['language'],
            p['family'],
            p['estimated_difficulty'],
            ', '.join(p['tags']),
            p['source_file'],
            p['status']
        ])

print("✅ Exported to iol-problems-labels.csv")
print(f"Total problems: {len(db['problems'])}")
