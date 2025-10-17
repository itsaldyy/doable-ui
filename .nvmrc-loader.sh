#!/bin/bash
# Automatic Node version switching for this project
# This script is sourced when entering the project directory

# Preserve IDE terminal integration (VS Code, Kiro, etc.)
_SAVED_PROMPT_COMMAND="$PROMPT_COMMAND"

# Check if nvm is available
if [ -s "$NVM_DIR/nvm.sh" ]; then
    # Load nvm if not already loaded
    [ -z "$NVM_LOADED" ] && source "$NVM_DIR/nvm.sh"

    # Check if .nvmrc exists
    if [ -f .nvmrc ]; then
        REQUIRED_VERSION=$(cat .nvmrc | tr -d '[:space:]')
        CURRENT_VERSION=$(node -v 2>/dev/null | sed 's/v//')
        PREVIOUS_VERSION="v$CURRENT_VERSION"

        # Only switch if versions don't match
        if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
            # Try to switch silently first
            if nvm use --silent 2>/dev/null; then
                NEW_VERSION=$(node -v 2>/dev/null)
                echo "🔄 Node.js: $PREVIOUS_VERSION → $NEW_VERSION (project requires v$REQUIRED_VERSION)"
            else
                # Version not installed, need to install it
                echo "📦 Node.js v$REQUIRED_VERSION not installed. Installing..."
                nvm install "$REQUIRED_VERSION"
                NEW_VERSION=$(node -v 2>/dev/null)
                echo "✅ Node.js: $PREVIOUS_VERSION → $NEW_VERSION (installed and activated)"
            fi
        fi
    fi
elif command -v node >/dev/null 2>&1; then
    # nvm not available but node is installed
    CURRENT_VERSION=$(node -v | sed 's/v//')
    REQUIRED_VERSION=$(cat .nvmrc 2>/dev/null | tr -d '[:space:]')

    if [ -n "$REQUIRED_VERSION" ] && [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
        echo "⚠️  Node.js v$CURRENT_VERSION detected, but v$REQUIRED_VERSION required"
        echo "💡 Install nvm to enable automatic version switching: https://github.com/nvm-sh/nvm"
    fi
else
    echo "⚠️  Node.js not found. Please install Node.js v$(cat .nvmrc 2>/dev/null || echo 'unknown')"
fi

# Restore PROMPT_COMMAND if it was cleared by nvm
if [ -n "$_SAVED_PROMPT_COMMAND" ] && [ -z "$PROMPT_COMMAND" ]; then
    export PROMPT_COMMAND="$_SAVED_PROMPT_COMMAND"
fi
unset _SAVED_PROMPT_COMMAND
