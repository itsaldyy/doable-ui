#!/bin/bash
# run-tests.sh
# Runs unit tests on staged files to ensure functional correctness

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/logging.sh"

log_info "Running unit tests..."

# Get staged TypeScript/JavaScript files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  log_success "No code files changed, skipping tests"
  exit 0
fi

# Check if there are any test files in the staged changes
STAGED_TEST_FILES=$(echo "$STAGED_FILES" | grep -E '\.test\.(ts|tsx|js|jsx)$' || true)
STAGED_SOURCE_FILES=$(echo "$STAGED_FILES" | grep -v -E '\.test\.(ts|tsx|js|jsx)$' || true)

# Determine which tests to run
if [ -n "$STAGED_TEST_FILES" ]; then
  log_step "Running tests for modified test files..."
  TEST_PATTERN=$(echo "$STAGED_TEST_FILES" | tr '\n' '|' | sed 's/|$//')
else
  log_step "Running all tests (source files modified)..."
  TEST_PATTERN=""
fi

# Run tests with minimal output
log_step "Executing test suite..."

if [ -n "$TEST_PATTERN" ]; then
  # Run specific test files
  if npm test -- --testPathPattern="$TEST_PATTERN" --silent --passWithNoTests 2>&1 | tee /tmp/test-output.log; then
    TEST_EXIT_CODE=0
  else
    TEST_EXIT_CODE=$?
  fi
else
  # Run all tests
  if npm test -- --silent --passWithNoTests 2>&1 | tee /tmp/test-output.log; then
    TEST_EXIT_CODE=0
  else
    TEST_EXIT_CODE=$?
  fi
fi

# Check test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
  log_success "All tests passed"
  rm -f /tmp/test-output.log
  exit 0
else
  log_error "Tests failed"
  echo ""
  log_header "Test Failure Details"

  # Extract and display relevant error information
  if [ -f /tmp/test-output.log ]; then
    # Show failed test summary
    echo -e "${RED}Failed Tests:${RESET}"
    grep -A 5 "FAIL" /tmp/test-output.log || true
    echo ""

    # Show test summary
    echo -e "${YELLOW}Test Summary:${RESET}"
    grep -E "(Tests:|Snapshots:)" /tmp/test-output.log || true
    echo ""
  fi

  log_header "Next Steps"
  echo -e "${CYAN}1.${RESET} Review the test failures above"
  echo -e "${CYAN}2.${RESET} Fix the failing tests or update the code"
  echo -e "${CYAN}3.${RESET} Run tests manually: ${BOLD}npm test${RESET}"
  echo -e "${CYAN}4.${RESET} To skip tests temporarily: ${BOLD}git commit --no-verify${RESET}"
  echo ""

  rm -f /tmp/test-output.log
  exit 1
fi
