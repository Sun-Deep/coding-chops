import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { VERDICT_FROM } from "./beats";
import { RUN } from "./measurements";

/**
 * Thirty-four words.
 *
 * Line one says what the field is while the camera pulls back to show all
 * of it. Line two is the slow way, said while the first check runs. Lines
 * three and four say what git does while the halves go over. The payoff
 * is this run's two counts, the slow way first.
 */
const commits = RUN.commits.toLocaleString("en-US");

export const narration: readonly NarrationLine[] = [
  {
    from: 4,
    to: 72,
    text: <>Free shipping broke in one of {commits} commits.</>,
  },
  {
    from: 78,
    to: 146,
    text: (
      <>
        One at a time, that&apos;s up to{" "}
        {RUN.mostOneByOne.toLocaleString("en-US")} checks.
      </>
    ),
  },
  {
    from: 152,
    to: 228,
    text: (
      <>
        git bisect tests the middle
        <br />
        and rules out half.
      </>
    ),
  },
  { from: 234, to: VERDICT_FROM - 8, text: "Each answer halves what's left." },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        One at a time: {RUN.oneByOne} checks.
        <br />
        <span style={{ color: ACCENT }}>git bisect: {RUN.steps.length}.</span>
      </>
    ),
  },
];
