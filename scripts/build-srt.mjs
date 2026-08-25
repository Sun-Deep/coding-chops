// Build one SRT for the full episode from the per-scene caption JSON.
//
// Usage: node scripts/build-srt.mjs <track>/<episode> [out.srt]
//
// The episode burns its subtitles into the frame, so a viewer with CC switched
// on otherwise gets YouTube's auto-generated track stacked on top of them,
// saying the same thing a beat later. Uploading this replaces the auto track
// with the words that were actually said, in the same lines the video draws.
//
// Scene offsets come from narration.ts, which is measured from the locked
// stems, so the SRT and the render cannot drift.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const episode = process.argv[2];
if (!episode) {
  console.error(
    "usage: node scripts/build-srt.mjs <track>/<episode> [out.srt]",
  );
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const out = process.argv[3] ?? path.join(root, "out", "sd01-single-server.srt");

const narration = await readFile(
  path.join(root, "src/tracks", episode, "narration.ts"),
  "utf8",
);
const scenes = [
  ...narration.matchAll(/\{ id: "([^"]+)", seconds: ([\d.]+)/g),
].map(([, id, seconds]) => ({ id, seconds: Number(seconds) }));

const stamp = (totalMs) => {
  const ms = Math.round(totalMs);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, "0")}`;
};

// Same grouping the on-screen captions use: break on terminal punctuation,
// with length and pause as backstops for whisper's unpunctuated runs.
const toLines = (captions) => {
  const lines = [];
  let words = [];
  const flush = () => {
    if (!words.length) return;
    lines.push({
      text: words
        .map((w) => w.text)
        .join("")
        .trim(),
      startMs: words[0].startMs,
      endMs: words[words.length - 1].endMs,
    });
    words = [];
  };
  for (const c of captions) {
    const gap = words.length ? c.startMs - words[words.length - 1].endMs : 0;
    if (words.length >= 13 && gap >= 420) flush();
    words.push(c);
    if (/[.!?]"?$/.test(c.text.trim())) flush();
    else if (words.length >= 26) flush();
  }
  flush();
  return lines;
};

// A caption may run a few frames past the last word of its scene, and the last
// one can therefore end after the video does. Players clamp it, but an SRT that
// claims to run longer than its video is wrong on its face.
const totalMs = scenes.reduce((sum, s) => sum + s.seconds * 1000, 0);

let offset = 0;
let index = 0;
const blocks = [];

for (const scene of scenes) {
  const captions = JSON.parse(
    await readFile(
      path.join(
        root,
        "curriculum",
        episode,
        "audio/captions",
        `${scene.id}.json`,
      ),
      "utf8",
    ),
  );
  for (const line of toLines(captions)) {
    index += 1;
    blocks.push(
      `${index}\n${stamp(offset + line.startMs)} --> ${stamp(Math.min(offset + line.endMs, totalMs))}\n${line.text}\n`,
    );
  }
  offset += scene.seconds * 1000;
}

await writeFile(out, blocks.join("\n"));
console.log(
  `${index} subtitle lines across ${scenes.length} scenes -> ${path.relative(root, out)}`,
);
