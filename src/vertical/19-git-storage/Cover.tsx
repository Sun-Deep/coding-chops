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
import { GC_CMD } from "./beats";
import { GitStorage } from "./GitStorage";

/**
 * The frame the cover holds: two whole copies in the store for a one-line
 * change, after the sweep has counted 159 of 160 lines the same and before
 * `git gc` starts typing, so no command is caught half written. That is the
 * headline's claim as a picture, with the one-line diff in the terminal under
 * it. The 68 is kept for the reel.
 */
const HELD_FRAME = GC_CMD - 2;
const SCALE = 0.8;
const SOURCE_TOP = 424;
const PLACED_TOP = 690;

export const GitStorageCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>How git stores a change</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Change one line.
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={76} color={ACCENT}>
      Git stores the whole file.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(${SOURCE_TOP}px 0 ${1920 - 1300}px 0)`,
          transformOrigin: `${WIDTH / 2}px ${SOURCE_TOP}px`,
          transform: `translateY(${PLACED_TOP - SOURCE_TOP}px) scale(${SCALE})`,
        }}
      >
        <GitStorage />
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
