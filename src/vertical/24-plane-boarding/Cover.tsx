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
import { BigWings, Plane } from "./Cabin";
import { SECONDS, clock } from "./measurements";

/**
 * The whole airliner from the reel's first frame, so the cover says "plane"
 * at grid size the way the opening does. Its cabin is the back-to-front
 * boarding at simulated second 52, the moment the most passengers in it are
 * stuck at once (10 of them, red down the aisle), under the two times.
 */
const HELD_SIM_S = 52;
/** Moves the reel's plane down so its nose clears the headline. */
const DROP = 70;

export const PlaneBoardingCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 56%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      Back to front: {clock(SECONDS.backToFront)}.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      Window first: {clock(SECONDS.windowFirst)}.
    </Headline>
    <svg width={WIDTH} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="shade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.18} />
          <stop offset="1" stopColor="#000" stopOpacity={0.25} />
        </linearGradient>
      </defs>
      <g transform={`translate(0 ${DROP})`}>
        <BigWings cx={WIDTH / 2} opacity={1} />
        <Plane method="backToFront" t={HELD_SIM_S} x={WIDTH / 2} opacity={1} />
      </g>
    </svg>
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
