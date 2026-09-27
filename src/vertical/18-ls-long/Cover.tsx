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
import { NOTE_AT } from "./beats";
import { Command, Listing } from "./Listing";

/**
 * The frame the cover holds: the key complete, the folder line in the
 * terminal, both numbers settled under it and the size row saying what 4096
 * is. Taken after the note has arrived, not during it, because VR14's cover shipped mid-animation.
 *
 * The composition's own headline is covered by the cover's larger one, so the
 * whole frame is shifted and scaled into the square rather than cropped.
 */
const HELD_FRAME = NOTE_AT + 12;
const SCALE = 0.72;
const SOURCE_TOP = 396;
const PLACED_TOP = 672;

export const LsLongCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Reading ls -l</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      <Command /> is seven columns.
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={76} color={ACCENT}>
      4096 isn&apos;t what&apos;s inside.
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
        <Listing />
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
