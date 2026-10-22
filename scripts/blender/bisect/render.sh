#!/usr/bin/env bash
# Renders the bisect reel's field of 1,000 commits in Blender and encodes it
# for Remotion, which lays the headline, terminal, labels, narration and
# sound over it.
#
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/bisect/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr43
FRAMES=out/vr43-frames/history
COVER=0360
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/bisect/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/bisect/history.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$FRAMES" && mkdir -p "$FRAMES"
"$BLENDER" -b --factory-startup -P scripts/blender/bisect/history.py -- \
  "$OUT/timeline.json" "$FRAMES"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$FRAMES/f%04d.png" \
  -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/history.mp4"
# The frame the cover holds.
cp "$FRAMES/f$COVER.png" "$OUT/history-$COVER.png"
echo "rendered $OUT/history.mp4"
