#!/bin/bash
# lint-staged.sh
# Runs linting on staged files

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/logging.sh"

log_info "Running linter on staged files..."

# Get staged TypeScript/JavaScript files
STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=d | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_TS_FILES" ]; then
  log_success "No TypeScript/JavaScript files to lint"
  exit 0
fi

# Run ESLint on staged files
if npm run lint -- --fix $STAGED_TS_FILES 2>&1 | tee /tmp/lint-output.log; then
  # Re-stage files that were fixed
  echo "$STAGED_TS_FILES" | xargs git add
  log_success "Linting passed"
  rm -f /tmp/lint-output.log
  exit 0
else
  LINT_EXIT_CODE=$?
  log_error "Linting failed"
  echo ""
  log_header "Linting Error Details"

  # Extract and display relevant error information
  if [ -f /tmp/lint-output.log ]; then
    # Show errors and warnings
    echo -e "${RED}Issues Found:${RESET}"
    grep -E "(error|warning)" /tmp/lint-output.log | head -20 || true
    echo ""

    # Show summary
    echo -e "${YELLOW}Summary:${RESET}"
    grep -E "problem" /tmp/lint-output.log | tail -1 || true
    echo ""
  fi

  log_header "Next Steps"
  echo -e "${CYAN}1.${RESET} Review the linting errors above"
  echo -e "${CYAN}2.${RESET} Fix the issues in your code"
  echo -e "${CYAN}3.${RESET} Run linter manually: ${BOLD}npm run lint${RESET}"
  echo -e "${CYAN}4.${RESET} Some issues can be auto-fixed: ${BOLD}npm run lint -- --fix${RESET}"
  echo -e "${CYAN}5.${RESET} To skip linting temporarily: ${BOLD}SKIP_LINT=1 git commit${RESET}"
  echo ""

  rm -f /tmp/lint-output.log
  exit $LINT_EXIT_CODE
fi
