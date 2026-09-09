import { AbsoluteFill } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Lockup } from "../../shared/brand/Lockup";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label, Punch } from "../../shared/vertical/type";
import { Field } from "./Field";
import { QUICK, SELECTION, SORTED } from "./measurements";

/**
 * The cover.
 *
 * Uploaded at 9:16 and cropped by everything that shows it, so every element
 * that has to survive sits between `SQUARE_TOP` and `SQUARE_BOTTOM`. The bar
 * field below is ground: it is allowed to be cut, and it is what tells somebody
 * at a glance that this is the sorting one.
 *
 * It leads with the contradiction rather than the topic. "Sorting algorithms
 * compared" is a category. "Already sorted. Still 19,900." is a result that
 * does not sound right, and that is the thing worth stopping for.
 */
const ROW = 728;

const Lane: React.FC<{
  top: number;
  name: string;
  figure: string;
  color: string;
  weight?: number;
}> = ({ top, name, figure, color, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (WIDTH - ROW) / 2,
      width: ROW,
      display: "grid",
      gridTemplateColumns: "1fr auto",
      alignItems: "baseline",
      fontFamily: theme.monoFamily,
      fontSize: 29,
      fontWeight: weight,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    <span style={{ textAlign: "left" }}>{name}</span>
    <span style={{ textAlign: "right" }}>{figure}</span>
  </div>
);

const Rule: React.FC<{ top: number }> = ({ top }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: (WIDTH - ROW) / 2,
      width: ROW,
      height: 1,
      background: "rgba(233,228,216,0.16)",
    }}
  />
);

export const QuicksortCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 44%, #161D2A 0%, ${theme.colors.black} 66%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 58}>Selection sort · visualized</Eyebrow>

    <Headline top={SQUARE_TOP + 138} size={96}>
      Already sorted.
    </Headline>
    <Headline top={SQUARE_TOP + 250} size={96} color={ACCENT}>
      Still 19,900.
    </Headline>

    <Rule top={SQUARE_TOP + 382} />

    <Lane
      top={SQUARE_TOP + 418}
      name="selection sort"
      figure={SELECTION.comparisons.toLocaleString()}
      color={ACCENT}
      weight={700}
    />
    <Lane
      top={SQUARE_TOP + 474}
      name="quicksort"
      figure={QUICK.comparisons.toLocaleString()}
      color={theme.colors.grayLight}
    />
    <Lane
      top={SQUARE_TOP + 530}
      name="writes"
      figure={`${SELECTION.writes} / ${QUICK.writes.toLocaleString()}`}
      color={theme.colors.grayLight}
    />

    <Rule top={SQUARE_TOP + 584} />

    <Headline top={SQUARE_TOP + 640} size={132} color={ACCENT}>
      12.8× fewer
    </Headline>

    <Label top={SQUARE_TOP + 790}>And 3.2× more writes</Label>

    <Punch top={SQUARE_TOP + 856} size={52}>
      Selection sort is not
      <br />
      slow by accident.
    </Punch>

    <Field
      values={SORTED}
      settled={SORTED.map(() => true)}
      probe={null}
      anchor={null}
      side="bottom"
      baseline={SQUARE_BOTTOM + 210}
      span={230}
    />

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
