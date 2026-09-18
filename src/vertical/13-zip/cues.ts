import { COLLAPSE_FROM, COLLAPSE_TO, FIRINGS, frameOfByte } from "./beats";
import { PARSE } from "./measurements";
import { TOKENS } from "./lz77";

/**
 * The encoding, made audible.
 *
 * Two voices, and which one you are hearing is the claim. A `tick` fires as the
 * head spells out a character it has never seen, and a `probe` note fires when
 * it finds a stretch it has seen before. The first line of the file has no
 * earlier text to match, so it is all ticking; after that the ticking nearly
 * stops and the track becomes notes. A listener knows the file has gone
 * redundant before the tally under it says so.
 *
 * The notes are pitched by how far back the match was found. A stretch repeated
 * from the line above is high and one reaching back most of the file is low, so
 * the pitch is the distance the arc has just drawn on screen.
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

/** Literal bytes between ticks, so the opening is a texture and not a machine gun. */
const LITERAL_STRIDE = 3;

const NEAREST = Math.min(...FIRINGS.map((f) => f.distance));
const FURTHEST = PARSE.longestDistance;

/**
 * Frames between the repeats that hold a match open.
 *
 * A match fired only on its first byte left the track silent for the whole time
 * the head spent travelling through it, and the longest stretch here is 51
 * bytes. The first render had a 0.70 second gap at 1.1 seconds for exactly that
 * reason: the head was inside the first long copy, which is the most important
 * moment in the cut and was also the quietest.
 *
 * So a match sounds for as long as it is being copied. The strike is loud and
 * the repeats under it are a texture at the same pitch, which makes a long
 * stretch a run on one note and a short one a single hit. Counted in frames
 * rather than in bytes, because the sweep accelerates and a byte stride would
 * thin out at the top of the file and machine-gun at the bottom.
 */
const SUSTAIN_EVERY = 6;

/**
 * The notes the matches make.
 *
 * Near matches high, far matches low, on a log scale because distance runs from
 * 51 bytes to 879 and a linear map would put almost every match at the bottom
 * of the scale. So the pitch is the length of the arc the picture has just
 * drawn: a stretch repeated from the line above rings high, and one reaching
 * back most of the file sits at the bottom.
 */
export const MATCHES: readonly Pulse[] = FIRINGS.flatMap((fired, index) => {
  const reach =
    Math.log(fired.distance / NEAREST) / Math.log(FURTHEST / NEAREST);
  const rate = note(1 - reach);
  const from = Math.round(fired.frame);
  const to = Math.round(frameOfByte(fired.at + fired.length));

  // The strike: a longer stretch is a bigger saving, so it is louder.
  const pulses: Pulse[] = [
    {
      id: `match-${index}`,
      frame: from,
      rate,
      gain: 5.4 + Math.min(1, fired.length / PARSE.longestCopy) * 3.4,
    },
  ];

  for (let frame = from + SUSTAIN_EVERY; frame < to; frame += SUSTAIN_EVERY) {
    pulses.push({ id: `match-${index}-${frame}`, frame, rate, gain: 2.4 });
  }

  return pulses;
});

/** The head spelling out a character it has not seen before. */
export const LITERALS: readonly Pulse[] = TOKENS.filter(
  (t) => t.kind === "literal",
)
  .filter((_, index) => index % LITERAL_STRIDE === 0)
  .map((token, index) => ({
    id: `literal-${index}`,
    frame: Math.round(frameOfByte(token.at)),
    rate: 1.32,
    gain: 2.6,
  }));

/**
 * The collapse.
 *
 * Thirty-nine stretches contracting inside a second and a half, ordered up the
 * file, which is a crunch rather than a sequence of events. It is the loudest
 * thing in the cut because it is the only thing in the cut the viewer has been
 * waiting for.
 */
export const CRUSH: readonly Pulse[] = FIRINGS.map((fired, index) => {
  const through = index / (FIRINGS.length - 1);
  return {
    id: `crush-${index}`,
    frame: Math.round(
      COLLAPSE_FROM + through * (COLLAPSE_TO - COLLAPSE_FROM - 6),
    ),
    // Falling, so the file sounds like it is settling rather than scattering.
    rate: 1.26 - through * 0.5,
    gain: 4.2 + through * 2.2,
  };
});
