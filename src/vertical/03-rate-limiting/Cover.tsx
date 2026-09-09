import { AbsoluteFill } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Lockup } from "../../shared/brand/Lockup";
import { SQUARE_BOTTOM, SQUARE_TOP } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label, Punch } from "../../shared/vertical/type";
import { ALGORITHMS, FIXED, LIMIT, commas } from "./measurements";

/**
 * The cover.
 *
 * Uploaded at 9:16 and cropped by everything that shows it. The square is the
 * tightest of the crops, so every element sits between `SQUARE_TOP` and
 * `SQUARE_BOTTOM` and the strips above and below carry nothing but ground.
 *
 * It leads with the contradiction rather than the topic. "Rate limiting
 * explained" is a category. "100 a minute. 200 got through." is a bug report,
 * and a bug report is the one thing a developer stops scrolling for.
 */
const ROW = 728;

const Lane: React.FC<{
  top: number;
  name: string;
  through: string;
  color: string;
  weight?: number;
}> = ({ top, name, through, color, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (1080 - ROW) / 2,
      width: ROW,
      display: "grid",
      gridTemplateColumns: "1fr 0.5fr",
      alignItems: "baseline",
      fontFamily: theme.monoFamily,
      fontSize: 29,
      fontWeight: weight,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    <span style={{ textAlign: "left" }}>{name}</span>
    <span style={{ textAlign: "right" }}>{through}</span>
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

export const RateLimitingCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 44%, #161D2A 0%, ${theme.colors.black} 66%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 58}>Rate limiting · visualized</Eyebrow>

    <Headline top={SQUARE_TOP + 138} size={96}>
      {LIMIT} a minute.
    </Headline>
    <Headline top={SQUARE_TOP + 250} size={96} color={ACCENT}>
      200 got through.
    </Headline>

    <Rule top={SQUARE_TOP + 382} />

    {ALGORITHMS.map((a, i) => (
      <Lane
        key={a.name}
        top={SQUARE_TOP + 418 + i * 56}
        name={a.name}
        through={`${commas(a.count)} through`}
        color={a === FIXED ? ACCENT : theme.colors.grayLight}
        weight={a === FIXED ? 700 : 500}
      />
    ))}

    <Rule top={SQUARE_TOP + 584} />

    <Headline top={SQUARE_TOP + 640} size={132} color={ACCENT}>
      2× the limit
    </Headline>

    <Label top={SQUARE_TOP + 790}>At the window seam</Label>

    <Punch top={SQUARE_TOP + 856} size={52}>
      Fixed window is two limits
      <br />
      with a seam.
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
