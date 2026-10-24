#!/usr/bin/env bash
# Renders the last-ticket reel's cinema in Blender and encodes it for
# Remotion, which lays the headline, code, labels, narration and sound
# over it.
#
# Needs Blender at /Applications/Blender.app and the Quaternius pack in
# third_party/quaternius-characters (see third_party/README.md).
#
# Usage: scripts/blender/ticket/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr47
FRAMES=out/vr47-frames/cinema
COVER=0190
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/ticket/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/ticket/cinema.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$FRAMES" && mkdir -p "$FRAMES"
"$BLENDER" -b --factory-startup -P scripts/blender/ticket/cinema.py -- \
  "$OUT/timeline.json" "$FRAMES"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$FRAMES/f%04d.png" \
  -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/cinema.mp4"
# The frame the cover holds.
cp "$FRAMES/f$COVER.png" "$OUT/cinema-$COVER.png"
echo "rendered $OUT/cinema.mp4"
