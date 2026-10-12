import type { NarrationLine } from "../../shared/vertical/Narration";

/** Twenty-seven words, locked before drawing the race. */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 58, text: "Top: nobody passes anyone." },
  { from: 64, to: 138, text: "Below: skip dishes you don't want." },
  { from: 144, to: 224, text: "One slow diner blocks everyone behind." },
  { from: 230, to: 308, text: "Skipping helps most, but hurts some." },
  {
    from: 316,
    to: 414,
    emphasis: true,
    text: (
      <>
        Computers call this
        <br />
        head-of-line blocking.
      </>
    ),
  },
];
