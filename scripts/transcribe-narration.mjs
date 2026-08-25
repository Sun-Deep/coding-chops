// Turn locked narration into timestamped caption JSON.
//
// Usage: node scripts/transcribe-narration.mjs <episode-audio-dir> [--force] [--recorrect]
//
// --recorrect re-applies caption-corrections.json to the caption JSON that is
// already there and does nothing else. Corrections get edited far more often
// than narration gets re-recorded, and a full --force run would spend minutes
// in whisper only to hand back new timings for visuals that are already
// aligned to the old ones.
//
// The production standard puts caption JSON second in the truth chain, above the
// storyboard and the composition. Visuals get aligned to these timings, so this
// runs after narration is locked and before any animation work.
//
// whisper.cpp only accepts 16 kHz mono WAV, so each stem is downsampled into a
// temporary file first. The master stems themselves are never modified.
//
// Everything downloads into .whisper/, which is gitignored. First run pulls the
// model and builds whisper.cpp, so it is slow. Later runs reuse both.

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.7.4";
const MODEL = "medium.en";

const audioDir = process.argv[2];
if (!audioDir) {
  console.error("usage: node scripts/transcribe-narration.mjs <audio-dir>");
  process.exit(1);
}

const repoRoot = path.resolve(import.meta.dirname, "..");
const whisperPath = path.join(repoRoot, ".whisper");
const stemsDir = path.join(audioDir, "master");
const outDir = path.join(audioDir, "captions");
const tmpDir = path.join(whisperPath, "tmp");

const recorrectOnly = process.argv.includes("--recorrect");

if (!recorrectOnly) {
  await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
  await downloadWhisperModel({ model: MODEL, folder: whisperPath });
  await mkdir(tmpDir, { recursive: true });
}
await mkdir(outDir, { recursive: true });

/**
 * Whisper mishears the occasional word, and captions have to match what was
 * actually said. Corrections live in a file next to the audio and are applied
 * after every run, so a re-transcription cannot silently undo them.
 */
const correctionsPath = path.join(audioDir, "caption-corrections.json");
const corrections = existsSync(correctionsPath)
  ? JSON.parse(await readFile(correctionsPath, "utf8"))
  : {};

const applyCorrections = (name, captions) => {
  const rules = corrections[name];
  if (!Array.isArray(rules)) return captions;

  let working = captions;

  for (const rule of rules) {
    const bareOf = (caption) =>
      caption.text
        .trim()
        .toLowerCase()
        .replace(/[^a-z']/g, "");
    // `before` anchors a rule to the word that follows it. Ordinals are counted
    // among the tokens that currently match, so correcting one renumbers the
    // rest: a rule written as occurrence 1 of two "resource" tokens hits the
    // other one on the next run and corrupts it. Anchoring on context is stable,
    // and self-limiting — once the word is corrected the rule stops matching.
    const matches = working.filter((c, i) => {
      if (bareOf(c) !== rule.from.toLowerCase()) return false;
      if (!rule.before) return true;
      const next = working[i + 1];
      return next !== undefined && bareOf(next) === rule.before.toLowerCase();
    });
    if (matches.length === 0) {
      // A rule whose `to` no longer bare-matches its `from` reads as missing
      // once it has been applied, which is the normal state, not a problem.
      const bareTo = rule.to?.toLowerCase().replace(/[^a-z']/g, "");
      const done = bareTo && working.some((c) => bareOf(c) === bareTo);
      console.log(
        `  ${done ? "already applied" : "MISSING"} "${rule.from}" in ${name}`,
      );
      continue;
    }

    // occurrence -1 means the last one, which is how you target a word that
    // repeats throughout a segment without counting them by hand.
    const index =
      rule.occurrence === -1 ? matches.length - 1 : (rule.occurrence ?? 1) - 1;
    const target = matches[index];
    if (!target) {
      // A drop that has already run leaves one fewer match than the rule
      // counted on, which is the rule working rather than failing.
      const dropped = rule.drop && matches.length < index + 1;
      console.log(
        `  ${dropped ? "already applied" : "MISSING"} occurrence ${rule.occurrence} of "${rule.from}" in ${name}`,
      );
      continue;
    }

    if (rule.drop) {
      // Whisper sometimes doubles a word, or invents one. Removing the token is
      // the only fix; blanking its text would leave a gap in the line.
      working = working.filter((c) => c !== target);
      console.log(`  dropped "${rule.from}" in ${name}`);
      continue;
    }

    // Punctuation is stripped before matching, so a rule that only adds a
    // period still matches its own output. Without this guard, re-running the
    // corrections turns "this." into "this.." and then "this...".
    if (target.text.trim() === rule.to) {
      console.log(`  already applied "${rule.from}" in ${name}`);
      continue;
    }

    target.text = target.text.replace(new RegExp(rule.from, "i"), rule.to);
    console.log(`  corrected "${rule.from}" to "${rule.to}" in ${name}`);
  }

  return working;
};

if (recorrectOnly) {
  const existing = (await readdir(outDir))
    .filter((f) => f.endsWith(".json"))
    .sort();
  for (const file of existing) {
    const out = path.join(outDir, file);
    const name = path.basename(file, ".json");
    const captions = JSON.parse(await readFile(out, "utf8"));
    await writeFile(
      out,
      JSON.stringify(applyCorrections(name, captions), null, 2) + "\n",
    );
  }
  console.log(`recorrected ${existing.length} caption files`);
  process.exit(0);
}

const stems = (await readdir(stemsDir))
  .filter((f) => f.endsWith(".wav"))
  .sort();

for (const stem of stems) {
  const name = path.basename(stem, ".wav");
  const out = path.join(outDir, `${name}.json`);
  if (existsSync(out) && !process.argv.includes("--force")) {
    console.log(`${name}: already transcribed, skipping`);
    continue;
  }

  const wav16 = path.join(tmpDir, `${name}.wav`);
  execFileSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    path.join(stemsDir, stem),
    "-ar",
    "16000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    wav16,
  ]);

  const result = await transcribe({
    inputPath: wav16,
    whisperPath,
    whisperCppVersion: WHISPER_VERSION,
    model: MODEL,
    tokenLevelTimestamps: true,
    language: "en",
    splitOnWord: true,
  });

  const { captions } = toCaptions({ whisperCppOutput: result });
  await writeFile(
    out,
    JSON.stringify(applyCorrections(name, captions), null, 2) + "\n",
  );
  console.log(
    `${name}: ${captions.length} captions -> ${path.relative(repoRoot, out)}`,
  );
}

await rm(tmpDir, { recursive: true, force: true });
