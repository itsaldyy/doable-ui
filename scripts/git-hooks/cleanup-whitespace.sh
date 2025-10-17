#!/bin/bash
# cleanup-whitespace.sh
# Removes excessive blank lines and trailing whitespace from staged files

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/logging.sh"

log_info "Running whitespace cleanup..."

# Get list of staged files (excluding deleted files)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d)

if [ -z "$STAGED_FILES" ]; then
  log_success "No staged files to check"
  exit 0
fi

# Counter for modified files
MODIFIED_COUNT=0

# Process each staged file
while IFS= read -r file; do
  # Skip binary files and non-text files
  if file "$file" | grep -q "text"; then
    ORIGINAL_HASH=$(md5sum "$file" | cut -d' ' -f1)

    # Remove trailing whitespace
    sed -i 's/[[:space:]]*$//' "$file"

    # Remove excessive blank lines (more than 2 consecutive)
    # This keeps at most 1 blank line between content
    awk 'BEGIN{blank=0} /^[[:space:]]*$/{blank++; if(blank<=1) print; next} {blank=0; print}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

    # Ensure file ends with a newline (POSIX standard)
    # Check if last character is not a newline
    if [ -n "$(tail -c 1 "$file" 2>/dev/null)" ]; then
      echo "" >> "$file"
    fi

    NEW_HASH=$(md5sum "$file" | cut -d' ' -f1)

    # If file was modified, re-stage it
    if [ "$ORIGINAL_HASH" != "$NEW_HASH" ]; then
      git add "$file"
      log_warning "Cleaned whitespace in: $file"
      ((MODIFIED_COUNT++))
    fi
  fi
done <<< "$STAGED_FILES"

if [ $MODIFIED_COUNT -gt 0 ]; then
  log_success "Cleaned whitespace in $MODIFIED_COUNT file(s)"
else
  log_success "No whitespace issues found"
fi

exit 0
