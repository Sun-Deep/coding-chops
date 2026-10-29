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
import * as B from "./beats";
import { fmt } from "./count";
import { RUN } from "./measurements";
import { PLAYER_TOP, Page } from "./Page";
import "./runs";

/** The count just turned negative and the dancer has stopped. */
export const COVER_FRAME = B.SIGN_AT + 24;
const PAGE_PLACED = SQUARE_TOP + 196;
const SCALE = 0.86;

export const GangnamCounterCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      Gangnam Style: 1 more view
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      = {fmt(RUN.wrapped)}
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${WIDTH / 2}px ${PLAYER_TOP}px`,
        transform: `translateY(${PAGE_PLACED - PLAYER_TOP}px) scale(${SCALE})`,
      }}
    >
      <Page
        frame={COVER_FRAME}
        still={`vr51/dancer-${String(COVER_FRAME).padStart(4, "0")}.png`}
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
