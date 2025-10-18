# Pre-commit Hook SCRIPT_DIR Variable Fix

## Task Summary & Goal

**Objective:** Fix the pre-commit hook script that was failing in IDE Source Control due to `$SCRIPT_DIR` variable being overwritten when sourcing utility scripts, causing the hook to look in the wrong directory for check scripts.

## Analysis & Rationale

### Context & Background

The pre-commit hook (`scripts/git-hooks/pre-commit.sh`) orchestrates multiple checks (linting, type checking, tests, formatting) by sourcing utility scripts and then executing individual check scripts. The hook was working from the command line but failing when triggered by the IDE's Source Control interface.

**Referenced Files:**

- `scripts/git-hooks/pre-commit.sh` - Main orchestrator
- `scripts/utils/colors.sh` - Color definitions
- `scripts/utils/logging.sh` - Logging functions
- Individual check scripts (lint-staged.sh, check-types.sh, etc.)

### Thought Process & Rationale

**Root Cause Analysis:**

The issue was in `scripts/utils/logging.sh` lines 6-8:

```bash
if [ -z "$GREEN" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  source "$SCRIPT_DIR/colors.sh"
fi
```

**The Problem:**

1. `pre-commit.sh` sets `SCRIPT_DIR` to point to `scripts/git-hooks/`
2. When sourcing `logging.sh`, it checks if colors are loaded
3. If not, it redefines `SCRIPT_DIR` to point to `scripts/utils/` (its own directory)
4. This overwrites the original `SCRIPT_DIR` value
5. Later, when trying to run check scripts, it looks in the wrong directory

**Why This Happened:**

- `logging.sh` was designed to be self-contained and work independently
- It needed to find `colors.sh` relative to itself
- But it didn't preserve the caller's `SCRIPT_DIR` value

**Solution Approach:**

We considered three options:

1. **Rename the variable in logging.sh** - Would require updating all utility scripts
2. **Use a different variable name in pre-commit.sh** - Less intuitive, doesn't fix root cause
3. **Save and restore pattern** - Preserve original value before sourcing ✅

**Why Option 3:**

- Minimal changes required
- Clear intent (documented with comments)
- Doesn't break existing utility scripts
- Standard pattern in shell scripting
- Easy to understand and maintain

## Deliverables & Outcomes

### Output

**Fixed pre-commit.sh (key section):**

```bash
# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Fallback: if SCRIPT_DIR doesn't contain 'git-hooks', try to find it
if [[ ! "$SCRIPT_DIR" =~ git-hooks ]]; then
  GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
  if [ -n "$GIT_ROOT" ]; then
    SCRIPT_DIR="$GIT_ROOT/scripts/git-hooks"
  fi
fi

# Save SCRIPT_DIR before sourcing utilities (they may overwrite it)
SAVED_SCRIPT_DIR=$SCRIPT_DIR
UTIL_DIR="$SCRIPT_DIR/../utils"

# Source utilities
source "$UTIL_DIR/colors.sh"
source "$UTIL_DIR/logging.sh"

# Load saved SCRIPT_DIR
SCRIPT_DIR=$SAVED_SCRIPT_DIR
```

**Changes Made:**

1. ✅ Uncommented the `SCRIPT_DIR` definition (was commented out during debugging)
2. ✅ Added `SAVED_SCRIPT_DIR` to preserve the original value
3. ✅ Created `UTIL_DIR` variable for clarity
4. ✅ Restored `SCRIPT_DIR` after sourcing utilities
5. ✅ Removed debug echo statements
6. ✅ Removed whitespace cleanup from checks array
7. ✅ Deleted `cleanup-whitespace.sh` script

**Additional Cleanup:**

Removed whitespace cleanup routine as requested:

```bash
# Before:
CHECKS=(
  "lint-staged.sh:Linting (ESLint):1"
  "check-types.sh:Type Checking (TypeScript):1"
  "run-tests.sh:Unit Tests:1"
  "cleanup-whitespace.sh:Whitespace Cleanup:1"  # ← Removed
  "format-code.sh:Code Formatting (Prettier):1"
)

# After:
CHECKS=(
  "lint-staged.sh:Linting (ESLint):1"
  "check-types.sh:Type Checking (TypeScript):1"
  "run-tests.sh:Unit Tests:1"
  "format-code.sh:Code Formatting (Prettier):1"
)
```

### Benefits & Impact

**Immediate Benefits:**

- ✅ Pre-commit hook now works correctly in IDE Source Control
- ✅ Hook works from command line (unchanged)
- ✅ All check scripts execute from correct directory
- ✅ Cleaner output (removed debug statements)
- ✅ Leaner hook (removed whitespace cleanup)

**Code Quality:**

- Clear variable naming (`SAVED_SCRIPT_DIR`, `UTIL_DIR`)
- Documented intent with inline comments
- Follows shell scripting best practices
- Easier to debug if issues arise

**Developer Experience:**

- Commits work seamlessly from IDE
- No need to use `--no-verify` workaround
- Consistent behavior across environments
- Faster pre-commit checks (one less script)

## Synthesis & Future Implications

### Key Learnings

1. **Variable Scope in Shell Scripts:**
    - Sourced scripts share the same variable namespace
    - Variables can be unintentionally overwritten
    - Always preserve critical variables before sourcing

2. **Bash Source Behavior:**
    - `source` executes script in current shell context
    - `${BASH_SOURCE[0]}` refers to the sourced file, not the caller
    - This is why `logging.sh` was getting its own directory

3. **Debugging Shell Scripts:**
    - Echo statements helped identify the issue
    - Tracking variable values through execution flow
    - Testing in different contexts (CLI vs IDE) reveals edge cases

4. **Git Hook Execution Context:**
    - Hooks can be called from different working directories
    - IDE may invoke hooks differently than command line
    - Absolute paths are more reliable than relative paths

### Best Practices Established

**For Future Shell Scripts:**

1. **Use unique variable names** for local scope:

    ```bash
    LOCAL_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ```

2. **Document variable preservation:**

    ```bash
    # Save VARIABLE before sourcing (utilities may overwrite it)
    SAVED_VARIABLE=$VARIABLE
    ```

3. **Create helper variables** for clarity:

    ```bash
    UTIL_DIR="$SCRIPT_DIR/../utils"
    ```

4. **Test in multiple contexts:**
    - Command line execution
    - IDE Source Control
    - Different working directories

### Next Steps

**Potential Improvements:**

1. **Refactor utility scripts** to use local variables:

    ```bash
    # In logging.sh
    _LOGGING_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$_LOGGING_SCRIPT_DIR/colors.sh"
    ```

2. **Create a sourcing helper** function:

    ```bash
    safe_source() {
      local saved_script_dir=$SCRIPT_DIR
      source "$1"
      SCRIPT_DIR=$saved_script_dir
    }
    ```

3. **Add validation** to check scripts exist before running:

    ```bash
    if [ ! -f "$SCRIPT_PATH" ]; then
      log_error "Script not found: $SCRIPT_PATH"
      exit 1
    fi
    ```

4. **Consider environment variables** for critical paths:
    ```bash
    export GIT_HOOKS_DIR="${GIT_HOOKS_DIR:-$SCRIPT_DIR}"
    ```

### Maintenance Notes

**If Adding New Utility Scripts:**

- Use unique variable names (prefix with `_` or script name)
- Don't assume `SCRIPT_DIR` points to your directory
- Document any variables you modify
- Test sourcing from different contexts

**If Modifying Pre-commit Hook:**

- Preserve the save/restore pattern for `SCRIPT_DIR`
- Test both CLI and IDE execution
- Keep debug statements commented (not deleted) for future troubleshooting

**If Issues Arise:**

- Uncomment debug echo statements
- Check variable values at each step
- Verify file paths are absolute, not relative
- Test with `bash -x` for detailed execution trace

## Testing Performed

**Verification Steps:**

```bash
# 1. Test from command line
bash scripts/git-hooks/pre-commit.sh
# Result: ✅ All checks passed

# 2. Test from IDE Source Control
# (Make a change and commit via IDE)
# Result: ✅ Hook executed successfully

# 3. Verify SCRIPT_DIR preservation
# (Added echo statements temporarily)
# Result: ✅ Variable maintained correct value
```

## References

- [Bash Source Command](https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html#index-source)
- [BASH_SOURCE Variable](https://www.gnu.org/software/bash/manual/html_node/Bash-Variables.html)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Shell Script Best Practices](https://google.github.io/styleguide/shellguide.html)
