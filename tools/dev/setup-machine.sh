#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${AURORA_REPO_URL:-https://github.com/sgwoods/Codex-Test1.git}"
DEFAULT_TARGET="$PWD/Codex-Test1"
TARGET_DIR="${1:-$DEFAULT_TARGET}"
TARGET_DIR="${TARGET_DIR/#\~/$HOME}"

CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OS_NAME="$(uname -s)"
BrewBinCandidates=(
  "/opt/homebrew/bin/brew"
  "/usr/local/bin/brew"
)

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
  - On a fresh macOS machine, this script will try to install missing Aurora
    prerequisites using Homebrew.
  - Fresh-machine dependency setup may request administrator approval for
    Apple Command Line Tools, Homebrew, or package installation.
  - iCloud-backed locations are allowed only if each machine uses its own
    distinct clone path. Do not use the same working tree across machines.
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
  cat <<'EOF'
Do not run Aurora machine setup as root.

Use a normal macOS user account with administrator rights, then rerun the same
setup command from that user shell. Homebrew and the Aurora setup flow will
request admin approval when needed.
EOF
  exit 1
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

have_tool() {
  command -v "$1" >/dev/null 2>&1
}

find_brew_bin() {
  for candidate in "${BrewBinCandidates[@]}"; do
    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  if have_tool brew; then
    command -v brew
    return 0
  fi
  return 1
}

activate_brew_path() {
  local brew_bin="$1"
  local brew_prefix
  brew_prefix="$("$brew_bin" --prefix)"
  eval "$("$brew_bin" shellenv)"
  export PATH="$brew_prefix/bin:$brew_prefix/sbin:$PATH"
}

ensure_command_line_tools() {
  if [[ "$OS_NAME" != "Darwin" ]]; then
    return 0
  fi
  if xcode-select -p >/dev/null 2>&1; then
    return 0
  fi

  echo "Apple Command Line Tools are required before Aurora can install dependencies."
  echo "Requesting Apple Command Line Tools now..."
  if xcode-select --install >/dev/null 2>&1; then
    :
  fi
  cat <<'EOF'

Finish the Apple Command Line Tools installation dialog, then rerun this setup
command.
EOF
  exit 1
}

ensure_homebrew() {
  local brew_bin
  local homebrew_installer_url="https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh"
  local homebrew_installer=""
  if brew_bin="$(find_brew_bin)"; then
    activate_brew_path "$brew_bin"
    return 0
  fi

  if [[ "$OS_NAME" != "Darwin" ]]; then
    echo "Missing required package manager: Homebrew"
    echo "Install the Aurora prerequisites manually on this OS, then rerun this setup script."
    exit 1
  fi

  ensure_command_line_tools

  echo "Homebrew not found. Installing Homebrew..."
  echo "Homebrew may request administrator approval in this terminal."
  echo "Do not rerun this Aurora setup script with sudo or su."
  if [[ ! -r /dev/tty ]]; then
    echo "No interactive terminal is available for Homebrew installation."
    echo "Open a normal Terminal session as your regular user and rerun the same Aurora setup command."
    exit 1
  fi

  homebrew_installer="$(mktemp "${TMPDIR:-/tmp}/aurora-homebrew-install.XXXXXX.sh")"
  trap 'rm -f "$homebrew_installer"' RETURN
  curl -fsSL "$homebrew_installer_url" -o "$homebrew_installer"
  chmod +x "$homebrew_installer"

  # Aurora is often installed with `curl ... | bash`, which makes stdin a pipe.
  # Homebrew needs a real terminal so it can prompt for administrator approval.
  echo "Running the Homebrew installer with your terminal attached for prompts..."
  /bin/bash "$homebrew_installer" </dev/tty
  trap - RETURN
  rm -f "$homebrew_installer"

  if brew_bin="$(find_brew_bin)"; then
    activate_brew_path "$brew_bin"
    return 0
  fi

  echo "Homebrew install completed, but brew is still not on PATH."
  echo "Try adding Homebrew to your shell and rerun this setup script."
  exit 1
}

brew_install_if_missing() {
  local kind="$1"
  local package="$2"
  local present="$3"

  if [[ "$present" == "yes" ]]; then
    return 0
  fi

  if [[ "$kind" == "formula" ]]; then
    echo "Installing missing dependency with Homebrew: $package"
    brew install "$package"
  else
    echo "Installing missing application with Homebrew Cask: $package"
    brew install --cask "$package"
  fi
}

ensure_mac_prerequisites() {
  local needs_brew="no"
  local node_present="no"
  local python_present="no"
  [[ "$OS_NAME" == "Darwin" ]] || return 0

  if ! have_tool git || ! have_tool node || ! have_tool npm || ! have_tool python3 || ! have_tool gh || [[ ! -x "$CHROME_PATH" ]]; then
    needs_brew="yes"
  fi

  if [[ "$needs_brew" == "no" ]]; then
    return 0
  fi

  cat <<'EOF'
Fresh-machine Aurora setup detected missing macOS prerequisites.
This step may request administrator approval for:
- Apple Command Line Tools
- Homebrew installation
- package or application installs
EOF
  echo

  ensure_homebrew

  brew_install_if_missing formula git "$(have_tool git && echo yes || echo no)"
  if have_tool node && have_tool npm; then
    node_present="yes"
  fi
  brew_install_if_missing formula node "$node_present"
  if have_tool python3; then
    python_present="yes"
  fi
  brew_install_if_missing formula python "$python_present"
  brew_install_if_missing formula gh "$(have_tool gh && echo yes || echo no)"
  brew_install_if_missing cask google-chrome "$([[ -x "$CHROME_PATH" ]] && echo yes || echo no)"
  hash -r
}

ensure_mac_prerequisites

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
