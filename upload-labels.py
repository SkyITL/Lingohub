#!/usr/bin/env python3
"""
Upload problem labels from CSV to the production database.
Reads PROBLEM-LABELS-FINAL.csv and sends data to the API.
"""

import csv
import json
import subprocess
import sys

def read_labels_csv(filepath):
    """Read labels from CSV file."""
    labels = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Only include problems with complete labels
            if (row.get('new_difficulty') and row['new_difficulty'].strip()
                and row.get('primary_category') and row['primary_category'].strip()):
                labels.append({
                    'number': row['number'],
                    'new_difficulty': row['new_difficulty'],
                    'primary_category': row['primary_category'],
                    'secondary_tags': row.get('secondary_tags', ''),
                    'notes': row.get('notes', '')
                })
    return labels

def upload_labels(labels, api_url, batch_size=10):
    """Upload labels to API in batches using curl."""
    total = len(labels)
    print(f"Uploading {total} problem labels to {api_url}")
    print(f"Batch size: {batch_size}\n")

    total_updated = 0
    total_not_found = 0
    all_errors = []

    # Process in batches to avoid timeout
    for i in range(0, total, batch_size):
        batch = labels[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total + batch_size - 1) // batch_size

        print(f"Batch {batch_num}/{total_batches}: Uploading {len(batch)} labels...")

        try:
            # Use curl via subprocess to avoid SSL issues
            payload = json.dumps({'labels': batch})

            result = subprocess.run([
                'curl', '-s', '-k', '-X', 'POST', api_url,
                '-H', 'Content-Type: application/json',
                '-d', payload,
                '--max-time', '120'
            ], capture_output=True, text=True, timeout=130)

            if result.returncode == 0:
                try:
                    response_data = json.loads(result.stdout)
                    updated = response_data.get('updated', 0)
                    not_found = response_data.get('notFound', 0)
                    errors = response_data.get('errors', [])

                    total_updated += updated
                    total_not_found += not_found
                    if errors:
                        all_errors.extend(errors)

                    print(f"  ✓ Updated: {updated}, Not found: {not_found}")
                    if errors:
                        print(f"  ⚠ Errors: {len(errors)}")
                        for error in errors[:3]:  # Show first 3 errors
                            print(f"    - {error}")
                except json.JSONDecodeError as e:
                    print(f"  ✗ Invalid JSON response: {result.stdout[:100]}")
                    all_errors.append(f"Batch {batch_num} invalid JSON: {e}")
            else:
                print(f"  ✗ Curl failed: {result.stderr}")
                all_errors.append(f"Batch {batch_num} curl error: {result.stderr}")

        except Exception as e:
            print(f"  ✗ Exception: {e}")
            all_errors.append(f"Batch {batch_num} exception: {e}")

    print(f"\n{'='*60}")
    print(f"Upload Complete!")
    print(f"{'='*60}")
    print(f"Total problems processed: {total}")
    print(f"Successfully updated: {total_updated}")
    print(f"Not found in database: {total_not_found}")

    if all_errors:
        print(f"\n⚠ Errors encountered: {len(all_errors)}")
        print("\nFirst 10 errors:")
        for error in all_errors[:10]:
            print(f"  - {error}")
    else:
        print(f"\n✅ No errors!")

    return total_updated, total_not_found, all_errors

def main():
    csv_file = '/Users/skyliu/Lingohub/PROBLEM-LABELS-FINAL.csv'
    api_url = 'https://lingohub-backend.vercel.app/api/admin/problems/upload-labels'

    print("Reading labels from CSV...")
    labels = read_labels_csv(csv_file)
    print(f"Found {len(labels)} complete labels\n")

    # Upload (skip confirmation for automated runs)
    print(f"Uploading {len(labels)} labels to production...\n")
    updated, not_found, errors = upload_labels(labels, api_url, batch_size=1)

    # Exit code based on results
    if not_found > 0 or errors:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    main()
