#!/usr/bin/env node

// What a chmod number is, and which ones a real disk actually carries.
//
// Two kinds of figure here and they are not the same kind of claim.
//
// The arithmetic is exact. A mode is three octal digits, one for the owner, one
// for the group and one for everybody else, and each digit is three bits worth
// 4, 2 and 1. That gives 8 * 8 * 8 = 512 modes and it is arithmetic rather than
// a measurement, so this script proves it by deriving all 512 two independent
// ways and checking they agree.
//
// The distribution is measured, and it is measured on one machine. Which modes
// a disk carries is a property of that disk, so the roots scanned are pinned
// and printed, and the reel says how many files the figure came off. What does
// not move between machines is the shape: a handful of modes out of 512 cover
// almost everything, because almost every file is either a document or a
// program.
//
// The directory check at the end is a real run against a real temporary
// directory, because the catch of the whole cut is that `x` on a directory does
// not mean what it means on a file.

import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  chmod,
  rm,
} from "node:fs/promises";
import { lstat, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const READ = 4;
const WRITE = 2;
const EXECUTE = 1;

/** The three audiences a mode is dialled for, in the order they are written. */
const AUDIENCES = ["owner", "group", "everyone"];

/** One octal digit into the three bits it is the sum of. */
const bitsOf = (digit) => ({
  read: (digit & READ) !== 0,
  write: (digit & WRITE) !== 0,
  execute: (digit & EXECUTE) !== 0,
});

const symbolOf = (digit) => {
  const b = bitsOf(digit);
  return `${b.read ? "r" : "-"}${b.write ? "w" : "-"}${b.execute ? "x" : "-"}`;
};

// ---------------------------------------------------------------------------
// 1. The arithmetic, proved rather than asserted.
// ---------------------------------------------------------------------------

const ALL = [];
for (let owner = 0; owner < 8; owner++) {
  for (let group = 0; group < 8; group++) {
    for (let everyone = 0; everyone < 8; everyone++) {
      ALL.push([owner, group, everyone]);
    }
  }
}

if (ALL.length !== 512) {
  throw new Error(`there should be 512 modes, built ${ALL.length}`);
}

for (const digits of ALL) {
  const octal = digits.join("");
  const symbolic = digits.map(symbolOf).join("");

  // Independently: build the symbolic string from scratch and read it back to
  // a number, so the sum and the letters have to agree without sharing code.
  let rebuilt = 0;
  symbolic.split("").forEach((letter, index) => {
    const place = 2 - Math.floor(index / 3);
    const weight = { r: READ, w: WRITE, x: EXECUTE, "-": 0 }[letter];
    rebuilt += weight * 8 ** place;
  });

  const asNumber = parseInt(octal, 8);
  if (rebuilt !== asNumber) {
    throw new Error(`${octal} is ${symbolic} which reads back as ${rebuilt}`);
  }
  if (symbolic.length !== 9) {
    throw new Error(`${octal} produced ${symbolic.length} letters`);
  }
}

// Every digit is the sum of the bits that are on. This is the whole cut.
for (let digit = 0; digit < 8; digit++) {
  const b = bitsOf(digit);
  const sum =
    (b.read ? READ : 0) + (b.write ? WRITE : 0) + (b.execute ? EXECUTE : 0);
  if (sum !== digit) throw new Error(`${digit} is not ${sum}`);
}

// ---------------------------------------------------------------------------
// 2. The distribution, measured.
// ---------------------------------------------------------------------------

/**
 * System directories only, and that is the point.
 *
 * This repository was in here to begin with and it made the figure drift: every
 * file added to the project moved the count, so the script's own assertion
 * fired the moment VR12's source was written. A number that changes because
 * somebody did unrelated work is not a measurement. These four do not change
 * between runs, between hours, or because the tree is being worked on.
 */
const ROOTS = ["/usr/bin", "/usr/lib", "/etc", "/usr/share/man"];

const scan = async () => {
  const files = new Map();
  const dirs = new Map();
  let fileCount = 0;
  let dirCount = 0;

  const bump = (map, mode) => map.set(mode, (map.get(mode) ?? 0) + 1);
  const modeOf = (stats) => (stats.mode & 0o777).toString(8).padStart(3, "0");

  // Build output and installed dependencies are real files on a real disk, but
  // they churn, and a figure that moves between two runs of the same script is
  // not a measurement. The source tree stays; what a build put there does not.
  const SKIP = new Set(["node_modules", "out", "renders", ".git"]);

  const walk = async (path) => {
    let entries;
    try {
      entries = await readdir(path, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP.has(entry.name)) continue;
      const full = join(path, entry.name);
      if (entry.isSymbolicLink()) continue;
      try {
        const stats = await lstat(full);
        if (entry.isDirectory()) {
          bump(dirs, modeOf(stats));
          dirCount++;
          await walk(full);
        } else if (entry.isFile()) {
          bump(files, modeOf(stats));
          fileCount++;
        }
      } catch {
        // Unreadable entries are skipped rather than guessed at.
      }
    }
  };

  for (const root of ROOTS) {
    try {
      const stats = await lstat(root);
      bump(dirs, modeOf(stats));
      dirCount++;
    } catch {
      continue;
    }
    await walk(root);
  }

  return { files, dirs, fileCount, dirCount };
};

const { files, dirs, fileCount, dirCount } = await scan();

const ranked = (map, total) =>
  [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([mode, count]) => ({ mode, count, share: (count / total) * 100 }));

const fileModes = ranked(files, fileCount);
const dirModes = ranked(dirs, dirCount);

let running = 0;
const withRunning = fileModes.map((row) => {
  running += row.share;
  return { ...row, running };
});

// ---------------------------------------------------------------------------
// 3. The catch, run rather than described.
// ---------------------------------------------------------------------------

const directoryExecuteBit = async () => {
  const base = await mkdtemp(join(tmpdir(), "chmod-"));
  const folder = join(base, "folder");
  const file = join(folder, "notes.txt");
  await mkdir(folder);
  await writeFile(file, "readable\n");
  await chmod(file, 0o644);

  const attempt = async () => {
    try {
      await readFile(file, "utf8");
      return "read";
    } catch (error) {
      return error.code;
    }
  };

  await chmod(folder, 0o755);
  const withExecute = await attempt();

  // 644 on a directory: readable, writable, and not enterable.
  await chmod(folder, 0o644);
  const withoutExecute = await attempt();

  await chmod(folder, 0o755);
  await rm(base, { recursive: true, force: true });

  return { withExecute, withoutExecute };
};

const directory = await directoryExecuteBit();

// ---------------------------------------------------------------------------

const EXPECTED_TOTAL = 512;
const EXPECTED_WEIGHTS = { r: 4, w: 2, x: 1 };

if (directory.withExecute !== "read") {
  throw new Error(
    `a 755 directory should allow the read, got ${directory.withExecute}`,
  );
}
if (directory.withoutExecute !== "EACCES") {
  throw new Error(
    `a 644 directory should deny the read with EACCES, got ${directory.withoutExecute}`,
  );
}

/**
 * The figures `src/vertical/12-file-modes/measurements.ts` is built from.
 *
 * The distribution is a property of this disk, so it is asserted rather than
 * trusted: a change to the roots, to the exclusions, or to the tree being
 * scanned moves these, and moving them silently would leave the reel stating
 * numbers no run produces.
 */
const EXPECTED = {
  files: 4_572,
  directories: 127,
  distinct: 9,
  top: [
    ["644", 2_574],
    ["444", 1_016],
    ["755", 806],
    ["555", 163],
  ],
};

if (fileCount !== EXPECTED.files || dirCount !== EXPECTED.directories) {
  throw new Error(
    `scanned ${fileCount} files and ${dirCount} directories, expected ` +
      `${EXPECTED.files} and ${EXPECTED.directories}`,
  );
}
if (files.size !== EXPECTED.distinct) {
  throw new Error(
    `${files.size} distinct modes, expected ${EXPECTED.distinct}`,
  );
}
for (const [index, [mode, count]] of EXPECTED.top.entries()) {
  const row = fileModes[index];
  if (row.mode !== mode || row.count !== count) {
    throw new Error(
      `rank ${index + 1} is ${row.mode} at ${row.count}, expected ${mode} at ${count}`,
    );
  }
}

/** The claim the reel makes: four of the 512 cover almost everything. */
const TOP_FOUR = withRunning[3].running;
if (TOP_FOUR < 99.5) {
  throw new Error(
    `the top four cover ${TOP_FOUR.toFixed(1)}%, expected at least 99.5%`,
  );
}

console.log(`${EXPECTED_TOTAL} possible modes, all verified both ways`);
console.log(
  `weights r=${EXPECTED_WEIGHTS.r} w=${EXPECTED_WEIGHTS.w} x=${EXPECTED_WEIGHTS.x}, ` +
    `so every digit is the sum of the bits that are on\n`,
);

console.log(
  `scanned ${fileCount.toLocaleString()} files and ${dirCount.toLocaleString()} directories under:`,
);
for (const root of ROOTS) console.log(`  ${root}`);

console.log(
  `\n${files.size} distinct file modes of ${EXPECTED_TOTAL} possible\n`,
);
console.log("mode  symbolic     files      share   running");
for (const row of withRunning.slice(0, 8)) {
  console.log(
    `${row.mode}   ${row.mode
      .split("")
      .map((d) => symbolOf(Number(d)))
      .join("")}  ` +
      `${String(row.count).padStart(8)}  ${row.share.toFixed(1).padStart(6)}%  ${row.running.toFixed(1).padStart(6)}%`,
  );
}

console.log(`\n${dirs.size} distinct directory modes`);
for (const row of dirModes.slice(0, 3)) {
  console.log(
    `${row.mode}   ${row.mode
      .split("")
      .map((d) => symbolOf(Number(d)))
      .join("")}  ` +
      `${String(row.count).padStart(8)}  ${row.share.toFixed(1).padStart(6)}%`,
  );
}

console.log(`\ntop four cover ${TOP_FOUR.toFixed(1)}% of files`);
console.log(`\nthe directory execute bit:`);
console.log(`  folder 755, file 644 -> ${directory.withExecute}`);
console.log(`  folder 644, file 644 -> ${directory.withoutExecute}`);
