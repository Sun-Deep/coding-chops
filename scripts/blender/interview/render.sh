#!/usr/bin/env bash
# Renders the Google interview reel's room in Blender and encodes it for
# Remotion, which lays the code, the words, the voice and the sound over it.
# The timing comes from the creator's take; see the reel's README.
#
# Usage: scripts/blender/interview/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr50
DIR=out/vr50-frames/room
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/interview/export.mjs "$OUT/timeline.json"
rm -rf "$DIR" && mkdir -p "$DIR"
"$BLENDER" -b --factory-startup -P scripts/blender/interview/room.py -- \
  "$OUT/timeline.json" "$DIR"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" \
  -c:v libx264 -crf 14 -pix_fmt yuv420p "$OUT/room.mp4"
COVER=$(node -e 'const t=JSON.parse(require("fs").readFileSync(process.argv[1]));console.log(String(t.beats.wrong+12).padStart(4,"0"))' "$OUT/timeline.json")
cp "$DIR/f$COVER.png" "$OUT/room-cover.png"
echo "rendered $OUT/room.mp4"
