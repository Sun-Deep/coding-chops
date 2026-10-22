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
import { QUERY_TOP, Query } from "./Query";
import { SCENE_TOP, Table } from "./Table";
import "./runs";

/** The query with all seven steps numbered, over the five rows it returns. */
export const COVER_FRAME = 400;
const QUERY_PLACED = SQUARE_TOP + 184;
const SCENE_PLACED = QUERY_PLACED + 296;
const SCALE = 0.92;

export const SqlOrderCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      You write SELECT first.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      Postgres runs it fifth.
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${QUERY_PLACED - QUERY_TOP}px)`,
      }}
    >
      <Query frame={COVER_FRAME} />
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${WIDTH / 2}px ${SCENE_TOP}px`,
        transform: `translateY(${SCENE_PLACED - SCENE_TOP}px) scale(${SCALE})`,
      }}
    >
      <Table
        frame={COVER_FRAME}
        still={`vr44/table-${String(COVER_FRAME).padStart(4, "0")}.png`}
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
