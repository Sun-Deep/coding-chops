#!/usr/bin/env bash
# Renders the Monty Hall reel's doors in Blender and encodes them for
# Remotion, which lays the headline, code, labels, narration and sound
# over them.
#
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/monty/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr45
FRAMES=out/vr45-frames/doors
COVER=0112
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/monty/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/monty/doors.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$FRAMES" && mkdir -p "$FRAMES"
"$BLENDER" -b --factory-startup -P scripts/blender/monty/doors.py -- \
  "$OUT/timeline.json" "$FRAMES"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$FRAMES/f%04d.png" \
  -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/doors.mp4"
# The frame the cover holds.
cp "$FRAMES/f$COVER.png" "$OUT/doors-$COVER.png"
echo "rendered $OUT/doors.mp4"
