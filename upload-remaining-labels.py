#!/usr/bin/env python3
"""
Upload remaining problem labels that failed due to rate limiting.
This script will upload problems 88-397 (the ones that hit rate limits).
"""

import csv
import json
import subprocess
import sys
import time

def read_labels_csv(filepath):
    """Read labels from CSV file."""
    labels = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
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

def upload_labels_with_delay(labels, api_url, start_idx, end_idx, delay=2):
    """Upload labels with delay between requests to avoid rate limiting."""
    print(f"Uploading problems {start_idx+1} to {end_idx} with {delay}s delay between requests...")

    total_updated = 0
    total_errors = 0

    for i in range(start_idx, min(end_idx, len(labels))):
        label = labels[i]
        batch_num = i + 1

        print(f"Problem {batch_num}/{len(labels)}: {label['number']}...", end=' ', flush=True)

        try:
            payload = json.dumps({'labels': [label]})

            result = subprocess.run(
                ['curl', '-s', '-k', '-X', 'POST', api_url,
                 '-H', 'Content-Type: application/json',
                 '-d', payload,
                 '--max-time', '30'],
                capture_output=True,
                text=True,
                timeout=35
            )

            if result.returncode == 0:
                try:
                    response_data = json.loads(result.stdout)
                    updated = response_data.get('updated', 0)

                    if updated > 0:
                        print("✓")
                        total_updated += 1
                    else:
                        print(f"⚠ No update")
                        total_errors += 1
                except json.JSONDecodeError:
                    if 'Too many requests' in result.stdout:
                        print("⚠ Rate limited (will retry)")
                        total_errors += 1
                        # Wait longer if rate limited
                        time.sleep(5)
                    else:
                        print(f"✗ Invalid response: {result.stdout[:50]}")
                        total_errors += 1
            else:
                print(f"✗ Curl error")
                total_errors += 1

        except Exception as e:
            print(f"✗ Exception: {e}")
            total_errors += 1

        # Delay between requests to avoid rate limiting
        if i < end_idx - 1:
            time.sleep(delay)

    print(f"\n{'='*60}")
    print(f"Batch Upload Complete!")
    print(f"{'='*60}")
    print(f"Successfully updated: {total_updated}")
    print(f"Errors: {total_errors}")

    return total_updated, total_errors

def main():
    csv_file = '/Users/skyliu/Lingohub/PROBLEM-LABELS-FINAL.csv'
    api_url = 'https://lingohub-backend.vercel.app/api/admin/problems/upload-labels'

    print("Reading labels from CSV...")
    labels = read_labels_csv(csv_file)
    print(f"Found {len(labels)} complete labels\n")

    # Upload the problems that failed (88-397, 0-indexed: 87-396)
    print("Uploading remaining 310 problems that hit rate limits...\n")
    updated, errors = upload_labels_with_delay(labels, api_url, 87, 397, delay=2)

    print(f"\n{'='*60}")
    print(f"FINAL SUMMARY")
    print(f"{'='*60}")
    print(f"Previously successful: 122 problems")
    print(f"This run successful: {updated} problems")
    print(f"Total successful: {122 + updated}/{len(labels)}")
    print(f"Remaining: {len(labels) - 122 - updated}")

    if errors > 0:
        print(f"\n⚠ {errors} problems still need to be uploaded")
        sys.exit(1)
    else:
        print(f"\n✅ All problems uploaded successfully!")
        sys.exit(0)

if __name__ == '__main__':
    main()
