import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { PACKED } from "./measurements";

/**
 * Twenty-seven words.
 *
 * Line three is the finding most people have backwards: a commit does not
 * store the change, it stores the file. The last line is the second surprise,
 * and it is the old copy that shrinks, not the new one, which the store shows
 * while the line is up.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 54, text: "Commit a 10 KB file." },
  { from: 62, to: 124, text: "Change one line." },
  { from: 142, to: 240, text: "Git stores the whole file again." },
  { from: 246, to: 308, text: "Then git gc packs the repo." },
  {
    from: 318,
    to: 414,
    emphasis: true,
    text: (
      <>
        The old copy becomes
        <br />
        <span style={{ color: ACCENT }}>{PACKED.v1Delta} bytes.</span>
      </>
    ),
  },
];
