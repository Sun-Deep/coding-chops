#!/usr/bin/env node

// What your computer does when you compress a folder.
//
// The subject is the household operation: a folder of files, right-clicked and
// compressed, producing a `.zip` beside it. So the archive here is built by the
// real `zip` binary rather than by anything in this repository, and the size the
// reel prints is the size that lands on disk.
//
// Three kinds of figure, and they are not the same kind of claim.
//
// The archive sizes are exact and they are not ours. They come off Info-ZIP,
// the same tool behind Finder's Compress and every `zip` on a Unix box.
//
// The per-file compressed sizes are exact too, and they come out of the
// archive's own central directory as `unzip -lv` reports it.
//
// The parse is a demonstration. DEFLATE is two mechanisms stacked: LZ77
// replaces a run of bytes it has seen before with a pointer back to the earlier
// copy, and Huffman then writes what is left in fewer bits. The reel animates
// the first one, so this script performs its own LZ77 parse per file to know
// which spans are copies and where each one points, and proves it by expanding
// the token stream back out and checking it is the input byte for byte.
//
// Per file, and that matters. A zip compresses each member on its own, with the
// window reset at every file boundary, so nothing in tue.log may point at
// anything in mon.log. That is why the parse runs twice rather than once over
// the pair, and it is visible in the reel: when the second file comes up the
// arcs stop and the encoder has to spell everything out again.

import { deflateRawSync, gzipSync, constants } from "node:zlib";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  writeFileSync,
  statSync,
  rmSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The fixture.
// ---------------------------------------------------------------------------
//
// Literals rather than anything generated at run time, so the figures cannot
// drift between runs or between machines. VR12's scan counted this repository
// and every file added to the project moved the number.
//
// Two days of the same service. The repetition is visible before any mechanism
// runs, which is the whole claim, and the second file repeats the first at a
// glance while sharing none of its compression, which is the thing about zip
// most people have never been told.

const FOLDER = "logs";

const FILES = [
  {
    name: "mon.log",
    lines: [
      "2026-09-16 09:14:02 INFO  GET  /api/orders 200 12ms",
      "2026-09-16 09:14:02 INFO  GET  /api/cart   200 40ms",
      "2026-09-16 09:14:03 INFO  GET  /api/orders 200 23ms",
      "2026-09-16 09:14:03 INFO  GET  /api/orders 200 15ms",
      "2026-09-16 09:14:04 INFO  GET  /api/cart   200 11ms",
      "2026-09-16 09:14:04 ERROR GET  /api/orders 500 10ms",
      "2026-09-16 09:14:05 INFO  GET  /api/orders 200 42ms",
      "2026-09-16 09:14:05 INFO  GET  /api/orders 200 19ms",
      "2026-09-16 09:14:06 INFO  GET  /api/orders 200 14ms",
      "2026-09-16 09:14:06 INFO  GET  /api/orders 200 21ms",
      "2026-09-16 09:14:07 INFO  GET  /api/orders 200 37ms",
      "2026-09-16 09:14:07 INFO  GET  /api/orders 200 58ms",
      "2026-09-16 09:14:08 INFO  GET  /api/orders 200 27ms",
      "2026-09-16 09:14:08 INFO  POST /api/orders 201 26ms",
      "2026-09-16 09:14:09 INFO  GET  /api/orders 200 18ms",
      "2026-09-16 09:14:09 INFO  GET  /api/users  200 10ms",
      "2026-09-16 09:14:10 INFO  GET  /api/cart   200 58ms",
      "2026-09-16 09:14:10 INFO  GET  /api/cart   200 46ms",
      "2026-09-16 09:14:11 INFO  GET  /api/orders 200 13ms",
      "2026-09-16 09:14:11 INFO  GET  /api/cart   200 11ms",
    ],
  },
  {
    name: "tue.log",
    lines: [
      "2026-09-17 09:14:02 INFO  GET  /api/users  200 51ms",
      "2026-09-17 09:14:02 INFO  GET  /api/cart   200 50ms",
      "2026-09-17 09:14:03 INFO  POST /api/orders 201 47ms",
      "2026-09-17 09:14:03 INFO  GET  /api/orders 200 16ms",
      "2026-09-17 09:14:04 WARN  GET  /api/users  429 39ms",
      "2026-09-17 09:14:04 INFO  GET  /api/orders 200 16ms",
      "2026-09-17 09:14:05 INFO  POST /api/cart   201 34ms",
      "2026-09-17 09:14:05 INFO  GET  /api/cart   200 22ms",
      "2026-09-17 09:14:06 INFO  GET  /api/orders 200 22ms",
      "2026-09-17 09:14:06 INFO  POST /api/orders 201 26ms",
      "2026-09-17 09:14:07 INFO  GET  /api/orders 200 44ms",
      "2026-09-17 09:14:07 WARN  GET  /api/orders 429 47ms",
      "2026-09-17 09:14:08 INFO  GET  /api/users  200 57ms",
      "2026-09-17 09:14:08 INFO  GET  /api/cart   200 33ms",
      "2026-09-17 09:14:09 INFO  GET  /api/orders 200 11ms",
      "2026-09-17 09:14:09 INFO  POST /api/orders 201 15ms",
      "2026-09-17 09:14:10 INFO  GET  /api/orders 200 17ms",
      "2026-09-17 09:14:10 INFO  POST /api/orders 201 12ms",
      "2026-09-17 09:14:11 INFO  GET  /api/cart   200 24ms",
      "2026-09-17 09:14:11 INFO  GET  /api/cart   200 15ms",
    ],
  },
];

const bodyOf = (file) => file.lines.join("\n") + "\n";
const BUFFERS = FILES.map((f) => Buffer.from(bodyOf(f), "utf8"));
const RAW_TOTAL = BUFFERS.reduce((sum, b) => sum + b.length, 0);

// ---------------------------------------------------------------------------
// 1. The real archive.
// ---------------------------------------------------------------------------

const work = mkdtempSync(join(tmpdir(), "coding-chops-zip-"));
const root = join(work, FOLDER);
mkdirSync(root);
FILES.forEach((file, i) => writeFileSync(join(root, file.name), BUFFERS[i]));

/** `zip -9 -X`, the same encoder and the same flags every time. */
const zipTo = (archive, members) => {
  execFileSync("zip", ["-9", "-X", "-q", "-r", archive, ...members], {
    cwd: work,
  });
  return statSync(join(work, archive)).size;
};

// The archive as it stands after each file, which is what the reel's bar walks
// between.
//
// Each step is a whole archive of a folder holding the first i files, built the
// same way the finished one is, so the last step is the finished one and the
// script asserts that. Zipping the members directly instead would leave out the
// folder entry and the steps would not be comparable with the archive they end
// on.
const AFTER = [];
for (let i = 0; i < FILES.length; i++) {
  const step = mkdtempSync(join(tmpdir(), "coding-chops-zip-step-"));
  mkdirSync(join(step, FOLDER));
  FILES.slice(0, i + 1).forEach((file, j) =>
    writeFileSync(join(step, FOLDER, file.name), BUFFERS[j]),
  );
  execFileSync("zip", ["-9", "-X", "-q", "-r", "step.zip", FOLDER], {
    cwd: step,
  });
  AFTER.push(statSync(join(step, "step.zip")).size);
  rmSync(step, { recursive: true, force: true });
}

const ARCHIVE = zipTo("logs.zip", [FOLDER]);

if (AFTER[AFTER.length - 1] !== ARCHIVE) {
  throw new Error(
    `the last step is ${AFTER[AFTER.length - 1]} bytes but the archive is ${ARCHIVE}`,
  );
}

// It has to actually be a zip, and it has to still be the files.
execFileSync("unzip", ["-tqq", join(work, "logs.zip")]);
const listing = execFileSync("unzip", ["-lv", join(work, "logs.zip")], {
  encoding: "utf8",
});

const PER_FILE = FILES.map((file) => {
  const row = listing
    .split("\n")
    .find((l) => l.trim().endsWith(`${FOLDER}/${file.name}`));
  const cells = row.trim().split(/\s+/);
  return { name: file.name, raw: Number(cells[0]), stored: Number(cells[2]) };
});

const STORED_TOTAL = PER_FILE.reduce((sum, f) => sum + f.stored, 0);

// ---------------------------------------------------------------------------
// 2. LZ77, per file, performed rather than described.
// ---------------------------------------------------------------------------

/** DEFLATE's limits, from RFC 1951 section 4. */
const MIN_MATCH = 3;
const MAX_MATCH = 258;

const parse = (bytes) => {
  const tokens = [];
  let at = 0;
  while (at < bytes.length) {
    let bestLength = 0;
    let bestStart = -1;
    for (let start = 0; start < at; start++) {
      let length = 0;
      while (
        length < MAX_MATCH &&
        at + length < bytes.length &&
        bytes[start + length] === bytes[at + length]
      ) {
        length++;
      }
      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
    }
    if (bestLength >= MIN_MATCH) {
      tokens.push({
        kind: "copy",
        at,
        length: bestLength,
        distance: at - bestStart,
        source: bestStart,
      });
      at += bestLength;
    } else {
      tokens.push({ kind: "literal", at, byte: bytes[at] });
      at += 1;
    }
  }
  return tokens;
};

const expand = (tokens) => {
  const out = [];
  for (const token of tokens) {
    if (token.kind === "literal") {
      out.push(token.byte);
    } else {
      const start = out.length - token.distance;
      for (let i = 0; i < token.length; i++) out.push(out[start + i]);
    }
  }
  return Buffer.from(out);
};

const PARSES = BUFFERS.map((buffer, i) => {
  const tokens = parse(buffer);
  if (!expand(tokens).equals(buffer)) {
    throw new Error(
      `${FILES[i].name}: the parse does not reconstruct the file`,
    );
  }
  const copies = tokens.filter((t) => t.kind === "copy");
  const literals = tokens.filter((t) => t.kind === "literal");
  const covered = copies.reduce((sum, t) => sum + t.length, 0);
  if (covered + literals.length !== buffer.length) {
    throw new Error(`${FILES[i].name}: tokens do not account for every byte`);
  }
  return { tokens, copies, literals, covered };
});

const COVERED_TOTAL = PARSES.reduce((sum, p) => sum + p.covered, 0);

// ---------------------------------------------------------------------------
// 3. The output as each file is written.
// ---------------------------------------------------------------------------

const SAMPLE_STRIDE = 15;

const GROWTH = BUFFERS.map((buffer) => {
  const samples = [];
  for (let at = 0; at <= buffer.length; at += SAMPLE_STRIDE) {
    samples.push([
      at,
      deflateRawSync(buffer.subarray(0, at), { level: 9 }).length,
    ]);
  }
  if (samples[samples.length - 1][0] !== buffer.length) {
    samples.push([buffer.length, deflateRawSync(buffer, { level: 9 }).length]);
  }
  return samples;
});

// ---------------------------------------------------------------------------
// 4. Report.
// ---------------------------------------------------------------------------

const pct = (part, whole) => ((part / whole) * 100).toFixed(1);

console.log("# The folder");
console.log(`name                  ${FOLDER}/`);
for (const file of PER_FILE) {
  console.log(`  ${file.name.padEnd(18)}${String(file.raw).padStart(5)} bytes`);
}
console.log(`raw total             ${RAW_TOTAL} bytes`);
console.log();

console.log("# The archive (Info-ZIP, -9 -X, exact)");
console.log(`logs.zip              ${ARCHIVE} bytes`);
for (const file of PER_FILE) {
  console.log(
    `  ${file.name.padEnd(18)}${String(file.stored).padStart(5)} bytes stored  (${pct(file.stored, file.raw)}% of ${file.raw})`,
  );
}
console.log(`compressed payload    ${STORED_TOTAL} bytes`);
console.log(
  `zip structure         ${ARCHIVE - STORED_TOTAL} bytes  (headers, central directory, folder entry)`,
);
console.log(`ratio                 ${(RAW_TOTAL / ARCHIVE).toFixed(2)}x`);
console.log();

console.log("# The archive after each file");
AFTER.forEach((size, i) => {
  console.log(
    `  through ${FILES[i].name.padEnd(12)}${String(size).padStart(5)} bytes`,
  );
});
console.log();

console.log("# LZ77 per file (this script, verified lossless)");
PARSES.forEach((p, i) => {
  console.log(`${FILES[i].name}`);
  console.log(`  tokens              ${p.tokens.length}`);
  console.log(`  copies              ${p.copies.length}`);
  console.log(`  literals            ${p.literals.length}`);
  console.log(
    `  bytes copied        ${p.covered}  (${pct(p.covered, BUFFERS[i].length)}% of the file)`,
  );
  console.log(
    `  longest copy        ${Math.max(...p.copies.map((t) => t.length))} bytes`,
  );
  console.log(
    `  longest back        ${Math.max(...p.copies.map((t) => t.distance))} bytes`,
  );
});
console.log(
  `copied across both    ${COVERED_TOTAL} of ${RAW_TOTAL}  (${pct(COVERED_TOTAL, RAW_TOTAL)}%)`,
);
console.log();

console.log("# What a zip cannot do");
// The two files are similar and the archive gets nothing for it, because each
// member is compressed against its own window. Concatenating them and running
// one DEFLATE over the pair shows what that costs.
const JOINED = Buffer.concat(BUFFERS);
const JOINED_DEFLATE = deflateRawSync(JOINED, { level: 9 }).length;
console.log(`both files, one stream ${JOINED_DEFLATE} bytes`);
console.log(`both files, zip members ${STORED_TOTAL} bytes`);
console.log(
  `gzip of the pair        ${gzipSync(JOINED, { level: 9 }).length} bytes`,
);
console.log();

console.log("# The output as each file is written");
GROWTH.forEach((samples, i) => {
  console.log(`${FILES[i].name}`);
  for (const [at, size] of samples) {
    console.log(
      `  after ${String(at).padStart(4)} bytes  ->  ${String(size).padStart(3)} bytes`,
    );
  }
});

rmSync(work, { recursive: true, force: true });
