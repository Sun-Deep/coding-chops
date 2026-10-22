#!/usr/bin/env bash
# Renders the Roadster reel's two falls in Blender and encodes them for
# Remotion, which lays the headline, labels, narration and sound over them.
#
# Usage: scripts/blender/roadster/render.sh [scale]
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
SCALE="${1:-1.0}"
OUT=public/vr39
COVER=0140
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs \
  scripts/blender/roadster/export.mjs "$OUT/timeline.json"
for v in off on; do
  "$BLENDER" -b --factory-startup -P scripts/blender/roadster/scene.py -- \
    "$OUT/timeline.json" "$v" "$OUT/marks-$v.json"
  rm -rf "out/vr39-frames/$v" && mkdir -p "out/vr39-frames/$v"
  "$BLENDER" -b --factory-startup -P scripts/blender/roadster/scene.py -- \
    "$OUT/timeline.json" "$v" "out/vr39-frames/$v" 0 419 "$SCALE"
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "out/vr39-frames/$v/f%04d.png" \
    -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/$v.mp4"
  # The frame the cover holds.
  cp "out/vr39-frames/$v/f$COVER.png" "$OUT/$v-$COVER.png"
done
echo "rendered $OUT/off.mp4 and $OUT/on.mp4"
