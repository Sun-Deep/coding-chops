import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { VERDICT_FROM, arrive } from "./beats";
import { FEWER } from "./measurements";

/**
 * Thirty-six words.
 *
 * Line one sets the race while both of you leave the awning. Line two is
 * the walkers' argument, said while the runner's counter climbs fastest.
 * Line three is the cause, up while the walker's front bar climbs to meet
 * the runner's and finishes level with it. The payoff gives the result and
 * where the difference came from.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 80, text: "Same rain, same 14 m to the bus stop." },
  {
    from: 86,
    to: 186,
    text: "Running, you hit more drops each second.",
  },
  {
    from: 192,
    to: Math.round(arrive("walk")) - 2,
    text: (
      <>
        But the drops in your path
        <br />
        are the same either way.
      </>
    ),
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Run: {Math.round(FEWER.total * 100)}% fewer drops.
        <br />
        <span style={{ color: ACCENT }}>
          Walk: {FEWER.top}x more on your head.
        </span>
      </>
    ),
  },
];
