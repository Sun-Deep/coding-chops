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
import { Kitchen } from "./Kitchen";

/**
 * Both kitchens near the end: both averages final, the bottom one named, and
 * the orange 3:00 lunch alone at the microwave after waiting 10:35.
 */
const HELD_FRAME = 400;
const SCALE = 0.98;
const SOURCE_TOP = 462;
const SOURCE_BOTTOM = 1262;
const PLACED_TOP = SQUARE_TOP + 180;

export const MicrowaveCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      Quick meals first:
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      42% less waiting.
    </Headline>
    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(${SOURCE_TOP}px 0 ${1920 - SOURCE_BOTTOM}px 0)`,
          transformOrigin: `${WIDTH / 2}px ${SOURCE_TOP}px`,
          transform: `translateY(${PLACED_TOP - SOURCE_TOP}px) scale(${SCALE})`,
        }}
      >
        <Kitchen />
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
