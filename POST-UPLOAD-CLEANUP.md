# Post-Upload Cleanup Instructions

After the label upload completes, run these cleanup commands to finalize the database.

## Summary of Changes Needed

1. **Remove overly common tags** (pattern-recognition, logical-reasoning)
2. **Clean up IOL problem titles** (remove language names like ": Budukh")

## Cleanup Steps

### Step 1: Wait for Vercel Deployment

The updated backend code has been pushed with:
- Tag filtering (excludes pattern-recognition, logical-reasoning)
- IOL title cleanup endpoint

Wait for Vercel to finish deploying (~2-3 minutes after git push).

### Step 2: Clean IOL Problem Titles

Remove language names from IOL problem titles:

```bash
curl -X PUT https://lingohub-backend.vercel.app/api/admin/problems/clean-iol-titles
```

**Expected result:**
```json
{
  "message": "IOL problem titles cleaned successfully",
  "updated": 25,
  "problems": [
    {
      "number": "LH-IOL-2003-1",
      "oldTitle": "IOL 2003 Problem 1: Budukh",
      "newTitle": "IOL 2003 Problem 1"
    },
    ...
  ]
}
```

### Step 3: Re-upload All Labels with Tag Filtering

Once the new code is deployed, re-run the upload to apply tag filtering:

```bash
cd /Users/skyliu/Lingohub
python3 upload-labels.py
```

This will:
- Update all 432 problems with filtered tags
- Remove "pattern-recognition" and "logical-reasoning" tags
- Keep all other tags intact

**Note:** The upload script removes existing tags and re-adds them, so running it again will apply the new filtering logic.

## Verification

After cleanup, verify the results:

### Check IOL Titles

```bash
curl -s 'https://lingohub-backend.vercel.app/api/problems?source=IOL' | \
  python3 -c "import json, sys; problems = json.load(sys.stdin)['problems']; \
  [print(f\"{p['number']}: {p['title']}\") for p in problems[:10]]"
```

Should show clean titles without language names.

### Check Tag Distribution

Query the database to verify no overly common tags exist:

```bash
# Check if pattern-recognition tag was removed
curl -s 'https://lingohub-backend.vercel.app/api/problems?tags=pattern-recognition' | \
  python3 -c "import json, sys; print(f\"Problems with pattern-recognition: {len(json.load(sys.stdin)['problems'])}\")"
```

Should return 0 problems.

## Tags That Were Filtered

**Excluded tags** (appear in >30% of problems):
1. `pattern-recognition` - 357/432 problems (82.6%)
2. `logical-reasoning` - 143/432 problems (33.1%)

**Kept tags** (appear in <30% of problems):
- `multi-step` - 129 problems (29.9%)
- All geographic tags (asia, americas, oceania, europe, africa)
- All primary categories (morphology-verb, morphology-noun, phonology, syntax, etc.)
- All language family tags
- All feature tags (complex-data, rule-discovery, beginner-friendly, etc.)

## Timeline

1. ✅ **Completed:** Upload 432 problem labels (first pass with old code)
2. ✅ **Completed:** Push tag filtering + IOL cleanup code
3. ⏳ **In Progress:** Vercel deployment (~2-3 min)
4. 🔜 **Next:** Run cleanup steps above
5. 🔜 **Final:** Verify all changes applied correctly

## Files

- `PROBLEM-LABELS-FINAL.csv` - Source data with all 432 labels
- `upload-labels.py` - Upload script (automatically filters tags on upload)
- `upload-remaining-log.txt` - Log from the upload process
- Backend: `backend/src/routes/admin.ts` - Contains filtering logic

## Current Upload Status

The initial upload is running and will complete with all 432 problems labeled, but with the old tag set (including pattern-recognition and logical-reasoning). After running the cleanup steps above, the database will have the filtered tags.
