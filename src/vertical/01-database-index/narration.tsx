import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { SEQ, commas } from "./measurements";

/**
 * What a narrator would be saying, written to be read instead.
 *
 * Nine lines over twenty-seven seconds, about two words a second. Subtitles
 * stay readable to roughly three, and this is a cut where the picture is also
 * asking for attention, so it sits under that.
 *
 * The plain lines say what is happening while it happens. The emphasised ones
 * are the point of their shot, and they are the lines that used to sit in the
 * frame as standalone cards. Folding them into the same track means one voice
 * rather than two competing blocks of type.
 *
 * Frames are absolute, so this file and `beats.ts` have to be read together.
 *
 * Long lines break by hand. Left to wrap, both of the two line ones orphan
 * their last word, and a subtitle whose second line is one word reads as a
 * mistake for the beat it takes to understand it. That beat is a fifth of the
 * time the line is on screen.
 */
export const narration: readonly NarrationLine[] = [
  // Sequential scan.
  { from: 0, to: 90, text: "No index on user_id." },
  { from: 96, to: 226, text: "So Postgres reads every row in the table." },
  {
    from: 232,
    to: 286,
    emphasis: true,
    text: (
      <>
        <span style={{ color: ACCENT }}>1 row</span> matched.
        <br />
        {commas(SEQ.rowsDiscarded)} did not.
      </>
    ),
  },

  // The descent.
  { from: 294, to: 358, text: "Now add a b-tree index." },
  {
    from: 364,
    to: 508,
    text: (
      <>
        Each page read rules out
        <br />
        almost everything left.
      </>
    ),
  },
  {
    from: 514,
    to: 572,
    emphasis: true,
    text: (
      <>
        Three page reads.
        <br />
        <span style={{ color: ACCENT }}>Then the row.</span>
      </>
    ),
  },

  // Verdict.
  { from: 578, to: 626, text: "The data did not change." },
  { from: 630, to: 682, emphasis: true, text: "The way in did." },

  // End card.
  {
    from: 690,
    to: 806,
    emphasis: true,
    text: (
      <>
        Reads get faster.
        <br />
        <span style={{ color: ACCENT }}>Writes pay for it.</span>
      </>
    ),
  },
];
