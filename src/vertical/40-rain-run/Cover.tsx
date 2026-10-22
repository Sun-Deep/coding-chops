import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { FEWER } from "./measurements";
import "./runs";
import { Street } from "./Street";

/** Both of you under cover, both counters finished. */
export const COVER_FRAME = 390;
const SCALE = 0.95;
const SOURCE_TOP = 424;
const SOURCE_BOTTOM = 1302;
const PLACED_TOP = SQUARE_TOP + 176;

export const RainRunCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      Run: {Math.round(FEWER.total * 100)}% fewer raindrops.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      Walk: {FEWER.top}x more on your head.
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        clipPath: `inset(${SOURCE_TOP}px 0 ${1920 - SOURCE_BOTTOM}px 0)`,
        transformOrigin: `${WIDTH / 2}px ${SOURCE_TOP}px`,
        transform: `translateY(${PLACED_TOP - SOURCE_TOP}px) scale(${SCALE})`,
      }}
    >
      <Street still={COVER_FRAME} />
    </div>
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
