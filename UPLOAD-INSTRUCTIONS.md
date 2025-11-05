# Problem Labels Upload Instructions

## Summary

All 432 linguistics olympiad problems have been labeled with:
- Difficulty ratings (1-5 stars)
- Primary categories (11 categories like morphology-verb, phonology, syntax, etc.)
- Secondary tags (language families, regions, features)
- Optional notes

The labels are ready to upload to the production database.

## Files

1. **PROBLEM-LABELS-FINAL.csv** - Contains all 432 labeled problems
2. **upload-labels.py** - Python script to upload labels to production API
3. **backend/src/routes/admin.ts** - Backend endpoint for receiving uploads

## Upload Endpoint

The new admin endpoint has been deployed to Vercel:
- **URL**: `POST /api/admin/problems/upload-labels`
- **Endpoint**: `https://lingohub-backend.vercel.app/api/admin/problems/upload-labels`
- **Method**: POST
- **Body**: `{"labels": [...]}`  (array of problem label objects)

### What the Endpoint Does

For each problem label:
1. Finds the problem by `number` field (e.g., "LH-IOL-2023-1")
2. Updates `difficulty` and `rating` fields based on `new_difficulty`:
   - difficulty 1 → rating 1000
   - difficulty 2 → rating 1200
   - difficulty 3 → rating 1400
   - difficulty 4 → rating 1600
   - difficulty 5 → rating 2000
3. Creates/links tags from `primary_category` and `secondary_tags` fields
4. Returns stats on updated/not found problems

## How to Upload

### Option 1: Run the Python Script (Recommended)

```bash
cd /Users/skyliu/Lingohub
python3 upload-labels.py
```

The script will:
- Read all 432 labels from PROBLEM-LABELS-FINAL.csv
- Ask for confirmation before uploading
- Upload in batches of 50 to avoid timeouts
- Show progress for each batch
- Display final statistics

### Option 2: Manual curl (for testing)

Test with a single problem:
```bash
curl -sk -X POST 'https://lingohub-backend.vercel.app/api/admin/problems/upload-labels' \
  -H 'Content-Type: application/json' \
  -d '{
    "labels": [{
      "number": "LH-IOL-2023-1",
      "new_difficulty": "3",
      "primary_category": "morphology-verb",
      "secondary_tags": "pattern-recognition,native-american,americas"
    }]
  }'
```

## Troubleshooting

### If the script fails with network errors:

1. **Check backend deployment status**:
   ```bash
   curl -sk https://lingohub-backend.vercel.app/api/health
   ```
   Should return: `{"status":"ok","database":"connected","timestamp":"..."}`

2. **Verify endpoint exists**:
   ```bash
   curl -sk -X POST https://lingohub-backend.vercel.app/api/admin/problems/upload-labels \
     -H 'Content-Type: application/json' \
     -d '{"labels":[]}'
   ```
   Should return: `{"message":"Labels uploaded successfully","updated":0,"notFound":0,"total":0}`

3. **Check network connectivity**:
   - The script uses `curl -sk` to bypass SSL certificate issues
   - Make sure you have internet connectivity
   - Vercel backend should be accessible

### If SSL/TLS errors occur:

The script is configured to use `curl -k` which ignores SSL certificate verification. This is necessary due to potential SSL library issues on macOS.

## Expected Results

After successful upload:
- **Total problems processed**: 432
- **Successfully updated**: 432 (all problems should exist in database)
- **Not found**: 0 (if any problems are not found, check if they were seeded)
- **Errors**: 0

## Verification

After upload, verify the labels in production:

```bash
# Check a specific problem's tags
curl -sk 'https://lingohub-backend.vercel.app/api/problems?number=LH-IOL-2023-1'
```

You should see:
- `difficulty` and `rating` fields updated
- Tags linked to the problem

## Next Steps

After successful upload:
1. Verify a few problems have correct difficulty/tags
2. Test frontend filtering by difficulty and tags
3. Update frontend UI to display the new tags
4. Consider adding tag-based search/filtering

## Breakdown by Source

- **APLO**: 30/30 problems (100%)
- **IOL**: 110/110 problems (100%)
- **NACLO**: 292/292 problems (100%)

Total: 432/432 problems labeled and ready for upload.
