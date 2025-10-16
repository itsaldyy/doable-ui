# Prettier Integration with Git Hooks

## Overview

This document describes the integration of Prettier into the pre-commit hooks system to enforce consistent code formatting across the entire codebase.

## Motivation

**Problem:** Inconsistent code formatting across the team leads to:

- Noisy git diffs with formatting changes
- Code review friction over style preferences
- Time wasted on manual formatting
- Inconsistent codebase appearance

**Solution:** Integrate Prettier into pre-commit hooks to automatically format all staged files according to `.prettierrc` configuration before commit.

## Implementation

### 1. Created `format-code.sh` Hook

**Location:** `scripts/git-hooks/format-code.sh`

**What it does:**

1. Gets all staged files that Prettier can format (JS, TS, JSON, CSS, MD, etc.)
2. Filters out files listed in `.prettierignore`
3. Runs `npx prettier --write` on the files
4. Re-stages the formatted files automatically
5. Reports results with colored output

**Key Features:**

- Only processes staged files (fast)
- Respects `.prettierignore` exclusions
- Auto-fixes formatting issues
- Re-stages modified files
- Provides clear feedback

### 2. Updated Pre-commit Orchestrator

**File:** `scripts/git-hooks/pre-commit.sh`

**Change:** Added Prettier formatting as the second check (after whitespace cleanup, before linting):

```bash
CHECKS=(
  "cleanup-whitespace.sh:Whitespace Cleanup:1"
  "format-code.sh:Code Formatting (Prettier):1"  # ← Added
  "lint-staged.sh:Linting:1"
  "check-types.sh:Type Checking:1"
)
```

**Rationale for Order:**

1. **Whitespace Cleanup** - Removes excessive blank lines first
2. **Prettier Formatting** - Formats code structure and style
3. **Linting** - Checks code quality (after formatting)
4. **Type Checking** - Validates types (final check)

This order ensures that formatting is applied before linting, reducing potential conflicts.

### 3. Updated Configuration

**File:** `scripts/git-hooks/config.sh`

**Added:**

```bash
export FORMAT_ENABLED="${FORMAT_ENABLED:-1}"
export PRETTIER_CONFIG="${PRETTIER_CONFIG:-.prettierrc}"
```

**Usage:**

- `FORMAT_ENABLED=0` - Disable Prettier formatting
- `PRETTIER_CONFIG=custom.json` - Use custom Prettier config

### 4. Prettier Configuration

**File:** `.prettierrc`

```json
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 4,
    "useTabs": false
}
```

**File:** `.prettierignore`

```
node_modules
dist
build
coverage
.storybook-static
*.min.js
*.min.css
package-lock.json
```

## Benefits

### 1. Consistency

- ✅ All code follows the same formatting rules
- ✅ No more debates about code style
- ✅ Uniform appearance across the codebase

### 2. Automation

- ✅ Formatting happens automatically on commit
- ✅ No manual formatting needed
- ✅ Developers can focus on logic, not style

### 3. Clean Git History

- ✅ No formatting-only commits
- ✅ Cleaner diffs (only logical changes)
- ✅ Easier code reviews

### 4. Team Productivity

- ✅ Reduces code review friction
- ✅ Saves time on manual formatting
- ✅ Onboarding is easier (formatting is automatic)

## Workflow

### Before Prettier Integration

```
Developer writes code
  ↓
Developer manually formats (maybe)
  ↓
Developer commits
  ↓
Code review: "Please fix formatting"
  ↓
Developer fixes formatting
  ↓
Another commit for formatting
```

### After Prettier Integration

```
Developer writes code
  ↓
Developer commits
  ↓
Pre-commit hook runs Prettier automatically
  ↓
Code is formatted and re-staged
  ↓
Commit proceeds with formatted code
  ↓
Code review: Focus on logic, not formatting
```

## Supported File Types

Prettier formats the following file types:

- **JavaScript:** `.js`, `.jsx`
- **TypeScript:** `.ts`, `.tsx`
- **JSON:** `.json`
- **CSS:** `.css`, `.scss`
- **Markdown:** `.md`
- **HTML:** `.html`
- **YAML:** `.yaml`, `.yml`

## Usage Examples

### Automatic (Recommended)

```bash
# Just commit normally - Prettier runs automatically
git add src/components/Button.tsx
git commit -m "feat: add Button component"

# Output:
# → Running: Code Formatting (Prettier)
# ℹ Running Prettier formatting...
# → Formatting 1 file(s)...
# ✓ Formatted 1 file(s)
# ✓ Code Formatting (Prettier) passed
```

### Manual Testing

```bash
# Test Prettier formatting manually
bash scripts/git-hooks/format-code.sh

# Format specific files manually
npx prettier --write src/components/Button.tsx
```

### Disable Temporarily

```bash
# Skip all hooks (including Prettier)
git commit --no-verify -m "WIP: work in progress"

# Or set environment variable
FORMAT_ENABLED=0 git commit -m "Skip formatting"
```

## Integration with ESLint

Prettier and ESLint work together:

1. **Prettier** handles formatting (spacing, line breaks, quotes)
2. **ESLint** handles code quality (unused variables, best practices)

**Order in pre-commit:**

1. Prettier formats the code
2. ESLint checks the formatted code

This prevents conflicts between Prettier and ESLint formatting rules.

## Troubleshooting

### Issue: Prettier and ESLint Conflict

**Solution:** Ensure ESLint is configured to work with Prettier:

- Use `eslint-config-prettier` to disable ESLint formatting rules
- Let Prettier handle all formatting
- Let ESLint handle code quality

### Issue: Files Not Being Formatted

**Check:**

1. Is the file type supported by Prettier?
2. Is the file in `.prettierignore`?
3. Is `FORMAT_ENABLED=1`?
4. Run manually to see errors: `bash scripts/git-hooks/format-code.sh`

### Issue: Formatting Takes Too Long

**Solutions:**

- Prettier only formats staged files (already optimized)
- Consider excluding large generated files in `.prettierignore`
- Check if you're staging too many files at once

## Performance

**Typical Performance:**

- 1-5 files: ~200-500ms
- 10-20 files: ~500-1000ms
- 50+ files: ~1-2 seconds

**Optimization:**

- Only staged files are formatted
- Files in `.prettierignore` are skipped
- Prettier is fast (written in JavaScript, optimized)

## Team Adoption

### For New Team Members

1. **Automatic Setup:** Hooks install via `npm install`
2. **No Configuration Needed:** Works out of the box
3. **Transparent:** Formatting happens automatically
4. **Feedback:** Clear messages show what was formatted

### For Existing Codebase

**Option 1: Format Everything at Once**

```bash
# Format entire codebase
npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"

# Commit the formatting changes
git add .
git commit -m "chore: format codebase with Prettier"
```

**Option 2: Gradual Adoption**

- Let pre-commit hooks format files as they're modified
- Over time, the entire codebase will be formatted
- No big-bang formatting commit needed

## Configuration Customization

### Adjust Prettier Rules

Edit `.prettierrc`:

```json
{
    "semi": false, // No semicolons
    "singleQuote": false, // Use double quotes
    "printWidth": 100, // Longer lines
    "tabWidth": 2, // 2-space indentation
    "trailingComma": "all" // Trailing commas everywhere
}
```

### Ignore Additional Files

Edit `.prettierignore`:

```
# Existing ignores
node_modules
dist

# Add custom ignores
*.generated.ts
legacy/
```

## Best Practices

1. **Commit Prettier Config:** Always version control `.prettierrc` and `.prettierignore`
2. **Team Agreement:** Agree on formatting rules as a team
3. **Don't Fight It:** Trust Prettier's decisions, don't override manually
4. **Editor Integration:** Install Prettier extension in your IDE for real-time formatting
5. **CI/CD Check:** Add Prettier check in CI to catch any bypassed commits

## Future Enhancements

1. **Editor Integration Guide:** Document how to set up Prettier in VS Code, WebStorm, etc.
2. **CI/CD Integration:** Add Prettier check in CI pipeline
3. **Pre-push Hook:** Add Prettier check before push (in addition to pre-commit)
4. **Metrics:** Track formatting changes over time
5. **Custom Rules:** Add project-specific Prettier plugins if needed

## Conclusion

Prettier integration ensures that all code in the repository follows consistent formatting standards automatically. This reduces friction, improves code review quality, and maintains a clean, professional codebase.

**Key Takeaway:** Developers can now focus on writing great code, and Prettier will handle the formatting automatically! 💅✨

---

**Last Updated:** 2025-01-16
**Related Documents:**

- `scripts/git-hooks/README.md` - Full hooks documentation
- `scripts/git-hooks/ARCHITECTURE.md` - Technical architecture
- `docs/knowledge-transfer/git-hooks-setup.md` - Initial hooks setup
