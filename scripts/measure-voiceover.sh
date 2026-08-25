#!/usr/bin/env bash
# Report what a narration take actually contains, before deciding how to treat it.
#
# Usage: scripts/measure-voiceover.sh <file-or-directory>
#
# PAUSE_dB is the number that decides whether denoising is worth doing. It is the
# RMS level inside the first detected gap between phrases, which is where room
# tone lives. Below about -60 dB there is nothing to remove and a denoiser will
# only cost you high frequencies. Above about -50 dB there is a real floor.
#
# Room reverb does not show up here. A boomy room measures clean and still
# sounds wrong, and no denoiser fixes it.

set -euo pipefail
target="${1:?usage: measure-voiceover.sh <file-or-directory>}"
[[ -d "$target" ]] && files=("$target"/*.{m4a,wav,mp3,aiff}) || files=("$target")

printf "%-14s %8s %8s %8s %7s %9s\n" FILE DUR LUFS LRA PEAK PAUSE_dB
for f in "${files[@]}"; do
  [[ -f "$f" ]] || continue
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  m=$(ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 |
      grep -A12 "Integrated loudness")
  lufs=$(echo "$m" | grep -E "^ +I: " | awk '{print $2}')
  lra=$(echo "$m" | grep -E "^ +LRA: " | awk '{print $2}')
  peak=$(echo "$m" | grep -E "Peak:" | tail -1 | awk '{print $2}')
  gap=$(ffmpeg -hide_banner -nostats -i "$f" -af "silencedetect=n=-50dB:d=0.2" \
        -f null - 2>&1 | grep -oE "silence_start: [0-9.]+" | head -1 | awk '{print $2}')
  floor=$(ffmpeg -hide_banner -nostats -ss "${gap:-0}" -t 0.15 -i "$f" \
          -af astats=metadata=1:reset=0 -f null - 2>&1 |
          grep "RMS level dB" | head -1 | awk '{print $NF}')
  printf "%-14s %8.2f %8s %8s %8s %9.1f\n" \
    "$(basename "$f")" "$dur" "$lufs" "$lra" "$peak" "$floor"
done
