#!/bin/bash
# Automatic setup script for Node.js version management
# This script safely installs and configures direnv for automatic Node version switching
# Safe to run multiple times (idempotent)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$ID
            OS_VERSION=$VERSION_ID
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
}

# Check if direnv is installed
check_direnv() {
    if command -v direnv &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Check if nvm is installed
check_nvm() {
    if [ -s "$NVM_DIR/nvm.sh" ] || [ -s "$HOME/.nvm/nvm.sh" ]; then
        return 0
    else
        return 1
    fi
}

# Install direnv based on OS
install_direnv() {
    print_header "Installing direnv"

    case $OS in
        ubuntu|debian)
            print_info "Detected Debian/Ubuntu Linux"
            if command -v apt-get &> /dev/null; then
                print_info "Installing direnv via apt..."
                sudo apt-get update -qq
                sudo apt-get install -y direnv
                print_success "direnv installed successfully"
            else
                print_error "apt-get not found. Please install direnv manually."
                return 1
            fi
            ;;

        fedora|rhel|centos)
            print_info "Detected Fedora/RHEL/CentOS Linux"
            if command -v dnf &> /dev/null; then
                print_info "Installing direnv via dnf..."
                sudo dnf install -y direnv
                print_success "direnv installed successfully"
            elif command -v yum &> /dev/null; then
                print_info "Installing direnv via yum..."
                sudo yum install -y direnv
                print_success "direnv installed successfully"
            else
                print_error "Package manager not found. Please install direnv manually."
                return 1
            fi
            ;;

        arch|manjaro)
            print_info "Detected Arch/Manjaro Linux"
            if command -v pacman &> /dev/null; then
                print_info "Installing direnv via pacman..."
                sudo pacman -S --noconfirm direnv
                print_success "direnv installed successfully"
            else
                print_error "pacman not found. Please install direnv manually."
                return 1
            fi
            ;;

        macos)
            print_info "Detected macOS"
            if command -v brew &> /dev/null; then
                print_info "Installing direnv via Homebrew..."
                brew install direnv
                print_success "direnv installed successfully"
            else
                print_warning "Homebrew not found. Installing via curl..."
                curl -sfL https://direnv.net/install.sh | bash
                print_success "direnv installed successfully"
            fi
            ;;

        windows)
            print_error "Windows detected. Please install direnv manually:"
            print_info "Visit: https://direnv.net/docs/installation.html"
            return 1
            ;;

        *)
            print_warning "Unknown OS. Attempting generic installation..."
            if command -v curl &> /dev/null; then
                curl -sfL https://direnv.net/install.sh | bash
                print_success "direnv installed successfully"
            else
                print_error "Could not install direnv automatically."
                print_info "Please install manually: https://direnv.net/docs/installation.html"
                return 1
            fi
            ;;
    esac
}

# Detect shell and get config file
get_shell_config() {
    CURRENT_SHELL=$(basename "$SHELL")

    case $CURRENT_SHELL in
        bash)
            if [ -f "$HOME/.bashrc" ]; then
                echo "$HOME/.bashrc"
            elif [ -f "$HOME/.bash_profile" ]; then
                echo "$HOME/.bash_profile"
            else
                echo "$HOME/.bashrc"
            fi
            ;;
        zsh)
            echo "$HOME/.zshrc"
            ;;
        fish)
            echo "$HOME/.config/fish/config.fish"
            ;;
        *)
            echo "$HOME/.profile"
            ;;
    esac
}

# Add direnv hook to shell config
setup_direnv_hook() {
    print_header "Configuring direnv hook"

    SHELL_CONFIG=$(get_shell_config)
    CURRENT_SHELL=$(basename "$SHELL")

    print_info "Detected shell: $CURRENT_SHELL"
    print_info "Config file: $SHELL_CONFIG"

    # Create config file if it doesn't exist
    if [ ! -f "$SHELL_CONFIG" ]; then
        print_info "Creating $SHELL_CONFIG..."
        mkdir -p "$(dirname "$SHELL_CONFIG")"
        touch "$SHELL_CONFIG"
    fi

    # Check if direnv hook already exists
    case $CURRENT_SHELL in
        bash)
            HOOK_LINE='eval "$(direnv hook bash)"'
            ;;
        zsh)
            HOOK_LINE='eval "$(direnv hook zsh)"'
            ;;
        fish)
            HOOK_LINE='direnv hook fish | source'
            ;;
        *)
            HOOK_LINE='eval "$(direnv hook bash)"'
            ;;
    esac

    if grep -q "direnv hook" "$SHELL_CONFIG" 2>/dev/null; then
        print_success "direnv hook already configured in $SHELL_CONFIG"
    else
        print_info "Adding direnv hook to $SHELL_CONFIG..."
        echo "" >> "$SHELL_CONFIG"
        echo "# direnv hook for automatic environment loading" >> "$SHELL_CONFIG"
        echo "$HOOK_LINE" >> "$SHELL_CONFIG"
        print_success "direnv hook added to $SHELL_CONFIG"
    fi
}

# Configure direnv to hide verbose output
configure_direnv_output() {
    print_header "Configuring direnv output"

    DIRENV_CONFIG_DIR="$HOME/.config/direnv"
    DIRENV_CONFIG_FILE="$DIRENV_CONFIG_DIR/direnv.toml"

    # Create config directory if it doesn't exist
    if [ ! -d "$DIRENV_CONFIG_DIR" ]; then
        print_info "Creating direnv config directory..."
        mkdir -p "$DIRENV_CONFIG_DIR"
    fi

    # Check if config already has hide_env_diff setting
    if [ -f "$DIRENV_CONFIG_FILE" ] && grep -q "hide_env_diff" "$DIRENV_CONFIG_FILE" 2>/dev/null; then
        print_success "direnv output already configured"
    else
        print_info "Configuring direnv to hide verbose output..."
        cat > "$DIRENV_CONFIG_FILE" << 'DIRENV_EOF'
[global]
# Silence direnv output - we'll show our own informative messages
hide_env_diff = true
DIRENV_EOF
        print_success "direnv configured for clean output"
    fi
}

# Allow direnv for this project
allow_direnv() {
    print_header "Allowing direnv for this project"

    if [ -f .envrc ]; then
        print_info "Running 'direnv allow'..."
        direnv allow
        print_success "direnv allowed for this project"
    else
        print_error ".envrc file not found in current directory"
        return 1
    fi
}

# Check nvm installation
check_nvm_installation() {
    print_header "Checking nvm installation"

    if check_nvm; then
        print_success "nvm is installed"

        # Try to load nvm
        if [ -s "$NVM_DIR/nvm.sh" ]; then
            source "$NVM_DIR/nvm.sh"
        elif [ -s "$HOME/.nvm/nvm.sh" ]; then
            export NVM_DIR="$HOME/.nvm"
            source "$NVM_DIR/nvm.sh"
        fi

        # Check if required Node version is installed
        if [ -f .nvmrc ]; then
            REQUIRED_VERSION=$(cat .nvmrc | tr -d '[:space:]')
            print_info "Required Node.js version: v$REQUIRED_VERSION"

            if nvm ls "$REQUIRED_VERSION" &> /dev/null; then
                print_success "Node.js v$REQUIRED_VERSION is installed"
            else
                print_warning "Node.js v$REQUIRED_VERSION is not installed"
                print_info "Installing Node.js v$REQUIRED_VERSION..."
                nvm install "$REQUIRED_VERSION"
                print_success "Node.js v$REQUIRED_VERSION installed"
            fi
        fi
    else
        print_warning "nvm is not installed"
        print_info "Install nvm from: https://github.com/nvm-sh/nvm"
        print_info "Or run: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    fi
}

# Main setup flow
main() {
    print_header "Node.js Version Manager Setup"

    print_info "This script will set up automatic Node.js version switching"
    print_info "using direnv and nvm for this project."
    echo ""

    # Detect OS
    detect_os
    print_info "Operating System: $OS"

    # Check if direnv is already installed
    if check_direnv; then
        print_success "direnv is already installed"
    else
        print_warning "direnv is not installed"

        # Ask for confirmation before installing
        read -p "Would you like to install direnv? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_direnv || {
                print_error "Failed to install direnv"
                exit 1
            }
        else
            print_warning "Skipping direnv installation"
            print_info "You can install it manually later: https://direnv.net/docs/installation.html"
            exit 0
        fi
    fi

    # Setup direnv hook
    setup_direnv_hook

    # Configure direnv output (hide verbose messages)
    configure_direnv_output

    # Allow direnv for this project
    allow_direnv

    # Check nvm installation
    check_nvm_installation

    # Final instructions
    print_header "Setup Complete!"

    print_success "direnv is installed and configured"
    print_success "This project is allowed to use direnv"

    echo ""
    print_info "Next steps:"
    echo "  1. Reload your shell: source $(get_shell_config)"
    echo "  2. Or restart your terminal"
    echo "  3. cd out and back into this directory to activate direnv"
    echo ""
    print_info "Node.js version will now automatically switch to v$(cat .nvmrc 2>/dev/null || echo 'unknown')"
    print_info "when you enter this project directory!"
    echo ""

    # Offer to reload shell
    read -p "Would you like to reload your shell now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        SHELL_CONFIG=$(get_shell_config)
        print_info "Reloading $SHELL_CONFIG..."
        exec "$SHELL" -l
    fi
}

# Run main function
main
