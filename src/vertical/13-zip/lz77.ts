import {
  BYTES,
  DEFLATE,
  GROWTH,
  GROWTH_STRIDE,
  LINES,
  MAX_MATCH,
  MIN_MATCH,
  PARSE,
  TEXT,
} from "./measurements";

/**
 * The same LZ77 parse as `scripts/measure-zip.mjs`, recomputed here.
 *
 * Double entry, the rule from section 2 of the playbook. The script is the
 * source of the figures and this is an independent implementation of the same
 * mechanism, and the two are checked against each other at module load. If the
 * fixture is edited on one side, or the matcher changed on either, the render
 * fails immediately instead of drawing spans that no longer describe the
 * numbers printed beside them.
 */

export type Token =
  | { readonly kind: "literal"; readonly at: number; readonly byte: number }
  | {
      readonly kind: "copy";
      readonly at: number;
      readonly length: number;
      readonly distance: number;
      readonly source: number;
    };

const bytes = Array.from(TEXT, (c) => c.charCodeAt(0));

/**
 * Greedy longest match against everything already emitted.
 *
 * Deliberately the simple parse: at each position take the longest run that
 * appears earlier, otherwise emit one literal byte. Matches may overlap their
 * own source, which is legal and is how DEFLATE encodes a run of one repeated
 * byte. The window is not bounded here because the whole file is 1,035 bytes
 * and DEFLATE's is 32K, so every earlier byte is always in it.
 */
const parse = (): Token[] => {
  const tokens: Token[] = [];
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

export const TOKENS: readonly Token[] = parse();

export const COPIES = TOKENS.filter(
  (t): t is Extract<Token, { kind: "copy" }> => t.kind === "copy",
);

const LITERALS = TOKENS.filter((t) => t.kind === "literal");
const COVERED = COPIES.reduce((sum, t) => sum + t.length, 0);

// ---------------------------------------------------------------------------
// The check.
// ---------------------------------------------------------------------------

const agree = (label: string, here: number, script: number) => {
  if (here !== script) {
    throw new Error(
      `VR13 ${label}: the port says ${here}, the measurement says ${script}`,
    );
  }
};

agree("file length", TEXT.length, BYTES);
agree("tokens", TOKENS.length, PARSE.tokens);
agree("copies", COPIES.length, PARSE.copies);
agree("literals", LITERALS.length, PARSE.literals);
agree("covered bytes", COVERED, PARSE.covered);
agree(
  "longest copy",
  Math.max(...COPIES.map((c) => c.length)),
  PARSE.longestCopy,
);
agree(
  "longest distance",
  Math.max(...COPIES.map((c) => c.distance)),
  PARSE.longestDistance,
);

// Every byte is accounted for exactly once, which is what makes the picture a
// partition of the file rather than a set of highlights over it.
agree("bytes accounted for", COVERED + LITERALS.length, BYTES);

// ---------------------------------------------------------------------------
// Where a byte is on screen.
// ---------------------------------------------------------------------------

/** Byte index of the first character of each line. */
export const LINE_STARTS: readonly number[] = (() => {
  const starts: number[] = [];
  let at = 0;
  for (const line of LINES) {
    starts.push(at);
    at += line.length + 1;
  }
  return starts;
})();

export const WIDEST_LINE = Math.max(...LINES.map((l) => l.length));

export type Run = {
  readonly line: number;
  readonly from: number;
  readonly to: number;
};

/**
 * A byte span broken into the per-line runs that draw it.
 *
 * A copy routinely crosses a line ending -- the longest one here is 51 bytes,
 * which is a whole line plus its newline -- so a span is a set of rectangles
 * rather than one. The newline itself is not drawn; it has no column.
 */
export const runsOf = (at: number, length: number): Run[] => {
  const runs: Run[] = [];
  const end = at + length;

  for (let line = 0; line < LINES.length; line++) {
    const start = LINE_STARTS[line];
    const stop = start + LINES[line].length;
    const from = Math.max(at, start);
    const to = Math.min(end, stop);
    if (to > from) runs.push({ line, from: from - start, to: to - start });
  }

  return runs;
};

/** Where the reading head is, as a line and a column, for a byte index. */
export const seatOf = (index: number) => {
  let line = 0;
  for (let i = 0; i < LINE_STARTS.length; i++) {
    if (index >= LINE_STARTS[i]) line = i;
  }
  return {
    line,
    column: Math.min(index - LINE_STARTS[line], LINES[line].length),
  };
};

/**
 * Which copy owns each byte, or -1 for a byte the encoder had to spell out.
 *
 * The parse is a partition, so this is total: every byte has exactly one
 * answer. It is what lets the sheet fade a copied character without touching
 * the one beside it.
 */
export const OWNER: Int16Array = (() => {
  const owner = new Int16Array(TEXT.length).fill(-1);
  COPIES.forEach((copy, index) => {
    for (let i = copy.at; i < copy.at + copy.length; i++) owner[i] = index;
  });
  return owner;
})();

export type Segment = {
  readonly line: number;
  readonly from: number;
  readonly to: number;
  /** Index into `COPIES`, or -1 for a literal stretch. */
  readonly copy: number;
};

/**
 * Each line cut into stretches that share an owner.
 *
 * Drawn as its own `<text>` so a copied stretch can fade out while the literals
 * either side of it stay. One `<text>` per line could not do that, and one per
 * character would be a thousand nodes a frame.
 */
export const SEGMENTS: readonly Segment[] = (() => {
  const segments: Segment[] = [];

  for (let line = 0; line < LINES.length; line++) {
    const start = LINE_STARTS[line];
    const length = LINES[line].length;
    let from = 0;

    for (let column = 1; column <= length; column++) {
      const here = column < length ? OWNER[start + column] : -2;
      if (here !== OWNER[start + from]) {
        segments.push({ line, from, to: column, copy: OWNER[start + from] });
        from = column;
      }
    }
  }

  return segments;
})();

// ---------------------------------------------------------------------------
// The growth table.
// ---------------------------------------------------------------------------
//
// This one cannot be double entered, because recomputing it would mean
// implementing DEFLATE rather than LZ77. What can be checked is that it is the
// table it claims to be: sampled at the stride it says, and ending on the file
// and on the output size the rest of the module already asserts.
//
// It is deliberately not asserted to rise every step. It does not, and finding
// that out was worth the failed assertion: the output is one or two bytes
// smaller at six of these samples than it was fifteen bytes earlier. That is
// real DEFLATE rather than bad data. Huffman codes are chosen per block from
// the symbol frequencies of the whole block, so fifteen more bytes can shift
// the distribution enough to encode everything before them a byte cheaper. It
// is the same reason the finished 177 bytes are not the last sample plus a
// remainder.
//
// So the check is that no step falls by more than a few bytes, which still
// catches a mangled or misordered table while allowing the encoder to do what
// it actually does.

/** The most the output may fall between two samples before it is a data fault. */
const GROWTH_SLACK = 4;

agree("growth samples end at the file", GROWTH[GROWTH.length - 1][0], BYTES);
agree(
  "growth ends at the output size",
  GROWTH[GROWTH.length - 1][1],
  DEFLATE.out,
);

for (let i = 1; i < GROWTH.length; i++) {
  if (GROWTH[i][0] !== GROWTH[i - 1][0] + GROWTH_STRIDE) {
    throw new Error(
      `VR13 growth: sample ${i} is not ${GROWTH_STRIDE} bytes after the one before it`,
    );
  }
  if (GROWTH[i][1] < GROWTH[i - 1][1] - GROWTH_SLACK) {
    throw new Error(
      `VR13 growth: the output falls from ${GROWTH[i - 1][1]} to ${GROWTH[i][1]} bytes, which is more than the encoder's own slack`,
    );
  }
}

/** The measured output size after `byte` bytes, straight-line between samples. */
export const outputAt = (byte: number) => {
  const at = Math.min(Math.max(byte, 0), BYTES);
  const i = Math.min(GROWTH.length - 2, Math.floor(at / GROWTH_STRIDE));
  const [x0, y0] = GROWTH[i];
  const [x1, y1] = GROWTH[i + 1];
  return y0 + ((at - x0) / (x1 - x0)) * (y1 - y0);
};
