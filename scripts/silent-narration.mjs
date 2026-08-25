// Write silent narration stems so the project renders without the recordings.
//
// Usage: node scripts/silent-narration.mjs <track>/<episode>
//   e.g. node scripts/silent-narration.mjs system-design/01-single-server
//
// The narration recordings are not distributed: the content licence excludes
// them and they run to roughly 300 MB. Without them `remotion render` fails on
// a missing file, which would make a fresh clone look broken rather than
// deliberately incomplete.
//
// Every animation is timed off the caption JSON, which IS committed, so a
// render against these stems is correct in every respect except that nobody is
// speaking. Subtitles still carry the narration, so the lesson is followable.
//
// Existing files are never overwritten. If you have the real stems in place,
// running this does nothing.

import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const episode = process.argv[2];
if (!episode) {
  console.error("usage: node scripts/silent-narration.mjs <track>/<episode>");
  process.exit(1);
}

const repoRoot = path.resolve(import.meta.dirname, "..");
const narrationFile = path.join(
  repoRoot,
  "src/tracks",
  episode,
  "narration.ts",
);
const outDir = path.join(repoRoot, "public/narration");

if (!existsSync(narrationFile)) {
  console.error(`No narration.ts for ${episode}. Looked in ${narrationFile}`);
  process.exit(1);
}

// narration.ts is generated with a fixed shape by narration-durations.mjs.
const source = await readFile(narrationFile, "utf8");
const scenes = [
  ...source.matchAll(
    /\{ id: "([^"]+)", seconds: ([\d.]+), audio: "([^"]+)" \}/g,
  ),
].map(([, id, seconds, audio]) => ({ id, seconds: Number(seconds), audio }));

if (scenes.length === 0) {
  console.error(`Could not read any scenes from ${narrationFile}`);
  process.exit(1);
}

// Locally this is often a symlink to the master stems. If it points at
// something that is not there, mkdir fails with a bare ENOENT, which reads as a
// bug in this script rather than as a link with nothing on the end of it.
if (existsSync(path.dirname(outDir)) && !existsSync(outDir)) {
  const { lstatSync } = await import("node:fs");
  let dangling = false;
  try {
    dangling = lstatSync(outDir).isSymbolicLink();
  } catch {
    dangling = false;
  }
  if (dangling) {
    console.error(
      `public/narration is a symlink and its target is missing. Remove the link and run this again.`,
    );
    process.exit(1);
  }
}

await mkdir(outDir, { recursive: true });

let written = 0;
for (const scene of scenes) {
  const target = path.join(outDir, scene.audio);
  if (existsSync(target)) {
    console.log(`${scene.id}: already present, leaving it alone`);
    continue;
  }

  execFileSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=48000:cl=mono",
    "-t",
    String(scene.seconds),
    "-c:a",
    "pcm_s16le",
    target,
  ]);
  console.log(
    `${scene.id}: ${scene.seconds}s of silence -> public/narration/${scene.audio}`,
  );
  written += 1;
}

console.log(
  written === 0
    ? "Nothing to do. Every stem was already in place."
    : `Wrote ${written} silent stem${written === 1 ? "" : "s"}. Renders will be silent; subtitles still carry the narration.`,
);
