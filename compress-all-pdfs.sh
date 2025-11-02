#!/bin/bash
# Compress all olympiad PDFs using Ghostscript

SOURCE_DIR="/Users/skyliu/Lingohub/frontend/public/olympiad-problems"
BACKUP_DIR="/Users/skyliu/Lingohub/olympiad-problems-backup"
TEMP_DIR="/tmp/pdf-compression"

# Create backup directory
echo "📦 Creating backup of original PDFs..."
mkdir -p "$BACKUP_DIR"
rsync -a "$SOURCE_DIR/" "$BACKUP_DIR/"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Count total PDFs
TOTAL=$(find "$SOURCE_DIR" -name "*.pdf" -type f | wc -l)
echo "📊 Found $TOTAL PDF files to compress"

# Initialize counters
COUNT=0
ORIGINAL_SIZE=0
COMPRESSED_SIZE=0

# Process each PDF
find "$SOURCE_DIR" -name "*.pdf" -type f | while read -r pdf; do
    COUNT=$((COUNT + 1))

    # Get original size
    ORIG_SIZE=$(stat -f%z "$pdf")
    ORIGINAL_SIZE=$((ORIGINAL_SIZE + ORIG_SIZE))

    # Compress to temp file
    TEMP_FILE="$TEMP_DIR/$(basename "$pdf")"

    gs -sDEVICE=pdfwrite \
       -dCompatibilityLevel=1.4 \
       -dPDFSETTINGS=/ebook \
       -dNOPAUSE \
       -dQUIET \
       -dBATCH \
       -sOutputFile="$TEMP_FILE" \
       "$pdf" 2>/dev/null

    if [ $? -eq 0 ]; then
        # Get compressed size
        COMP_SIZE=$(stat -f%z "$TEMP_FILE")
        COMPRESSED_SIZE=$((COMPRESSED_SIZE + COMP_SIZE))

        # Replace original with compressed
        mv "$TEMP_FILE" "$pdf"

        # Calculate reduction for this file
        REDUCTION=$(echo "scale=1; ($ORIG_SIZE - $COMP_SIZE) * 100 / $ORIG_SIZE" | bc)

        echo "[$COUNT/$TOTAL] ✅ $(basename "$pdf"): $(($ORIG_SIZE/1024))KB → $(($COMP_SIZE/1024))KB (-${REDUCTION}%)"
    else
        echo "[$COUNT/$TOTAL] ❌ Failed: $(basename "$pdf")"
    fi
done

echo ""
echo "🎉 Compression complete!"
echo "📊 Original size: $((ORIGINAL_SIZE / 1024 / 1024)) MB"
echo "📊 Compressed size: $((COMPRESSED_SIZE / 1024 / 1024)) MB"
echo "📊 Total reduction: $(echo "scale=1; ($ORIGINAL_SIZE - $COMPRESSED_SIZE) * 100 / $ORIGINAL_SIZE" | bc)%"
echo "💾 Backup saved to: $BACKUP_DIR"

# Cleanup temp directory
rm -rf "$TEMP_DIR"
