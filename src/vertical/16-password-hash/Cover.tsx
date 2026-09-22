import { AbsoluteFill, Sequence } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { SQUARE_BOTTOM, SQUARE_TOP, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import {
  CHIP_HEIGHT,
  CHIP_TOP,
  FIELD_LABEL_TOP,
} from "./layout";
import { HERO, HEX_DIGITS } from "./measurements";
import { Row } from "./Row";

/**
 * The frame the cover holds.
 *
 * The end of the middle pass, after the comparison has crossed the whole row
 * and after the verdict has finished sliding in. Chosen off the beats rather
 * than by eye: VR14's cover was caught mid scan and mid typing at once, with
 * its headline sitting on top of a half drawn symbol, and the rule that came
 * out of it is that a held frame must be a state the animation rests in.
 *
 * Local frame 135 of the second pass. Typing finished at 40, the comparison at
 * 112, the chip at 128.
 */
const HELD_FRAME = 275;

/** What the scaled object actually spans, in its own coordinates. */
const CONTENT_TOP = FIELD_LABEL_TOP - 24;
const CONTENT_BOTTOM = CHIP_TOP + CHIP_HEIGHT + 10;
const CONTENT_HEIGHT = CONTENT_BOTTOM - CONTENT_TOP;

const HEADLINE_TOP = SQUARE_TOP + 162;
const HEADLINE_SIZE = 82;
const ROOM_TOP = HEADLINE_TOP + HEADLINE_SIZE + 28;
const ROOM_BOTTOM = SQUARE_BOTTOM - 128;

const SCALE = 0.86;

/**
 * Derived rather than typed, so a layout change in the reel moves the cover
 * with it. VR14's cover broke because a fixed offset outlived the thing it was
 * offsetting: the payload changed, the symbol grew from 29 modules to 37, and
 * the number that placed it had been written against the old size.
 */
const PLACED = ROOM_TOP + (ROOM_BOTTOM - ROOM_TOP - CONTENT_HEIGHT * SCALE) / 2;
const OFFSET = PLACED - CONTENT_TOP;

if (CONTENT_HEIGHT * SCALE > ROOM_BOTTOM - ROOM_TOP) {
  throw new Error("VR16: the cover's object does not fit between the headline and the mark");
}

export const PasswordHashCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #1A1A24 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Password hashing</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Change one letter.
    </Headline>
    <Headline top={HEADLINE_TOP} size={HEADLINE_SIZE} color={ACCENT}>
      {HERO.kept} of {HEX_DIGITS} survive.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${WIDTH / 2}px ${CONTENT_TOP}px`,
          transform: `translateY(${OFFSET}px) scale(${SCALE})`,
        }}
      >
        <Row />
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
