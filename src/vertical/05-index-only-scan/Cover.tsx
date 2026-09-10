import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { SQUARE_BOTTOM, SQUARE_TOP } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label, Readout } from "../../shared/vertical/type";
import { Heap } from "./Field";
import { PAGE_RATIO, SCATTERED, SETUP, commas } from "./measurements";

/**
 * The cover.
 *
 * Uploaded at 9:16 and then cropped by everything that shows it: 1:1 for the
 * TikTok profile grid, 3:4 for the Instagram one, 9:16 only in the feed. The
 * square is the tightest, so every element sits between `SQUARE_TOP` and
 * `SQUARE_BOTTOM` and the strips above and below carry nothing but ground.
 *
 * It states the result rather than teasing it, and the promise it makes is the
 * one the cut delivers in the first six seconds: the index was already there
 * and it did not save you. A cover asking whether your indexes are working is
 * the version that gets scrolled past.
 *
 * The field of tiles is the cut's own picture and it belongs here. The first
 * version of this cover was type all the way down, which is what VR01 and VR03
 * did, and both of those read as a page of numbers at thumbnail size. VR02 and
 * VR04 put their object on the cover and are the two that stop a scroll. The
 * field is doing the headline's work: "half the table" is a claim in words and
 * a picture in tiles, and the picture is the one that survives being small.
 *
 * The lanes table went to make room. The grid and the one line under it say
 * what the two rows said, and a cover with a table on it is a cover nobody
 * reads at grid size.
 */

const Rule: React.FC<{ top: number }> = ({ top }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (1080 - 756) / 2,
      width: 756,
      height: 1,
      background: "rgba(233,228,216,0.16)",
    }}
  />
);

export const IndexOnlyScanCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 44%, #161D2A 0%, ${theme.colors.black} 66%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 58}>Index only scan · visualized</Eyebrow>

    {/* Both lines have to hold one line at 96. "The index was there." is
        twenty characters and wrapped into the line below it. */}
    <Headline top={SQUARE_TOP + 128} size={96}>
      Already indexed.
    </Headline>
    <Headline top={SQUARE_TOP + 238} size={96} color={ACCENT}>
      Half the table.
    </Headline>

    {/* The same field the reel draws, at the same 56 percent, from the same
        scatter. Ten rows rather than sixteen so it reads as a band here. */}
    <Heap
      read={SCATTERED[1].pages / SETUP.heapPages}
      top={SQUARE_TOP + 390}
      rows={10}
    />

    <Readout
      top={SQUARE_TOP + 606}
      size={30}
      color={theme.colors.grayLight}
    >
      {commas(SCATTERED[1].pages)} of {commas(SETUP.heapPages)} pages
    </Readout>

    <Rule top={SQUARE_TOP + 672} />

    <Headline top={SQUARE_TOP + 716} size={150} color={ACCENT}>
      {PAGE_RATIO}×
    </Headline>

    <Label top={SQUARE_TOP + 900}>
      Fewer pages with a covering index
    </Label>

    <div
      style={{
        position: "absolute",
        top: SQUARE_BOTTOM - 62,
        left: 0,
        width: 1080,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
