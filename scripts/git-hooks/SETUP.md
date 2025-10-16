# Git Hooks Setup Guide

This guide will help you get started with the Git hooks in this project.

## Quick Start

The hooks are automatically installed when you run:

```bash
npm install
```

That's it! The hooks will now run automatically on every commit.

## What Gets Checked

Every time you commit, the following checks run automatically (in order):

1. 🔍 **Linting** - Catches bugs and standard violations with ESLint (auto-fixes when possible)
2. 🔒 **Type Checking** - Ensures TypeScript types are correct
3. ✅ **Unit Tests** - Verifies functional correctness with Jest
4. ✨ **Whitespace Cleanup** - Removes trailing spaces and excessive blank lines
5. 💅 **Code Formatting** - Formats code with Prettier per `.prettierrc` (auto-fixes)

**Why this order?** We validate correctness first (lint → types → tests), then apply cosmetic fixes (whitespace → format). This "fail fast" approach catches real issues before wasting time on formatting.

## Testing the Setup

Try making a commit to see the hooks in action:

```bash
# Make a small change
echo "// test" >> src/App.tsx

# Stage the change
git add src/App.tsx

# Commit (hooks will run automatically)
git commit -m "test: verify hooks are working"
```

You should see colorful output showing each check running.

## Skipping Hooks (Emergency Only)

If you absolutely need to skip the hooks (not recommended):

```bash
git commit --no-verify -m "Emergency commit"
```

## Customizing Hook Behavior

Edit `scripts/git-hooks/config.sh` to customize settings:

```bash
# Disable specific checks
export LINT_ENABLED=0
export TYPE_CHECK_ENABLED=0

# Adjust whitespace cleanup
export MAX_CONSECUTIVE_BLANK_LINES=2
```

## Running Hooks Manually

Test hooks without committing:

```bash
# Run all pre-commit checks
bash scripts/git-hooks/pre-commit.sh

# Run individual checks (in order)
bash scripts/git-hooks/lint-staged.sh
bash scripts/git-hooks/check-types.sh
bash scripts/git-hooks/run-tests.sh
bash scripts/git-hooks/cleanup-whitespace.sh
bash scripts/git-hooks/format-code.sh
```

## Troubleshooting

### "Permission denied" errors

Make scripts executable:

```bash
chmod +x scripts/git-hooks/*.sh scripts/utils/*.sh
```

### Hooks not running

Reinstall Husky:

```bash
npm run prepare
```

### Slow hooks

The hooks are designed to be fast by only checking staged files. If they're slow:

1. Check if you have many staged files
2. Consider disabling non-critical checks temporarily
3. Use `--no-verify` for work-in-progress commits

## Need Help?

- Read the full documentation: `scripts/git-hooks/README.md`
- Check the configuration: `scripts/git-hooks/config.sh`
- Ask the team in your project's communication channel

## Benefits

✅ **Consistent Code Quality** - Everyone follows the same standards
✅ **Consistent Formatting** - Prettier ensures uniform code style
✅ **Catch Errors Early** - Find issues before they reach CI/CD
✅ **Auto-fixing** - Many issues are fixed automatically
✅ **Fast Feedback** - Know immediately if something is wrong
✅ **Team Alignment** - Shared hooks ensure consistency across the team
