import type { NarrationLine } from "../../shared/vertical/Narration";
import { HERO, MODULES_TOTAL } from "./measurements";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * Twenty-four words, cut to the hole.
 *
 * The surprise first and the reason second, which is the order that earns an
 * "oh, that is how it works" rather than a fact. Lines one to three are the
 * thing happening; lines four and five are why it was survivable.
 *
 * One unit throughout. Squares on screen are modules, pieces are codewords, and
 * no line asks the viewer to convert between them: 841 squares hold 70 pieces,
 * and the two numbers never meet in a sum.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 70, text: `A QR code. ${n(MODULES_TOTAL)} squares.` },
  { from: 80, to: 142, text: `Blank ${HERO.hole * HERO.hole} in the middle.` },
  { from: 152, to: 214, text: "It still scans." },
  { from: 226, to: 300, text: `Only ${HERO.data} pieces are your link.` },
  {
    from: 312,
    to: 412,
    emphasis: true,
    text: `The other ${HERO.ec} rebuild it.`,
  },
];
