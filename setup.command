#!/usr/bin/env bash
# macOS: double-click to run the one-time setup.
cd "$(dirname "$0")" && ./agy-foreman setup
echo; read -r -p "Press Enter to close…" _
