import { HEX_DIGITS, AFTER, BEFORE, HERO } from "./measurements";
import { sha256 } from "./sha256";

/**
 * Every frame either side of this cut needs, in one module.
 *
 * VR07 shipped a cue map that fired at events which had been deleted, because
 * the cue times were literals typed next to the animation rather than read out
 * of it. Nothing in `cues.ts` or in any component computes a frame of its own:
 * they all call in here.
 */

/** Three passes at the same login box. */
export const STATES = [
  { password: BEFORE, verdict: "SAVED", signup: true },
  { password: AFTER, verdict: "NO MATCH", signup: false },
  { password: BEFORE, verdict: "MATCH", signup: false },
] as const;

export const STATE_LEN = 140;
export const DURATION = STATES.length * STATE_LEN;

/**
 * A character every six frames, which is a fifth of a second each.
 *
 * Fast enough to read as typing and slow enough that the row underneath is
 * legibly different between one keystroke and the next. The whole point is that
 * a viewer sees sixty-four characters replaced seven times in under a second
 * and a half, so the interval is set by what the eye can register as a change
 * rather than by what a person types like.
 */
export const TYPE_FROM = 4;
export const TYPE_STEP = 6;

/** The comparison crossing the row, one cell at a time. */
export const SWEEP_FROM = 54;
export const SWEEP_TO = 112;
export const CHIP_AT = 114;

export const stateAt = (frame: number) =>
  Math.min(STATES.length - 1, Math.floor(frame / STATE_LEN));
export const localAt = (frame: number) => frame - stateAt(frame) * STATE_LEN;

/** How many characters are in the field. */
export const typedAt = (frame: number) => {
  const state = STATES[stateAt(frame)];
  const local = localAt(frame);
  if (local < TYPE_FROM) return 0;
  return Math.min(state.password.length, Math.floor((local - TYPE_FROM) / TYPE_STEP) + 1);
};

/** Whether a keystroke lands on this exact frame, which is what the sound needs. */
export const keystrokeAt = (frame: number) => {
  const local = localAt(frame);
  if (local < TYPE_FROM) return false;
  const since = local - TYPE_FROM;
  if (since % TYPE_STEP !== 0) return false;
  return since / TYPE_STEP < STATES[stateAt(frame)].password.length;
};

/** What the site already holds, from the password that was signed up with. */
export const STORED = sha256(BEFORE);

/**
 * The digest of whatever is in the field, for every frame this cut has.
 *
 * Precomputed rather than hashed per frame: there are only twenty-four distinct
 * states of the field across the whole cut, and a component that hashed on
 * every render would do it sixty-four times a frame for the same answer.
 *
 * Before the first keystroke of a login the row shows what the database is
 * holding, because that is what is actually in it. Before the first keystroke
 * of the sign-up it shows the digest of the empty field, which is a real digest
 * and not a blank: an empty password still hashes to sixty-four characters, and
 * a row that starts empty would quietly suggest otherwise.
 */
const DIGESTS: string[][] = STATES.map((state, s) => {
  const out: string[] = [];
  for (let typed = 0; typed <= state.password.length; typed++) {
    if (typed === 0) out.push(s === 0 ? sha256("") : STORED);
    else out.push(sha256(state.password.slice(0, typed)));
  }
  return out;
});

export const digestAt = (frame: number) => DIGESTS[stateAt(frame)][typedAt(frame)];

/**
 * The digest that was in the row immediately before the current keystroke.
 *
 * The cells flip rather than cutting, and a flip that shows the new glyph all
 * the way through is a squash rather than a change. Each cell shows the old
 * character until it is edge on and the new one after.
 */
export const digestBefore = (frame: number) =>
  DIGESTS[stateAt(frame)][Math.max(0, typedAt(frame) - 1)];

/** The local frame of the most recent keystroke, or a long way before the cut. */
export const lastKeyAt = (frame: number) => {
  const typed = typedAt(frame);
  if (typed === 0) return -999;
  return TYPE_FROM + (typed - 1) * TYPE_STEP;
};

/** The digest each pass ends on, and which of its characters match the stored row. */
const SETTLED = STATES.map((state) => sha256(state.password));
const MASKS = SETTLED.map((digest) =>
  [...digest].map((c, i) => c === STORED[i]),
);

export const settledDigest = (frame: number) => SETTLED[stateAt(frame)];
export const maskAt = (frame: number) => MASKS[stateAt(frame)];

/**
 * How far the comparison has crossed the row, in cells, fractional at the head.
 *
 * Linear, because this is a read of sixty-four positions and nothing about it
 * accelerates. The fractional part is what lets the head be drawn between two
 * cells rather than snapping, which is the difference between a sweep and a
 * row of things switching on.
 */
export const sweptAt = (frame: number) => {
  const local = localAt(frame);
  if (local <= SWEEP_FROM) return 0;
  if (local >= SWEEP_TO) return HEX_DIGITS;
  return ((local - SWEEP_FROM) / (SWEEP_TO - SWEEP_FROM)) * HEX_DIGITS;
};

/** Cells the sweep has finished with. */
export const sweptWhole = (frame: number) => Math.floor(sweptAt(frame));

/** How many of those came back the same, counted rather than announced. */
export const matchesAt = (frame: number) => {
  const mask = maskAt(frame);
  const upto = sweptWhole(frame);
  let n = 0;
  for (let i = 0; i < upto; i++) if (mask[i]) n++;
  return n;
};

/** The verdict sliding in, 0 to 1. */
export const chipAt = (frame: number) => {
  const local = localAt(frame);
  if (local < CHIP_AT) return 0;
  return Math.min(1, (local - CHIP_AT) / 14);
};

/** The frame each state's verdict lands on, for the cue map. */
export const CHIP_FRAMES = STATES.map((_, s) => s * STATE_LEN + CHIP_AT);

/** The totals each pass settles on, which the frame prints and must not invent. */
export const FINAL_MATCHES = MASKS.map((mask) => mask.filter(Boolean).length);

if (FINAL_MATCHES[0] !== HEX_DIGITS || FINAL_MATCHES[2] !== HEX_DIGITS) {
  throw new Error("VR16: the right password does not reproduce the stored row");
}
if (FINAL_MATCHES[1] !== HERO.kept) {
  throw new Error(
    `VR16: the wrong password leaves ${FINAL_MATCHES[1]} characters, the script measured ${HERO.kept}`,
  );
}
