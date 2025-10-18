#!/bin/bash
# Script to verify and fix direnv verbose messages

echo "=== Checking direnv configuration ==="
echo ""

# Check if DIRENV_LOG_FORMAT is set
if [ -z "$DIRENV_LOG_FORMAT" ]; then
    echo "❌ DIRENV_LOG_FORMAT is not set in current shell"
    echo ""
    echo "Solution: Reload your shell or restart your terminal"
    echo ""
    echo "Option 1: Reload shell config"
    echo "  source ~/.bashrc"
    echo ""
    echo "Option 2: Restart terminal"
    echo "  Close and reopen your terminal"
    echo ""
    echo "Option 3: Start a new shell session"
    echo "  exec bash -l"
    echo ""
else
    echo "✅ DIRENV_LOG_FORMAT is set correctly"
fi

# Check if it's in .bashrc
if grep -q "DIRENV_LOG_FORMAT" ~/.bashrc; then
    echo "✅ DIRENV_LOG_FORMAT is configured in ~/.bashrc"
else
    echo "❌ DIRENV_LOG_FORMAT is not in ~/.bashrc"
    echo ""
    echo "Adding it now..."
    echo "" >> ~/.bashrc
    echo "# Silence direnv verbose output (show only our custom messages)" >> ~/.bashrc
    echo 'export DIRENV_LOG_FORMAT=""' >> ~/.bashrc
    echo "✅ Added to ~/.bashrc"
    echo ""
    echo "Now reload your shell: source ~/.bashrc"
fi

echo ""
echo "=== Testing ==="
echo ""
echo "After reloading your shell, test by:"
echo "1. cd .."
echo "2. cd doable-ui"
echo ""
echo "You should ONLY see:"
echo "  🔄 Node.js: vX.X.X → v20.19.5 (project requires v20.19.5)"
echo ""
echo "You should NOT see:"
echo "  direnv: loading ..."
echo "  direnv: export ..."
