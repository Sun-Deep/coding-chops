import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { Command } from "./Listing";
import { FOLDER_SIZE } from "./measurements";

/**
 * Thirty-two words.
 *
 * Lines one to three hand over the key while it is being built, the same job
 * chmod's lines did. Line two is the callback: the first ten characters are the
 * thing the page's best reel already taught. Line four names the number every
 * viewer has seen next to a folder, and the last line is what it is, while the
 * band proves it with the folder's own contents.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: 6,
    to: 74,
    text: (
      <>
        One <Command /> line. Seven columns.
      </>
    ),
  },
  { from: 86, to: 140, text: "The first ten characters are chmod." },
  { from: 150, to: 212, text: "Then links, owner, group, size, date, name." },
  { from: 228, to: 298, text: `Almost every folder says ${FOLDER_SIZE}.` },
  {
    from: 312,
    to: 414,
    emphasis: true,
    text: (
      <>
        That&apos;s its list of names.
        <br />
        <span style={{ color: ACCENT }}>Not what&apos;s inside.</span>
      </>
    ),
  },
];
