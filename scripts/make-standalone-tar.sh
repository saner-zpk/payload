#!/usr/bin/env bash
set -euo pipefail

# make-standalone-tar.sh
# Build standalone output if missing, then package a tarball for deployment.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/.next/standalone"
STATIC_DIR="${ROOT_DIR}/.next/static"
REL_OUT=".next/standalone"
REL_STATIC=".next/static"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAR_PATH="/tmp/payload-standalone-${TIMESTAMP}.tar.gz"

echo "Working in ${ROOT_DIR}"

cd "${ROOT_DIR}"

if [ ! -d "${OUT_DIR}" ]; then
  echo "Standalone output not found. Running pnpm build..."
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm not found. Enabling corepack and installing pnpm..."
    corepack enable pnpm || true
  fi
  pnpm install --frozen-lockfile
  pnpm build
fi

LIST=()
if [ -d "${OUT_DIR}" ]; then
  LIST+=("${REL_OUT}")
fi
if [ -d "${STATIC_DIR}" ]; then
  LIST+=("${REL_STATIC}")
fi
if [ -f "${ROOT_DIR}/server.js" ]; then
  LIST+=("server.js")
fi
LIST+=("package.json")
if [ -f "deploy/onepanel-start.sh" ]; then
  LIST+=("deploy/onepanel-start.sh")
fi

if [ ${#LIST[@]} -eq 0 ]; then
  echo "Nothing to package; exiting." >&2
  exit 1
fi

echo "Creating tarball at ${TAR_PATH}..."
tar -czf "${TAR_PATH}" "${LIST[@]}"

echo "Tarball created: ${TAR_PATH}"
ls -lh "${TAR_PATH}"

echo "Done."
