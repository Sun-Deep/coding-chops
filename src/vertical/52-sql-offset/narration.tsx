import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import * as B from "./beats";
import { RUN } from "./measurements";

const n = (x: number) => x.toLocaleString("en-US");

/** Twenty-eight words, under three a second, each over the thing it says. */
export const narration: readonly NarrationLine[] = [
  {
    from: 4,
    to: 88,
    text: <>OFFSET can&apos;t jump to row {n(RUN.hero.offset + 1)}.</>,
  },
  {
    from: 92,
    to: B.PAGE_OUT - 2,
    emphasis: true,
    text: (
      <>
        {n(RUN.hero.offset)} rows read,
        <br />
        then thrown away.
      </>
    ),
  },
  {
    from: B.PAGE_OUT,
    to: B.TAKE_2 - 4,
    text: `Then your ${RUN.hero.keysetRead}.`,
  },
  {
    from: B.TAKE_2 + 4,
    to: B.VERDICT - 4,
    text: (
      <>
        WHERE id &gt; {RUN.hero.offset}
        <br />
        finds it in the index.
      </>
    ),
  },
  {
    from: B.VERDICT,
    to: 416,
    emphasis: true,
    text: (
      <>
        <span style={{ color: ACCENT }}>{RUN.hero.keysetRead} rows read.</span>{" "}
        Same page.
      </>
    ),
  },
];
