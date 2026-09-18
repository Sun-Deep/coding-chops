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
import { CARD_TOP } from "./layout";
import { Sheet } from "./Sheet";

/**
 * The frame the cover holds: late in the sweep, before the collapse, so the
 * sheet is at its most marked up. Most of the file is lit, several arcs are in
 * the air and nothing has contracted yet, which is the picture that says what
 * the cut is about. Frame zero would be a plain log with one caret on it, and
 * the collapsed frame would be a mostly empty card.
 */
const HELD_FRAME = 268;

const SCALE = 0.82;
const PLACED_TOP = 700;

export const ZipCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>File compression</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={74}>
      Zip finds what
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={80} color={ACCENT}>
      you already said.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${WIDTH / 2}px ${CARD_TOP}px`,
          transform: `translateY(${PLACED_TOP - CARD_TOP}px) scale(${SCALE})`,
        }}
      >
        <Sheet />
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
