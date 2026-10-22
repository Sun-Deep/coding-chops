import { AbsoluteFill, Sequence } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { CIRCLE_IN } from "./beats";
import { Lots } from "./Lot";
import { SECONDS, clock } from "./measurements";

/**
 * Both drivers through the door and both clocks stopped, so the frame under
 * the headline shows the two times it states.
 */
const HELD_FRAME = CIRCLE_IN + 4;
const SCALE = 0.74;
const SOURCE_TOP = 428;
const PLACED_TOP = 596;

export const ParkingCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      Picked a row: {clock(SECONDS.row)}.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      Circled: {clock(SECONDS.circle)}.
    </Headline>
    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(${SOURCE_TOP}px 0 ${1920 - 1270}px 0)`,
          transformOrigin: `${WIDTH / 2}px ${SOURCE_TOP}px`,
          transform: `translateY(${PLACED_TOP - SOURCE_TOP}px) scale(${SCALE})`,
        }}
      >
        <Lots />
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
