import { REPLAY_FROM, VERDICT_LAND } from "./beats";
import { MAX_OPS, N } from "./measurements";
import { ALGORITHMS, byKey, type Algorithm } from "./sorting";

/**
 * The gunfire.
 *
 * A sorting visualiser that moves hundreds of bars in silence is missing the
 * thing people actually come to these for, so every panel fires a `swap` as
 * bars land in their slots. Three decisions keep that from turning into a
 * drone.
 *
 * It fires on writes and on nothing else. A comparison moves no bar and gets no
 * sound, which is what makes the track carry information rather than volume:
 * selection sort does 1,128 comparisons and 92 writes, so it clicks nine times
 * in seven and a half seconds while bubble sort is hammering. You can hear
 * which algorithm is moving things about before you have read either number.
 *
 * It fires once every `RACE_STRIDE` writes rather than on all of them. Three
 * thousand writes is three thousand sounds, and past about thirty a second a
 * listener stops hearing events and starts hearing texture. The stride is a
 * constant rather than a rate, so the firing speeds up exactly as the shared
 * clock does and the acceleration is audible.
 *
 * And the pitch is the value that landed. Low slot, low click. That is what
 * turns a run of clicks into the sound of an array converging: the scatter at
 * the start is noise across the whole range, and by the end each panel is
 * sweeping upward because it is writing 1, 2, 3 in order.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
};

/** Writes between cues during the race. */
const RACE_STRIDE = 10;

/** And during the verdict, whose clock runs roughly three times faster. */
const REPLAY_STRIDE = 24;

/**
 * Value to playback rate, over about one and a third octaves.
 *
 * Narrow on purpose. Two full octaves put the top of the array into a whistle
 * and the bottom into a thud, and the interval that has to stay legible is the
 * one between neighbouring slots, not the one between the extremes.
 */
const rateFor = (value: number) => 0.85 * 2 ** (((value - 1) / (N - 1)) * 1.3);

/**
 * One cue per frame per panel, at most.
 *
 * Two copies of a 60 millisecond click on the same frame is one louder click
 * and two more files for the mixer to carry, so the second is dropped rather
 * than stacked.
 */
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

const racePulses = (algorithm: Algorithm): Pulse[] => {
  const { writeFrame, writeValue } = algorithm.playback;
  const pulses: Pulse[] = [];
  for (let i = 0; i < writeFrame.length; i += RACE_STRIDE) {
    pulses.push({
      id: `${algorithm.key}-race-${i}`,
      frame: writeFrame[i],
      rate: rateFor(writeValue[i]),
    });
  }
  return thin(pulses);
};

const replayPulses = (algorithm: Algorithm): Pulse[] => {
  const { writeOps, writeValue } = algorithm.playback;
  const span = VERDICT_LAND - REPLAY_FROM;
  const pulses: Pulse[] = [];
  for (let i = 0; i < writeOps.length; i += REPLAY_STRIDE) {
    pulses.push({
      id: `${algorithm.key}-replay-${i}`,
      frame: Math.round(REPLAY_FROM + (writeOps[i] / MAX_OPS) * span),
      rate: rateFor(writeValue[i]),
    });
  }
  return thin(pulses);
};

export const RACE_FIRE: readonly Pulse[] = ALGORITHMS.flatMap(racePulses);

/**
 * The verdict fires too, and it is the best two seconds of the track.
 *
 * Quicksort's burst is over in a third of a second and bubble sort keeps
 * hammering for another two, so the claim the cut has been building to arrives
 * as one gun stopping while the other does not.
 */
export const REPLAY_FIRE: readonly Pulse[] = [
  ...replayPulses(byKey("bubble")),
  ...replayPulses(byKey("quick")),
];
