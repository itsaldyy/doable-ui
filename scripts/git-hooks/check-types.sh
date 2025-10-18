#!/bin/bash
# check-types.sh
# Runs TypeScript type checking

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/logging.sh"

log_info "Running TypeScript type checking..."

# Run TypeScript compiler in check mode
if npm run type-check 2>&1 | tee /tmp/typecheck-output.log; then
  log_success "Type checking passed"
  rm -f /tmp/typecheck-output.log
  exit 0
else
  TYPE_EXIT_CODE=$?
  log_error "Type checking failed"
  echo ""
  log_header "Type Error Details"

  # Extract and display relevant error information
  if [ -f /tmp/typecheck-output.log ]; then
    # Show type errors
    echo -e "${RED}Type Errors Found:${RESET}"
    grep -E "error TS[0-9]+" /tmp/typecheck-output.log | head -15 || true
    echo ""

    # Show summary
    echo -e "${YELLOW}Summary:${RESET}"
    grep -E "Found [0-9]+ error" /tmp/typecheck-output.log || true
    echo ""
  fi

  log_header "Next Steps"
  echo -e "${CYAN}1.${RESET} Review the type errors above"
  echo -e "${CYAN}2.${RESET} Fix the type issues in your code"
  echo -e "${CYAN}3.${RESET} Run type check manually: ${BOLD}npm run type-check${RESET}"
  echo -e "${CYAN}4.${RESET} Check your TypeScript configuration in ${BOLD}tsconfig.json${RESET}"
  echo -e "${CYAN}5.${RESET} To skip type checking temporarily: ${BOLD}SKIP_TYPES=1 git commit${RESET}"
  echo ""

  rm -f /tmp/typecheck-output.log
  exit $TYPE_EXIT_CODE
fi
