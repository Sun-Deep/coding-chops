import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { LEFT, RIGHT } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import { REPLAY_FROM, VERDICT_FROM, VERDICT_LAND } from "./beats";
import { panelAt } from "./grid";
import { MAX_OPS, MIN_OPS, N, RATIO } from "./measurements";
import { SortPanel } from "./SortPanel";
import { ALGORITHMS } from "./sorting";

/** The two the verdict keeps: the most work done and the least. */
const SLOWEST = "bubble";
const FASTEST = "quick";

const Meta: React.FC<{ children: React.ReactNode; opacity: number }> = ({
  children,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      top: 368,
      left: LEFT,
      width: RIGHT - LEFT,
      opacity,
      textAlign: "center",
      fontFamily: theme.monoFamily,
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: "0.15em",
      color: theme.colors.grayDark,
    }}
  >
    {children}
  </div>
);

/**
 * Six sorts on one clock, then the two ends of the result.
 *
 * The race is the cut. Every panel is handed the same number of operations per
 * frame, so nothing on screen is choreographed: the order the panels drop out
 * in is the order the algorithms actually finish in on this array, and the
 * cascade between four and eleven seconds is what the measurement produced.
 *
 * The verdict does not introduce a new picture. It takes the four panels
 * between the extremes down and runs the other two again, side by side, on a
 * faster clock that is still one clock. Quicksort resorts itself in a quarter
 * of a second and bubble sort is still grinding two seconds later, which is the
 * same claim the race just made, made again with only two things to watch. The
 * two totals move up under the headline for it and hold there, so the figures
 * the cut is arguing about stay fixed on screen while the run beneath them
 * starts over.
 */
export const SortingRace: React.FC = () => {
  const frame = useCurrentFrame();

  const verdict = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 16],
    [0, 1],
    clamp,
  );
  const replay =
    frame < REPLAY_FROM
      ? undefined
      : Math.round(
          interpolate(frame, [REPLAY_FROM, VERDICT_LAND], [0, MAX_OPS], clamp),
        );

  return (
    <>
      <Eyebrow top={244}>Sorting algorithms</Eyebrow>
      <Headline top={286} size={62}>
        Six sorts. One clock.
      </Headline>

      <Meta opacity={1 - verdict}>SAME ARRAY · n = {N} · ONE SHARED CLOCK</Meta>
      <Meta opacity={verdict}>
        BUBBLE {MAX_OPS.toLocaleString()} · QUICK {MIN_OPS.toLocaleString()} ·{" "}
        <span style={{ color: ACCENT }}>{RATIO}× THE WORK</span>
      </Meta>

      {ALGORITHMS.map((algorithm, index) => {
        const kept = algorithm.key === SLOWEST || algorithm.key === FASTEST;
        return (
          <SortPanel
            key={algorithm.key}
            algorithm={algorithm}
            {...panelAt(index)}
            attention={kept ? 1 : 1 - verdict * 0.72}
            singledOut={kept && verdict > 0.5}
            replaySpent={kept ? replay : undefined}
          />
        );
      })}
    </>
  );
};
