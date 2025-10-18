# Node.js Version Management Setup

This project uses Node.js v20.19.5 (specified in `.nvmrc`). We provide multiple ways to automatically switch to the correct version when entering the project directory.

## 🚀 Automated Setup (Recommended)

The easiest way to get started is using our automated setup script:

```bash
bash scripts/setup-node-version-manager.sh
```

**What it does:**

- ✅ Detects your OS (Ubuntu, Debian, Fedora, RHEL, CentOS, Arch, Manjaro, macOS)
- ✅ Installs direnv using your system's package manager (with confirmation)
- ✅ Configures your shell automatically (bash, zsh, fish)
- ✅ Allows direnv for this project
- ✅ Checks nvm and Node.js installation
- ✅ Installs required Node version if missing
- ✅ Safe to run multiple times (idempotent)
- ✅ Provides helpful error messages and guidance

**After setup, you'll see clean, informative messages:**

```bash
# When entering the project directory:
🔄 Node.js: v16.19.1 → v20.19.5 (project requires v20.19.5)

# When leaving the project directory:
🔙 Node.js: v20.19.5 → v16.19.1 (left project directory)
```

**Note:** Verbose direnv messages are automatically hidden. You'll only see Node version changes.

**Supported Systems:**

- Ubuntu/Debian (apt)
- Fedora/RHEL/CentOS (dnf/yum)
- Arch/Manjaro (pacman)
- macOS (Homebrew or curl)
- Generic Linux (curl fallback)

After running the script, just reload your shell or restart your terminal, and Node.js will automatically switch when you enter the project!

---

## Manual Setup Options

If you prefer to set things up manually or need more control, choose one of these options:

## Quick Start

### Option 1: direnv (Recommended - Fully Automatic)

**Best for:** Developers who want zero-friction automatic version switching

1. **Install direnv:**

    ```bash
    # macOS
    brew install direnv

    # Ubuntu/Debian
    sudo apt install direnv

    # Other systems: https://direnv.net/docs/installation.html
    ```

2. **Add direnv hook to your shell:**

    ```bash
    # For bash (~/.bashrc)
    echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

    # For zsh (~/.zshrc)
    echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc

    # For fish (~/.config/fish/config.fish)
    echo 'direnv hook fish | source' >> ~/.config/fish/config.fish
    ```

3. **Reload your shell:**

    ```bash
    source ~/.bashrc  # or ~/.zshrc, etc.
    ```

4. **Allow direnv for this project:**
    ```bash
    cd /path/to/doable-ui
    direnv allow
    ```

**How it works:**

- When you `cd` into the project, direnv automatically runs `.envrc`
- `.envrc` loads nvm and switches to the correct Node version
- When you leave the project, your previous Node version is restored
- Zero manual intervention required!

### Option 2: Manual Source (Simple)

**Best for:** Developers who don't want to install additional tools

```bash
# Run this command when you open a terminal in the project
source .nvmrc-loader.sh
```

**Tip:** Add an alias to your shell config for convenience:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias nvmload='source .nvmrc-loader.sh'

# Then just run:
nvmload
```

### Option 3: Standard nvm (Manual)

**Best for:** Developers already familiar with nvm

```bash
# Switch to the correct version
nvm use

# If not installed, install it first
nvm install
```

## What Each File Does

### `.nvmrc`

- Specifies the required Node.js version (20.19.5)
- Standard file recognized by nvm and other tools

### `.nvmrc-loader.sh`

- Shell script that automatically switches Node versions
- Can be sourced manually or by other tools
- Provides helpful messages if nvm is not available
- Automatically installs the version if missing

### `.envrc`

- Configuration file for direnv
- Automatically loads Node.js version when entering the directory
- Shows informative message about version switching
- Requires `direnv allow` to be run once for security

### `.envrc.leave`

- Executed when leaving the project directory
- Restores previous Node.js version
- Shows informative message about version restoration

### `~/.config/direnv/direnv.toml`

- Global direnv configuration (created automatically)
- Hides verbose direnv messages (`direnv: loading`, `direnv: export`, etc.)
- Keeps terminal output clean and focused on Node version changes

## Troubleshooting

### "nvm: command not found"

Install nvm first:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Then reload your shell or run:

```bash
source ~/.bashrc  # or ~/.zshrc
```

### "direnv: command not found"

Install direnv using your package manager (see Option 1 above).

### Wrong Node version still active

```bash
# Verify current version
node -v

# Force switch with nvm
nvm use

# Or re-source the loader
source .nvmrc-loader.sh
```

### direnv not working

```bash
# Make sure you've allowed the project
direnv allow

# Check if direnv hook is in your shell config
echo $SHELL
cat ~/.bashrc | grep direnv  # or ~/.zshrc
```

## Benefits

✅ **Consistency:** Everyone uses the same Node version
✅ **Automatic:** No need to remember to switch versions
✅ **Safe:** Prevents version-related bugs and issues
✅ **Fast:** Instant switching when entering the directory
✅ **Clean:** Version-controlled, no global pollution

## Verification

After setup, verify it's working:

```bash
# Leave and re-enter the project directory
cd .. && cd doable-ui

# Check Node version
node -v
# Should output: v20.19.5
```

## IDE Integration

### VS Code

VS Code terminals will automatically use the correct Node version if:

- You have direnv installed and configured
- You've run `direnv allow` in the project

### Other IDEs

Most IDEs respect the system Node version. If using direnv, the correct version will be active in integrated terminals.

## CI/CD

In CI/CD environments, use the `.nvmrc` file directly:

```yaml
# GitHub Actions example
- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'

# GitLab CI example
image: node:20.19.5
```

## Automated Setup Script Details

### What the Script Does

The `scripts/setup-node-version-manager.sh` script provides a comprehensive, safe setup process:

1. **OS Detection**: Automatically detects your operating system and version
2. **direnv Installation**: Installs direnv using your system's native package manager
3. **Shell Configuration**: Adds direnv hook to your shell config file (.bashrc, .zshrc, etc.)
4. **Project Authorization**: Runs `direnv allow` for this project
5. **nvm Verification**: Checks if nvm is installed and working
6. **Node Installation**: Installs the required Node.js version if missing

### Safety Features

- ✅ **Idempotent**: Safe to run multiple times without side effects
- ✅ **Confirmation Prompts**: Asks before installing or modifying system
- ✅ **Error Handling**: Gracefully handles errors with helpful messages
- ✅ **Non-Destructive**: Only adds to config files, never removes
- ✅ **Rollback Friendly**: All changes are clearly marked in config files

### Supported Package Managers

- **apt-get** (Ubuntu, Debian)
- **dnf** (Fedora, RHEL 8+)
- **yum** (CentOS, RHEL 7)
- **pacman** (Arch, Manjaro)
- **brew** (macOS)
- **curl** (Generic fallback)

### Script Output

The script provides color-coded output:

- 🟢 **Green checkmarks**: Successful operations
- 🔵 **Blue info**: Informational messages
- 🟡 **Yellow warnings**: Non-critical issues
- 🔴 **Red errors**: Critical problems requiring attention

### Manual Inspection

You can review the script before running:

```bash
cat scripts/setup-node-version-manager.sh
```

All operations are transparent and logged to the console.

## Troubleshooting

Having issues? See the comprehensive troubleshooting guide:

- [docs/TROUBLESHOOTING_NODE_VERSION.md](TROUBLESHOOTING_NODE_VERSION.md)

Common issues covered:

- `__vsc_prompt_cmd_original: command not found` (VS Code terminal)
- direnv not working
- Node version not switching
- Permission errors
- And many more...

## Further Reading

- [nvm Documentation](https://github.com/nvm-sh/nvm)
- [direnv Documentation](https://direnv.net/)
- [Node.js Version Management Best Practices](https://nodejs.org/en/download/package-manager)
