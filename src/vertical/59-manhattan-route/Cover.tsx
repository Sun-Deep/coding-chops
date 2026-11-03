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
import { RATIO } from "./measurements";
import { Stage } from "./Stage";

/**
 * After Dijkstra arrives: blue over every borough, the orange thread inside.
 * The city goes down first so its dark bands sit under the headline.
 */
export const COVER_FRAME = 300;
const SCALE = 0.95;
/** The city's top edge in the render, as a fraction of its height. */
const CITY_TOP = 0.28;
const PLACED_TOP = SQUARE_TOP + 184;

export const ManhattanRouteCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${WIDTH / 2}px 0px`,
        transform: `translate(0px, ${PLACED_TOP - CITY_TOP * 1920 * SCALE}px) scale(${SCALE})`,
      }}
    >
      <Stage
        cover
        frame={COVER_FRAME}
        still={`vr59/city-${String(COVER_FRAME).padStart(4, "0")}.png`}
      />
    </div>
    <Headline top={SQUARE_TOP + 24} size={64}>
      Same ride across Manhattan.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      A* checked {Math.floor(RATIO)}x fewer.
    </Headline>
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
