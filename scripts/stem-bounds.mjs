#!/usr/bin/env node
/* global console, process */

// Where the voice starts and stops in each narration stem, measured from the
// audio rather than taken from the transcription.
//
// whisper.cpp's word times are good inside a stem and loose at its edges: it
// marked the last word of one stem as ending 0.64 s before the voice did, and
// a reel trimmed to those times cut "billion" in half. ffmpeg's silencedetect
// finds the first and last moment above -40 dB instead.
//
// Usage: node scripts/stem-bounds.mjs <episode-audio-dir>
// Writes <episode-audio-dir>/stems.json. Re-run after any re-record.

import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("usage: node scripts/stem-bounds.mjs <audio-dir>");
const master = path.join(dir, "master");
const out = {};
for (const file of readdirSync(master)
  .filter((f) => f.endsWith(".wav"))
  .sort()) {
  const f = path.join(master, file);
  const duration = Number(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      f,
    ])
      .toString()
      .trim(),
  );
  // silencedetect reports on stderr.
  const err = execFileSync("sh", [
    "-c",
    `ffmpeg -hide_banner -i "${f}" -af silencedetect=noise=-40dB:d=0.3 -f null - 2>&1`,
  ]).toString();
  const starts = [...err.matchAll(/silence_start: ([0-9.]+)/g)].map((m) =>
    Number(m[1]),
  );
  const ends = [...err.matchAll(/silence_end: ([0-9.]+)/g)].map((m) =>
    Number(m[1]),
  );
  const speechStart = starts[0] === 0 && ends.length ? ends[0] : 0;
  const tail = ends.length && Math.abs(ends[ends.length - 1] - duration) < 0.02;
  const speechEnd = tail ? starts[starts.length - 1] : duration;
  out[path.basename(file, ".wav")] = {
    startMs: Math.round(speechStart * 1000),
    endMs: Math.round(speechEnd * 1000),
    durationMs: Math.round(duration * 1000),
  };
}
writeFileSync(
  path.join(dir, "stems.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(out);
