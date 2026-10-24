#!/usr/bin/env bash
# Renders the Monty Hall reel in Blender, the first game close up
# (doors.py) up to the cut and the studio (studio.py) after it, and encodes
# them as one clip for Remotion, which lays the headline, code, labels,
# narration and sound over it.
#
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/monty/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr45
DIR=out/vr45-frames/all
COVER=0112
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/monty/export.mjs "$OUT/timeline.json"
CUT=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).pull)' "$OUT/timeline.json")
"$BLENDER" -b --factory-startup -P scripts/blender/monty/doors.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
"$BLENDER" -b --factory-startup -P scripts/blender/monty/studio.py -- \
  "$OUT/timeline.json" "$OUT/track.json"
rm -rf "$DIR" && mkdir -p "$DIR"
FRAMES=$(seq -s, 0 $((CUT - 1))) "$BLENDER" -b --factory-startup \
  -P scripts/blender/monty/doors.py -- "$OUT/timeline.json" "$DIR"
"$BLENDER" -b --factory-startup -P scripts/blender/monty/studio.py -- \
  "$OUT/timeline.json" "$DIR"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" \
  -c:v libx264 -crf 12 -pix_fmt yuv420p "$OUT/scene.mp4"
# The frame the cover holds.
cp "$DIR/f$COVER.png" "$OUT/doors-$COVER.png"
echo "rendered $OUT/scene.mp4"
