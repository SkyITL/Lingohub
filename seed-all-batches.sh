#!/bin/bash

# Seed all 432 problems in batches to avoid Vercel timeout
# 432 problems ÷ 50 per batch = 9 batches (0-8)

API_URL="https://lingohub-backend.vercel.app/api/seed/run"
BATCH_SIZE=10
TOTAL_PROBLEMS=432
TOTAL_BATCHES=$(( (TOTAL_PROBLEMS + BATCH_SIZE - 1) / BATCH_SIZE ))

echo "🌱 Seeding $TOTAL_PROBLEMS problems in $TOTAL_BATCHES batches of $BATCH_SIZE"
echo ""

for batch in $(seq 0 $((TOTAL_BATCHES - 1))); do
  echo "📦 Batch $batch of $((TOTAL_BATCHES - 1))..."

  response=$(curl -s -X POST "$API_URL?batch=$batch&size=$BATCH_SIZE")

  # Check if successful
  if echo "$response" | grep -q '"success":true'; then
    echo "   ✅ Success"
    echo "$response" | python3 -c "import json, sys; d=json.load(sys.stdin); print(f\"   Processed: {d['problems']['processed']}/{d['problems']['total']}, Created: {d['problems']['created']}, Updated: {d['problems']['updated']}\")"
  else
    echo "   ❌ Failed"
    echo "$response"
    exit 1
  fi

  echo ""

  # Small delay between batches
  sleep 2
done

echo "✅ All batches completed! Database seeded with $TOTAL_PROBLEMS problems."
