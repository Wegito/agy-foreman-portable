#!/usr/bin/env bash
# One-line installer for macOS and Linux. Paste into Terminal:
#   curl -fsSL https://raw.githubusercontent.com/Wegito/agy-foreman-portable/main/install.sh | bash
# Downloads agy-foreman (portable) into ~/agy-foreman (or the folder you pass) and runs its setup.
# Files fetched with curl keep their permissions and are not quarantined by macOS, so nothing is blocked.
set -euo pipefail
DEST="${1:-$HOME/agy-foreman}"
URL="https://codeload.github.com/Wegito/agy-foreman-portable/tar.gz/refs/heads/main"

if [ -e "$DEST/agy-foreman" ]; then echo "Updating $DEST (your project settings are not touched)…"; else echo "Installing into $DEST…"; fi
mkdir -p "$DEST"
curl -fsSL "$URL" | tar -xz -C "$DEST" --strip-components=1
chmod +x "$DEST/agy-foreman" "$DEST/setup.command" "$DEST/install.sh" 2>/dev/null || true
exec "$DEST/agy-foreman" setup
