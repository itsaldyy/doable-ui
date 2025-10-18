#!/bin/bash
# pre-commit.sh
# Main pre-commit hook orchestrator
# This script runs all pre-commit checks in sequence

set -e

# Get the directory where this script is located
# Use absolute path resolution to ensure it works from any context
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Fallback: if SCRIPT_DIR doesn't contain 'git-hooks', try to find it
if [[ ! "$SCRIPT_DIR" =~ git-hooks ]]; then
  # We're probably being called from the wrong context
  # Try to find the git-hooks directory relative to the git root
  GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
  if [ -n "$GIT_ROOT" ]; then
    SCRIPT_DIR="$GIT_ROOT/scripts/git-hooks"
  fi
fi

# Source utilities
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/logging.sh"

log_header "Pre-commit Checks"

# Track if any check fails
FAILED=0

# Array of checks to run (in order)
# Format: "script_name:description:required"
# required=1 means failure blocks commit, required=0 means warning only
#
# Order rationale:
# 1. Linting - Catch bugs, vulnerabilities, and standard violations first
# 2. Type Checking - Validate TypeScript correctness
# 3. Unit Tests - Verify functional correctness
# 4. Whitespace Cleanup - Clean up formatting issues
# 5. Code Formatting - Apply final formatting polish
#
# This order ensures we validate correctness before applying cosmetic fixes
CHECKS=(
  "lint-staged.sh:Linting (ESLint):1"
  "check-types.sh:Type Checking (TypeScript):1"
  "run-tests.sh:Unit Tests:1"
  "cleanup-whitespace.sh:Whitespace Cleanup:1"
  "format-code.sh:Code Formatting (Prettier):1"
)

# Track which checks failed
FAILED_CHECKS=()

# Run each check
for check in "${CHECKS[@]}"; do
  IFS=':' read -r script description required <<< "$check"

  log_step "Running: $description"

  # Full path to the script
  SCRIPT_PATH="$SCRIPT_DIR/$script"
  
  # Debug: show what we're trying to run
  if [ ! -f "$SCRIPT_PATH" ]; then
    log_error "Script not found: $SCRIPT_PATH"
    if [ "$required" = "1" ]; then
      FAILED_CHECKS+=("$description")
      FAILED=1
    fi
    continue
  fi

  if bash "$SCRIPT_PATH"; then
    log_success "$description passed"
  else
    EXIT_CODE=$?
    if [ "$required" = "1" ]; then
      log_error "$description failed (blocking commit)"
      FAILED_CHECKS+=("$description")
      FAILED=1
    else
      log_warning "$description failed (non-blocking)"
    fi
  fi

  echo "" # Blank line for readability
done

# Final result
if [ $FAILED -eq 1 ]; then
  log_header "Pre-commit Failed"

  # Show which checks failed
  echo -e "${RED}Failed Checks:${RESET}"
  for failed_check in "${FAILED_CHECKS[@]}"; do
    echo -e "  ${CROSS_MARK} $failed_check"
  done
  echo ""

  # Provide actionable guidance
  log_header "How to Proceed"
  echo -e "${CYAN}Option 1:${RESET} Fix the issues and commit again"
  echo -e "  ${DIM}Review the error details above and fix the problems${RESET}"
  echo ""
  echo -e "${CYAN}Option 2:${RESET} Run checks manually to see full output"
  echo -e "  ${BOLD}bash scripts/git-hooks/pre-commit.sh${RESET}"
  echo ""
  echo -e "${CYAN}Option 3:${RESET} Skip hooks temporarily (not recommended)"
  echo -e "  ${BOLD}git commit --no-verify -m \"your message\"${RESET}"
  echo ""
  echo -e "${YELLOW}${WARNING_MARK} Note:${RESET} Skipping hooks may introduce issues into the codebase"
  echo ""

  exit 1
else
  log_header "Pre-commit Passed"
  log_success "All checks passed! Proceeding with commit."
  echo ""
  exit 0
fi
