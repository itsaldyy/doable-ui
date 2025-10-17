# Node.js Version Management Setup

This project uses Node.js v20.19.5 (specified in `.nvmrc`). We provide multiple ways to automatically switch to the correct version when entering the project directory.

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
    cd /path/to/to-do-react-ts
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
- Automatically sources `.nvmrc-loader.sh` when entering the directory
- Requires `direnv allow` to be run once for security

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
cd .. && cd to-do-react-ts

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

## Further Reading

- [nvm Documentation](https://github.com/nvm-sh/nvm)
- [direnv Documentation](https://direnv.net/)
- [Node.js Version Management Best Practices](https://nodejs.org/en/download/package-manager)
