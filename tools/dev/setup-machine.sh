#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${AURORA_REPO_URL:-https://github.com/sgwoods/Codex-Test1.git}"
DEFAULT_TARGET="$PWD/Codex-Test1"
TARGET_DIR="${1:-$DEFAULT_TARGET}"
TARGET_DIR="${TARGET_DIR/#\~/$HOME}"

CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

usage() {
  cat <<'EOF'
Aurora machine setup

Usage:
  bash setup-machine.sh [target-dir]

Examples:
  cd "$HOME/Development"
  bash setup-machine.sh

  cd "$HOME/Library/Mobile Documents/com~apple~CloudDocs/MacBookPro"
  bash setup-machine.sh

  bash setup-machine.sh "$HOME/Library/Mobile Documents/com~apple~CloudDocs/MacBookPro/Codex-Test1"

Notes:
  - The target directory is optional. Default:
      ./Codex-Test1
    under the folder where you run the script.
  - iCloud-backed locations are allowed only if each machine uses its own
    distinct clone path. Do not use the same working tree across machines.
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

require_tool() {
  local name="$1"
  local hint="$2"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Missing required tool: $name"
    echo "$hint"
    exit 1
  fi
}

require_tool git "Install Git, then rerun this setup script."
require_tool node "Install Node.js, then rerun this setup script."
require_tool npm "Install npm, then rerun this setup script."
require_tool python3 "Install Python 3, then rerun this setup script."
require_tool gh "Install GitHub CLI (gh), then rerun this setup script."

if [[ ! -x "$CHROME_PATH" ]]; then
  echo "Missing required browser: Google Chrome"
  echo "Expected at: $CHROME_PATH"
  exit 1
fi

if [[ "$TARGET_DIR" == "$HOME/Library/Mobile Documents/"* ]]; then
  echo "Using an iCloud-backed Aurora clone path:"
  echo "  $TARGET_DIR"
  echo "This is only safe if this machine has its own distinct clone path."
  echo "Do not open or sync the same git working tree across multiple machines."
  echo
fi

mkdir -p "$(dirname "$TARGET_DIR")"

if [[ -d "$TARGET_DIR/.git" ]]; then
  echo "Reusing existing Aurora clone:"
  echo "  $TARGET_DIR"
else
  if [[ -e "$TARGET_DIR" && -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]]; then
    echo "Target directory exists and is not an Aurora git clone:"
    echo "  $TARGET_DIR"
    echo "Choose an empty folder or an existing Codex-Test1 clone."
    exit 1
  fi
  echo "Cloning Aurora into:"
  echo "  $TARGET_DIR"
  git clone "$REPO_URL" "$TARGET_DIR"
fi

if ! git -C "$TARGET_DIR" remote get-url origin >/dev/null 2>&1; then
  echo "The target directory does not look like a valid git clone:"
  echo "  $TARGET_DIR"
  exit 1
fi

ORIGIN_URL="$(git -C "$TARGET_DIR" remote get-url origin || true)"
if [[ "$ORIGIN_URL" != *"sgwoods/Codex-Test1"* ]]; then
  echo "The target clone is not pointed at sgwoods/Codex-Test1:"
  echo "  origin -> $ORIGIN_URL"
  exit 1
fi

cd "$TARGET_DIR"

echo
echo "Running Aurora bootstrap inside:"
echo "  $TARGET_DIR"
echo
npm run machine:bootstrap

echo
echo "Aurora machine setup complete."
echo "Local repo:"
echo "  $TARGET_DIR"
echo
echo "Local development URLs:"
echo "  Game:   http://127.0.0.1:8000/"
echo "  Viewer: http://127.0.0.1:4311/"
echo
echo "For future sessions, the one-step refresh command is:"
echo "  cd \"$TARGET_DIR\""
echo "  npm run machine:bootstrap"
echo
echo "Next useful commands:"
echo "  cd \"$TARGET_DIR\""
echo "  npm run machine:status"
echo "  npm run machine:doctor"
echo "  npm run release:show-authority"
