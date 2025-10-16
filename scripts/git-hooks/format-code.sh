#!/bin/bash
# format-code.sh
# Runs Prettier formatting on staged files

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/logging.sh"

log_info "Running Prettier formatting..."

# Get staged files that Prettier can format
# Prettier supports: js, jsx, ts, tsx, json, css, scss, md, html, yaml, etc.
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d | grep -E '\.(js|jsx|ts|tsx|json|css|scss|md|html|yaml|yml)$' || true)

if [ -z "$STAGED_FILES" ]; then
  log_success "No files to format"
  exit 0
fi

# Check if files are ignored by .prettierignore
FILES_TO_FORMAT=""
while IFS= read -r file; do
  # Check if file exists and is not in .prettierignore
  if [ -f "$file" ]; then
    # Use prettier to check if file should be ignored
    if npx prettier --check "$file" > /dev/null 2>&1 || [ $? -eq 1 ]; then
      FILES_TO_FORMAT="$FILES_TO_FORMAT $file"
    fi
  fi
done <<< "$STAGED_FILES"

if [ -z "$FILES_TO_FORMAT" ]; then
  log_success "No files to format (all ignored)"
  exit 0
fi

# Count files before formatting
TOTAL_FILES=$(echo "$FILES_TO_FORMAT" | wc -w | tr -d ' ')
log_step "Formatting $TOTAL_FILES file(s)..."

# Run Prettier with --write to format files
if echo "$FILES_TO_FORMAT" | xargs npx prettier --write --ignore-unknown 2>&1 | tee /tmp/prettier-output.log; then
  # Re-stage formatted files
  echo "$FILES_TO_FORMAT" | xargs git add
  log_success "Formatted $TOTAL_FILES file(s)"
  rm -f /tmp/prettier-output.log
  exit 0
else
  PRETTIER_EXIT_CODE=$?
  log_error "Prettier formatting failed"
  echo ""
  log_header "Formatting Error Details"

  # Extract and display relevant error information
  if [ -f /tmp/prettier-output.log ]; then
    echo -e "${RED}Formatting Issues:${RESET}"
    cat /tmp/prettier-output.log
    echo ""
  fi

  log_header "Next Steps"
  echo -e "${CYAN}1.${RESET} Review the formatting errors above"
  echo -e "${CYAN}2.${RESET} Check if files have syntax errors"
  echo -e "${CYAN}3.${RESET} Run Prettier manually: ${BOLD}npx prettier --write <file>${RESET}"
  echo -e "${CYAN}4.${RESET} Check your Prettier configuration in ${BOLD}.prettierrc${RESET}"
  echo -e "${CYAN}5.${RESET} To skip formatting temporarily: ${BOLD}FORMAT_ENABLED=0 git commit${RESET}"
  echo ""

  rm -f /tmp/prettier-output.log
  exit $PRETTIER_EXIT_CODE
fi
