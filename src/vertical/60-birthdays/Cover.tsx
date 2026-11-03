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
import { PERCENT } from "./measurements";
import { Stage } from "./Stage";

/**
 * The web finished and the one orange string, both NOV 12 tags lit. The
 * room goes down first so its dark bands sit under the headline.
 */
export const COVER_FRAME = 150;
const SCALE = 0.86;
/** The room's top edge in the render, as a fraction of its height. */
const ROOM_TOP = 0.26;
const PLACED_TOP = SQUARE_TOP + 176;

export const BirthdaysCover: React.FC = () => (
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
        transform: `translate(0px, ${PLACED_TOP - ROOM_TOP * 1920 * SCALE}px) scale(${SCALE})`,
      }}
    >
      <Stage
        cover
        frame={COVER_FRAME}
        still={`vr60/classes-${String(COVER_FRAME).padStart(4, "0")}.png`}
      />
    </div>
    <Headline top={SQUARE_TOP + 24} size={64}>
      23 people in a room.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      {PERCENT}%: a shared birthday.
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
