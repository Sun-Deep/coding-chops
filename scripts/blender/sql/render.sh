#!/usr/bin/env bash
# Renders the SQL reel's mailroom of 1,000 orders in Blender and encodes it for
# Remotion, which lays the headline, query, labels, narration and sound
# over it.
#
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/sql/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr44
FRAMES=out/vr44-frames/table
COVER=0400
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/sql/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/sql/mailroom.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$FRAMES" && mkdir -p "$FRAMES"
"$BLENDER" -b --factory-startup -P scripts/blender/sql/mailroom.py -- \
  "$OUT/timeline.json" "$FRAMES"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$FRAMES/f%04d.png" \
  -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/table.mp4"
# The frame the cover holds.
cp "$FRAMES/f$COVER.png" "$OUT/table-$COVER.png"
echo "rendered $OUT/table.mp4"
