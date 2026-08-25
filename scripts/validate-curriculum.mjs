// Check that an episode folder is complete and that its script status is honest.
//
// The previous version of this check required the literal string
// "Status: blocked" in script.md and threw if it was missing. Its error message
// said the episode "must remain blocked until its understanding gate passes",
// but it never read the understanding check, so passing that gate did nothing
// and the only way to release a script was to delete the rule holding it. A
// gate with no key is not a gate.
//
// This reads both files and compares them. A script may only leave blocked once
// every box in the understanding check is ticked, and it must go back to blocked
// if a box is ever unticked again. The gate now opens and closes on the work
// rather than on a magic string.

import { access, readFile } from "node:fs/promises";

const requiredEpisodeFiles = [
  "README.md",
  "learning-notes.md",
  "sources.md",
  "understanding-check.md",
  "script.md",
  "storyboard.md",
];

const episodeDirectory = new URL(
  "../curriculum/system-design/01-single-server/",
  import.meta.url,
);

for (const file of requiredEpisodeFiles) {
  await access(new URL(file, episodeDirectory));
}

const read = (file) => readFile(new URL(file, episodeDirectory), "utf8");

const script = await read("script.md");
const understanding = await read("understanding-check.md");

const status = script.match(/^Status:\s*(.+)$/m)?.[1].trim();
const allowed = ["blocked", "approved"];

if (!status) {
  throw new Error("script.md needs a `Status:` line.");
}

if (!allowed.includes(status)) {
  throw new Error(
    `script.md has "Status: ${status}". Use one of: ${allowed.join(", ")}.`,
  );
}

const unticked = [...understanding.matchAll(/^- \[ \] (.+)$/gm)].map(
  (match) => match[1],
);

if (status === "approved" && unticked.length > 0) {
  throw new Error(
    `script.md is approved but the understanding check has ${unticked.length} unticked item(s):\n` +
      unticked.map((item) => `  - ${item}`).join("\n"),
  );
}

if (status === "blocked" && unticked.length === 0) {
  console.log(
    "Note: the understanding check is complete but script.md is still blocked.",
  );
}

console.log(`Curriculum structure is valid. Episode 01 script: ${status}.`);
