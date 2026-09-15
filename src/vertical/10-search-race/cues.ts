import {
  budgetAt,
  CHEAP_WALK_FROM,
  CHEAP_WALK_TO,
  DURATION,
  finishFrame,
  STEPS_WALK_FROM,
  STEPS_WALK_TO,
  walkedAt,
} from "./beats";
import { byKey, CELLS, MUD, SEARCHES, START, xOf, yOf } from "./maze";
import { HEIGHT, WIDTH, type SearchKey } from "./measurements";

/**
 * The search, made audible.
 *
 * Every panel fires a `probe` as its frontier reaches cells and the pitch is
 * how far that cell is from the start, so a flood spreading outward is a rising
 * sweep and a search doubling back is a pitch that falls. Depth-first sounds
 * like what it is doing before its label has been read.
 *
 * The pitches are quantised to a pentatonic scale. The first cut mapped
 * distance straight onto playback rate, which is the obvious thing to do and
 * sounds like nothing: a few hundred clicks at arbitrary intervals is texture,
 * and texture at one pitch per cell is noise. On a scale the same data is a
 * run, the intervals resolve, and the ear starts following the shape of the
 * search instead of enduring it. Nothing about the mapping changed except that
 * it now lands on notes.
 *
 * Firing on expansions and nothing else is what keeps the track carrying
 * information rather than volume. Greedy expands 99 cells against breadth-first
 * search's 658, so it is audibly the quietest panel and the first to stop.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
  /** A step into mud. Same voice, well below the rest of them. */
  readonly heavy?: boolean;
};

/**
 * Expansions between cues.
 *
 * Sixteen rather than the six this started at. `probe` is a plucked tone that
 * rings for about a seventh of a second, so firing one every sixth expansion
 * put fifty a second on top of each other and the pitches stopped being
 * separable. Twenty a second leaves each note its own space and still tracks
 * the clock accelerating.
 */
const STRIDE = 16;

/**
 * Major pentatonic across two octaves.
 *
 * The first version spanned 0.85 to 2.09 and the second, quantised, spanned
 * 0.80 to 2.40. Snapping to notes inside a range that had barely moved is why
 * the creator could not hear any difference: the mapping changed and the sound
 * did not. Two octaves is a range a listener can actually follow up and down.
 */
const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const BASE_RATE = 0.65;

const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return BASE_RATE * 2 ** (DEGREES[i] / 12);
};

/** A step into mud: the same voice an octave below the bottom of the scale. */
const MUD_RATE = BASE_RATE * 2 ** (-12 / 12);

/** Frames a mud step is allowed to ring before it is cut off. */
export const MUD_FRAMES = 9;

const SPAN = WIDTH + HEIGHT;

const byDistance = (cell: number) =>
  note(
    Math.min(
      1,
      (Math.abs(xOf(cell) - xOf(START)) + Math.abs(yOf(cell) - yOf(START))) /
        SPAN,
    ),
  );

const frameOfExpansion = () => {
  const budget = new Int16Array(DURATION);
  for (let f = 0; f < DURATION; f++) budget[f] = budgetAt(f);
  return (index: number) => {
    for (let f = 0; f < DURATION; f++) if (budget[f] > index) return f;
    return DURATION - 1;
  };
};

const at = frameOfExpansion();

const thin = (pulses: Pulse[]) => {
  const out: Pulse[] = [];
  let last = -1;
  for (const pulse of pulses) {
    if (pulse.frame === last) continue;
    last = pulse.frame;
    out.push(pulse);
  }
  return out;
};

/**
 * Panels fire out of phase with each other.
 *
 * Every panel is on the same clock and has spent the same number of expansions
 * at any frame, so a stride counted from zero makes all six cross their
 * sixteenth cell on the same frame. That is six notes at once and then nothing,
 * repeating: it left two silent gaps of four tenths of a second in the opening
 * bars and, for the rest of the race, replaced a run with a chord struck over
 * and over. Starting each panel a sixth of a stride further along interleaves
 * them.
 */
export const PROBES: readonly Pulse[] = SEARCHES.flatMap((search, panel) => {
  const { order } = search.playback;
  const pulses: Pulse[] = [];
  const offset = Math.round((panel * STRIDE) / SEARCHES.length);
  for (let i = offset; i < order.length; i += STRIDE) {
    pulses.push({
      id: `${search.key}-${i}`,
      frame: at(i),
      rate: byDistance(order[i]),
    });
  }
  return thin(pulses);
});

/**
 * The two walks.
 *
 * One cue a frame, pitched by how far along the route the walker is, so each
 * walk is a run up the scale and the longer route is audibly the longer run.
 *
 * Any frame that takes the walker into mud is the mud sound instead: the same
 * voice dropped an octave and a fourth, which is the cost arriving in the ear
 * rather than in a number. The route with the fewest steps hits it twenty
 * times and the cheapest hits it twice, so the whole claim is audible with the
 * screen switched off.
 */
const walkPulses = (
  key: "bfs" | "dijkstra",
  from: number,
  to: number,
): Pulse[] => {
  const { path } = byKey(key).playback;
  const steps = path.length - 1;
  const pulses: Pulse[] = [];
  let previous = 0;
  for (let frame = from; frame <= to; frame++) {
    const reached = Math.round(walkedAt(frame, steps, from, to));
    if (reached <= previous) continue;
    let muddy = false;
    for (let i = previous + 1; i <= reached; i++) {
      if (CELLS[path[i]] === MUD) muddy = true;
    }
    // Every other frame, so the tones stay separable, and always on mud, so
    // the count a viewer reads off the legend is the count they hear.
    if (!muddy && (frame - from) % 2 !== 0) {
      previous = reached;
      continue;
    }
    pulses.push({
      id: `walk-${key}-${frame}`,
      frame,
      rate: muddy ? MUD_RATE : note(reached / steps),
      heavy: muddy,
    });
    previous = reached;
  }
  return pulses;
};

export const WALK: readonly Pulse[] = [
  ...walkPulses("bfs", STEPS_WALK_FROM, STEPS_WALK_TO),
  ...walkPulses("dijkstra", CHEAP_WALK_FROM, CHEAP_WALK_TO),
];

/**
 * One cue per search running out of work, read off the same curve the picture
 * uses. Dijkstra and depth-first expand 583 and 586 cells, which on this clock
 * is one frame apart and one event to a listener, so they are one cue.
 */
export const ARRIVALS: readonly { key: SearchKey; frame: number }[] = (() => {
  const seen = new Set<number>();
  const out: { key: SearchKey; frame: number }[] = [];
  for (const search of [...SEARCHES].sort(
    (a, b) => a.playback.run.expansions - b.playback.run.expansions,
  )) {
    const frame = finishFrame(search.key);
    if (seen.has(frame) || seen.has(frame - 1) || seen.has(frame + 1)) continue;
    seen.add(frame);
    out.push({ key: search.key, frame });
  }
  return out;
})();
