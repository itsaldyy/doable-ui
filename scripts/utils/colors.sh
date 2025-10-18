#!/bin/bash
# colors.sh
# Terminal color definitions for pretty output

# Check if terminal supports colors
if [ -t 1 ]; then
  # Colors
  export RED='\033[0;31m'
  export GREEN='\033[0;32m'
  export YELLOW='\033[1;33m'
  export BLUE='\033[0;34m'
  export MAGENTA='\033[0;35m'
  export CYAN='\033[0;36m'
  export WHITE='\033[1;37m'
  export GRAY='\033[0;90m'

  # Styles
  export BOLD='\033[1m'
  export DIM='\033[2m'
  export UNDERLINE='\033[4m'
  export RESET='\033[0m'

  # Emojis/Symbols
  export CHECK_MARK='✓'
  export CROSS_MARK='✗'
  export INFO_MARK='ℹ'
  export WARNING_MARK='⚠'
else
  # No colors for non-terminal output
  export RED=''
  export GREEN=''
  export YELLOW=''
  export BLUE=''
  export MAGENTA=''
  export CYAN=''
  export WHITE=''
  export GRAY=''
  export BOLD=''
  export DIM=''
  export UNDERLINE=''
  export RESET=''
  export CHECK_MARK='[OK]'
  export CROSS_MARK='[ERROR]'
  export INFO_MARK='[INFO]'
  export WARNING_MARK='[WARN]'
fi
