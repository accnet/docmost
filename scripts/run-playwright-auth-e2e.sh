#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIB_DIR="$ROOT_DIR/.tmp/libasound/extracted/usr/lib/x86_64-linux-gnu"

if [[ ! -f "$LIB_DIR/libasound.so.2" ]]; then
  mkdir -p "$ROOT_DIR/.tmp/libasound"
  pushd "$ROOT_DIR/.tmp/libasound" >/dev/null
  apt download libasound2 >/dev/null
  dpkg-deb -x libasound2_*.deb extracted
  popd >/dev/null
fi

export LD_LIBRARY_PATH="$LIB_DIR${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

cd "$ROOT_DIR"
exec corepack pnpm exec playwright test "$@"
