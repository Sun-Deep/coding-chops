import type { NarrationLine } from "../../shared/vertical/Narration";
import { GAME } from "./gameplay";

export const narration: readonly NarrationLine[] = [
  { from: 4, to: 64, text: "ADIEU. One guess, how many left?" },
  {
    from: 74,
    to: 110,
    emphasis: true,
    text: `${GAME.adieu.length} still fit.`,
  },
  { from: 132, to: 194, text: "Same puzzle. Try ROATE." },
  {
    from: 205,
    to: 243,
    emphasis: true,
    text: `${GAME.roate.length} answers left.`,
  },
  { from: 258, to: 326, text: "TRACE solves it." },
  {
    from: 344,
    to: 415,
    text: (
      <>
        ROATE cannot be
        <br />
        an answer here.
      </>
    ),
  },
];
