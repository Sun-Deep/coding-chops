import { HEX_DIGITS } from "./measurements";
import {
  CHIP_FRAMES,
  FINAL_MATCHES,
  STATES,
  STATE_LEN,
  SWEEP_FROM,
  SWEEP_TO,
  DURATION,
  keystrokeAt,
  maskAt,
} from "./beats";

/**
 * The row, made audible.
 *
 * Every sound here is something happening to a character. A key going down, a
 * position being compared, a verdict landing. Nothing marks an animated
 * property and nothing is laid down to fill time.
 *
 * The comparison carries the claim. A position that came back the same rings;
 * one that did not is a dull knock an octave and a fourth below, which is the
 * register VR10 settled on for the expensive event. So the wrong password is
 * sixty-one knocks with three rings buried in it and the right one is a run all
 * the way across, and a listener with the screen off hears which is which.
 *
 * Density is held near twenty notes a second, the ceiling VR10 arrived at after
 * shipping a wall of them. Knocks fire every other position; rings fire on
 * every match, except when nearly everything matches, where they stride by two
 * as well. That keeps three rings audible as three separate events without the
 * sixty-four in the last pass turning into one noise.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

/** Major pentatonic across two octaves, the scale VR10 onwards settled on. */
const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const BASE_RATE = 0.62;

const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return BASE_RATE * 2 ** (DEGREES[i] / 12);
};

/** Above this many matches, ringing every one of them is a wall rather than a run. */
const DENSE = 16;

/** The frame the comparison reaches a given position in a given pass. */
const cellFrame = (state: number, cell: number) =>
  state * STATE_LEN +
  SWEEP_FROM +
  Math.round(((cell + 0.5) / HEX_DIGITS) * (SWEEP_TO - SWEEP_FROM));

/**
 * A key going down, and with it the whole row changing.
 *
 * Walked frame by frame off `keystrokeAt` rather than recomputed from the
 * interval, so a change to the typing cadence cannot leave the clicks behind.
 * That is the VR07 desync, and it has happened three times on this channel.
 */
export const KEYS: readonly Pulse[] = (() => {
  const out: Pulse[] = [];
  for (let frame = 0; frame < DURATION; frame++) {
    if (!keystrokeAt(frame)) continue;
    out.push({ id: `key-${frame}`, frame, rate: 1.24, gain: 5.2 });
  }
  return out;
})();

/** The comparison crossing the row: a ring for a match, a knock for anything else. */
export const COMPARES: readonly Pulse[] = (() => {
  const out: Pulse[] = [];
  for (let state = 0; state < STATES.length; state++) {
    const mask = maskAt(state * STATE_LEN);
    const dense = FINAL_MATCHES[state] > DENSE;
    let rung = 0;
    for (let cell = 0; cell < HEX_DIGITS; cell++) {
      const frame = cellFrame(state, cell);
      const across = cell / (HEX_DIGITS - 1);
      if (mask[cell]) {
        rung++;
        if (dense && rung % 2 === 0) continue;
        out.push({
          id: `ring-${state}-${cell}`,
          frame,
          rate: note(across),
          gain: 6.6,
        });
      } else {
        if (cell % 2 === 1) continue;
        // An octave and a fourth under the ring, which is where VR10 put the
        // costly event so it reads as weight rather than as volume.
        out.push({
          id: `knock-${state}-${cell}`,
          frame,
          rate: note(across) / 2.67,
          gain: 3.4,
        });
      }
    }
  }
  return out;
})();

/** The verdict. Two of them open a door and one of them does not. */
export const VERDICTS: readonly Pulse[] = CHIP_FRAMES.map((frame, state) => ({
  id: `verdict-${state}`,
  frame,
  rate: FINAL_MATCHES[state] === HEX_DIGITS ? 1.0 : 0.86,
  gain: FINAL_MATCHES[state] === HEX_DIGITS ? 7.8 : 8.4,
}));

/** Which sample a verdict uses. A refusal is not a quieter success. */
export const verdictSample = (state: number) =>
  FINAL_MATCHES[state] === HEX_DIGITS ? "solved" : "reject";

/** Sanity: the middle pass has to sound emptier than the two either side. */
const ringsIn = (state: number) =>
  COMPARES.filter((c) => c.id.startsWith(`ring-${state}-`)).length;
if (!(ringsIn(1) < ringsIn(0) && ringsIn(1) < ringsIn(2))) {
  throw new Error("VR16: the wrong password does not sound emptier than the right one");
}
