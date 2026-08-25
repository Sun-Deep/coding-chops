#!/usr/bin/env bash
# Turn a raw narration take into a mix-ready stem.
#
# Usage: scripts/clean-voiceover.sh <input-audio> [output-dir] [--denoise|--minimal]
#
# --minimal is for audio that has already been through a repair tool such as
# Adobe Podcast Enhance Speech. Those tools denoise, shape tone, and compress
# on the way out. Stacking a second round of EQ and compression on top is what
# makes narration sound processed, so --minimal does only what is still missing:
# mono, subsonic cut, loudness, ceiling.
#
# Never writes over the input. Output is 48 kHz mono WAV.
#
# Denoise is OFF by default and that is deliberate. Measure the take first with
# scripts/measure-voiceover.sh. If the pauses already sit below about -60 dB RMS
# there is nothing to remove, and running a denoiser on clean speech only costs
# you high frequencies and adds artifacts. Pass --denoise when the measurement
# says the floor is actually high.
#
# The chain:
#   pan           collapses dual-mono stereo to one channel, no information lost
#   highpass      cuts subsonic rumble and plosive energy below 75 Hz
#   [afftdn]      broadband denoise, only with --denoise
#   equalizer     -2 dB at 300 Hz for boxiness, +2 dB at 4.5 kHz for consonants
#   deesser       tames the sibilance the presence lift exaggerates
#   acompressor   evens out delivery without pumping
#   loudnorm      two passes, so the measured result matches the target
#   alimiter      catches anything left above the ceiling
#
# Target: -16 LUFS integrated, -1.5 dBTP. That leaves room for the music bed to
# duck under narration in a final mix landing near -14 LUFS.

set -euo pipefail

input="${1:?usage: clean-voiceover.sh <input-audio> [output-dir] [--denoise]}"
outdir="${2:-audio/clean}"
mode="${3:-}"
name="$(basename "${input%.*}")"
out="$outdir/${name%-enhanced}.wav"
mkdir -p "$outdir"

base="pan=mono|c0=0.5*c0+0.5*c1,highpass=f=75:poles=2"

if [[ "$mode" == "--minimal" ]]; then
  filters="$base"
else
  denoise=""
  [[ "$mode" == "--denoise" ]] && denoise="afftdn=nr=10:nf=-50:tn=1,"
  filters="$base,\
${denoise}\
equalizer=f=300:t=q:w=1.2:g=-2,\
equalizer=f=4500:t=q:w=1.0:g=2,\
deesser=i=0.4,\
acompressor=threshold=-18dB:ratio=3:attack=5:release=120"
fi

# Pass one measures the chain's output so pass two can hit the target exactly.
measured="$(ffmpeg -hide_banner -nostats -i "$input" \
  -af "$filters,loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json" \
  -f null - 2>&1 | sed -n '/{/,/}/p')"
get() { echo "$measured" | grep "\"$1\"" | sed 's/.*: *"\([^"]*\)".*/\1/'; }

ffmpeg -hide_banner -loglevel error -y -i "$input" \
  -af "$filters,loudnorm=I=-16:TP=-1.5:LRA=7:\
measured_I=$(get input_i):measured_TP=$(get input_tp):\
measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):\
offset=$(get target_offset):linear=true,alimiter=limit=0.95" \
  -ar 48000 -ac 1 -c:a pcm_s24le "$out"

echo "$out"
