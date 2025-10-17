#!/bin/bash
# Validate commit message format
# Enforces Conventional Commits specification

# Colors for output
source "$(dirname "$0")/../utils/colors.sh"

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Conventional Commits pattern
# Format: type(scope): subject
#
# Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
# Scope: optional, can be anything (hooks, spec, steering, etc.)
# Subject: brief description, lowercase, no period at end
#
# Examples:
#   feat(hooks): Add commit message validation
#   fix: Resolve Node version switching issue
#   docs(api): Update authentication guide
#   refactor(spec): Restructure tasks for TDD

PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([a-z0-9-]+\))?: [A-Z].{0,71}$"

# Allow merge commits
if echo "$COMMIT_MSG" | grep -qE "^Merge "; then
    exit 0
fi

# Allow revert commits
if echo "$COMMIT_MSG" | grep -qE "^Revert "; then
    exit 0
fi

# Validate first line of commit message
FIRST_LINE=$(echo "$COMMIT_MSG" | head -n 1)

if ! echo "$FIRST_LINE" | grep -qE "$PATTERN"; then
    echo ""
    echo "${RED}✗ Invalid commit message format${NC}"
    echo ""
    echo "${YELLOW}Your commit message:${NC}"
    echo "  $FIRST_LINE"
    echo ""
    echo "${BLUE}Expected format:${NC}"
    echo "  type(scope): subject"
    echo ""
    echo "${BLUE}Valid types:${NC}"
    echo "  ${GREEN}feat${NC}     - New feature"
    echo "  ${GREEN}fix${NC}      - Bug fix"
    echo "  ${GREEN}docs${NC}     - Documentation changes"
    echo "  ${GREEN}style${NC}    - Code style changes (formatting, etc.)"
    echo "  ${GREEN}refactor${NC} - Code refactoring"
    echo "  ${GREEN}test${NC}     - Adding or updating tests"
    echo "  ${GREEN}chore${NC}    - Maintenance tasks"
    echo "  ${GREEN}perf${NC}     - Performance improvements"
    echo "  ${GREEN}ci${NC}       - CI/CD changes"
    echo "  ${GREEN}build${NC}    - Build system changes"
    echo "  ${GREEN}revert${NC}   - Revert a previous commit"
    echo ""
    echo "${BLUE}Scope (optional):${NC}"
    echo "  hooks, spec, steering, docs, api, etc."
    echo ""
    echo "${BLUE}Examples:${NC}"
    echo "  ${GREEN}feat(hooks): Add commit message validation${NC}"
    echo "  ${GREEN}fix: Resolve Node version switching issue${NC}"
    echo "  ${GREEN}docs(api): Update authentication guide${NC}"
    echo "  ${GREEN}refactor(spec): Restructure tasks for TDD${NC}"
    echo ""
    echo "${BLUE}Rules:${NC}"
    echo "  • Subject must start with uppercase letter (Sentence case)"
    echo "  • Subject must be 1-72 characters"
    echo "  • No period at the end of subject"
    echo "  • Use imperative mood (Add, not Added)"
    echo ""
    exit 1
fi

# Check subject line length (should be <= 72 chars for first line)
SUBJECT_LENGTH=${#FIRST_LINE}
if [ $SUBJECT_LENGTH -gt 72 ]; then
    echo ""
    echo "${YELLOW}⚠ Warning: Subject line is too long (${SUBJECT_LENGTH} chars, max 72)${NC}"
    echo ""
    echo "Consider shortening your commit message:"
    echo "  $FIRST_LINE"
    echo ""
fi

# Extract subject from commit message
SUBJECT=$(echo "$FIRST_LINE" | sed -E 's/^[a-z]+(\([a-z0-9-]+\))?: //')

# Check if subject starts with lowercase (should be uppercase/Sentence case)
if echo "$SUBJECT" | grep -qE "^[a-z]"; then
    echo ""
    echo "${YELLOW}⚠ Warning: Subject should start with uppercase letter (Sentence case)${NC}"
    echo ""
    echo "Your subject: $SUBJECT"
    echo "Should be: $(echo "$SUBJECT" | sed 's/^./\U&/')"
    echo ""
fi

# Check if subject ends with period
if echo "$SUBJECT" | grep -qE "\.$"; then
    echo ""
    echo "${YELLOW}⚠ Warning: Subject should not end with a period${NC}"
    echo ""
fi

exit 0
