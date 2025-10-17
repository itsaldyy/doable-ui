#!/bin/bash
# Automatic Node version switching for this project
# This script is sourced when entering the project directory

# Check if nvm is available
if [ -s "$NVM_DIR/nvm.sh" ]; then
    # Load nvm if not already loaded
    [ -z "$NVM_LOADED" ] && source "$NVM_DIR/nvm.sh"

    # Check if .nvmrc exists
    if [ -f .nvmrc ]; then
        REQUIRED_VERSION=$(cat .nvmrc | tr -d '[:space:]')
        CURRENT_VERSION=$(node -v 2>/dev/null | sed 's/v//')

        # Only switch if versions don't match
        if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
            echo "🔄 Switching to Node.js v$REQUIRED_VERSION (from .nvmrc)..."
            nvm use

            # Check if the version is installed
            if [ $? -ne 0 ]; then
                echo "📦 Node.js v$REQUIRED_VERSION not installed. Installing..."
                nvm install
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
