# Git Hooks

This directory contains version-controlled Git hooks that run automatically during Git operations.

## Structure

```
scripts/
├── git-hooks/
│   ├── pre-commit.sh           # Main orchestrator for pre-commit checks
│   ├── cleanup-whitespace.sh   # Removes excessive blank lines and trailing whitespace
│   ├── lint-staged.sh          # Runs ESLint on staged files
│   ├── check-types.sh          # Runs TypeScript type checking
│   └── README.md               # This file
└── utils/
    ├── colors.sh               # Terminal color definitions
    └── logging.sh              # Logging utility functions
```

## How It Works

1. **Husky** manages the Git hooks installation (`.husky/` directory)
2. **Husky's pre-commit hook** calls our `scripts/git-hooks/pre-commit.sh`
3. **Our orchestrator** runs individual check scripts in sequence
4. **Each check** uses shared utilities for consistent output

## Available Hooks

### Pre-commit Checks

The pre-commit hook runs the following checks in order:

**Order Rationale:** Validate correctness first, then apply cosmetic fixes. This "fail fast" approach catches real issues before wasting time on formatting.

1. **Linting** (`lint-staged.sh`)
    - Runs ESLint on staged TypeScript/JavaScript files
    - Catches bugs, vulnerabilities, and coding standard violations
    - Auto-fixes issues when possible
    - Re-stages fixed files
    - Provides detailed error messages with actionable next steps
    - **Status**: Required (blocks commit on failure)

2. **Type Checking** (`check-types.sh`)
    - Runs TypeScript compiler in check mode
    - Ensures no type errors exist
    - Validates TypeScript correctness
    - Shows specific type errors with file locations
    - **Status**: Required (blocks commit on failure)

3. **Unit Tests** (`run-tests.sh`)
    - Runs Jest tests for modified files
    - Verifies functional correctness
    - Shows failed test details and summary
    - Provides guidance on fixing test failures
    - **Status**: Required (blocks commit on failure)

4. **Whitespace Cleanup** (`cleanup-whitespace.sh`)
    - Removes trailing whitespace
    - Removes excessive blank lines (keeps max 1 blank line between content)
    - Auto-fixes and re-stages modified files
    - **Status**: Required (blocks commit on failure)

5. **Code Formatting** (`format-code.sh`)
    - Runs Prettier on staged files (JS, TS, JSON, CSS, MD, etc.)
    - Formats code according to `.prettierrc` configuration
    - Respects `.prettierignore` exclusions
    - Auto-fixes and re-stages formatted files
    - **Status**: Required (blocks commit on failure)

## Adding New Hooks

### 1. Create a New Hook Script

Create a new script in `scripts/git-hooks/`:

```bash
#!/bin/bash
# my-new-check.sh
# Description of what this check does

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/logging.sh"

log_info "Running my new check..."

# Your check logic here
if [ condition ]; then
  log_success "Check passed"
  exit 0
else
  log_error "Check failed"
  exit 1
fi
```

### 2. Make It Executable

```bash
chmod +x scripts/git-hooks/my-new-check.sh
```

### 3. Add to Orchestrator

Edit `scripts/git-hooks/pre-commit.sh` and add your check to the `CHECKS` array:

```bash
CHECKS=(
  "cleanup-whitespace.sh:Whitespace Cleanup:1"
  "lint-staged.sh:Linting:1"
  "check-types.sh:Type Checking:1"
  "my-new-check.sh:My New Check:1"  # Add this line
)
```

Format: `"script_name:description:required"`

- `required=1`: Failure blocks commit
- `required=0`: Failure shows warning only

## Disabling Hooks Temporarily

### Skip All Hooks

```bash
git commit --no-verify -m "Your commit message"
# or
git commit -n -m "Your commit message"
```

### Skip Specific Checks

Set environment variables before committing:

```bash
SKIP_LINT=1 git commit -m "Skip linting"
SKIP_TYPES=1 git commit -m "Skip type checking"
```

Then modify the individual scripts to check for these variables:

```bash
if [ "${SKIP_LINT:-0}" = "1" ]; then
  log_warning "Linting skipped (SKIP_LINT=1)"
  exit 0
fi
```

## Testing Hooks Manually

You can test any hook script manually:

```bash
# Test the entire pre-commit flow
bash scripts/git-hooks/pre-commit.sh

# Test individual checks
bash scripts/git-hooks/cleanup-whitespace.sh
bash scripts/git-hooks/lint-staged.sh
bash scripts/git-hooks/check-types.sh
```

## Debugging

Enable debug output:

```bash
DEBUG=1 bash scripts/git-hooks/pre-commit.sh
```

## Utilities

### Colors (`scripts/utils/colors.sh`)

Available color variables:

- `$RED`, `$GREEN`, `$YELLOW`, `$BLUE`, `$MAGENTA`, `$CYAN`, `$WHITE`, `$GRAY`
- `$BOLD`, `$DIM`, `$UNDERLINE`, `$RESET`
- `$CHECK_MARK`, `$CROSS_MARK`, `$INFO_MARK`, `$WARNING_MARK`

### Logging (`scripts/utils/logging.sh`)

Available functions:

- `log_info "message"` - Blue info message
- `log_success "message"` - Green success message
- `log_warning "message"` - Yellow warning message
- `log_error "message"` - Red error message
- `log_header "title"` - Cyan section header
- `log_step "message"` - Magenta step indicator
- `log_debug "message"` - Gray debug message (only if DEBUG=1)

## Installation

Hooks are automatically installed when you run:

```bash
npm install
```

This is configured in `package.json` via Husky's postinstall script.

## Troubleshooting

### Hooks Not Running

1. Check if Husky is installed:

    ```bash
    ls -la .husky/
    ```

2. Verify scripts are executable:

    ```bash
    ls -l scripts/git-hooks/*.sh
    ```

3. Reinstall hooks:
    ```bash
    npx husky install
    ```

### Permission Denied Errors

Make scripts executable:

```bash
chmod +x scripts/git-hooks/*.sh scripts/utils/*.sh
```

### Hooks Running on CI/CD

To prevent hooks from running in CI/CD environments, Husky automatically skips installation when `CI=true` environment variable is set.

## Best Practices

1. **Keep checks fast** - Slow hooks frustrate developers
2. **Auto-fix when possible** - Don't just report errors, fix them
3. **Provide clear error messages** - Help developers understand what went wrong
4. **Make checks optional** - Allow skipping with `--no-verify` for emergencies
5. **Test hooks locally** - Run manually before committing hook changes
6. **Document everything** - Update this README when adding new hooks

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)
