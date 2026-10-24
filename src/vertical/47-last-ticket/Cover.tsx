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
import { CODE_TOP, Code } from "./Code";
import { SCENE_TOP, Stage } from "./Stage";
import "./runs";

/** Take 1's end: one person in F12, the other holding a ticket for it. */
export const COVER_FRAME = 190;
const CODE_PLACED = SQUARE_TOP + 184;
const SCENE_PLACED = CODE_PLACED + 296;
const SCALE = 0.92;

export const LastTicketCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      1 seat. 2 tickets sold.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      FOR UPDATE stops it.
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${CODE_PLACED - CODE_TOP}px)`,
      }}
    >
      <Code frame={COVER_FRAME} />
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${WIDTH / 2}px ${SCENE_TOP}px`,
        transform: `translateY(${SCENE_PLACED - SCENE_TOP}px) scale(${SCALE})`,
      }}
    >
      <Stage
        frame={COVER_FRAME}
        still={`vr47/cinema-${String(COVER_FRAME).padStart(4, "0")}.png`}
      />
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
