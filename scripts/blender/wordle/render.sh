#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr54
DIR=out/vr54-frames/board
mkdir -p "$OUT" "$DIR"
node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs scripts/blender/wordle/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/wordle/board.py -- "$OUT/timeline.json" "$DIR"
if [[ -z "${FRAMES:-}" ]]; then
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/board.mp4"
  cp "$DIR/f0330.png" "$OUT/board-cover.png"
fi
