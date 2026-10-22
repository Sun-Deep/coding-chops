import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { LET_GO, VERDICT_FROM } from "./beats";
import { FALL, FORCE } from "./measurements";

/**
 * Thirty-six words.
 *
 * Line one explains the first reading on the instruments: held upside down
 * by the fan, the car feels 1 g, as if parked. Line two names the two rules
 * as both cars let go and the one below rolls, both reading 0 g. Line three
 * is said while the jets underneath brake it, reading 2 g. The payoff puts
 * the roof's 26 g against the roll's 2 g.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: 4,
    to: LET_GO - 6,
    text: (
      <>
        Upside down, the fan holds it on:
        <br />1 g, like parked.
      </>
    ),
  },
  {
    from: LET_GO,
    to: 176,
    text: "Top: thrusters off. Below: they roll it over.",
  },
  {
    from: 182,
    to: VERDICT_FROM - 10,
    text: `Then the jets underneath brake it at ${FORCE.brakeG.toFixed(0)} g.`,
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Off: the roof hits at {FORCE.roofG.toFixed(0)} g.
        <br />
        <span style={{ color: ACCENT }}>
          On: rolled in {FALL.rollBy} s, {FORCE.brakeG.toFixed(0)} g max.
        </span>
      </>
    ),
  },
];
