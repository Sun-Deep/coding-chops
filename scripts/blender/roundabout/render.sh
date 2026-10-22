#!/usr/bin/env bash
# Renders the roundabout reel's two junctions in Blender and encodes them
# for Remotion, which lays the headline, labels, narration and sound over
# them.
#
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/roundabout/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr42
COVER=0150
mkdir -p "$OUT"
[ -n "${KEEP_TIMELINE:-}" ] || node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/roundabout/export.mjs "$OUT/timeline.json"
for j in ${JUNCTIONS:-lights roundabout}; do
  "$BLENDER" -b --factory-startup -P scripts/blender/roundabout/junction.py -- \
    "$OUT/timeline.json" "$j" "$OUT/track-$j.json"
  rm -rf "out/vr42-frames/$j" && mkdir -p "out/vr42-frames/$j"
  "$BLENDER" -b --factory-startup -P scripts/blender/roundabout/junction.py -- \
    "$OUT/timeline.json" "$j" "out/vr42-frames/$j"
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "out/vr42-frames/$j/f%04d.png" \
    -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/$j.mp4"
  # The frame the cover holds.
  cp "out/vr42-frames/$j/f$COVER.png" "$OUT/$j-$COVER.png"
done
echo "rendered $OUT/lights.mp4 and $OUT/roundabout.mp4"
