#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Measures what a view counter prints one view past 2,147,483,647, in a
// 32-bit int and in a 64-bit long, by compiling the reel's own lines with
// javac and running them. Also measures what 6 billion views (Gangnam
// Style, July 2026) reads as when it is forced into an int, the bit
// patterns the wheels show, and the 64-bit ceiling.
//
// Cross-checks the int result in C, built with -fwrapv because signed
// overflow without it is undefined behaviour.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/measure-gangnam-counter.mjs

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  INT32,
  INT64,
  SIX,
} from "../src/vertical/51-gangnam-counter/snippets.ts";

const dir = mkdtempSync(join(tmpdir(), "vr51-"));
const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: dir, encoding: "utf8" }).trim();

const java = (name, body) => {
  writeFileSync(
    join(dir, `${name}.java`),
    `public class ${name} {\n  public static void main(String[] a) {\n    ${body.join("\n    ")}\n  }\n}\n`,
  );
  run("javac", [`${name}.java`]);
  return run("java", ["-cp", dir, name]);
};

const int32 = java("Int32", [...INT32]);
const int64 = java("Int64", [...INT64]);
const sixBillion = java("SixBillion", [...SIX]);
const bits = java("Bits", [
  "System.out.println(Integer.toBinaryString(2147483647));",
  "System.out.println(Integer.toBinaryString(2147483647 + 1));",
  "System.out.println(Long.MAX_VALUE);",
  'System.out.println(Integer.MAX_VALUE + " " + Integer.MIN_VALUE);',
]).split("\n");

writeFileSync(
  join(dir, "wrap.c"),
  '#include <stdint.h>\n#include <stdio.h>\nint main(void) { int32_t v = 2147483647; v = v + 1; printf("%d\\n", v); return 0; }\n',
);
run("cc", ["-fwrapv", "-O2", "-o", "wrap", "wrap.c"]);
const c = run(join(dir, "wrap"), []);

const javaVersion = spawnSync("java", ["-version"], {
  encoding: "utf8",
}).stderr;
const result = {
  int32: Number(int32),
  int64: Number(int64),
  sixBillionAsInt: Number(sixBillion),
  maxBits: bits[0].padStart(32, "0"),
  wrappedBits: bits[1],
  longMax: bits[2],
  intRange: bits[3],
  c,
};
console.log(result);

assert.equal(result.int32, -2147483648);
assert.equal(result.int64, 2147483648);
assert.equal(result.sixBillionAsInt, 6000000000 - 2 ** 32);
assert.equal(result.maxBits, "0" + "1".repeat(31));
assert.equal(result.wrappedBits, "1" + "0".repeat(31));
assert.equal(result.longMax, "9223372036854775807");
assert.equal(result.intRange, "2147483647 -2147483648");
assert.equal(c, "-2147483648");
console.log(`\n${javaVersion.split("\n")[0]}`);
console.log(run("cc", ["--version"]).split("\n")[0]);
console.log("all checks pass");
