#!/bin/bash

# Image optimization script for Hugo blog
# Requirements:
# - imagemagick (install with: brew install imagemagick)
# - webp (install with: brew install webp)

set -e

# Configuration
MAX_WIDTH=1200
JPEG_QUALITY=85
PNG_QUALITY=85
WEBP_QUALITY=80

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting image optimization...${NC}"

# Check if required tools are installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}ImageMagick is not installed. Install it with: brew install imagemagick${NC}"
    exit 1
fi

if ! command -v cwebp &> /dev/null; then
    echo -e "${YELLOW}WebP tools not installed. Install with: brew install webp${NC}"
    echo -e "${YELLOW}Continuing without WebP conversion...${NC}"
    WEBP_AVAILABLE=false
else
    WEBP_AVAILABLE=true
fi

# Create backup directory
BACKUP_DIR="static/images/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Process images
TOTAL_BEFORE=0
TOTAL_AFTER=0
COUNT=0

# Function to format file size
format_size() {
    numfmt --to=iec-i --suffix=B "$1"
}

# Process each image
for img in static/images/*.{jpg,jpeg,png,gif}; do
    # Skip if no matching files
    [ -f "$img" ] || continue

    # Skip backup directories
    [[ "$img" == *"/backup-"* ]] && continue

    filename=$(basename "$img")
    extension="${filename##*.}"
    name="${filename%.*}"

    # Get original size
    original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    TOTAL_BEFORE=$((TOTAL_BEFORE + original_size))

    echo -e "\n${YELLOW}Processing: $filename${NC}"
    echo "  Original size: $(format_size $original_size)"

    # Backup original
    cp "$img" "$BACKUP_DIR/$filename"

    # Optimize based on file type
    case "$extension" in
        jpg|jpeg)
            # Resize if wider than MAX_WIDTH and optimize JPEG
            convert "$img" \
                -resize "${MAX_WIDTH}>" \
                -quality $JPEG_QUALITY \
                -sampling-factor 4:2:0 \
                -strip \
                -interlace Plane \
                -colorspace sRGB \
                "$img.tmp"
            mv "$img.tmp" "$img"
            ;;
        png)
            # Resize if wider than MAX_WIDTH and optimize PNG
            convert "$img" \
                -resize "${MAX_WIDTH}>" \
                -quality $PNG_QUALITY \
                -strip \
                -define png:compression-filter=5 \
                -define png:compression-level=9 \
                -define png:compression-strategy=1 \
                "$img.tmp"
            mv "$img.tmp" "$img"
            ;;
        gif)
            # Optimize GIF (keep animations)
            convert "$img" \
                -resize "${MAX_WIDTH}>" \
                -layers Optimize \
                -fuzz 5% \
                "$img.tmp"
            mv "$img.tmp" "$img"
            ;;
    esac

    # Create WebP version if available
    if $WEBP_AVAILABLE && [[ "$extension" != "gif" ]]; then
        output_webp="static/images/${name}.webp"
        if [ ! -f "$output_webp" ] || [ "$img" -nt "$output_webp" ]; then
            cwebp -q $WEBP_QUALITY "$img" -o "$output_webp" 2>/dev/null
            webp_size=$(stat -f%z "$output_webp" 2>/dev/null || stat -c%s "$output_webp" 2>/dev/null)
            echo "  Created WebP: $(format_size $webp_size)"
        fi
    fi

    # Get new size
    new_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    TOTAL_AFTER=$((TOTAL_AFTER + new_size))

    # Calculate savings
    saved=$((original_size - new_size))
    percent=$((saved * 100 / original_size))

    echo "  Optimized size: $(format_size $new_size)"
    echo -e "  ${GREEN}Saved: $(format_size $saved) (${percent}%)${NC}"

    COUNT=$((COUNT + 1))
done

# Summary
echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}Optimization Complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo "Images processed: $COUNT"
echo "Total size before: $(format_size $TOTAL_BEFORE)"
echo "Total size after: $(format_size $TOTAL_AFTER)"
TOTAL_SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
if [ $TOTAL_BEFORE -gt 0 ]; then
    TOTAL_PERCENT=$((TOTAL_SAVED * 100 / TOTAL_BEFORE))
    echo -e "${GREEN}Total saved: $(format_size $TOTAL_SAVED) (${TOTAL_PERCENT}%)${NC}"
fi
echo -e "\nOriginal images backed up to: ${BACKUP_DIR}"
echo -e "\n${YELLOW}Tip: Use <picture> element in HTML to serve WebP with fallback:${NC}"
echo '<picture>'
echo '  <source srcset="/images/image.webp" type="image/webp">'
echo '  <img src="/images/image.jpg" alt="Description">'
echo '</picture>'