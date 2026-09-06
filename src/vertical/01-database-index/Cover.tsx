import { AbsoluteFill } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Lockup } from "../../shared/brand/Lockup";
import { SQUARE_BOTTOM, SQUARE_TOP } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label, Punch } from "../../shared/vertical/type";
import { INDEX, SEQ, SPEEDUP, commas } from "./measurements";

/**
 * The cover.
 *
 * Uploaded at 9:16 and then cropped by everything that shows it: 1:1 for the
 * TikTok profile grid, 3:4 for the Instagram one, 9:16 only in the feed itself.
 * The square is the tightest of the three, so every element sits between
 * `SQUARE_TOP` and `SQUARE_BOTTOM` and the strips above and below carry nothing
 * but ground. A cover laid out against the full 1920 loses its headline the
 * moment somebody opens the profile it is on.
 *
 * It states the result rather than teasing it. The thumbnail contract asks for
 * one clear promise, and on a feed the promise that works is the number, not a
 * question about the number.
 */
const ROW = 728;

const Lane: React.FC<{
  top: number;
  name: string;
  rows: string;
  time: string;
  color: string;
  weight?: number;
}> = ({ top, name, rows, time, color, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (1080 - ROW) / 2,
      width: ROW,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 0.62fr",
      alignItems: "baseline",
      fontFamily: theme.monoFamily,
      fontSize: 29,
      fontWeight: weight,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    <span style={{ textAlign: "left" }}>{name}</span>
    <span style={{ textAlign: "right" }}>{rows}</span>
    <span style={{ textAlign: "right" }}>{time}</span>
  </div>
);

export const DatabaseIndexCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 44%, #161D2A 0%, ${theme.colors.black} 66%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 58}>Database index · visualized</Eyebrow>

    <Headline top={SQUARE_TOP + 138} size={96}>
      10 million rows.
    </Headline>
    <Headline top={SQUARE_TOP + 250} size={96} color={ACCENT}>
      One query.
    </Headline>

    <div
      style={{
        position: "absolute",
        top: SQUARE_TOP + 382,
        left: (1080 - ROW) / 2,
        width: ROW,
        height: 1,
        background: "rgba(233,228,216,0.16)",
      }}
    />

    <Lane
      top={SQUARE_TOP + 418}
      name="No index"
      rows={`${commas(SEQ.rowsDiscarded + SEQ.rowsMatched)} rows`}
      time={`${SEQ.ms} ms`}
      color={theme.colors.grayLight}
    />
    <Lane
      top={SQUARE_TOP + 476}
      name="B-tree index"
      rows="1 row"
      time={`${INDEX.ms} ms`}
      color={ACCENT}
      weight={700}
    />

    <div
      style={{
        position: "absolute",
        top: SQUARE_TOP + 528,
        left: (1080 - ROW) / 2,
        width: ROW,
        height: 1,
        background: "rgba(233,228,216,0.16)",
      }}
    />

    <Headline top={SQUARE_TOP + 588} size={158} color={ACCENT}>
      {commas(SPEEDUP)}×
    </Headline>

    <Label top={SQUARE_TOP + 772}>Faster, same machine</Label>

    <Punch top={SQUARE_TOP + 828} size={54}>
      The data did not change.
      <br />
      The way in did.
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
