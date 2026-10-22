#!/usr/bin/env bash
# Renders the rain reel's two streets in Blender, the walker and the runner,
# and encodes them for Remotion, which lays the headline, counters,
# narration and sound over them.
#
# Needs Blender at /Applications/Blender.app and the Quaternius characters in
# third_party/quaternius-characters (see third_party/README.md).
#
# Usage: scripts/blender/rain/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr40
COVER=0390
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs \
  scripts/blender/rain/export.mjs "$OUT/timeline.json"
for g in walk run; do
  "$BLENDER" -b --factory-startup -P scripts/blender/rain/street.py -- \
    "$OUT/timeline.json" "$g" "$OUT/steps-$g.json"
  rm -rf "out/vr40-frames/$g" && mkdir -p "out/vr40-frames/$g"
  "$BLENDER" -b --factory-startup -P scripts/blender/rain/street.py -- \
    "$OUT/timeline.json" "$g" "out/vr40-frames/$g"
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "out/vr40-frames/$g/f%04d.png" \
    -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/$g.mp4"
  # The frame the cover holds.
  cp "out/vr40-frames/$g/f$COVER.png" "$OUT/$g-$COVER.png"
done
echo "rendered $OUT/walk.mp4 and $OUT/run.mp4"
