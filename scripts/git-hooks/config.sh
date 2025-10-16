#!/bin/bash
# config.sh
# Configuration for Git hooks behavior
# You can customize these settings to match your project needs

# Whitespace Cleanup Configuration
export CLEANUP_WHITESPACE_ENABLED="${CLEANUP_WHITESPACE_ENABLED:-1}"
export MAX_CONSECUTIVE_BLANK_LINES="${MAX_CONSECUTIVE_BLANK_LINES:-1}"

# Code Formatting Configuration
export FORMAT_ENABLED="${FORMAT_ENABLED:-1}"
export PRETTIER_CONFIG="${PRETTIER_CONFIG:-.prettierrc}"

# Linting Configuration
export LINT_ENABLED="${LINT_ENABLED:-1}"
export LINT_AUTO_FIX="${LINT_AUTO_FIX:-1}"

# Type Checking Configuration
export TYPE_CHECK_ENABLED="${TYPE_CHECK_ENABLED:-1}"

# Testing Configuration
export RUN_TESTS_ON_COMMIT="${RUN_TESTS_ON_COMMIT:-1}"
export TEST_PATTERN="${TEST_PATTERN:-*.test.ts}"
export TEST_TIMEOUT="${TEST_TIMEOUT:-30}"  # seconds

# Performance Settings
export HOOK_TIMEOUT="${HOOK_TIMEOUT:-60}"  # seconds

# Output Settings
export VERBOSE="${VERBOSE:-0}"
export SHOW_TIMING="${SHOW_TIMING:-0}"

# File Patterns
export IGNORE_PATTERNS="${IGNORE_PATTERNS:-node_modules/|dist/|build/|coverage/}"
