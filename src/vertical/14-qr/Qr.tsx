import { AbsoluteFill } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Provenance } from "../../shared/vertical/type";
import { PROVENANCE_TOP } from "./layout";
import { DECODER, HERO, MODULES_TOTAL } from "./measurements";
import { Band } from "./Band";
import { Symbol } from "./Symbol";

/**
 * The shot.
 *
 * Three beats on one object: a hole is cut in a QR code, it reads anyway, and
 * then the code is taken apart to show why there was room to lose that much.
 * The surprise comes first and the reason second, which is the order that earns
 * an "oh, that is how it works" rather than a fact.
 *
 * The headline is up from frame zero and stays. At feed size it is the only
 * thing read before the decision to keep watching is made.
 */
export const Qr: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: theme.fontFamily }}>
    <Eyebrow top={242}>QR codes</Eyebrow>
    <Headline top={268} size={58}>
      Most of a QR code
    </Headline>
    <Headline top={326} size={58} color={ACCENT}>
      isn&rsquo;t the link.
    </Headline>

    <Symbol />
    <Band />

    <Provenance top={PROVENANCE_TOP}>
      {MODULES_TOTAL} modules, level {HERO.level} &middot; hole measured by{" "}
      {DECODER}
    </Provenance>
  </AbsoluteFill>
);
