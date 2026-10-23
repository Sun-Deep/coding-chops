/**
 * Fifteen seconds at 30fps: the ceiling in section 2 of the vertical
 * format standard, used because this cut has four things to say (what
 * people saw, how it works, when, and what to do) and each needs a beat.
 *
 * News first, then the mechanism, then the fix: the reel opens on what
 * viewers already saw in the headlines and then explains it.
 */
export const DURATION = 450;
export const FPS = 30;

/** Named government sites switch off across the field. */
export const OFF = 14;
/** The camera dives from the field into one server. */
export const DIVE = 76;
/** The upload request flies in: a stack of parts. */
export const ARRIVE = 104;
/** PHP unpacks the parts into memory, faster and faster. */
export const UNPACK = 140;
/** Memory slots on the server's front, and when each part lands in one. */
export const SLOTS = 48;
export const LANDS: readonly number[] = (() => {
  const out: number[] = [];
  let t = UNPACK;
  for (let k = 0; k < SLOTS; k++) {
    out.push(Math.round(t * 10) / 10);
    t += Math.max(0.6, 2.8 * (1 - k / SLOTS) ** 1.6);
  }
  return out;
})();
/** Memory runs out with the last part only half in. */
export const OOM = Math.ceil(LANDS[SLOTS - 1]) + 2;
/** Cleanup sweeps up the rack and stops on the half-built part. */
export const CLEAN = OOM + 14;
export const HOLD = CLEAN + 18;
/** Cleanup uses the half-built part: the attacker's code takes over. */
export const TAKEOVER = HOLD + 14;
/** Pull back to the field. */
export const PULL = 296;
/** The top panel turns from the timeline to the three steps. */
export const STEPS = 318;
/** The patch wave: every site comes back. */
export const PATCH = 330;
export const VERDICT_FROM = 354;

if (TAKEOVER > PULL - 30)
  throw new Error("beats.ts: the takeover needs a second before the pull");
