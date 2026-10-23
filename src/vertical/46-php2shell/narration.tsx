import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { ARRIVE, DIVE, OOM, PATCH, PULL, VERDICT_FROM } from "./beats";

/**
 * Thirty-six words. The news people saw, then why, step by step, said
 * while it happens on screen, then the fix and the one mistake to avoid.
 * Sites were switched off by their owners as a precaution; the line says
 * so rather than calling them hacked.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: 4,
    to: DIVE - 4,
    text: (
      <>
        Governments switched sites off.
        <br />
        Here&apos;s why.
      </>
    ),
  },
  {
    from: DIVE + 2,
    to: ARRIVE + 50,
    text: "One upload request. No login needed.",
  },
  {
    from: ARRIVE + 56,
    to: OOM + 10,
    text: (
      <>
        PHP runs out of memory
        <br />
        halfway through it.
      </>
    ),
  },
  {
    from: OOM + 16,
    to: PULL - 6,
    text: (
      <>
        Cleanup trusts the half-built part.
        <br />
        The attacker&apos;s code runs.
      </>
    ),
  },
  { from: PULL, to: PATCH + 18, text: "Before your site's own code starts." },
  {
    from: VERDICT_FROM,
    to: 444,
    emphasis: true,
    text: (
      <>
        Update PHP itself.
        <br />
        <span style={{ color: ACCENT }}>WordPress updates won&apos;t.</span>
      </>
    ),
  },
];
