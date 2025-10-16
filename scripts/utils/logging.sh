#!/bin/bash
# logging.sh
# Logging utility functions for consistent output

# Ensure colors are loaded
if [ -z "$GREEN" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  source "$SCRIPT_DIR/colors.sh"
fi

# Log info message
log_info() {
  echo -e "${BLUE}${INFO_MARK}${RESET} $1"
}

# Log success message
log_success() {
  echo -e "${GREEN}${CHECK_MARK}${RESET} $1"
}

# Log warning message
log_warning() {
  echo -e "${YELLOW}${WARNING_MARK}${RESET} $1"
}

# Log error message
log_error() {
  echo -e "${RED}${CROSS_MARK}${RESET} $1" >&2
}

# Log header (for section titles)
log_header() {
  echo -e "\n${BOLD}${CYAN}=== $1 ===${RESET}\n"
}

# Log step (for multi-step processes)
log_step() {
  echo -e "${MAGENTA}→${RESET} $1"
}

# Log debug message (only if DEBUG=1)
log_debug() {
  if [ "${DEBUG:-0}" = "1" ]; then
    echo -e "${GRAY}[DEBUG]${RESET} $1"
  fi
}
