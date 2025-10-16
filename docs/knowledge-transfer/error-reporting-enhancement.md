# Enhanced Error Reporting in Git Hooks

## Overview

This document describes the enhanced error reporting system implemented in the pre-commit hooks to provide engineers with informative, actionable error messages.

## Problem Statement

**Before Enhancement:**

- Generic error messages: "Check failed"
- No context about what went wrong
- No guidance on how to fix issues
- Engineers had to manually run commands to see full output
- Frustrating developer experience

**After Enhancement:**

- Detailed error information extracted from tool output
- Clear indication of what failed and where
- Actionable next steps provided
- Multiple resolution options presented
- Improved developer experience

## Implementation

### 1. Error Capture and Logging

Each hook script now captures output to temporary log files:

```bash
if npm run lint -- --fix $STAGED_TS_FILES 2>&1 | tee /tmp/lint-output.log; then
  # Success path
  rm -f /tmp/lint-output.log
else
  # Error path - process the log file
  # Extract relevant information
  # Display actionable guidance
  rm -f /tmp/lint-output.log
fi
```

**Benefits:**

- Full output is captured for analysis
- Relevant errors are extracted and displayed
- Temporary files are cleaned up automatically
- No pollution of the file system

### 2. Structured Error Display

Each hook follows a consistent error reporting format:

```
❌ [Check Name] failed

=== Error Details ===
[Extracted relevant errors from tool output]

=== Next Steps ===
1. Review the errors above
2. Fix the issues in your code
3. Run check manually: [command]
4. Additional guidance specific to the check
5. How to skip temporarily (if needed)
```

### 3. Hook-Specific Error Reporting

#### Linting Errors (`lint-staged.sh`)

**What's Captured:**

- Specific linting errors and warnings
- File locations and line numbers
- Error summary (total problems found)

**Example Output:**

```
❌ Linting failed

=== Linting Error Details ===
Issues Found:
  src/components/Button.tsx:15:7: error: 'useState' is not defined
  src/utils/helpers.ts:23:1: warning: Unexpected console statement

Summary:
✖ 2 problems (1 error, 1 warning)

=== Next Steps ===
1. Review the linting errors above
2. Fix the issues in your code
3. Run linter manually: npm run lint
4. Some issues can be auto-fixed: npm run lint -- --fix
5. To skip linting temporarily: SKIP_LINT=1 git commit
```

#### Type Checking Errors (`check-types.sh`)

**What's Captured:**

- TypeScript error codes (TS####)
- File locations and line numbers
- Error descriptions
- Total error count

**Example Output:**

```
❌ Type checking failed

=== Type Error Details ===
Type Errors Found:
  src/hooks/useTodos.ts(45,7): error TS2322: Type 'string' is not assignable to type 'number'
  src/components/TodoItem.tsx(12,3): error TS2339: Property 'id' does not exist on type 'Todo'

Summary:
Found 2 errors in 2 files

=== Next Steps ===
1. Review the type errors above
2. Fix the type issues in your code
3. Run type check manually: npm run type-check
4. Check your TypeScript configuration in tsconfig.json
5. To skip type checking temporarily: SKIP_TYPES=1 git commit
```

#### Unit Test Failures (`run-tests.sh`)

**What's Captured:**

- Failed test names and descriptions
- Test file locations
- Test summary (passed/failed counts)
- Failure reasons

**Example Output:**

```
❌ Tests failed

=== Test Failure Details ===
Failed Tests:
  FAIL src/hooks/useTodos.test.ts
    useTodos
      ✕ should add a new todo (15 ms)
      ✕ should update todo text (8 ms)

Test Summary:
Tests:       2 failed, 28 passed, 30 total

=== Next Steps ===
1. Review the test failures above
2. Fix the failing tests or update the code
3. Run tests manually: npm test
4. To skip tests temporarily: git commit --no-verify
```

#### Formatting Errors (`format-code.sh`)

**What's Captured:**

- Prettier parsing errors
- Syntax errors in files
- File locations

**Example Output:**

```
❌ Prettier formatting failed

=== Formatting Error Details ===
Formatting Issues:
  SyntaxError: Unexpected token (15:7)
  > 15 | const x = {
       |       ^

=== Next Steps ===
1. Review the formatting errors above
2. Check if files have syntax errors
3. Run Prettier manually: npx prettier --write <file>
4. Check your Prettier configuration in .prettierrc
5. To skip formatting temporarily: FORMAT_ENABLED=0 git commit
```

### 4. Orchestrator Error Summary

The main `pre-commit.sh` orchestrator provides a final summary:

```
=== Pre-commit Failed ===

Failed Checks:
  ✗ Linting (ESLint)
  ✗ Unit Tests

=== How to Proceed ===

Option 1: Fix the issues and commit again
  Review the error details above and fix the problems

Option 2: Run checks manually to see full output
  bash scripts/git-hooks/pre-commit.sh

Option 3: Skip hooks temporarily (not recommended)
  git commit --no-verify -m "your message"

⚠ Note: Skipping hooks may introduce issues into the codebase
```

## Design Principles

### 1. Fail Fast

- Show errors immediately
- Don't continue with cosmetic fixes if correctness checks fail
- Save developer time

### 2. Be Specific

- Extract relevant error information
- Show file locations and line numbers
- Provide context about what went wrong

### 3. Be Actionable

- Always provide next steps
- Show commands to run manually
- Offer multiple resolution paths

### 4. Be Consistent

- All hooks follow the same error format
- Consistent use of colors and symbols
- Predictable structure

### 5. Be Helpful

- Explain what the error means
- Suggest how to fix it
- Provide escape hatches (skip options)

## Color Coding

Errors use consistent color coding for quick visual parsing:

- 🔴 **Red** - Errors and failures
- 🟡 **Yellow** - Warnings and summaries
- 🔵 **Cyan** - Actionable steps and options
- ⚪ **White/Bold** - Commands to run
- ⚫ **Dim** - Additional context

## Error Message Components

Each error message includes:

1. **Header** - What failed
2. **Error Details** - Specific errors extracted from tool output
3. **Summary** - High-level overview (counts, totals)
4. **Next Steps** - Numbered list of actions to take
5. **Escape Hatch** - How to skip temporarily (with warning)

## Benefits

### For Developers

✅ **Faster Debugging** - See exactly what's wrong immediately
✅ **Clear Guidance** - Know what to do next
✅ **Less Frustration** - No need to hunt for error details
✅ **Learning** - Understand what each check does
✅ **Confidence** - Know how to fix issues

### For Teams

✅ **Consistency** - Everyone sees the same error format
✅ **Onboarding** - New developers understand errors quickly
✅ **Productivity** - Less time debugging hook failures
✅ **Quality** - Better error messages lead to better fixes
✅ **Documentation** - Error messages serve as inline docs

## Examples of Error Scenarios

### Scenario 1: Linting Error

**Trigger:** Unused variable in code

**Output:**

```
→ Running: Linting (ESLint)
ℹ Running linter on staged files...
❌ Linting failed

=== Linting Error Details ===
Issues Found:
  src/App.tsx:10:7: error: 'count' is assigned a value but never used

Summary:
✖ 1 problem (1 error, 0 warnings)

=== Next Steps ===
1. Review the linting errors above
2. Fix the issues in your code
3. Run linter manually: npm run lint
4. Some issues can be auto-fixed: npm run lint -- --fix
5. To skip linting temporarily: SKIP_LINT=1 git commit
```

**Developer Action:** Remove unused variable or use it

### Scenario 2: Type Error

**Trigger:** Type mismatch in TypeScript

**Output:**

```
→ Running: Type Checking (TypeScript)
ℹ Running TypeScript type checking...
❌ Type checking failed

=== Type Error Details ===
Type Errors Found:
  src/hooks/useTodos.ts(45,7): error TS2322: Type 'string' is not assignable to type 'number'

Summary:
Found 1 error in 1 file

=== Next Steps ===
1. Review the type errors above
2. Fix the type issues in your code
3. Run type check manually: npm run type-check
4. Check your TypeScript configuration in tsconfig.json
5. To skip type checking temporarily: SKIP_TYPES=1 git commit
```

**Developer Action:** Fix type mismatch

### Scenario 3: Test Failure

**Trigger:** Failing unit test

**Output:**

```
→ Running: Unit Tests
ℹ Running unit tests...
❌ Tests failed

=== Test Failure Details ===
Failed Tests:
  FAIL src/hooks/useTodos.test.ts
    useTodos
      ✕ should add a new todo (15 ms)
        Expected: { text: 'New todo', completed: false }
        Received: { text: 'New todo', completed: true }

Test Summary:
Tests:       1 failed, 29 passed, 30 total

=== Next Steps ===
1. Review the test failures above
2. Fix the failing tests or update the code
3. Run tests manually: npm test
4. To skip tests temporarily: git commit --no-verify
```

**Developer Action:** Fix test or update code logic

## Configuration

Error reporting can be customized via environment variables:

```bash
# Show verbose output
VERBOSE=1 git commit -m "message"

# Show debug information
DEBUG=1 git commit -m "message"

# Skip specific checks
SKIP_LINT=1 git commit -m "message"
SKIP_TESTS=1 git commit -m "message"
```

## Future Enhancements

1. **Error Categorization** - Group errors by severity
2. **Auto-fix Suggestions** - Suggest specific fixes for common errors
3. **Error History** - Track common errors across commits
4. **IDE Integration** - Send errors to IDE for inline display
5. **Metrics** - Track which checks fail most often
6. **Custom Error Messages** - Project-specific guidance

## Best Practices

### For Hook Developers

1. **Capture Full Output** - Use `tee` to capture and display
2. **Extract Relevant Info** - Use `grep` to find important errors
3. **Limit Output** - Show first 10-20 errors, not all
4. **Clean Up** - Remove temporary files
5. **Be Consistent** - Follow the established format

### For Users

1. **Read the Errors** - Don't just skip hooks
2. **Follow Next Steps** - Try suggested commands
3. **Ask for Help** - If errors are unclear, report them
4. **Don't Skip Habitually** - Only skip in emergencies
5. **Improve Hooks** - Suggest better error messages

## Conclusion

Enhanced error reporting transforms Git hooks from frustrating blockers into helpful guides. By providing clear, actionable error messages, we empower developers to fix issues quickly and maintain high code quality.

**Key Takeaway:** Good error messages are as important as the checks themselves. They turn failures into learning opportunities and improve the overall developer experience.

---

**Last Updated:** 2025-01-16
**Related Documents:**

- `scripts/git-hooks/README.md` - Full hooks documentation
- `scripts/git-hooks/ARCHITECTURE.md` - Technical architecture
- `docs/knowledge-transfer/git-hooks-setup.md` - Initial setup
