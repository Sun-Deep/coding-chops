// Check that every episode folder is complete and that its script status is
// honest.
//
// The first version of this check required the literal string "Status: blocked"
// in script.md and threw if it was missing. Its error message said the episode
// "must remain blocked until its understanding gate passes", but it never read
// the understanding check, so passing that gate did nothing and the only way to
// release a script was to delete the rule holding it. A gate with no key is not
// a gate.
//
// This reads both files and compares them. A script may only leave blocked once
// every box in the understanding check is ticked, and it must go back to blocked
// if a box is ever unticked again. The gate opens and closes on the work rather
// than on a magic string.
//
// The second version hardcoded one episode path, so a second track was invisible
// to it. This walks every episode under every track.
//
// An episode with no script.md is a draft. Lessons here start as a lone
// storyboard and grow, and failing the build for a folder that is honestly
// unfinished would only teach people to write empty files to silence it. Drafts
// are reported and skipped. The moment a script.md appears, the full set is
// required.

import { readdir, readFile } from "node:fs/promises";

const requiredEpisodeFiles = [
  "README.md",
  "learning-notes.md",
  "sources.md",
  "understanding-check.md",
  "script.md",
  "storyboard.md",
];

const curriculum = new URL("../curriculum/", import.meta.url);
const skipTracks = new Set(["templates"]);

const directories = async (url) =>
  (await readdir(url, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const problems = [];
const drafts = [];
let checked = 0;

for (const track of await directories(curriculum)) {
  if (skipTracks.has(track)) continue;
  const trackUrl = new URL(`${track}/`, curriculum);

  for (const episode of await directories(trackUrl)) {
    const id = `${track}/${episode}`;
    const episodeUrl = new URL(`${episode}/`, trackUrl);
    const present = new Set(await readdir(episodeUrl));

    if (!present.has("script.md")) {
      drafts.push(id);
      continue;
    }

    const missing = requiredEpisodeFiles.filter((file) => !present.has(file));
    if (missing.length > 0) {
      problems.push(`${id} has a script but is missing: ${missing.join(", ")}`);
      continue;
    }

    const read = (file) => readFile(new URL(file, episodeUrl), "utf8");
    const script = await read("script.md");
    const understanding = await read("understanding-check.md");

    const status = script.match(/^Status:\s*(.+)$/m)?.[1].trim();
    const allowed = ["blocked", "approved", "published"];

    if (!status) {
      problems.push(`${id}: script.md needs a \`Status:\` line.`);
      continue;
    }

    if (!allowed.includes(status)) {
      problems.push(
        `${id}: script.md has "Status: ${status}". Use one of: ${allowed.join(", ")}.`,
      );
      continue;
    }

    const unticked = [...understanding.matchAll(/^- \[ \] (.+)$/gm)].map(
      (match) => match[1],
    );

    if (status !== "blocked" && unticked.length > 0) {
      problems.push(
        `${id}: script.md is ${status} but the understanding check has ` +
          `${unticked.length} unticked item(s):\n` +
          unticked.map((item) => `    - ${item}`).join("\n"),
      );
      continue;
    }

    if (status === "blocked" && unticked.length === 0) {
      console.log(
        `Note: ${id} has a complete understanding check but is still blocked.`,
      );
    }

    checked++;
    console.log(`${id}: ${status}`);
  }
}

for (const draft of drafts) {
  console.log(`${draft}: draft, no script yet`);
}

if (problems.length > 0) {
  throw new Error(problems.join("\n"));
}

console.log(
  `\nCurriculum structure is valid. ${checked} episode(s) checked, ${drafts.length} draft(s).`,
);
