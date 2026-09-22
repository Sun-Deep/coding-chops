import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label, Provenance } from "../../shared/vertical/type";
import { KEEPER_TOP, PROVENANCE_TOP } from "./layout";
import { HERO, HEX_DIGITS } from "./measurements";
import { Row } from "./Row";

/** The keeper arrives with the last line of narration, not before. */
const KEEPER_FROM = 352;

/**
 * The shot.
 *
 * One login box, three passes. Sign up, get it wrong by a single character, get
 * it right. The row underneath is recomputed from the field on every keystroke,
 * so the claim is demonstrated sixty-four characters at a time rather than
 * asserted in a caption.
 *
 * The line at the bottom is what the viewer keeps. VR14 and VR15 both explained
 * a mechanism and both missed; chmod handed over a key and is the best cut on
 * the page. A site that can send you your password back is not doing this, and
 * that is something a viewer can check on any service they use tomorrow.
 */
export const PasswordHash: React.FC = () => {
  const frame = useCurrentFrame();
  const keeper = Math.min(1, Math.max(0, (frame - KEEPER_FROM) / 16));

  return (
    <AbsoluteFill style={{ fontFamily: theme.fontFamily }}>
      <Eyebrow top={242}>Password hashing</Eyebrow>
      <Headline top={268} size={58}>
        Change one letter.
      </Headline>
      <Headline top={326} size={58} color={ACCENT}>
        {HERO.kept} of {HEX_DIGITS} survive.
      </Headline>

      <Row />

      {keeper > 0 ? (
        <div style={{ opacity: keeper, transform: `translateY(${(1 - keeper) * 14}px)` }}>
          <Label top={KEEPER_TOP} color={theme.colors.chalk}>
            A site that can email you
          </Label>
          <Label top={KEEPER_TOP + 36} color={theme.colors.chalk}>
            your password is not doing this
          </Label>
        </div>
      ) : null}

      <Provenance top={PROVENANCE_TOP}>
        sha-256 &middot; hashed three ways, they agree
      </Provenance>
    </AbsoluteFill>
  );
};
