import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";

export const narration: readonly NarrationLine[] = [
  { from: 0, to: 74, text: "Line 4 moves one plate at a time." },
  { from: 80, to: 148, text: "Each call changes the peg arguments." },
  { from: 154, to: 222, text: "The active call keeps changing depth." },
  { from: 228, to: 281, text: "Line 3 solves the smaller left tower." },
  { from: 287, to: 327, text: "Line 4 reaches the largest plate." },
  { from: 333, to: 401, text: "Line 5 rebuilds on the target." },
  { from: 407, to: 475, text: "Only line 4 changes the towers." },
  { from: 481, to: 608, text: "Every call repeats the same three steps." },
  {
    from: 618,
    to: 676,
    emphasis: true,
    text: (
      <>
        Four plates. <span style={{ color: ACCENT }}>Fifteen moves.</span>
      </>
    ),
  },
  {
    from: 682,
    to: 744,
    emphasis: true,
    text: (
      <>
        One more plate.
        <br />
        <span style={{ color: ACCENT }}>Twice the work, plus one.</span>
      </>
    ),
  },
];
