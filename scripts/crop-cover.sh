#!/usr/bin/env bash
# Crop a 9:16 vertical cover to the profile grid shapes that will cut it.
#
# Usage: scripts/crop-cover.sh out/vertical/vr05-cover.png
#
# A reel cover is uploaded at 9:16 and shown that way only in the feed. The
# profile grids crop it: 1:1 on TikTok, 3:4 on Instagram. The square is the
# tighter of the two, which is why `SQUARE_TOP` and `SQUARE_BOTTOM` in
# `src/shared/vertical/geometry.ts` are where every element on a cover has to
# sit.
#
# Both crops are centred and derived from the input width rather than hardcoded,
# which is the same derivation geometry.ts makes:
#
#   square    width x width,        top (height - width) / 2
#   portrait  width x width * 4/3,  top (height - width * 4 / 3) / 2
#
# So a change to the canvas size cannot leave this script behind.

set -euo pipefail

src="${1:?usage: scripts/crop-cover.sh <cover.png>}"
[ -f "$src" ] || { echo "no such file: $src" >&2; exit 1; }

dims=$(ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$src")
w=${dims%%,*}
h=${dims##*,}

square_top=$(( (h - w) / 2 ))
portrait_h=$(( w * 4 / 3 ))
portrait_top=$(( (h - portrait_h) / 2 ))

base="${src%.png}"

ffmpeg -y -v error -i "$src" -vf "crop=${w}:${w}:0:${square_top}" "${base}-crop-1x1.png"
ffmpeg -y -v error -i "$src" -vf "crop=${w}:${portrait_h}:0:${portrait_top}" "${base}-crop-3x4.png"

printf "%s  %sx%s\n" "$src" "$w" "$h"
printf "  1:1  %sx%s at y=%s  -> %s\n" "$w" "$w" "$square_top" "${base}-crop-1x1.png"
printf "  3:4  %sx%s at y=%s  -> %s\n" "$w" "$portrait_h" "$portrait_top" "${base}-crop-3x4.png"
