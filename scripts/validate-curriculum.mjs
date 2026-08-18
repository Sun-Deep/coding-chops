import { access, readFile } from "node:fs/promises";

const requiredEpisodeFiles = [
  "README.md",
  "learning-notes.md",
  "sources.md",
  "understanding-check.md",
  "script.md",
  "storyboard.md",
  "shorts.md",
];

const episodeDirectory = new URL(
  "../curriculum/system-design/01-single-server/",
  import.meta.url,
);

for (const file of requiredEpisodeFiles) {
  await access(new URL(file, episodeDirectory));
}

const script = await readFile(new URL("script.md", episodeDirectory), "utf8");

if (!script.includes("Status: blocked")) {
  throw new Error(
    "Episode 01 must remain blocked until its understanding gate passes.",
  );
}

console.log("Curriculum structure is valid.");
