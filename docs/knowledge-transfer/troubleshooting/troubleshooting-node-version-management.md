# Troubleshooting Node.js Version Management

This document covers common issues and solutions when using automatic Node.js version switching with direnv and nvm.

## Common Issues

### 1. `__vsc_prompt_cmd_original: command not found`

**Symptom:**

```bash
$ cd doable-ui/
direnv: loading ~/path/to/doable-ui/.envrc
Found '/home/user/path/to/projects/doable-ui/.nvmrc' with version <20.19.5>
Now using node v20.19.5 (npm v10.8.2)
__vsc_prompt_cmd_original: command not found
```

**What's Happening:**

- VS Code (or Kiro IDE) sets a special `PROMPT_COMMAND` variable to customize the terminal prompt
- When `nvm use` runs, it can sometimes clear or modify this variable
- The shell then tries to execute the missing command, causing the error

**Impact:**

- ⚠️ Harmless error message (doesn't affect functionality)
- ✅ Node version switching still works correctly
- ✅ direnv is working properly

**Solution:**
This has been fixed in the latest version of `.envrc` and `.nvmrc-loader.sh`. The scripts now:

1. Save `PROMPT_COMMAND` before running nvm
2. Restore it after nvm completes
3. Use `--silent` flag to reduce noise

**If you still see this error:**

```bash
# Re-allow direnv to pick up the fixes
direnv allow

# Or reload your terminal
exit
# Open new terminal
```

### 2. `direnv: error .envrc is blocked`

**Symptom:**

```bash
direnv: error .envrc is blocked. Run `direnv allow` to approve its content.
```

**Solution:**

```bash
direnv allow
```

**Why this happens:**

- direnv blocks `.envrc` files by default for security
- You must explicitly allow each project's `.envrc`
- This is a safety feature to prevent malicious scripts

### 3. Node version doesn't switch automatically

**Symptom:**

- You `cd` into the project but Node version stays the same
- No direnv messages appear

**Possible Causes & Solutions:**

**A. direnv not installed**

```bash
# Check if direnv is installed
which direnv

# If not found, run the setup script
bash scripts/setup-node-version-manager.sh
```

**B. direnv hook not configured**

```bash
# Check if direnv hook is in your shell config
grep "direnv hook" ~/.bashrc  # or ~/.zshrc

# If not found, add it manually
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```

**C. .envrc not allowed**

```bash
# Allow direnv for this project
direnv allow
```

**D. Shell not reloaded after setup**

```bash
# Reload your shell config
source ~/.bashrc  # or ~/.zshrc

# Or restart your terminal
```

### 4. `nvm: command not found`

**Symptom:**

```bash
direnv: loading .envrc
bash: nvm: command not found
```

**Solution:**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install required Node version
nvm install 20.19.5
```

### 5. Wrong Node version after switching directories

**Symptom:**

- Node version doesn't revert when leaving the project
- Or wrong version is active

**Solution:**
This is expected behavior with direnv. To manually switch:

```bash
# Use system default Node
nvm use system

# Or use a specific version
nvm use 18

# Or let nvm auto-detect from .nvmrc in another project
nvm use
```

### 6. Slow terminal startup

**Symptom:**

- Terminal takes a long time to open
- Noticeable delay when `cd`-ing into project

**Possible Causes:**

- nvm initialization is slow
- Multiple direnv hooks running

**Solutions:**

**A. Use lazy loading for nvm**
Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Lazy load nvm (faster shell startup)
export NVM_DIR="$HOME/.nvm"
nvm() {
    unset -f nvm
    [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
    nvm "$@"
}
```

**B. Check for duplicate direnv hooks**

```bash
# Should only appear once
grep -c "direnv hook" ~/.bashrc
```

### 7. Permission denied errors

**Symptom:**

```bash
bash: ./scripts/setup-node-version-manager.sh: Permission denied
```

**Solution:**

```bash
# Make script executable
chmod +x scripts/setup-node-version-manager.sh

# Or run with bash
bash scripts/setup-node-version-manager.sh
```

### 8. direnv not working in VS Code integrated terminal

**Symptom:**

- direnv works in external terminal
- Doesn't work in VS Code integrated terminal

**Solutions:**

**A. Restart VS Code**

```bash
# Close VS Code completely and reopen
```

**B. Check VS Code settings**
Open VS Code settings (Ctrl+,) and ensure:

```json
{
    "terminal.integrated.inheritEnv": true
}
```

**C. Reload window**

- Press `Ctrl+Shift+P`
- Type "Reload Window"
- Press Enter

### 9. `npm: command not found` after switching versions

**Symptom:**

```bash
$ node -v
v20.19.5
$ npm -v
bash: npm: command not found
```

**Solution:**

```bash
# Reinstall the Node version
nvm uninstall 20.19.5
nvm install 20.19.5

# Verify both work
node -v
npm -v
```

## Debugging Tips

### Check direnv status

```bash
# See what direnv is doing
direnv status

# See current environment
direnv export bash
```

### Check nvm status

```bash
# List installed versions
nvm ls

# See current version
nvm current

# See nvm installation path
echo $NVM_DIR
```

### Verify Node version

```bash
# Check Node version
node -v

# Check npm version
npm -v

# Check where Node is installed
which node
```

### Test .envrc manually

```bash
# Source .envrc manually to see errors
source .envrc
```

### Enable direnv logging

```bash
# See detailed direnv logs
export DIRENV_LOG_FORMAT="direnv: %s"
direnv allow
cd ..
cd doable-ui
```

## Getting Help

If you're still experiencing issues:

1. **Check the documentation:**
    - [docs/NODE_VERSION_SETUP.md](NODE_VERSION_SETUP.md)
    - [nvm documentation](https://github.com/nvm-sh/nvm)
    - [direnv documentation](https://direnv.net/)

2. **Verify your setup:**

    ```bash
    # Run diagnostics
    echo "Shell: $SHELL"
    echo "OS: $(uname -s)"
    which direnv
    which nvm
    node -v
    npm -v
    ```

3. **Try the automated setup:**

    ```bash
    bash scripts/setup-node-version-manager.sh
    ```

4. **Check for conflicts:**
    ```bash
    # Look for other version managers
    which nodenv
    which n
    which fnm
    ```

## Best Practices

1. **Always allow .envrc after pulling changes:**

    ```bash
    git pull
    direnv allow
    ```

2. **Keep nvm updated:**

    ```bash
    # Update nvm
    cd "$NVM_DIR"
    git fetch --tags origin
    git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`
    source "$NVM_DIR/nvm.sh"
    ```

3. **Use .nvmrc consistently:**
    - Always commit `.nvmrc` to version control
    - Update it when changing Node versions
    - Document version changes in commit messages

4. **Test in clean environment:**
    ```bash
    # Test setup in a new shell
    bash --noprofile --norc
    source ~/.bashrc
    cd /path/to/project
    ```

## Related Files

- `.nvmrc` - Specifies required Node.js version
- `.envrc` - direnv configuration for automatic loading
- `.nvmrc-loader.sh` - Shell script for manual loading
- `scripts/setup-node-version-manager.sh` - Automated setup script
