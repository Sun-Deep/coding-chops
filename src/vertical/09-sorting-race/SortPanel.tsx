import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import {
  COST_BAR_HEIGHT,
  FIELD_HEIGHT,
  FIELD_TOP,
  FIELD_WIDTH,
  PAD,
  PANEL_HEIGHT,
  PANEL_WIDTH,
} from "./grid";
import { MAX_OPS, N } from "./measurements";
import { frameForSpend, type Algorithm } from "./sorting";

/** A slot nothing has touched and that is not yet holding its own value. */
const COLD = "#454B54";

/** A slot already holding the value it will end on. The order, emerging. */
const SETTLED = "#8E9298";

/** Every slot, once the run is over. */
const DONE = theme.colors.chalk;

const HEX = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/;

const channels = (hex: string) => {
  const m = HEX.exec(hex);
  if (!m) throw new Error(`not a hex colour: ${hex}`);
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] as const;
};

/** Straight sRGB blend. Close enough over the short hops used here. */
const mix = (from: string, to: string, t: number) => {
  const a = channels(from);
  const b = channels(to);
  const at = Math.max(0, Math.min(1, t));
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * at));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const PITCH = FIELD_WIDTH / N;
const BAR_WIDTH = PITCH - 1.6;

/**
 * One algorithm, mid-run.
 *
 * The bar field is the whole mechanism and everything else on the card is a
 * caption for it. Three things are drawn into it and each one means exactly one
 * thing: height is the value in that slot, the accent is a slot this algorithm
 * has touched in the last few frames, and the lighter neutral is a slot already
 * holding the value it will finish on. So the order visibly emerges out of the
 * noise rather than arriving at the end, and the accent stays what it is
 * everywhere else in the format, which is where the work is.
 *
 * The band behind the bars is the stretch the algorithm is working inside. It
 * is the only part of the card that differs in kind between the six, and it is
 * what stops a grid of six bar fields reading as the same picture six times.
 */
export const SortPanel: React.FC<{
  algorithm: Algorithm;
  left: number;
  top: number;
  /** 1 while the panel is part of the race, lower once the verdict picks two. */
  attention?: number;
  /** Draw the accent border the verdict puts on the two extremes. */
  singledOut?: boolean;
  /**
   * Operations spent on the verdict's own clock, which is faster and linear.
   *
   * The whole panel winds back to that point: the array, the activity, the
   * range, the counter and the cost bar. The two survivors sort themselves
   * again side by side, quicksort's run over in a quarter of a second and
   * bubble sort's still going two seconds later, which is the cut restated at
   * a size somebody can take in on one look.
   *
   * It re-runs rather than freezing because a still grid of six sorted arrays
   * held the last two seconds of the frame at under six hundredths of a per
   * cent of pixel change, which is a video a viewer reads as stalled. A
   * counter winding back would be a measured figure going backwards, so the
   * two totals move up into the line under the headline for the verdict and
   * stay there, fixed, while the replay runs underneath them.
   */
  replaySpent?: number;
}> = ({
  algorithm,
  left,
  top,
  attention = 1,
  singledOut = false,
  replaySpent,
}) => {
  const frame = useCurrentFrame();
  const { playback } = algorithm;

  const replaying = replaySpent !== undefined;
  const charged = replaying
    ? Math.min(replaySpent, playback.run.ops)
    : playback.spent[frame];
  const source = replaying ? frameForSpend(playback, charged) : frame;
  const base = source * N;

  const finished = replaying
    ? charged >= playback.run.ops
    : frame >= playback.finishedAt;
  const flash =
    finished && !replaying
      ? interpolate(
          frame,
          [playback.finishedAt, playback.finishedAt + 14],
          [1, 0],
          clamp,
        )
      : 0;

  const spent = charged;
  const low = playback.low[source];
  const high = playback.high[source];

  /**
   * The cost bar, drawn against bubble sort's total on every card.
   *
   * One scale for all six is what makes it a chart rather than six progress
   * bars, and it thickens on the two the verdict keeps because by then it is
   * the only thing left saying anything.
   */
  const costBarHeight = singledOut ? COST_BAR_HEIGHT * 3 : COST_BAR_HEIGHT;

  const bars = [];
  for (let i = 0; i < N; i++) {
    const value = playback.state[base + i];
    // A replay holds its last frame rather than running past it, so the trail
    // banked on that frame would sit there lit for the rest of the cut: a panel
    // stamped SORTED with a comparison still glowing inside it. Nothing is
    // active once the run is over.
    const heat = replaying && finished ? 0 : playback.heat[base + i];
    const settled = value === i + 1;
    const neutral = finished ? DONE : settled ? SETTLED : COLD;
    const height = (value / N) * FIELD_HEIGHT;

    bars.push(
      <rect
        key={i}
        x={PAD + i * PITCH}
        y={FIELD_TOP + FIELD_HEIGHT - height}
        width={BAR_WIDTH}
        height={height}
        rx={1.5}
        fill={mix(neutral, ACCENT, Math.max(heat, flash * 0.55))}
      />,
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        opacity: attention,
        overflow: "hidden",
        borderRadius: 16,
        border: `1px solid ${
          singledOut ? ACCENT : `rgba(255, 255, 255, ${0.12 + flash * 0.3})`
        }`,
        background: "linear-gradient(150deg, #12161B 0%, #090B0E 100%)",
        boxShadow: singledOut
          ? `0 0 0 1px ${ACCENT}55, 0 18px 36px #00000055`
          : "0 14px 30px #0000004A",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PAD + 2,
          top: 14,
          fontFamily: theme.monoFamily,
          fontSize: 23,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: theme.colors.chalk,
        }}
      >
        {algorithm.name}
      </div>
      <div
        style={{
          position: "absolute",
          right: PAD + 2,
          top: 18,
          fontFamily: theme.monoFamily,
          fontSize: 17,
          fontWeight: 500,
          color: theme.colors.grayDark,
        }}
      >
        {algorithm.complexity}
      </div>

      <svg
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
        viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
        style={{ position: "absolute", inset: 0 }}
        aria-label={`${algorithm.name} sort, ${spent} operations spent`}
      >
        {finished ? null : (
          <>
            <rect
              x={PAD + low * PITCH - 2}
              y={FIELD_TOP - 6}
              width={(high - low + 1) * PITCH + 4}
              height={FIELD_HEIGHT + 12}
              rx={4}
              fill={ACCENT}
              opacity={0.04}
            />
            <rect
              x={PAD + low * PITCH - 2}
              y={FIELD_TOP + FIELD_HEIGHT + 2}
              width={(high - low + 1) * PITCH + 4}
              height={3}
              rx={1.5}
              fill={ACCENT}
              opacity={0.75}
            />
          </>
        )}
        {bars}
        <line
          x1={PAD}
          y1={FIELD_TOP + FIELD_HEIGHT + 3.5}
          x2={PANEL_WIDTH - PAD}
          y2={FIELD_TOP + FIELD_HEIGHT + 3.5}
          stroke="#6A7179"
          strokeWidth={1}
          opacity={0.45}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: PAD + 2,
          bottom: 20,
          fontFamily: theme.monoFamily,
          fontSize: 24,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: finished ? ACCENT : theme.colors.chalk,
        }}
      >
        {spent.toLocaleString()}
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: theme.colors.grayDark,
            marginLeft: 6,
          }}
        >
          ops
        </span>
      </div>

      {finished ? (
        <div
          style={{
            position: "absolute",
            right: PAD + 2,
            bottom: 22,
            padding: "3px 9px",
            borderRadius: 5,
            background: ACCENT,
            color: theme.colors.black,
            fontFamily: theme.monoFamily,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          SORTED
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          height: costBarHeight,
          background: "#1C2128",
        }}
      >
        <div
          style={{
            width: (charged / MAX_OPS) * PANEL_WIDTH,
            height: costBarHeight,
            background: ACCENT,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: ACCENT,
          opacity: flash * 0.1,
        }}
      />
    </div>
  );
};
