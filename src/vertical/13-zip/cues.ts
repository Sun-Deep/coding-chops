import { CYCLES, DRAIN_SPAN, FIRINGS, SEALED, frameOfByte } from "./beats";
import { PARSE } from "./measurements";
import { MEMBERS } from "./lz77";

/**
 * The encoding, made audible.
 *
 * Two voices, and which one you are hearing is the claim. A `tick` fires as the
 * head spells out a character it has never seen, and a `probe` note fires when
 * it finds a stretch it has seen before. The first lines of a file have nothing
 * earlier to match, so they are all ticking; after that the ticking nearly
 * stops and the track becomes notes.
 *
 * And it happens twice. When the second file comes up the ticking starts again
 * from nothing, because a zip compresses each member against its own window. A
 * listener with their eyes shut can hear the archive start a new file.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

/** Major pentatonic across two octaves, the scale VR10 and VR11 settled on. */
const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const BASE_RATE = 0.62;

const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return BASE_RATE * 2 ** (DEGREES[i] / 12);
};

/** Literal bytes between ticks, so a fresh file is a texture not a machine gun. */
const LITERAL_STRIDE = 4;

const NEAREST = Math.min(...FIRINGS.map((f) => f.distance));
const FURTHEST = Math.max(...PARSE.map((p) => p.longestDistance));

/**
 * Frames between the repeats that hold a match open.
 *
 * A match fired only on its first byte left the track silent for the whole time
 * the head spent travelling through it, and the longest stretch here is 50
 * bytes. So a match sounds for as long as it is being copied: the strike is
 * loud and the repeats under it are a texture at the same pitch, which makes a
 * long stretch a run on one note and a short one a single hit.
 */
const SUSTAIN_EVERY = 5;

/**
 * The notes the matches make.
 *
 * Near matches high, far matches low, on a log scale because distance runs from
 * a few bytes to most of a file and a linear map would put almost every match
 * at the bottom of the scale. The pitch is the length of the arc the picture
 * has just drawn.
 */
export const MATCHES: readonly Pulse[] = FIRINGS.flatMap((fired, index) => {
  const reach =
    Math.log(fired.distance / NEAREST) / Math.log(FURTHEST / NEAREST);
  const rate = note(1 - reach);
  const from = Math.round(fired.frame);
  const to = Math.round(frameOfByte(fired.member, fired.at + fired.length));
  const longest = PARSE[fired.member].longestCopy;

  const pulses: Pulse[] = [
    {
      id: `match-${index}`,
      frame: from,
      rate,
      // A longer stretch is a bigger saving, so it is louder.
      gain: 5.2 + Math.min(1, fired.length / longest) * 3.2,
    },
  ];

  for (let frame = from + SUSTAIN_EVERY; frame < to; frame += SUSTAIN_EVERY) {
    pulses.push({ id: `match-${index}-${frame}`, frame, rate, gain: 2.3 });
  }

  return pulses;
});

/** The head spelling out a character it has not seen before, in this file. */
export const LITERALS: readonly Pulse[] = MEMBERS.flatMap((member, index) =>
  member.tokens
    .filter((t) => t.kind === "literal")
    .filter((_, i) => i % LITERAL_STRIDE === 0)
    .map((token, i) => ({
      id: `literal-${index}-${i}`,
      frame: Math.round(frameOfByte(index, token.at)),
      rate: 1.32,
      gain: 2.5,
    })),
);

/**
 * The collapse.
 *
 * Every stretch in the member contracting inside under a second, ordered down
 * the file, which is a crunch rather than a sequence of events.
 */
export const CRUSH: readonly Pulse[] = MEMBERS.flatMap((member, index) => {
  const cycle = CYCLES[index];
  const span = cycle.collapseTo - cycle.collapseFrom - 4;
  return member.copies.map((_, c) => {
    const through = c / Math.max(1, member.copies.length - 1);
    return {
      id: `crush-${index}-${c}`,
      frame: Math.round(cycle.collapseFrom + through * span),
      // Falling, so the file sounds like it is settling rather than scattering.
      rate: 1.24 - through * 0.48,
      gain: 3.4 + through * 1.6,
    };
  });
});

/**
 * The drain.
 *
 * What survived the collapse leaves the sheet and lands in the archive, a line
 * at a time down the page, so there are two cues per line: one as it goes and
 * one as it arrives. Rising in pitch where the crush fell, because one is the
 * file being compacted and the other is the result being filed.
 */
export const DRAIN: readonly Pulse[] = MEMBERS.flatMap((member, index) => {
  const cycle = CYCLES[index];
  const lines = member.lines.length;
  const spread = cycle.drainTo - cycle.drainFrom - DRAIN_SPAN;
  return member.lines.flatMap((_, line) => {
    const through = line / Math.max(1, lines - 1);
    const at = cycle.drainFrom + through * Math.max(0, spread);
    return [
      {
        id: `drain-go-${index}-${line}`,
        frame: Math.round(at),
        rate: 0.9 + through * 0.5,
        gain: 2.2,
      },
      {
        id: `drain-land-${index}-${line}`,
        frame: Math.round(at + DRAIN_SPAN),
        rate: 1.15 + through * 0.6,
        gain: 2.8,
      },
    ];
  });
});

/** A member being added to the archive, and the archive being closed. */
export const FILED: readonly number[] = CYCLES.map((c) => c.drainTo);
export const SEAL = SEALED + 2;
