import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";

/**
 * Twenty-eight words.
 *
 * Line three is the rule, said while the frame draws it: the changed layer
 * turns orange and the orange runs down through every layer under it. Line
 * four is the same rule on the other file, where the changed layer is the last
 * one. The last line is what to do about it, not a summary of what happened.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 52, text: "Same app. Two Dockerfiles." },
  { from: 60, to: 100, text: "Change one line of code." },
  {
    from: 110,
    to: 206,
    text: "A changed layer rebuilds every layer below it.",
  },
  { from: 230, to: 290, text: "Here, nothing sits below it." },
  {
    from: 298,
    to: 414,
    emphasis: true,
    text: (
      <>
        Copy your code
        <br />
        <span style={{ color: ACCENT }}>after the install.</span>
      </>
    ),
  },
];
