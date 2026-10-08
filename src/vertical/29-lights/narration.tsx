import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Twenty-eight words.
 *
 * Lines one and two say both methods in the first five seconds, while the
 * left hand steps bulb to bulb and the right one jumps to the middle and half
 * the glow shrinks to half. Line three lands as the right tree lights. The payoff
 * names the idea while the left, sped up, finishes its seventy checks.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 70, text: "Left: test each bulb from the plug." },
  { from: 76, to: 150, text: "Right: test the middle, rule out half." },
  { from: 172, to: VERDICT_FROM - 8, text: "7 checks. The left needs 70." },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Computers search like this too.
        <br />
        It's called binary search.
      </>
    ),
  },
];
