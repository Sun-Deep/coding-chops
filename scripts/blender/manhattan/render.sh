#!/usr/bin/env bash
# Renders the Manhattan reel's city in Blender and encodes it for Remotion,
# which lays the headline, the two counters, the pin labels, the captions
# and the sound over it.
# Needs Blender at /Applications/Blender.app and the OpenStreetMap extract in
# third_party/osm-nyc (see third_party/README.md). FRAMES=a,b,c renders a proof.
#
# Usage: scripts/blender/manhattan/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr59
DIR=out/vr59-frames/city
COVER=0300
mkdir -p "$OUT"
node scripts/measure-delivery-route.mjs \
  curriculum/vertical/59-manhattan-route/runs/route.json "$OUT/search.json"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/manhattan/export.mjs \
  "$OUT/search.json" "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/manhattan/city.py -- \
  "$OUT/timeline.json" "$OUT/search.json" "$OUT/track.json"
if [[ -z "${FRAMES:-}" ]]; then rm -rf "$DIR"; fi
mkdir -p "$DIR"
"$BLENDER" -b --factory-startup -P scripts/blender/manhattan/city.py -- \
  "$OUT/timeline.json" "$OUT/search.json" "$DIR"
if [[ -z "${FRAMES:-}" ]]; then
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" \
    -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/city.mp4"
  # The frame the cover holds: the blue over every borough, the orange
  # thread and the white route inside it.
  cp "$DIR/f$COVER.png" "$OUT/city-$COVER.png"
  echo "rendered $OUT/city.mp4"
fi
