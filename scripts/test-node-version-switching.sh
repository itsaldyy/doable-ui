#!/bin/bash
# Test script to verify Node.js version switching messages
# This demonstrates the enter/exit behavior

echo "=== Testing Node.js Version Switching ==="
echo ""

echo "Current directory: $(pwd)"
echo "Current Node version: $(node -v 2>/dev/null || echo 'none')"
echo ""

echo "Instructions to test:"
echo "1. Open a terminal and navigate away from the project:"
echo "   cd ~"
echo "   (You should see: 🔙 Node.js: v20.19.5 → <your-version> (left project directory))"
echo ""
echo "2. Navigate back to the project:"
echo "   cd $(pwd)"
echo "   (You should see: 🔄 Node.js: <your-version> → v20.19.5 (project requires v20.19.5))"
echo ""
echo "3. The verbose direnv messages should be hidden:"
echo "   ✅ No 'direnv: loading' messages"
echo "   ✅ No 'direnv: unloading' messages"
echo "   ✅ No 'direnv: export' messages"
echo ""
echo "=== What You Should See ==="
echo ""
echo "When entering project:"
echo "  🔄 Node.js: v16.19.1 → v20.19.5 (project requires v20.19.5)"
echo ""
echo "When leaving project:"
echo "  🔙 Node.js: v20.19.5 → v16.19.1 (left project directory)"
echo ""
