#!/usr/bin/env bash
# Renders the birthday reel's classrooms in Blender and encodes them for
# Remotion, which lays the headline, the counters, the date tags, the
# captions and the sound over them.
# Needs Blender at /Applications/Blender.app and the Quaternius characters in
# third_party/quaternius-characters. FRAMES=a,b,c renders a proof.
#
# Usage: scripts/blender/birthdays/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr60
DIR=out/vr60-frames/classes
COVER=0150
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/birthdays/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/birthdays/classes.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
if [[ -z "${FRAMES:-}" ]]; then rm -rf "$DIR"; fi
mkdir -p "$DIR"
"$BLENDER" -b --factory-startup -P scripts/blender/birthdays/classes.py -- \
  "$OUT/timeline.json" "$DIR"
if [[ -z "${FRAMES:-}" ]]; then
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" \
    -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/classes.mp4"
  # The frame the cover holds: the web finished, the one orange string.
  cp "$DIR/f$COVER.png" "$OUT/classes-$COVER.png"
  echo "rendered $OUT/classes.mp4"
fi
