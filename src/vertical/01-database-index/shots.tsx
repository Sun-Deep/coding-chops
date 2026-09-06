import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Lockup } from "../../shared/brand/Lockup";
import { clamp } from "../../shared/video/timing";
import { EASE_IN_OUT, EASE_OUT } from "../../shared/video/motion";
import { columnLeft, columnWidth } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import {
  Headline,
  Label,
  Provenance,
  Punch,
  Readout,
} from "../../shared/vertical/type";
import { Field, FIELD_HEIGHT } from "./Field";
import { Tree } from "./Tree";
import {
  DESCENT,
  INDEX,
  SEQ,
  SETUP,
  SPEEDUP,
  WRITES,
  commas,
} from "./measurements";

/**
 * The shots.
 *
 * Every one of them is a pure function of the frame within its own sequence, so
 * a shot can be scrubbed on its own in the studio without the rest of the reel
 * around it.
 *
 * The vertical rhythm is shared: label at 300, the thing being taught from 400
 * to about 930, the number it produces at 965, the receipt under it at 1150,
 * and the narration on a baseline at 1460. Holding those anchors across four
 * different shots is what stops half a minute reading as four unrelated cards,
 * and it is also what keeps everything inside the reserves in
 * `src/shared/vertical/geometry.ts`.
 *
 * No shot draws its own closing line any more. Those are lines nine through one
 * of `narration.tsx`, set large, and `Reel.tsx` puts them on over the top. One
 * voice in one place beats a caption track and a card competing for the same
 * corner of the frame.
 */

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], { ...clamp, ...EASE_OUT });

/**
 * A number counting toward a target, rounded so the digits stay readable.
 *
 * Linear in `t`, because `t` is already the eased progress of the thing being
 * counted. Easing it twice puts the counter on 10,000,000 while the field it is
 * counting is still a row and a half short, and a counter that finishes before
 * the work does is the one detail that would tell a viewer the numbers are
 * decoration.
 */
const counting = (t: number, to: number, step: number) => {
  if (t >= 1) return to;
  const value = interpolate(t, [0, 1], [0, to], clamp);
  return Math.min(to, Math.round(value / step) * step);
};

export const Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [8, 228], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT.easing,
  });
  const found = ramp(frame, 232, 12);

  return (
    <>
      <Label top={300} opacity={ramp(frame, -6, 10)}>
        Without an index · seq scan
      </Label>

      {/* The query the sweep is running, at the top with the label because it
          is the setup rather than the result. One line, quiet, held for the
          whole shot: six seconds is long enough to forget what was asked. */}
      <div
        style={{
          position: "absolute",
          top: 348,
          left: columnLeft(348),
          width: columnWidth(348),
          textAlign: "center",
          opacity: ramp(frame, 2, 12),
          fontFamily: theme.monoFamily,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "0.01em",
          color: theme.colors.grayLight,
        }}
      >
        SELECT amount FROM events WHERE user_id = {SETUP.key};
      </div>

      <Field
        top={410}
        progress={sweep}
        match={found}
        opacity={ramp(frame, -6, 10)}
      />

      <Label top={410 + FIELD_HEIGHT + 46} opacity={ramp(frame, -2, 10)}>
        Rows read
      </Label>

      <Readout top={410 + FIELD_HEIGHT + 86} size={84} weight={700}>
        {commas(counting(sweep, SEQ.rowsDiscarded + SEQ.rowsMatched, 10_000))}
      </Readout>

      {/* Held back until the sweep finishes. Both figures describe the whole
          scan, and showing a total beside a counter still climbing invites the
          viewer to read them as the same measurement. */}
      <Provenance top={410 + FIELD_HEIGHT + 196} opacity={ramp(frame, 228, 14)}>
        {commas(SEQ.pages)} pages · {SEQ.ms} ms · rows removed by filter:{" "}
        {commas(SEQ.rowsDiscarded)}
      </Provenance>
    </>
  );
};

export const Descent: React.FC = () => {
  const frame = useCurrentFrame();
  // Four page reads across 195 frames. One unit of `step` is one read.
  const step = interpolate(frame, [26, 222], [0, 4], clamp);
  const settled = Math.min(3, Math.floor(step));

  return (
    <>
      <Label top={300} opacity={ramp(frame, 0, 10)}>
        With an index · b-tree
      </Label>

      <div style={{ opacity: ramp(frame, 0, 12) }}>
        <Tree top={400} step={step} />
      </div>

      <Label top={965} opacity={ramp(frame, 8, 12)}>
        Rows still possible
      </Label>

      <Readout top={1005} size={84} weight={700}>
        {commas(DESCENT[settled].remaining)}
      </Readout>

      <Provenance top={1150} opacity={ramp(frame, 226, 14)}>
        buffers: shared hit={INDEX.pages} · execution time: {INDEX.ms} ms
      </Provenance>
    </>
  );
};

/** One line of the verdict table. */
const Row: React.FC<{
  top: number;
  cells: readonly [string, string, string, string];
  opacity: number;
  color?: string;
  weight?: number;
}> = ({ top, cells, opacity, color = theme.colors.chalk, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: columnLeft(top),
      width: columnWidth(top),
      display: "grid",
      gridTemplateColumns: "1.15fr 1fr 0.8fr 0.85fr",
      alignItems: "baseline",
      opacity,
      fontFamily: theme.monoFamily,
      fontSize: 30,
      fontWeight: weight,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    <span style={{ textAlign: "left" }}>{cells[0]}</span>
    <span style={{ textAlign: "right" }}>{cells[1]}</span>
    <span style={{ textAlign: "right" }}>{cells[2]}</span>
    <span style={{ textAlign: "right" }}>{cells[3]}</span>
  </div>
);

export const Verdict: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <>
      <Label top={300} opacity={ramp(frame, -6, 10)}>
        Same query · same row
      </Label>

      <Row
        top={420}
        cells={["", "rows read", "pages", "time"]}
        opacity={ramp(frame, -2, 10) * 0.72}
        color={theme.colors.gray}
      />
      <Row
        top={490}
        cells={[
          "Seq scan",
          commas(SEQ.rowsDiscarded + SEQ.rowsMatched),
          commas(SEQ.pages),
          `${SEQ.ms} ms`,
        ]}
        opacity={ramp(frame, 2, 10)}
      />
      <Row
        top={556}
        cells={["Index scan", "1", String(INDEX.pages), `${INDEX.ms} ms`]}
        opacity={ramp(frame, 10, 10)}
        color={ACCENT}
        weight={700}
      />

      <Headline
        top={740}
        size={172}
        color={ACCENT}
        opacity={ramp(frame, 22, 14)}
        dy={interpolate(ramp(frame, 22, 14), [0, 1], [18, 0])}
      >
        {commas(SPEEDUP)}×
      </Headline>

      <Label top={950} opacity={ramp(frame, 32, 12)}>
        Faster, on the same machine
      </Label>

      <Provenance top={1040} opacity={ramp(frame, 40, 14)}>
        postgres {SETUP.postgres} · {commas(SETUP.rows)} rows · {SETUP.heapMb}{" "}
        mb · warm cache
      </Provenance>
    </>
  );
};

/**
 * The end card.
 *
 * `shared/brand/Outro.tsx` is the horizontal end card and centres itself in the
 * frame. Centring in 1920 puts a closing line squarely under the caption bar, so
 * the vertical card places the lockup by hand against the same anchors the rest
 * of the reel uses.
 *
 * This is the one shot allowed the brand accent. Everything above it is a
 * teaching frame, where the only colour on screen is the one carrying the
 * lookup.
 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const lockup = ramp(frame, 34, 16);

  return (
    <>
      <Punch top={340} size={62} opacity={ramp(frame, 0, 12)}>
        An index is not free.
      </Punch>

      <Readout
        top={484}
        size={29}
        color={theme.colors.gray}
        opacity={ramp(frame, 10, 12)}
      >
        {INDEX.sizeMb} MB added to a {SETUP.heapMb} MB table
        <br />
        {commas(WRITES.inserts)} inserts run {WRITES.slowdown}× slower with
        three indexes
      </Readout>

      <Provenance top={640} opacity={ramp(frame, 18, 14)}>
        measured, not estimated · full run in the repo
      </Provenance>

      {/* The closing couplet is the last line of `narration.tsx`, not a card
          here. It is the one sentence the whole cut is for, and it belongs in
          the same place every other sentence has been. */}
      <div
        style={{
          position: "absolute",
          top: 830,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: lockup,
          transform: `translateY(${interpolate(lockup, [0, 1], [16, 0])}px)`,
        }}
      >
        <Lockup size={62} tone="black" stacked />
      </div>
    </>
  );
};
