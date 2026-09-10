import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { SQUARE_BOTTOM, SQUARE_TOP } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label, Punch } from "../../shared/vertical/type";
import { PAGE_RATIO, SCATTERED, commas } from "./measurements";

/**
 * The cover.
 *
 * Uploaded at 9:16 and then cropped by everything that shows it: 1:1 for the
 * TikTok profile grid, 3:4 for the Instagram one, 9:16 only in the feed. The
 * square is the tightest, so every element sits between `SQUARE_TOP` and
 * `SQUARE_BOTTOM` and the strips above and below carry nothing but ground.
 *
 * It states the result rather than teasing it, and the promise it makes is the
 * one the cut delivers in the first seven seconds: the index was already there
 * and it did not save you. A cover asking whether your indexes are working is
 * the version that gets scrolled past.
 */
const ROW = 728;

const Lane: React.FC<{
  top: number;
  name: string;
  pages: string;
  color: string;
  weight?: number;
}> = ({ top, name, pages, color, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (1080 - ROW) / 2,
      width: ROW,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      alignItems: "baseline",
      fontFamily: theme.monoFamily,
      fontSize: 29,
      fontWeight: weight,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    <span style={{ textAlign: "left" }}>{name}</span>
    <span style={{ textAlign: "right" }}>{pages}</span>
  </div>
);

const Rule: React.FC<{ top: number }> = ({ top }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (1080 - ROW) / 2,
      width: ROW,
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
    <Headline top={SQUARE_TOP + 138} size={96}>
      Already indexed.
    </Headline>
    <Headline top={SQUARE_TOP + 250} size={96} color={ACCENT}>
      Half the table.
    </Headline>

    <Rule top={SQUARE_TOP + 382} />

    <Lane
      top={SQUARE_TOP + 418}
      name="Index"
      pages={`${commas(SCATTERED[1].pages)} pages`}
      color={theme.colors.grayLight}
    />
    <Lane
      top={SQUARE_TOP + 476}
      name="Covering index"
      pages={`${commas(SCATTERED[2].pages)} pages`}
      color={ACCENT}
      weight={700}
    />

    <Rule top={SQUARE_TOP + 528} />

    <Headline top={SQUARE_TOP + 588} size={158} color={ACCENT}>
      {PAGE_RATIO}×
    </Headline>

    <Label top={SQUARE_TOP + 772}>Fewer pages, same machine</Label>

    <Punch top={SQUARE_TOP + 828} size={54}>
      Same query.
      <br />
      One extra column.
    </Punch>

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
