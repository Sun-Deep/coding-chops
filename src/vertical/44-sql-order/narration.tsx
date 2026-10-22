import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { STAGES, VERDICT_FROM } from "./beats";
import { RUN } from "./measurements";

/**
 * Thirty-five words. Each line says the step that is happening on screen
 * as it happens; the payoff is the mistake the order explains, with
 * psql's own answer to it on screen beside it.
 */
const at = (clause: string) => STAGES.find((s) => s.clause === clause)!.at;

export const narration: readonly NarrationLine[] = [
  { from: 4, to: at("WHERE") - 6, text: "Postgres starts at FROM." },
  {
    from: at("WHERE"),
    to: at("HAVING") - 8,
    text: (
      <>
        WHERE drops unpaid orders.
        <br />
        GROUP BY piles the rest.
      </>
    ),
  },
  {
    from: at("HAVING"),
    to: at("ORDER BY") - 6,
    text: (
      <>
        HAVING drops small piles.
        <br />
        Only then does SELECT run.
      </>
    ),
  },
  {
    from: at("ORDER BY"),
    to: VERDICT_FROM - 8,
    text: <>ORDER BY sorts. LIMIT keeps {RUN.limit}.</>,
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        So WHERE can&apos;t see your alias.
        <br />
        <span style={{ color: ACCENT }}>ORDER BY can.</span>
      </>
    ),
  },
];
