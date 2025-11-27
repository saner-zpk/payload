#!/usr/bin/env bash
set -euo pipefail

# onepanel-start.sh
# Helper script used by 1Panel when deploying from source.
# Usage: set env vars in 1Panel, then use this as the build/start command or call it in build step.

echo "Running onepanel helper script..."

# ensure pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found — enabling corepack and installing pnpm"
  corepack enable pnpm || true
fi

echo "Installing dependencies (production only)..."
COREPACK_CMD=$(command -v corepack || true)
if [ -n "$COREPACK_CMD" ]; then
  corepack enable pnpm || true
fi

# Install dependencies
pnpm install --frozen-lockfile

echo "Building Next.js app..."
pnpm build

echo "Preparing standalone output..."
# copy standalone output to app root if present
if [ -d .next/standalone ]; then
  cp -r .next/standalone/* ./
fi

echo "Starting server on port ${PORT:-3000}..."
HOSTNAME=0.0.0.0 PORT=${PORT:-3000} node server.js
