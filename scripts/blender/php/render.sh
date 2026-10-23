#!/usr/bin/env bash
# Renders the PHP2Shell reel's server and field in Blender and encodes them
# for Remotion, which lays the headline, advisory, labels, narration and
# sound over them.
#
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/php/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr46
FRAMES=out/vr46-frames/server
COVER=0280
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/php/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/php/server.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$FRAMES" && mkdir -p "$FRAMES"
"$BLENDER" -b --factory-startup -P scripts/blender/php/server.py -- \
  "$OUT/timeline.json" "$FRAMES"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$FRAMES/f%04d.png" \
  -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/server.mp4"
# The frame the cover holds.
cp "$FRAMES/f$COVER.png" "$OUT/server-$COVER.png"
echo "rendered $OUT/server.mp4"
