#!/usr/bin/env bash
# Renders the stock lesson's pillars and walker in Blender and encodes them
# for Remotion, which lays the code, the marks, the captions, the voice and
# the sound over them.
#
# The timing comes from the creator's recorded stems: transcribe them first
# with `node scripts/transcribe-narration.mjs curriculum/vertical/48-stock-lesson/audio`
# and measure their edges with `node scripts/stem-bounds.mjs curriculum/vertical/48-stock-lesson/audio`.
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/stock/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr48
DIR=out/vr48-frames/pillars
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/stock/export.mjs "$OUT/timeline.json"
"$BLENDER" -b --factory-startup -P scripts/blender/stock/pillars.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$DIR" && mkdir -p "$DIR"
"$BLENDER" -b --factory-startup -P scripts/blender/stock/pillars.py -- \
  "$OUT/timeline.json" "$DIR"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" \
  -c:v libx264 -crf 14 -pix_fmt yuv420p "$OUT/scene.mp4"
# The frame the cover holds: the answer, 20 frames on.
COVER=$(node -e 'const t=JSON.parse(require("fs").readFileSync(process.argv[1]));console.log(String(t.beats.answer+20).padStart(4,"0"))' "$OUT/timeline.json")
cp "$DIR/f$COVER.png" "$OUT/scene-cover.png"
echo "rendered $OUT/scene.mp4"
