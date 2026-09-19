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
import { QUIET, RESULT_HEIGHT, RESULT_TOP, SYMBOL_TOP } from "./layout";
import { Symbol } from "./Symbol";

/**
 * The frame the cover holds.
 *
 * It has to be after the scan sweep has crossed and after the link has finished
 * typing, and before the hole starts healing. Held at 150 the cover caught the
 * sweep as an orange bar through the code and the link half written, reading
 * "https://gi".
 *
 * The sweep ends at 152 and the typing at 186, so anything from about 190 to the
 * rebuild at 318 is clean. 200 sits comfortably inside that.
 */
const HELD_FRAME = 200;

/** Where the drawn symbol actually starts and ends, in its own coordinates. */
const CONTENT_TOP = SYMBOL_TOP - QUIET;
const CONTENT_BOTTOM = RESULT_TOP + RESULT_HEIGHT;
const CONTENT_HEIGHT = CONTENT_BOTTOM - CONTENT_TOP;

/**
 * The room the symbol is allowed, between the headline and the mark.
 *
 * Measured off the headline rather than guessed. The first version placed the
 * symbol at a fixed offset and the second headline ran straight through the top
 * of the code, which is the kind of thing that only shows up once somebody looks
 * at the cover rather than the reel.
 */
const HEADLINE_TOP = SQUARE_TOP + 162;
const HEADLINE_SIZE = 82;
const ROOM_TOP = HEADLINE_TOP + HEADLINE_SIZE + 24;
const ROOM_BOTTOM = SQUARE_BOTTOM - 120;

const SCALE = 0.88;

/**
 * The offset that centres the scaled symbol in that room.
 *
 * `Symbol` draws in frame coordinates, so the cover scales it about its own top
 * edge and then slides it down. Deriving the slide rather than typing it means
 * a change to the reel's layout moves the cover with it.
 */
const PLACED = ROOM_TOP + (ROOM_BOTTOM - ROOM_TOP - CONTENT_HEIGHT * SCALE) / 2;
const OFFSET = PLACED - (SYMBOL_TOP + (CONTENT_TOP - SYMBOL_TOP) * SCALE);

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
    <Headline top={HEADLINE_TOP} size={HEADLINE_SIZE} color={ACCENT}>
      isn&rsquo;t the link.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${WIDTH / 2}px ${SYMBOL_TOP}px`,
          transform: `translateY(${OFFSET}px) scale(${SCALE})`,
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
