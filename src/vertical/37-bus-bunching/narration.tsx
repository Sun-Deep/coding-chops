import type { NarrationLine } from "../../shared/vertical/Narration";

/** Twenty-eight words. Every line adds a cause or a consequence. */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 50, text: "One bus falls behind." },
  { from: 60, to: 125, text: "Both stop for passengers." },
  { from: 155, to: 200, text: "More people. Longer stops." },
  { from: 210, to: 252, text: "The next catches up." },
  { from: 262, to: 319, text: "Now it has to wait." },
  {
    from: 329,
    to: 414,
    emphasis: true,
    text: (
      <>
        The delay feeds itself.
        <br />
        That's positive feedback.
      </>
    ),
  },
];
