#!/usr/bin/env bash
# Render both weighings and the answer from the shared motion timeline.
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
SCALE="${1:-1.0}"
mkdir -p public/vr41 out/vr41-full-frames
node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs \
  scripts/blender/coins/export.mjs public/vr41/full-timeline.json
"$BLENDER" -b --factory-startup -P scripts/blender/coins/scene.py -- \
  public/vr41/full-timeline.json out/vr41-full-frames "$SCALE"
ffmpeg -v error -y -framerate 30 -start_number 0 \
  -i out/vr41-full-frames/f%04d.png -frames:v 420 \
  -c:v libx264 -crf 12 -pix_fmt yuv420p -movflags +faststart public/vr41/full.mp4
ffmpeg -v error -y -i public/vr41/full.mp4 -frames:v 120 -an -c:v copy public/vr41/preview.mp4
for frame in 0122 0318 0390; do
  cp "out/vr41-full-frames/f${frame}.png" "public/vr41/full-${frame}.png"
done
cp out/vr41-full-frames/f0116.png public/vr41/preview-0116.png
