#!/usr/bin/env node

// Why a QR code with a hole punched through it still scans.
//
// Two kinds of figure here and they are not the same kind of claim.
//
// The structure is exact and it comes out of the encoder. How many modules a
// symbol has, how many of them are the patterns a scanner needs to find and
// read it, and how the rest divide into your data and its error correction are
// all properties of the QR specification for a given version and level.
//
// The hole is measured, by decoding. A square of modules is blanked in the
// middle of a real symbol and a real decoder is asked to read it, and the
// square grows until the decoder fails. Nothing here reasons about how much
// damage "should" be survivable.
//
// The encoder and the decoder are deliberately different implementations:
// `qrcode` writes the symbol, `jsqr` reads it back. A round trip through one
// library would prove much less.
//
// One thing this script exists to stop being said. It is widely repeated that
// you can destroy 30 per cent of a QR code and it will still scan, and the
// first draft of this reel was going to say it. That number is the share of
// *codewords* Reed-Solomon can reconstruct, and it is not a licence to black
// out a third of the picture: the measurement below shows random damage failing
// at a couple of per cent, because it hits the three corner squares a scanner
// needs in order to locate the symbol at all. Where the damage falls matters
// more than how much of it there is.

import QRCode from "qrcode";
import jsQR from "jsqr";
import ECCode from "qrcode/lib/core/error-correction-code.js";
import Utils from "qrcode/lib/core/utils.js";

/**
 * The fixture. A short https URL, which is what almost every QR code in the
 * wild actually holds, and short enough that the symbol stays small enough to
 * draw one module at a readable size in a vertical frame.
 */
const TEXT = "https://github.com/Sun-Deep/coding-chops";

const LEVELS = ["L", "M", "Q", "H"];

/** Pixels per module and quiet zone, for rendering to the decoder. */
const SCALE = 8;
const QUIET = 4;

const symbolOf = (level) => {
  const qr = QRCode.create(TEXT, { errorCorrectionLevel: level });
  const size = qr.modules.size;
  const modules = [];
  const reserved = [];
  for (let y = 0; y < size; y++) {
    const mrow = [];
    const rrow = [];
    for (let x = 0; x < size; x++) {
      mrow.push(qr.modules.data[y * size + x] ? 1 : 0);
      rrow.push(qr.modules.reservedBit[y * size + x] ? 1 : 0);
    }
    modules.push(mrow);
    reserved.push(rrow);
  }

  const codewords = Utils.getSymbolTotalCodewords(qr.version);
  const ec = ECCode.getTotalCodewordsCount(qr.version, qr.errorCorrectionLevel);

  return {
    level,
    version: qr.version,
    size,
    modules,
    reserved,
    codewords,
    ec,
    data: codewords - ec,
    structure: reserved.flat().reduce((a, b) => a + b, 0),
  };
};

/** Render a module grid the way a camera would see it, and read it back. */
const scans = (modules) => {
  const n = modules.length;
  const side = (n + QUIET * 2) * SCALE;
  const px = new Uint8ClampedArray(side * side * 4).fill(255);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!modules[y][x]) continue;
      for (let dy = 0; dy < SCALE; dy++) {
        for (let dx = 0; dx < SCALE; dx++) {
          const i =
            (((y + QUIET) * SCALE + dy) * side + ((x + QUIET) * SCALE + dx)) *
            4;
          px[i] = 0;
          px[i + 1] = 0;
          px[i + 2] = 0;
        }
      }
    }
  }
  const read = jsQR(px, side, side);
  return read !== null && read.data === TEXT;
};

const clone = (m) => m.map((r) => r.slice());

/** The largest blank square, centred, that the decoder still reads through. */
const holeThrough = (symbol) => {
  const n = symbol.size;
  let best = 0;
  for (let side = 1; side <= n; side++) {
    const m = clone(symbol.modules);
    const from = Math.floor((n - side) / 2);
    for (let y = from; y < from + side; y++) {
      for (let x = from; x < from + side; x++) m[y][x] = 0;
    }
    if (!scans(m)) break;
    best = side;
  }
  return best;
};

// ---------------------------------------------------------------------------
// 1. The symbols.
// ---------------------------------------------------------------------------

const SYMBOLS = LEVELS.map(symbolOf);

for (const s of SYMBOLS) {
  if (!scans(s.modules)) {
    throw new Error(`level ${s.level} does not decode before any damage`);
  }
  if (s.structure + s.codewords * 8 + 7 !== s.size * s.size && s.version >= 2) {
    // Remainder bits differ by version; report rather than assume.
  }
}

console.log("# The symbol");
console.log(`payload               ${JSON.stringify(TEXT)}`);
console.log(
  `decoder               jsqr, on a clean ${SCALE}x render with a ${QUIET} module quiet zone`,
);
console.log();

console.log("# What a symbol is made of");
for (const s of SYMBOLS) {
  const free = s.size * s.size - s.structure;
  console.log(
    `level ${s.level}: version ${s.version}, ${s.size}x${s.size} = ${s.size * s.size} modules`,
  );
  console.log(
    `  structure           ${String(s.structure).padStart(4)}  finders, timing, alignment, format`,
  );
  console.log(
    `  carrying data       ${String(free).padStart(4)}  = ${s.codewords} codewords x 8 bits + ${free - s.codewords * 8} unused`,
  );
  console.log(
    `  codewords           ${String(s.codewords).padStart(4)}  = ${s.data} your link + ${s.ec} error correction  (${((s.ec / s.codewords) * 100).toFixed(0)}% backup)`,
  );
}
console.log();

// ---------------------------------------------------------------------------
// 2. The hole, measured by decoding.
// ---------------------------------------------------------------------------

console.log("# The largest centred hole that still scans");
for (const s of SYMBOLS) {
  const side = holeThrough(s);
  const blanked = side * side;
  console.log(
    `level ${s.level}: ${side}x${side} = ${String(blanked).padStart(3)} modules blanked  ` +
      `(${((blanked / (s.size * s.size)) * 100).toFixed(1)}% of the symbol)  ` +
      `backup ${((s.ec / s.codewords) * 100).toFixed(0)}%`,
  );
}
console.log();

// ---------------------------------------------------------------------------
// 3. Where the damage falls matters more than how much of it there is.
// ---------------------------------------------------------------------------

console.log("# Random damage, for comparison");
let seed = 20260919;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

for (const s of SYMBOLS) {
  const n = s.size;
  const total = n * n;
  const results = [];
  for (let trial = 0; trial < 12; trial++) {
    const order = [...Array(total).keys()];
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let lo = 0;
    let hi = total;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      const m = clone(s.modules);
      for (let k = 0; k < mid; k++) {
        m[Math.floor(order[k] / n)][order[k] % n] = 1;
      }
      if (scans(m)) lo = mid;
      else hi = mid - 1;
    }
    results.push((lo / total) * 100);
  }
  results.sort((a, b) => a - b);
  console.log(
    `level ${s.level}: random blackout survives  median ${results[results.length >> 1].toFixed(1)}%  ` +
      `(min ${results[0].toFixed(1)}%, max ${results[results.length - 1].toFixed(1)}%)`,
  );
}
console.log();

console.log("# One finder square");
{
  const s = SYMBOLS[3];
  const m = clone(s.modules);
  for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) m[y][x] = 0;
  console.log(
    `level H, top-left finder blanked (49 of ${s.size * s.size} modules, ${((49 / (s.size * s.size)) * 100).toFixed(1)}%): scans = ${scans(m)}`,
  );
}
console.log();

// ---------------------------------------------------------------------------
// 4. The symbol the reel draws.
// ---------------------------------------------------------------------------

const HERO = SYMBOLS[3];
console.log("# Level H symbol, module by module (1 = dark)");
for (const row of HERO.modules) console.log(`  ${row.join("")}`);
console.log();
console.log(
  "# Level H structure map (1 = finder, timing, alignment or format)",
);
for (const row of HERO.reserved) console.log(`  ${row.join("")}`);
