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
import { GRID_BOTTOM, SLOT_TOP } from "./layout";
import { STEPS } from "./measurements";
import { Schedule } from "./Schedule";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * The frame the cover holds.
 *
 * Early, while all five fields are still stars and the whole week is lit,
 * because that is the state the headline describes and the one with the most on
 * screen. VR14's cover was caught mid-animation with a half typed line in it,
 * so this one is chosen off the beats: before the first pin at 16.
 */
const HELD_FRAME = 12;

/** What the scaled symbol actually spans, in its own coordinates. */
const CONTENT_TOP = SLOT_TOP - 16;
const CONTENT_BOTTOM = GRID_BOTTOM + 14;
const CONTENT_HEIGHT = CONTENT_BOTTOM - CONTENT_TOP;

const HEADLINE_TOP = SQUARE_TOP + 162;
const HEADLINE_SIZE = 82;
const ROOM_TOP = HEADLINE_TOP + HEADLINE_SIZE + 30;
const ROOM_BOTTOM = SQUARE_BOTTOM - 130;

const SCALE = 0.98;

/**
 * Derived rather than typed, so a layout change in the reel moves the cover
 * with it. VR14's cover broke because a fixed offset outlived the thing it was
 * offsetting.
 */
const PLACED = ROOM_TOP + (ROOM_BOTTOM - ROOM_TOP - CONTENT_HEIGHT * SCALE) / 2;
const OFFSET = PLACED - (SLOT_TOP + (CONTENT_TOP - SLOT_TOP) * SCALE);

export const CronCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Cron</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Five stars run
    </Headline>
    <Headline top={HEADLINE_TOP} size={HEADLINE_SIZE} color={ACCENT}>
      {n(STEPS[0].fires)} times a year.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${WIDTH / 2}px ${SLOT_TOP}px`,
          transform: `translateY(${OFFSET}px) scale(${SCALE})`,
        }}
      >
        <Schedule />
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
