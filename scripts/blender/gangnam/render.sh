#!/usr/bin/env bash
# Renders the Gangnam Style reel's dancer in Blender and encodes it for
# Remotion, which plays it in the reel's video page under the view count.
# Needs Blender at /Applications/Blender.app.
#
# Usage: scripts/blender/gangnam/render.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
OUT=public/vr51
DIR=out/vr51-frames/dancer
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings \
  --import ./scripts/ts-register.mjs scripts/blender/gangnam/export.mjs "$OUT/timeline.json"
rm -rf "$DIR" && mkdir -p "$DIR"
"$BLENDER" -b --factory-startup -P scripts/blender/gangnam/dancer.py -- \
  "$OUT/timeline.json" "$DIR"
ffmpeg -v error -y -framerate 30 -start_number 0 -i "$DIR/f%04d.png" \
  -c:v libx264 -crf 14 -pix_fmt yuv420p "$OUT/dancer.mp4"
# The frame the cover holds: just after the count turns negative.
COVER=$(node -e 'const t=JSON.parse(require("fs").readFileSync(process.argv[1]));console.log(String(t.beats.SIGN_AT+24).padStart(4,"0"))' "$OUT/timeline.json")
cp "$DIR/f$COVER.png" "$OUT/dancer-$COVER.png"
echo "rendered $OUT/dancer.mp4"
