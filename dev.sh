#!/usr/bin/env bash
# Launch the dev servers with a Node the toolchain actually supports.
#
# `node` on PATH is v10.16.3 (2019, EOL) — Vite needs 18+. nvm has v20
# installed but isn't sourced for non-interactive shells, so pin it here.
set -euo pipefail

NODE_DIR="$HOME/.nvm/versions/node/v20.20.2/bin"

if [ ! -x "$NODE_DIR/node" ]; then
  echo "Expected Node 20 at $NODE_DIR — run 'nvm install 20' or edit this path." >&2
  exit 1
fi

export PATH="$NODE_DIR:$PATH"
cd "$(dirname "$0")"
exec npm run dev
