import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { PULL, SORT, TALLY_FROM, VERDICT_FROM } from "./beats";
import { RUN } from "./measurements";

/**
 * Thirty-two words. The first two lines play the one game everyone knows;
 * the third says what the field is while it plays; the fourth gives the
 * reason while the games sort themselves by it; the payoff is the run.
 */
const n = (x: number) => x.toLocaleString("en-US");

export const narration: readonly NarrationLine[] = [
  {
    from: 4,
    to: 70,
    text: (
      <>
        You pick door 1.
        <br />
        The host opens a goat.
      </>
    ),
  },
  {
    from: 76,
    to: PULL + 22,
    text: (
      <>
        Stick or switch?
        <br />
        It feels like 50/50.
      </>
    ),
  },
  {
    from: TALLY_FROM,
    to: SORT - 6,
    text: <>Python played it {n(RUN.games)} times.</>,
  },
  {
    from: SORT,
    to: VERDICT_FROM - 8,
    text: (
      <>
        Switching wins whenever
        <br />
        your first pick was wrong.
      </>
    ),
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Stick won {n(RUN.stick)}.
        <br />
        <span style={{ color: ACCENT }}>Switch won {n(RUN.switch)}.</span>
      </>
    ),
  },
];
