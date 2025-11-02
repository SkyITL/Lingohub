#!/bin/bash

# Upload olympiad problems to Vercel backend
# Usage: ./upload-to-vercel.sh [test|full]

MODE=${1:-test}
BACKEND_URL="https://lingohub-backend.vercel.app"

if [ "$MODE" = "test" ]; then
    FILE="lingohub-test-upload.json"
    CLEAR="true"
    echo "📦 Uploading TEST data (20 problems)..."
else
    FILE="lingohub-olympiad-problems.json"
    CLEAR="true"
    echo "📦 Uploading FULL data (620 problems)..."
fi

if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    exit 1
fi

echo "   File: $FILE"
echo "   Backend: $BACKEND_URL"
echo "   Clear existing: $CLEAR"
echo ""

# Prepare JSON payload
PAYLOAD=$(cat "$FILE" | jq --arg clear "$CLEAR" '{problems: .problems, clearExisting: ($clear == "true")}')

# Upload
echo "🚀 Uploading to $BACKEND_URL/api/olympiad/batch-import..."
echo ""

RESPONSE=$(curl -X POST "$BACKEND_URL/api/olympiad/batch-import" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    -w "\nHTTP_STATUS:%{http_code}" \
    --silent)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$BODY" | jq '.'

if [ "$HTTP_STATUS" = "200" ]; then
    echo ""
    echo "✅ Upload successful!"
    echo "$BODY" | jq -r '"   Imported: \(.stats.imported)\n   Updated: \(.stats.updated)\n   Failed: \(.stats.failed)\n   Database total: \(.stats.databaseTotal)"'
else
    echo ""
    echo "❌ Upload failed with HTTP status: $HTTP_STATUS"
    exit 1
fi
