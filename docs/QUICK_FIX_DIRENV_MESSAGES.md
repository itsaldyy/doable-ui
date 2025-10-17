# Quick Fix: Hiding direnv Verbose Messages

## Problem

You see verbose direnv messages like:

```bash
direnv: loading ~/Dev/personal/projects/to-do-react-ts/.envrc
direnv: export ~NVM_BIN ~NVM_INC ~PATH
```

## Solution

The fix is already in your `~/.bashrc`, but you need to **reload your shell** for it to take effect.

### Option 1: Reload Shell Config (Quick)

```bash
source ~/.bashrc
```

### Option 2: Restart Terminal (Recommended)

Close and reopen your terminal application.

### Option 3: Start New Shell Session

```bash
exec bash -l
```

## Verify It's Working

After reloading, check if the variable is set:

```bash
echo "DIRENV_LOG_FORMAT: '$DIRENV_LOG_FORMAT'"
```

Should output:

```
DIRENV_LOG_FORMAT: ''
```

## Test

Navigate away and back to the project:

```bash
cd ~
cd ~/Dev/personal/projects/to-do-react-ts
```

### ✅ What You Should See

```bash
🔄 Node.js: v16.19.1 → v20.19.5 (project requires v20.19.5)
```

### ❌ What You Should NOT See

```bash
direnv: loading ~/Dev/personal/projects/to-do-react-ts/.envrc
direnv: export ~NVM_BIN ~NVM_INC ~PATH
```

## Still Seeing Messages?

Run the diagnostic script:

```bash
bash scripts/fix-direnv-messages.sh
```

This will check your configuration and provide specific guidance.

## Why This Happens

- The `DIRENV_LOG_FORMAT=""` variable must be set in your shell environment
- It's added to `~/.bashrc` automatically by the setup script
- But your current terminal session doesn't have it yet
- You need to reload the shell config or restart the terminal

## Technical Details

The environment variable `DIRENV_LOG_FORMAT` controls direnv's output format:

- When set to empty string `""`, direnv suppresses its verbose messages
- Our custom messages in `.envrc` and `.envrc.leave` still display
- This gives you clean, informative output without the noise

## Related Files

- `~/.bashrc` - Contains `export DIRENV_LOG_FORMAT=""`
- `.envrc` - Shows custom enter message
- `.envrc.leave` - Shows custom exit message
- `~/.config/direnv/direnv.toml` - Additional direnv configuration
