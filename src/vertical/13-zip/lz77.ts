import {
  AFTER,
  COVERED_TOTAL,
  FILES,
  GROWTH,
  GROWTH_STRIDE,
  MAX_MATCH,
  MIN_MATCH,
  PARSE,
  PER_FILE,
  RAW_TOTAL,
  bodyOf,
} from "./measurements";

/**
 * The same LZ77 parse as `scripts/measure-zip.mjs`, recomputed here, once per
 * file.
 *
 * Per file, and that is the point rather than an implementation detail. A zip
 * compresses each member on its own with the window reset at every file
 * boundary, so nothing in `tue.log` may point at anything in `mon.log`. Running
 * one parse over the pair would draw arcs a real archive cannot make.
 *
 * Double entry, the rule from section 2 of the playbook. The script is the
 * source of the figures and this is an independent implementation of the same
 * mechanism, checked against it at module load. If a fixture is edited on one
 * side, or the matcher changed on either, the render fails immediately instead
 * of drawing spans that no longer describe the numbers printed beside them.
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

export type Run = {
  readonly line: number;
  readonly from: number;
  readonly to: number;
};

export type Segment = {
  readonly line: number;
  readonly from: number;
  readonly to: number;
  /** Index into this file's copies, or -1 for a literal stretch. */
  readonly copy: number;
};

/**
 * Greedy longest match against everything already emitted in this file.
 *
 * Deliberately the simple parse: at each position take the longest run that
 * appears earlier, otherwise emit one literal byte. Matches may overlap their
 * own source, which is legal and is how DEFLATE encodes a run of one repeated
 * byte. The window is not bounded because a member here is about a kilobyte and
 * DEFLATE's window is 32K, so every earlier byte in the file is always in it.
 */
const parse = (bytes: readonly number[]): Token[] => {
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

const agree = (label: string, here: number, script: number) => {
  if (here !== script) {
    throw new Error(
      `VR13 ${label}: the port says ${here}, the measurement says ${script}`,
    );
  }
};

export type Member = {
  readonly name: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly bytes: number;
  readonly tokens: readonly Token[];
  readonly copies: readonly Extract<Token, { kind: "copy" }>[];
  readonly segments: readonly Segment[];
  readonly lineStarts: readonly number[];
  /** Which copy owns each byte, or -1 for one the encoder had to spell out. */
  readonly owner: Int16Array;
  /** What the archive stores for this member. */
  readonly stored: number;
};

export const MEMBERS: readonly Member[] = FILES.map((file, index) => {
  const text = bodyOf(file);
  const bytes = Array.from(text, (c) => c.charCodeAt(0));
  const tokens = parse(bytes);

  const copies = tokens.filter(
    (t): t is Extract<Token, { kind: "copy" }> => t.kind === "copy",
  );
  const literals = tokens.filter((t) => t.kind === "literal");
  const covered = copies.reduce((sum, t) => sum + t.length, 0);

  const expected = PARSE[index];
  const where = file.name;
  agree(`${where} length`, text.length, PER_FILE[index].raw);
  agree(`${where} tokens`, tokens.length, expected.tokens);
  agree(`${where} copies`, copies.length, expected.copies);
  agree(`${where} literals`, literals.length, expected.literals);
  agree(`${where} covered bytes`, covered, expected.covered);
  agree(
    `${where} longest copy`,
    Math.max(...copies.map((c) => c.length)),
    expected.longestCopy,
  );
  agree(
    `${where} longest distance`,
    Math.max(...copies.map((c) => c.distance)),
    expected.longestDistance,
  );
  // Every byte is accounted for exactly once, which is what makes the picture a
  // partition of the file rather than a set of highlights over it.
  agree(`${where} bytes accounted for`, covered + literals.length, text.length);

  const lineStarts: number[] = [];
  let at = 0;
  for (const line of file.lines) {
    lineStarts.push(at);
    at += line.length + 1;
  }

  const owner = new Int16Array(text.length).fill(-1);
  copies.forEach((copy, c) => {
    for (let i = copy.at; i < copy.at + copy.length; i++) owner[i] = c;
  });

  const segments: Segment[] = [];
  for (let line = 0; line < file.lines.length; line++) {
    const start = lineStarts[line];
    const length = file.lines[line].length;
    let from = 0;
    for (let column = 1; column <= length; column++) {
      const here = column < length ? owner[start + column] : -2;
      if (here !== owner[start + from]) {
        segments.push({ line, from, to: column, copy: owner[start + from] });
        from = column;
      }
    }
  }

  return {
    name: file.name,
    lines: file.lines,
    text,
    bytes: text.length,
    tokens,
    copies,
    segments,
    lineStarts,
    owner,
    stored: PER_FILE[index].stored,
  };
});

agree(
  "raw total",
  MEMBERS.reduce((sum, m) => sum + m.bytes, 0),
  RAW_TOTAL,
);
agree(
  "copied across both",
  PARSE.reduce((sum, p) => sum + p.covered, 0),
  COVERED_TOTAL,
);

export const WIDEST_LINE = Math.max(
  ...MEMBERS.flatMap((m) => m.lines.map((l) => l.length)),
);

export const MOST_LINES = Math.max(...MEMBERS.map((m) => m.lines.length));

/**
 * A byte span broken into the per-line runs that draw it.
 *
 * A copy routinely crosses a line ending -- the longest here is 50 bytes, which
 * is most of a line -- so a span is a set of rectangles rather than one. The
 * newline itself is not drawn; it has no column.
 */
export const runsOf = (member: Member, at: number, length: number): Run[] => {
  const runs: Run[] = [];
  const end = at + length;

  for (let line = 0; line < member.lines.length; line++) {
    const start = member.lineStarts[line];
    const stop = start + member.lines[line].length;
    const from = Math.max(at, start);
    const to = Math.min(end, stop);
    if (to > from) runs.push({ line, from: from - start, to: to - start });
  }

  return runs;
};

/** Where the reading head is, as a line and a column, for a byte index. */
export const seatOf = (member: Member, index: number) => {
  let line = 0;
  for (let i = 0; i < member.lineStarts.length; i++) {
    if (index >= member.lineStarts[i]) line = i;
  }
  return {
    line,
    column: Math.min(
      index - member.lineStarts[line],
      member.lines[line].length,
    ),
  };
};

// ---------------------------------------------------------------------------
// The growth tables.
// ---------------------------------------------------------------------------
//
// These cannot be double entered, because recomputing them would mean
// implementing DEFLATE rather than LZ77. What can be checked is that each is
// the table it claims to be: sampled at the stride it says, ending on the file
// and on the size the archive actually stores for that member.
//
// That last check is worth more than it looks. It says zlib at level 9 and
// Info-ZIP at -9 produce the same number of bytes for these files, which is
// what licenses drawing a bar out of zlib and labelling it with a figure that
// came out of `zip`.
//
// They are deliberately not asserted to rise every step. They do not, and
// finding that out was worth a failed assertion: the output is a byte or two
// smaller at some samples than it was fifteen bytes earlier. That is real
// DEFLATE rather than bad data. Huffman codes are chosen per block from the
// symbol frequencies of the whole block, so fifteen more bytes can shift the
// distribution enough to encode everything before them a byte cheaper.

/** The most the output may fall between two samples before it is a data fault. */
const GROWTH_SLACK = 4;

GROWTH.forEach((samples, index) => {
  const member = MEMBERS[index];
  agree(
    `${member.name} growth ends at the file`,
    samples[samples.length - 1][0],
    member.bytes,
  );
  agree(
    `${member.name} growth ends at what the archive stores`,
    samples[samples.length - 1][1],
    member.stored,
  );
  for (let i = 1; i < samples.length; i++) {
    // Every step is the stride except the last, which is however far the end
    // of the file was from the previous sample.
    const step = samples[i][0] - samples[i - 1][0];
    const last = i === samples.length - 1;
    if (
      step !== GROWTH_STRIDE &&
      !(last && step > 0 && step <= GROWTH_STRIDE)
    ) {
      throw new Error(
        `VR13 ${member.name} growth: sample ${i} is ${step} bytes after the one before it`,
      );
    }
    if (samples[i][1] < samples[i - 1][1] - GROWTH_SLACK) {
      throw new Error(
        `VR13 ${member.name} growth: the output falls from ${samples[i - 1][1]} to ${samples[i][1]} bytes, more than the encoder's own slack`,
      );
    }
  }
});

/** The measured size of member `index` after `byte` of its bytes. */
export const storedAt = (index: number, byte: number) => {
  const samples = GROWTH[index];
  const at = Math.min(Math.max(byte, 0), MEMBERS[index].bytes);
  const i = Math.min(samples.length - 2, Math.floor(at / GROWTH_STRIDE));
  const [x0, y0] = samples[i];
  const [x1, y1] = samples[i + 1];
  return y0 + ((at - x0) / (x1 - x0)) * (y1 - y0);
};

/**
 * The whole archive, part way through.
 *
 * Anchored on the real archive sizes at every file boundary: member `index`
 * starts from what the archive weighs with that member still empty and ends on
 * `AFTER[index]`, which came off `zip`. In between it walks its own measured
 * curve.
 *
 * The bar therefore steps up when a new member begins, before any of its
 * content has been read. That is not a glitch and it is not smoothed out: it is
 * the local header and directory entry the archive pays for the file itself,
 * about a hundred bytes of it, and it is the reason a folder of small files
 * zips worse than one big one.
 */
export const archiveAt = (index: number, byte: number) =>
  AFTER[index] - MEMBERS[index].stored + storedAt(index, byte);
