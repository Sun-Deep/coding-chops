import { positionAt, DURATION, REPLAY_FROM, REPLAY_TO } from "./beats";
import { COLS } from "./measurements";
import { byKey, MATCHERS, readsAtPosition } from "./search";

/**
 * The reading, made audible.
 *
 * Every panel fires a `probe` as it looks at characters, and the pitch is the
 * column that character sits in, so a line being read is a run up the scale and
 * the page sounds like thirty of them. The panels are fired out of phase with
 * each other, because they are all on the same sweep and a stride counted from
 * zero would have all six strike together and then go quiet.
 *
 * What carries the claim is the density. Naive looks at nine characters a frame
 * and Boyer-Moore looks at one, so the left column is a stream and the right
 * column is a scatter, and which side is doing less is audible before either
 * number has been read.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
};

/** Reads between cues. */
const STRIDE = 34;

/** Reads between cues while the verdict walks one matcher slowly. */
const REPLAY_STRIDE = 3;

/** Major pentatonic across two octaves. */
const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const BASE_RATE = 0.65;

const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return BASE_RATE * 2 ** (DEGREES[i] / 12);
};

/** Top of the scale, for the moment the window leaps over unread ground. */
const JUMP_RATE = BASE_RATE * 2 ** (26 / 12);

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

/** Reads consumed by each frame, per matcher, off the shared sweep. */
const readsByFrame = (index: number) => {
  const playback = MATCHERS[index].playback;
  const out = new Int32Array(DURATION);
  for (let f = 0; f < DURATION; f++) {
    out[f] = readsAtPosition(playback, positionAt(f));
  }
  return out;
};

export const PROBES: readonly Pulse[] = MATCHERS.flatMap((matcher, panel) => {
  const reads = readsByFrame(panel);
  const offset = Math.round((panel * STRIDE) / MATCHERS.length);
  const pulses: Pulse[] = [];
  let next = offset;
  for (let f = 0; f < DURATION; f++) {
    if (reads[f] <= next) continue;
    // Pitch by where on the line the sweep is, so each row is a run.
    const column = positionAt(f) % COLS;
    pulses.push({
      id: `${matcher.key}-${f}`,
      frame: f,
      rate: note(column / (COLS - 1)),
    });
    while (next < reads[f]) next += STRIDE;
  }
  return thin(pulses);
});

/**
 * The verdict's own walk.
 *
 * One note every few reads, and the top of the scale every time the window
 * leaps rather than slides. Boyer-Moore's case is that it can rule out ground
 * without looking at it, so the leap is the thing worth hearing.
 */
export const REPLAY: readonly Pulse[] = (() => {
  const bm = byKey("boyermoore").playback;
  const total = bm.frontier.length;
  const span = REPLAY_TO - REPLAY_FROM;
  const pulses: Pulse[] = [];
  let previous = 0;
  let previousWindow = bm.windows[0];
  for (let frame = REPLAY_FROM; frame <= REPLAY_TO; frame++) {
    const reads = Math.round(((frame - REPLAY_FROM) / span) * total);
    if (reads <= previous) continue;
    const window = bm.windows[Math.min(total - 1, reads - 1)];
    const leapt = window - previousWindow > 1;
    if (leapt || reads - previous >= REPLAY_STRIDE) {
      pulses.push({
        id: `replay-${frame}`,
        frame,
        rate: leapt ? JUMP_RATE : note((window % COLS) / (COLS - 1)),
      });
    }
    previous = reads;
    previousWindow = window;
  }
  return thin(pulses);
})();
