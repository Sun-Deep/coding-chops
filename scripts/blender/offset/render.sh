#!/usr/bin/env bash
# Renders the OFFSET reel's wall of crates in Blender and encodes it for
# Remotion, which lays the query, the chips, the labels, the narration
# and the sound over it.
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/offset/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr52
DIR=out/vr52-frames/wall
COVER=0120
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/offset/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/offset/wall.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$DIR" && mkdir -p "$DIR"
"$BLENDER" -b --factory-startup -P scripts/blender/offset/wall.py -- \
  "$OUT/timeline.json" "$DIR"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" \
  -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/wall.mp4"
# The frame the cover holds: the crates mid-dump, the page still waiting.
cp "$DIR/f$COVER.png" "$OUT/wall-$COVER.png"
echo "rendered $OUT/wall.mp4"
