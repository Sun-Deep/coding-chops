#!/usr/bin/env bash
# Synthesize the channel's sound effect set.
#
# Usage: scripts/build-sfx.sh
#
# Every effect is generated here rather than licensed, so the repository owns
# them and there is no third-party term to track. Re-running reproduces the set.
#
# Design rules, from the audio contract in the production standard:
#   - Sounds mark semantic events only. Nothing plays because a property moved.
#   - Narration stays the clearest layer, so these sit well below it.
#   - Everything is short. Nothing rings on into the next idea.
#
# Levels are conservative. Per-use gain lives in the composition, so an effect
# can be pulled down without regenerating it.

set -euo pipefail

out="$(cd "$(dirname "$0")/.." && pwd)/public/sfx"
mkdir -p "$out"

# gen <name> <duration> <peak-dB> <lavfi-source> [extra-filters]
gen() {
  local name="$1" dur="$2" peak="$3" src="$4" extra="${5:-anull}"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "$src" \
    -af "${extra},afade=t=in:st=0:d=0.006,alimiter=limit=0.9,volume=${peak}dB" \
    -ar 48000 -ac 1 -c:a pcm_s16le -t "$dur" "$out/$name.wav"
  printf "  %-9s %5.2fs  peak %s\n" "$name" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/$name.wav")" \
    "$(ffmpeg -hide_banner -nostats -i "$out/$name.wav" -af astats=metadata=1:reset=0 -f null - 2>&1 | grep 'Peak level dB' | tail -1 | awk '{print $NF}')"
}

echo "building sfx into public/sfx"

# A named thing lands. Two stacked partials so it reads as material, not a beep.
gen tick 0.10 -20 \
  "aevalsrc='(0.5*sin(2*PI*1850*t)+0.28*sin(2*PI*2760*t))*exp(-28*t)':d=0.1:s=48000"

# The pile of tools is dismissed. Air leaving the frame.
gen dissolve 0.85 -23 \
  "anoisesrc=color=brown:duration=0.85:amplitude=0.8:seed=7" \
  "bandpass=f=760:width_type=o:w=2.4,afade=t=out:st=0.15:d=0.7:curve=exp"

# The hero object appears. Low body under a clean partial.
gen appear 0.70 -17 \
  "aevalsrc='0.55*sin(2*PI*660*t)*exp(-5*t)+0.4*sin(2*PI*990*t)*exp(-7*t)+0.6*sin(2*PI*(110*t-30*t*t))*exp(-6*t)':d=0.7:s=48000"

# An object is placed. Soft weight, no click.
gen settle 0.45 -21 \
  "aevalsrc='0.75*sin(2*PI*(150*t-70*t*t))*exp(-9*t)':d=0.45:s=48000"

# The request departs. Rising chirp inside moving air.
gen send 0.65 -20 \
  "aevalsrc='0.4*sin(2*PI*(340*t+1150*t*t))*sin(PI*t/0.65)':d=0.65:s=48000" \
  "highpass=f=180"

# The request lands. Low impact with a short transient on top.
gen land 0.55 -17 \
  "aevalsrc='0.85*sin(2*PI*(95*t-40*t*t))*exp(-8*t)+0.22*sin(2*PI*1400*t)*exp(-45*t)':d=0.55:s=48000"

# The machine does one named piece of work. Quiet, internal, unglamorous.
gen process 0.16 -25 \
  "aevalsrc='0.4*sin(2*PI*520*t)*exp(-16*t)+0.2*sin(2*PI*780*t)*exp(-22*t)':d=0.16:s=48000"

# The reply comes back. Warmer and falling, so direction is audible.
gen return 0.70 -20 \
  "aevalsrc='0.4*sin(2*PI*(980*t-620*t*t))*sin(PI*t/0.7)':d=0.7:s=48000" \
  "highpass=f=150"

# Data arriving, one tile at a time.
gen fill 0.13 -26 \
  "aevalsrc='0.4*sin(2*PI*1240*t)*exp(-20*t)':d=0.13:s=48000"

# A concept is named and holds. The heaviest sound in the set, used sparingly.
gen name 0.90 -16 \
  "aevalsrc='0.7*sin(2*PI*82*t)*exp(-3.2*t)+0.34*sin(2*PI*164*t)*exp(-4.5*t)+0.2*sin(2*PI*246*t)*exp(-6*t)':d=0.9:s=48000"

echo "done"
