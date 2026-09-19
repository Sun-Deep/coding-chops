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
import { SYMBOL_TOP } from "./layout";
import { Symbol } from "./Symbol";

/**
 * The frame the cover holds: the hole fully open and the code still reading.
 * That is the picture that says what the cut is about, and it is the one frame
 * where the damage and the verdict are on screen together. Frame zero would be
 * an undamaged QR code, which is a thing people scroll past every day.
 */
const HELD_FRAME = 150;

const SCALE = 0.82;
const PLACED_TOP = 660;

export const QrCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>QR codes</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Most of a QR code
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={82} color={ACCENT}>
      isn&rsquo;t the link.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${WIDTH / 2}px ${SYMBOL_TOP}px`,
          transform: `translateY(${PLACED_TOP - SYMBOL_TOP}px) scale(${SCALE})`,
        }}
      >
        <Symbol />
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
