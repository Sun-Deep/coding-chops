import { MEMBERS } from "./lz77";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * One cycle per file, because that is what a zip does.
 *
 * Each member is read, collapsed onto what the encoder kept, and drained into
 * the archive, and then the next one comes up. The repeat is not padding: a zip
 * compresses every member against its own window, so the second file starting
 * from nothing is the mechanism rather than a transition, and seeing it happen
 * twice is what makes it a rule instead of an anecdote.
 */
export type Cycle = {
  readonly readFrom: number;
  readonly readTo: number;
  readonly collapseFrom: number;
  readonly collapseTo: number;
  readonly drainFrom: number;
  readonly drainTo: number;
};

export const CYCLES: readonly Cycle[] = [
  {
    readFrom: 2,
    readTo: 128,
    collapseFrom: 130,
    collapseTo: 154,
    drainFrom: 154,
    drainTo: 178,
  },
  {
    readFrom: 188,
    readTo: 316,
    collapseFrom: 318,
    collapseTo: 342,
    drainFrom: 342,
    drainTo: 372,
  },
];

/** The frame each member's card takes over the sheet. */
export const SHOWN_FROM = CYCLES.map((cycle, i) =>
  i === 0 ? -10 : CYCLES[i - 1].drainTo + 2,
);

/** Which member the sheet is showing. */
export const memberAt = (frame: number) => {
  let index = 0;
  for (let i = 0; i < SHOWN_FROM.length; i++) {
    if (frame >= SHOWN_FROM[i]) index = i;
  }
  return index;
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Accelerating, gently.
 *
 * The opening seconds are where a stranger decides, and they need long enough
 * on the first two lines to see that line two is line one again. After that the
 * file is understood and the sweep can run.
 */
const curve = (u: number) => 0.45 * u + 0.55 * u * u;

/** Which byte of the shown member the reading head has reached. */
export const headAt = (frame: number) => {
  const index = memberAt(frame);
  const cycle = CYCLES[index];
  const u = clamp((frame - cycle.readFrom) / (cycle.readTo - cycle.readFrom));
  return curve(u) * MEMBERS[index].bytes;
};

/** The frame the head reaches a byte of a given member. */
export const frameOfByte = (index: number, byte: number) => {
  const cycle = CYCLES[index];
  const target = clamp(byte / MEMBERS[index].bytes);
  // curve is 0.55u^2 + 0.45u - target, solved for the root in [0, 1].
  const u = (-0.45 + Math.sqrt(0.45 ** 2 + 4 * 0.55 * target)) / (2 * 0.55);
  return cycle.readFrom + u * (cycle.readTo - cycle.readFrom);
};

/** Frames a copy takes to light up and throw its arc back. */
export const FIRE = 7;

/** Every copy in every member, with the frame it fires on. */
export const FIRINGS = MEMBERS.flatMap((member, index) =>
  member.copies.map((copy) => ({
    ...copy,
    member: index,
    frame: frameOfByte(index, copy.at),
  })),
);

export const collapsedAt = (frame: number, index: number) => {
  const cycle = CYCLES[index];
  return clamp(
    (frame - cycle.collapseFrom) / (cycle.collapseTo - cycle.collapseFrom),
  );
};

export const DRAIN_SPAN = 16;

/** Stagger down the sheet, so it empties from the top rather than all at once. */
export const drainAt = (frame: number, index: number, line: number) => {
  const cycle = CYCLES[index];
  const lines = MEMBERS[index].lines.length;
  const spread = cycle.drainTo - cycle.drainFrom - DRAIN_SPAN;
  const stagger = (line / Math.max(1, lines - 1)) * Math.max(0, spread);
  return clamp((frame - cycle.drainFrom - stagger) / DRAIN_SPAN);
};

/** Bytes of the shown member that were a copy of something earlier in it. */
export const coveredBy = (index: number, byte: number) => {
  let covered = 0;
  for (const copy of MEMBERS[index].copies) {
    const to = Math.min(byte, copy.at + copy.length);
    if (to > copy.at) covered += to - copy.at;
  }
  return covered;
};

/** Bytes copied across the members already finished, plus the one in hand. */
export const coveredSoFar = (frame: number) => {
  const index = memberAt(frame);
  let total = 0;
  for (let i = 0; i < index; i++) total += coveredBy(i, MEMBERS[i].bytes);
  return total + coveredBy(index, headAt(frame));
};

/** The archive is finished when the last member has drained. */
export const SEALED = CYCLES[CYCLES.length - 1].drainTo;

/** The ratio lands after the archive is closed, never before. */
export const RATIO_FROM = SEALED + 8;

/** Bytes of the folder the head has read, across the members already done. */
export const readSoFar = (frame: number) => {
  const index = memberAt(frame);
  let total = 0;
  for (let i = 0; i < index; i++) total += MEMBERS[i].bytes;
  return total + headAt(frame);
};
