---
title: Agentic Git Commands Best Practices
inclusion: always
---

# Git Commands for Kiro Agent

## Always Use --no-pager for Git Commands

When running Git commands that display output (diff, log, show, etc.), always use `--no-pager` to prevent blocking on interactive pagers.

### Examples

**DO THIS:**

```bash
git --no-pager diff <file>
git --no-pager log --oneline -n 10
git --no-pager show HEAD
git --no-pager status
```

**DON'T DO THIS:**

```bash
git diff <file>          # ❌ Will block on pager
git log                  # ❌ Will block on pager
git show HEAD            # ❌ Will block on pager
```

### Why This Matters

Git uses a pager (like `less`) by default for commands with long output. The pager:

- Waits for user input (q to quit)
- Blocks command execution
- Prevents agent from proceeding

Using `--no-pager` ensures output goes directly to stdout without interactive paging.

### Commands That Need --no-pager

- `git diff`
- `git log`
- `git show`
- `git blame`
- `git branch -v`
- Any command with potentially long output

### Commands That Don't Need It

- `git add` (no output)
- `git commit` (short output)
- `git push` (short output)
- `git pull` (short output)
- `git status` (usually short, but use --no-pager to be safe)

## Showing Changes to User

When making changes to files, use `readFile` to open the file in an IDE tab so the user can review the changes directly in the editor.

**Example:**

```typescript
// After modifying a file
await readFile({
    path: 'package.json',
    explanation: 'Opening updated package.json for your review',
});
```

This is better than just showing git diff output because:

- User can see the full file context
- Syntax highlighting works
- User can edit directly if needed
- More natural IDE workflow
