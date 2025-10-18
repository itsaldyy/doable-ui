# Git Hooks Quick Reference

## 🚀 Quick Commands

### Run All Checks

```bash
bash scripts/git-hooks/pre-commit.sh
```

### Run Individual Checks

```bash
bash scripts/git-hooks/lint-staged.sh
bash scripts/git-hooks/check-types.sh
bash scripts/git-hooks/run-tests.sh
bash scripts/git-hooks/cleanup-whitespace.sh
bash scripts/git-hooks/format-code.sh
```

### Skip Hooks (Emergency)

```bash
git commit --no-verify -m "message"
# or
git commit -n -m "message"
```

## 🎯 What Gets Checked

| Check                  | What It Does                                    | Auto-Fix |
| ---------------------- | ----------------------------------------------- | -------- |
| **Linting**            | Catches bugs & standard violations with ESLint  | ✅ Yes   |
| **Type Checking**      | Ensures TypeScript types are correct            | ❌ No    |
| **Unit Tests**         | Verifies functional correctness with Jest       | ❌ No    |
| **Whitespace Cleanup** | Removes trailing spaces & excessive blank lines | ✅ Yes   |
| **Code Formatting**    | Formats code with Prettier per `.prettierrc`    | ✅ Yes   |

**Order:** Validate correctness first (lint → types → tests), then apply cosmetic fixes (whitespace → format)

## ⚙️ Configuration

Edit `scripts/git-hooks/config.sh`:

```bash
# Disable a check
export LINT_ENABLED=0

# Adjust whitespace cleanup
export MAX_CONSECUTIVE_BLANK_LINES=2

# Enable verbose output
export VERBOSE=1
```

## 🐛 Troubleshooting

### Hooks Not Running

```bash
npm run prepare
```

### Permission Denied

```bash
chmod +x scripts/git-hooks/*.sh scripts/utils/*.sh
```

### Slow Hooks

```bash
# Skip for WIP commits
git commit -n -m "WIP: work in progress"
```

## 🔧 Environment Variables

| Variable                     | Default | Description                |
| ---------------------------- | ------- | -------------------------- |
| `LINT_ENABLED`               | 1       | Enable linting             |
| `TYPE_CHECK_ENABLED`         | 1       | Enable type checking       |
| `RUN_TESTS_ON_COMMIT`        | 1       | Enable unit tests          |
| `CLEANUP_WHITESPACE_ENABLED` | 1       | Enable whitespace cleanup  |
| `FORMAT_ENABLED`             | 1       | Enable Prettier formatting |
| `VERBOSE`                    | 0       | Show detailed output       |
| `DEBUG`                      | 0       | Show debug messages        |
| `SKIP_LINT`                  | 0       | Skip linting check         |
| `SKIP_TYPES`                 | 0       | Skip type checking         |
| `SKIP_TESTS`                 | 0       | Skip unit tests            |
| `SKIP_FORMAT`                | 0       | Skip Prettier formatting   |

## 📖 Documentation

- **Full Docs:** `scripts/git-hooks/README.md`
- **Setup Guide:** `scripts/git-hooks/SETUP.md`
- **Architecture:** `scripts/git-hooks/ARCHITECTURE.md`
- **Knowledge Transfer:** `docs/knowledge-transfer/git-hooks-setup.md`

## 💡 Tips

1. **Commit Often** - Hooks are fast, commit frequently
2. **Auto-fixes** - Many issues are fixed automatically
3. **Clear Messages** - Hooks provide clear error messages
4. **Test First** - Run checks manually before committing
5. **Skip Wisely** - Only use `--no-verify` in emergencies

## 🎨 Output Colors

- 🔵 **Blue (ℹ)** - Information
- 🟢 **Green (✓)** - Success
- 🟡 **Yellow (⚠)** - Warning
- 🔴 **Red (✗)** - Error

## 📞 Need Help?

1. Read the full documentation
2. Check the troubleshooting section
3. Ask the team
4. Open an issue in the project repository
