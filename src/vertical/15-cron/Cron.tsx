import { AbsoluteFill } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Provenance } from "../../shared/vertical/type";
import { PROVENANCE_TOP } from "./layout";
import { STEPS, YEAR } from "./measurements";
import { Reference } from "./Reference";
import { Schedule } from "./Schedule";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * The shot.
 *
 * One object, four states. A cron line with all five fields open, then a field
 * pinned at a time, and the week it selects thinning out underneath while the
 * count falls by four orders of magnitude.
 *
 * The lesson is the pairing of the five slots with their names, which is what
 * the viewer still has tomorrow. chmod is the best performing cut on this page
 * and it works the same way: it does not explain permissions, it hands over a
 * key and lets the viewer prove it in the same frame.
 *
 * The headline is up from frame zero and stays. At feed size it is the only
 * thing read before the decision to keep watching is made.
 */
export const Cron: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: theme.fontFamily }}>
    <Eyebrow top={242}>Cron</Eyebrow>
    <Headline top={268} size={58}>
      Five stars run
    </Headline>
    <Headline top={326} size={58} color={ACCENT}>
      {n(STEPS[0].fires)} times a year.
    </Headline>

    <Schedule />
    <Reference />

    <Provenance top={PROVENANCE_TOP}>
      every minute of {YEAR}, counted twice &middot; cron-parser agrees
    </Provenance>
  </AbsoluteFill>
);
