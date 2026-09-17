import { AbsoluteFill, Sequence } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import { Lock } from "./Lock";

/**
 * The frame the cover holds: late enough that the switches, their values and
 * the sums are all up, so the still carries the whole mechanism. Frame zero
 * would be three drums mid-roll and nothing under them.
 */
const HELD_FRAME = 234;

const SCALE = 0.86;
const ORIGIN_X = 150;
const ORIGIN_Y = 384;
const PLACED_TOP = 690;

export const FileModesCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>File permissions</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      chmod 755
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={82} color={ACCENT}>
      is nine switches.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${ORIGIN_X}px ${ORIGIN_Y}px`,
          transform:
            `translate(${(WIDTH - 780 * SCALE) / 2 - ORIGIN_X}px, ` +
            `${PLACED_TOP - ORIGIN_Y}px) scale(${SCALE})`,
        }}
      >
        <Lock />
      </div>
    </Sequence>

    <div
      style={{
        position: "absolute",
        top: SQUARE_BOTTOM - 62,
        left: 0,
        width: WIDTH,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
