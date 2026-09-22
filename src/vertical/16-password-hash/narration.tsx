import type { NarrationLine } from "../../shared/vertical/Narration";
import { HERO } from "./measurements";

/**
 * Thirty words, cut to the three passes at the login box.
 *
 * One unit throughout, and it is survivors. The row on screen counts the
 * characters that came back, the narration names the same number, and nothing
 * asks the viewer to subtract. "61 of the 64 change" is the same fact and it is
 * the more quotable sentence, which is exactly why it had to go: VR10 put steps
 * next to cost and VR11 nearly put reads next to positions, and both times the
 * frame ended up arguing with its own caption.
 *
 * The last line is the one worth keeping. Everything before it explains a
 * mechanism, and a mechanism is what VR14 and VR15 were built on. This one
 * hands over something a viewer can use on any site they log into tomorrow.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 66, text: "A site never stores your password." },
  { from: 76, to: 134, text: "It stores this." },
  { from: 146, to: 206, text: "Change one letter." },
  {
    from: 214,
    to: 276,
    emphasis: true,
    text: `Three of the ${HERO.kept + HERO.changed} survive.`,
  },
  { from: 286, to: 344, text: "Type the right one and it matches." },
  {
    from: 352,
    to: 416,
    emphasis: true,
    text: "So nobody can send yours back.",
  },
];
