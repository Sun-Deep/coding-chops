import * as B from "./beats";

/**
 * The sound of what is on screen, from the recorded CC0 set in
 * `public/sfx/kenney/`: phones waking; two taps in the same frame; a busy
 * run of ticks for the payment; pings as the tickets land; a click as each
 * read returns; tickets confirming; soft footsteps down the aisle; a seat
 * taking a weight; a buzz and a low bell for a ticket to a taken seat. Take 2: a switch
 * for the cut, the lock clamping, a clock while B waits, the latch
 * releasing, a buzz for sold out, A's footsteps and seat, and the verdict.
 */

export type Cue = {
  readonly id: string;
  readonly name: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
  readonly length?: number;
};

const dB = (target: number) =>
  Math.round(10 ** ((target + 1) / 20) * 1000) / 1000;
const k = (name: string) => `kenney/${name}`;
const cue = (
  id: string,
  name: string,
  frame: number,
  level: number,
  rate = 1,
): Cue => ({
  id,
  name: k(name),
  frame: Math.round(frame),
  rate,
  gain: dB(level),
});
const steps = (id: string, from: number, to: number, level: number) =>
  Array.from({ length: Math.floor((to - from) / 9) }, (_, i) =>
    cue(
      `${id}-${i}`,
      `impactGeneric_light_00${i % 3}`,
      from + 4 + i * 9,
      level - (i % 2) * 2,
      0.8 + (i % 3) * 0.06,
    ),
  );

/** The 50 ms payment, drawn as a short busy run of ticks. */
const paying = (id: string, from: number, to: number) =>
  Array.from({ length: Math.floor((to - from) / 5) }, (_, i) =>
    cue(`${id}-${i}`, i % 2 ? "tick_002" : "tick_001", from + i * 5, -17, 1.25),
  );

export const CUES: readonly Cue[] = [
  cue("unlock-a", "glass_003", 3, -13, 1.1),
  cue("unlock-b", "glass_003", 7, -13, 0.95),
  ...paying("pay-1", B.READ_1 + 8, B.TICKET_1 - 4),
  cue("ping-a", "glass_003", B.TICKET_1 + 14, -11, 1.2),
  cue("ping-b", "glass_003", B.TICKET_1 + 20, -11, 1.0),
  cue("print", "drop_002", B.TICKET_1 + 28, -11),
  cue("cheer", "confirmation_001", B.TICKET_1 + 34, -12, 1.2),
  cue("uh-oh", "impactBell_heavy_000", B.SLUMP_1 + 6, -8, 0.35),
  cue("pay-2-start", "tick_001", B.LOCK_2 + 2, -12),
  cue("seated-2", "confirmation_001", B.SIT_2 + 8, -10, 0.9),
  cue("soldout-ring", "impactBell_heavy_000", B.SOLDOUT_2 + 10, -10, 0.38),
  // Take 1.
  cue("tap-a", "tick_001", B.TAP_1, -6),
  cue("tap-b", "tick_002", B.TAP_1 + 1, -6),
  cue("read-a", "click_004", B.READ_1, -12),
  cue("read-b", "click_002", B.READ_1 + 2, -12),
  cue("ticket-a", "confirmation_001", B.TICKET_1, -9),
  cue("ticket-b", "confirmation_001", B.TICKET_1 + 4, -10, 1.06),
  ...steps("walk-1", B.WALK_1, B.SIT_1 - 6, -15),
  cue("sit-1", "impactSoft_heavy_000", B.SIT_1 + 2, -9),
  cue("taken", "error_004", B.SLUMP_1, -8),
  // Take 2.
  cue("cut", "switch_003", B.TAKE_2, -10),
  cue("tap-a2", "tick_001", B.TAP_2, -9),
  cue("tap-b2", "tick_002", B.TAP_2 + 1, -9),
  cue("lock", "impactWood_medium_001", B.LOCK_2 + 5, -7),
  cue("lock-click", "click_004", B.LOCK_2 + 7, -10),
  ...Array.from({ length: 7 }, (_, i) =>
    cue(
      `wait-${i}`,
      i % 2 ? "tick_002" : "tick_001",
      B.LOCK_2 + 12 + i * 6,
      -15,
      0.8,
    ),
  ),
  cue("ticket-a2", "confirmation_001", B.TICKET_2, -9),
  cue("release", "drop_002", B.RELEASE_2, -9),
  cue("read-0", "click_004", B.RELEASE_2 + 3, -12),
  cue("soldout", "error_004", B.SOLDOUT_2 + 8, -8, 0.85),
  ...steps("walk-2", B.WALK_2, B.SIT_2 - 6, -15),
  cue("sit-2", "impactSoft_heavy_000", B.SIT_2 + 2, -9),
  cue("verdict", "impactSoft_heavy_000", B.VERDICT_FROM, -5, 0.9),
  cue("verdict-ring", "impactBell_heavy_000", B.VERDICT_FROM + 4, -9, 0.45),
];
