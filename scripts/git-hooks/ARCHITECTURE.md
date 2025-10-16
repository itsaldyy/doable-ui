# Git Hooks Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer Workflow                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   git commit -m "..."  │
                    └────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Git Hooks Layer                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              .husky/pre-commit (Husky)                    │  │
│  │  • Installed automatically via npm install                │  │
│  │  • Delegates to our custom orchestrator                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                 │                                 │
│                                 ▼                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │       scripts/git-hooks/pre-commit.sh (Orchestrator)      │  │
│  │  • Loads configuration from config.sh                     │  │
│  │  • Runs checks in sequence                                │  │
│  │  • Aggregates results                                     │  │
│  │  • Provides unified output                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                 │                                 │
│                    ┌────────────┼────────────┼────────────┐      │
│                    ▼            ▼            ▼            ▼       │
│         ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│         │  Whitespace  │ │  Code    │ │ Linting  │ │   Type   ││
│         │   Cleanup    │ │Formatting│ │          │ │ Checking ││
│         └──────────────┘ └──────────┘ └──────────┘ └──────────┘│
│                │              │              │            │       │
│                └──────────────┼──────────────┼────────────┘      │
│                               ▼                                   │
│                    ┌─────────────────────┐                       │
│                    │  Shared Utilities   │                       │
│                    │  • colors.sh        │                       │
│                    │  • logging.sh       │                       │
│                    └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
              ┌──────────┐            ┌──────────┐
              │  Success │            │  Failure │
              │  Commit  │            │  Blocked │
              └──────────┘            └──────────┘
```

## Component Interaction Flow

### 1. Commit Trigger

```
Developer runs: git commit -m "message"
         │
         ▼
Git looks for: .git/hooks/pre-commit
         │
         ▼
Finds symlink to: .husky/pre-commit
```

### 2. Husky Delegation

```
.husky/pre-commit
         │
         ├─ Checks if in Git repository
         ├─ Checks if CI environment (skip if true)
         └─ Executes: bash scripts/git-hooks/pre-commit.sh
```

### 3. Orchestrator Execution

```
scripts/git-hooks/pre-commit.sh
         │
         ├─ Load config.sh (configuration)
         ├─ Load colors.sh (terminal colors)
         ├─ Load logging.sh (output functions)
         │
         ├─ Display header
         │
         ├─ For each check in CHECKS array:
         │   │
         │   ├─ Log step start
         │   ├─ Execute check script
         │   ├─ Capture exit code
         │   ├─ Log result (success/failure)
         │   └─ Track overall status
         │
         └─ Display final result
             │
             ├─ If all passed: exit 0 (commit proceeds)
             └─ If any failed: exit 1 (commit blocked)
```

### 4. Individual Check Execution

#### Whitespace Cleanup

```
cleanup-whitespace.sh
         │
         ├─ Get staged files
         ├─ For each text file:
         │   ├─ Calculate original hash
         │   ├─ Remove trailing whitespace
         │   ├─ Remove excessive blank lines
         │   ├─ Calculate new hash
         │   └─ If changed: re-stage file
         │
         └─ Report results
```

#### Code Formatting

```
format-code.sh
         │
         ├─ Get staged files (JS, TS, JSON, CSS, MD, etc.)
         ├─ Filter out files in .prettierignore
         ├─ Run: npx prettier --write [files]
         ├─ Re-stage formatted files
         │
         └─ Exit with Prettier's exit code
```

#### Linting

```
lint-staged.sh
         │
         ├─ Get staged .ts/.tsx/.js/.jsx files
         ├─ Run: npm run lint -- --fix [files]
         ├─ If fixes applied: re-stage files
         │
         └─ Exit with ESLint's exit code
```

#### Type Checking

```
check-types.sh
         │
         ├─ Run: npm run type-check
         │   (or: npx tsc --noEmit)
         │
         └─ Exit with TypeScript's exit code
```

## Data Flow

### Configuration Flow

```
Environment Variables
         │
         ▼
config.sh (defaults + overrides)
         │
         ▼
Individual Check Scripts
         │
         ▼
Check Behavior
```

### Output Flow

```
Check Script
         │
         ├─ Uses: log_info()
         ├─ Uses: log_success()
         ├─ Uses: log_warning()
         └─ Uses: log_error()
                  │
                  ▼
         logging.sh functions
                  │
                  ▼
         colors.sh (color codes)
                  │
                  ▼
         Terminal Output
```

## File Dependencies

```
.husky/pre-commit
    └─ requires: scripts/git-hooks/pre-commit.sh

scripts/git-hooks/pre-commit.sh
    ├─ requires: scripts/utils/colors.sh
    ├─ requires: scripts/utils/logging.sh
    ├─ requires: scripts/git-hooks/config.sh (optional)
    ├─ executes: scripts/git-hooks/cleanup-whitespace.sh
    ├─ executes: scripts/git-hooks/lint-staged.sh
    └─ executes: scripts/git-hooks/check-types.sh

scripts/git-hooks/cleanup-whitespace.sh
    ├─ requires: scripts/utils/colors.sh
    └─ requires: scripts/utils/logging.sh

scripts/git-hooks/lint-staged.sh
    ├─ requires: scripts/utils/colors.sh
    ├─ requires: scripts/utils/logging.sh
    └─ requires: npm run lint (package.json)

scripts/git-hooks/check-types.sh
    ├─ requires: scripts/utils/colors.sh
    ├─ requires: scripts/utils/logging.sh
    └─ requires: npm run type-check (package.json)

scripts/utils/logging.sh
    └─ requires: scripts/utils/colors.sh
```

## Execution Timeline

```
Time  │ Action
──────┼────────────────────────────────────────────────────
0ms   │ Developer runs: git commit
10ms  │ Git triggers: .husky/pre-commit
20ms  │ Husky executes: scripts/git-hooks/pre-commit.sh
30ms  │ Load utilities (colors, logging, config)
40ms  │ Display header
50ms  │ Start: Whitespace Cleanup
      │   ├─ Get staged files (50ms)
      │   ├─ Process files (100-500ms)
      │   └─ Re-stage modified files (50ms)
250ms │ Complete: Whitespace Cleanup
260ms │ Start: Code Formatting
      │   ├─ Get staged files (50ms)
      │   ├─ Run Prettier (200-800ms)
      │   └─ Re-stage formatted files (50ms)
1.1s  │ Complete: Code Formatting
1.11s │ Start: Linting
      │   ├─ Get staged TS/JS files (50ms)
      │   ├─ Run ESLint (500-2000ms)
      │   └─ Re-stage fixed files (50ms)
3.2s  │ Complete: Linting
3.21s │ Start: Type Checking
      │   └─ Run tsc --noEmit (1000-3000ms)
5.5s  │ Complete: Type Checking
5.51s │ Display final result
5.52s │ Exit (commit proceeds or blocked)
```

**Total Time:** ~5-6 seconds for typical commit

## Error Handling Flow

```
Check Script Execution
         │
         ├─ Try: Execute check logic
         │   │
         │   ├─ Success: exit 0
         │   │
         │   └─ Failure: exit 1
         │
         ▼
Orchestrator Catches Exit Code
         │
         ├─ If exit 0:
         │   ├─ Log success
         │   └─ Continue to next check
         │
         └─ If exit 1:
             ├─ Log error
             ├─ Set FAILED=1
             └─ Continue to next check
                      │
                      ▼
         After all checks complete:
                      │
         ├─ If FAILED=1: exit 1 (block commit)
         └─ If FAILED=0: exit 0 (allow commit)
```

## Extension Points

### Adding a New Check

1. **Create check script:**

    ```bash
    scripts/git-hooks/my-new-check.sh
    ```

2. **Add to orchestrator:**

    ```bash
    # In scripts/git-hooks/pre-commit.sh
    CHECKS=(
      "cleanup-whitespace.sh:Whitespace Cleanup:1"
      "format-code.sh:Code Formatting (Prettier):1"
      "lint-staged.sh:Linting:1"
      "check-types.sh:Type Checking:1"
      "my-new-check.sh:My New Check:1"  # Add here
    )
    ```

3. **Make executable:**
    ```bash
    chmod +x scripts/git-hooks/my-new-check.sh
    ```

### Adding a New Hook Type

1. **Create hook script:**

    ```bash
    scripts/git-hooks/commit-msg.sh
    ```

2. **Create Husky hook:**
    ```bash
    echo "bash scripts/git-hooks/commit-msg.sh \$1" > .husky/commit-msg
    chmod +x .husky/commit-msg
    ```

### Adding Configuration Options

1. **Add to config.sh:**

    ```bash
    export MY_NEW_OPTION="${MY_NEW_OPTION:-default_value}"
    ```

2. **Use in check script:**
    ```bash
    source "$SCRIPT_DIR/../git-hooks/config.sh"
    if [ "$MY_NEW_OPTION" = "enabled" ]; then
      # Do something
    fi
    ```

## Security Considerations

1. **Script Execution:**
    - All scripts run with user's permissions
    - No elevated privileges required
    - Scripts are version controlled (reviewed by team)

2. **File Modifications:**
    - Only staged files are modified
    - Original files are preserved (Git tracks changes)
    - Changes are re-staged automatically

3. **External Commands:**
    - Only trusted npm scripts are executed
    - No arbitrary command execution
    - All dependencies are in package.json

## Performance Optimization

1. **Only Check Staged Files:**
    - Reduces scope of checks
    - Faster execution
    - Relevant to current commit

2. **Parallel Execution (Future):**
    - Independent checks can run in parallel
    - Reduce total execution time
    - Maintain clear output

3. **Caching (Future):**
    - Cache type checking results
    - Skip unchanged files
    - Invalidate on file changes

## Monitoring & Debugging

### Enable Debug Mode

```bash
DEBUG=1 git commit -m "message"
```

### Enable Verbose Output

```bash
VERBOSE=1 git commit -m "message"
```

### Show Timing Information

```bash
SHOW_TIMING=1 git commit -m "message"
```

### Skip Specific Checks

```bash
SKIP_LINT=1 git commit -m "message"
SKIP_TYPES=1 git commit -m "message"
```

### Run Checks Manually

```bash
# All checks
bash scripts/git-hooks/pre-commit.sh

# Individual check
bash scripts/git-hooks/cleanup-whitespace.sh
```

## Maintenance Checklist

- [ ] Review hook execution times monthly
- [ ] Update Husky when new versions released
- [ ] Add new checks as team needs evolve
- [ ] Remove obsolete checks
- [ ] Update documentation when changes made
- [ ] Test hooks after major Git/Node.js updates
- [ ] Gather team feedback on hook behavior
- [ ] Optimize slow checks
