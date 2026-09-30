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
import { VERDICT_FROM } from "./beats";
import { Elevator } from "./Elevator";
import { YOUR_TRIP, clock } from "./measurements";

/**
 * The frame the cover holds: both of your trips finished, both clocks stopped.
 * Taken after the left clock has stopped rather than while it runs, the
 * mid-animation mistake VR14 and VR19's first covers made.
 */
const HELD_FRAME = VERDICT_FROM + 10;
const SCALE = 0.8;
const SOURCE_TOP = 432;
const PLACED_TOP = 600;

export const ElevatorCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      Same seven calls.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      {clock(YOUR_TRIP.order)} or {clock(YOUR_TRIP.sweep)}.
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
        <Elevator />
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
