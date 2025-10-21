#!/usr/bin/env bash

set -euo pipefail

CONFIG=${1:-render.yaml}
shift || true

if [[ ! -f "$CONFIG" ]]; then
  echo "Error: blueprint config '$CONFIG' not found." >&2
  exit 1
fi

RENDER_BIN=${RENDER_BIN:-render}
if ! command -v "$RENDER_BIN" >/dev/null 2>&1; then
  echo "Error: Render CLI ('$RENDER_BIN') not found in PATH." >&2
  echo "Install instructions: https://render.com/docs/blueprint-spec#render-cli" >&2
  exit 127
fi

echo "Validating $CONFIG..."
"$RENDER_BIN" blueprint validate "$CONFIG"

echo "Deploying $CONFIG..."
"$RENDER_BIN" blueprint deploy "$CONFIG" --yes "$@"

echo "Done."
