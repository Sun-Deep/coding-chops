#!/usr/bin/env bash
# Renders the deplaning reel's two cabins in Blender and encodes them for
# Remotion, which lays the headline, labels, narration and sound over them.
#
# Needs Blender at /Applications/Blender.app and the Quaternius characters in
# third_party/quaternius-characters (see third_party/README.md).
#
# Usage: scripts/blender/deplane/render.sh [scale]
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
SCALE="${1:-1.0}"
OUT=public/vr36
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs \
  scripts/blender/deplane/export.mjs "$OUT/timeline.json"
for v in stand sit; do
  "$BLENDER" -b --factory-startup -P scripts/blender/deplane/animate.py -- \
    "$OUT/timeline.json" "$v" "$OUT/track-$v.json"
  rm -rf "out/vr36-frames/$v" && mkdir -p "out/vr36-frames/$v"
  "$BLENDER" -b --factory-startup -P scripts/blender/deplane/animate.py -- \
    "$OUT/timeline.json" "$v" "out/vr36-frames/$v" 0 419 "$SCALE"
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "out/vr36-frames/$v/f%04d.png" \
    -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/$v.mp4"
  # The frame the cover holds.
  cp "out/vr36-frames/$v/f0130.png" "$OUT/$v-0130.png"
done
echo "rendered $OUT/stand.mp4 and $OUT/sit.mp4"
