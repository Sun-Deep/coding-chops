import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Lockup } from "../../shared/brand/Lockup";
import { clamp } from "../../shared/video/timing";
import { EASE_OUT } from "../../shared/video/motion";
import { columnLeft, columnWidth } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline, Label, Provenance, Punch } from "../../shared/vertical/type";
import { BUCKET_BEATS, FIXED_BEATS, SLIDING_BEATS } from "./beats";
import { Clock, ResetMark } from "./parts";
import {
  Barrier,
  Booth,
  Counts,
  Jam,
  LaneSign,
  PER_CAR,
  Road,
  STAGE_H,
  STAGE_W,
  StageDefs,
  TokenRack,
  Traffic,
} from "./stage";
import {
  ALGORITHMS,
  AT_100K,
  BUCKET,
  BUCKET_TOKENS,
  FIXED,
  LIMIT,
  MEMORY_RATIO,
  SLIDING,
  commas,
} from "./measurements";

/**
 * The shots.
 *
 * Three of them happen at the same toll gate. Requests drive in from the left,
 * the barrier either lets them through or drops across the lane, and the queue
 * that builds behind it is the thing the viewer feels.
 *
 * What differs per shot is what hangs over the road and what makes the barrier
 * move. Fixed window has a lane sign that can run backwards. The sliding window
 * has the same sign and it never does. The token bucket has a rack of permits
 * on the booth roof that empties.
 *
 * Everything the viewer has to read is in the scene. Counts sit under the road,
 * because a strip of numbers below a picture is a dashboard reporting on it.
 */

const STAGE_TOP = 420;

const ramp = (frame: number, from: number, over: number) =>
  interpolate(frame, [from, from + over], [0, 1], { ...clamp, ...EASE_OUT });

/** Linear count between two frames. */
const count = (frame: number, from: number, to: number, target: number) =>
  Math.round(interpolate(frame, [from, to], [0, target], clamp));

const Stage: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <svg
    style={{
      position: "absolute",
      top: STAGE_TOP,
      left: (1080 - STAGE_W) / 2,
      opacity,
    }}
    width={STAGE_W}
    height={STAGE_H}
    viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
  >
    <StageDefs />
    {children}
  </svg>
);

export const Fixed: React.FC = () => {
  const frame = useCurrentFrame();
  const [b1s, b1e] = FIXED_BEATS.burstOne;
  const [b2s, b2e] = FIXED_BEATS.burstTwo;
  const reset = FIXED_BEATS.reset;

  const first = count(frame, b1s, b1e, LIMIT);
  const second = count(frame, b2s, b2e, LIMIT);
  const inWindow = frame < reset ? first : second;
  const total = frame < reset ? first : LIMIT + second;

  const ms = interpolate(frame, [b1s, b2e], [59_000, 61_000], clamp);
  // Down on the limit, and up again the instant the clock rolls.
  const open =
    inWindow >= LIMIT
      ? interpolate(frame, [b1e, b1e + 7], [1, 0], clamp)
      : frame > reset
        ? interpolate(frame, [reset, reset + 8], [0, 1], clamp)
        : 1;
  // Traffic only runs while the lane is open, so the road stops when it shuts.
  const flow = frame * 0.055;

  return (
    <>
      <Label top={300} opacity={ramp(frame, -8, 8)}>
        Fixed window · limit {LIMIT} a minute
      </Label>

      <Clock ms={ms} top={330} opacity={ramp(frame, -8, 8)} />

      <Stage opacity={ramp(frame, -8, 8)}>
        <Road scroll={open > 0.6 ? flow : 0} />
        <LaneSign value={inWindow} limit={LIMIT} />
        <Traffic flow={flow} open={open} />
        <Jam count={open < 0.6 ? 6 : 0} />
        <Booth />
        <Barrier open={open} />
        <Counts through={total} rejected={0} />
      </Stage>

      <ResetMark at={reset} frame={frame} />
    </>
  );
};

export const Sliding: React.FC = () => {
  const frame = useCurrentFrame();
  const [b1s, b1e] = SLIDING_BEATS.burstOne;
  const [b2s, b2e] = SLIDING_BEATS.burstTwo;

  const through = count(frame, b1s, b1e, LIMIT);
  const rejected = count(frame, b2s, b2e, LIMIT);
  const ms = interpolate(frame, [b1s, b2e], [59_000, 61_000], clamp);
  // It drops at the limit, and the clock rolling over does nothing to it.
  const open =
    through >= LIMIT ? interpolate(frame, [b1e, b1e + 7], [1, 0], clamp) : 1;
  const flow = frame * 0.055;

  return (
    <>
      <Label top={300} opacity={ramp(frame, -8, 8)}>
        Sliding window log · every timestamp kept
      </Label>

      <Clock ms={ms} top={330} opacity={ramp(frame, -8, 8)} />

      <Stage opacity={ramp(frame, -8, 8)}>
        <Road scroll={open > 0.6 ? flow : 0} />
        <LaneSign value={through} limit={LIMIT} />
        <Traffic flow={flow} open={open} />
        <Jam count={Math.floor(rejected / PER_CAR)} />
        <Booth />
        <Barrier open={open} />
        <Counts
          through={through}
          rejected={rejected}
          rejectedNote={`${commas(SLIDING.bytes)} bytes per user`}
          throughNote={`${AT_100K.sliding} mb at 100,000 users`}
          noteOpacity={ramp(frame, b2e - 30, 12)}
        />
      </Stage>
    </>
  );
};

export const Bucket: React.FC = () => {
  const frame = useCurrentFrame();
  const [b1s] = BUCKET_BEATS.burstOne;
  const [, b2e] = BUCKET_BEATS.burstTwo;

  const sent = Math.round(
    interpolate(frame, [b1s, b2e], [0, BUCKET_TOKENS.length], clamp),
  );
  const tokens =
    sent <= 0 ? LIMIT : BUCKET_TOKENS[Math.min(sent, BUCKET_TOKENS.length) - 1];

  let through = 0;
  for (let i = 0; i < sent; i += 1) if (BUCKET.allowed[i]) through += 1;
  const rejected = sent - through;

  // No permit, no entry. It lifts again each time one refills.
  const open = tokens >= 1 ? 1 : 0;
  const flow = frame * 0.055;

  return (
    <>
      <Label top={300} opacity={ramp(frame, -8, 8)}>
        Token bucket · refills at {LIMIT} a minute
      </Label>

      <Label top={330} opacity={ramp(frame, -8, 8)} color={theme.colors.gray}>
        {Math.floor(tokens)} permits left
      </Label>

      <Stage opacity={ramp(frame, -8, 8)}>
        <Road scroll={open > 0.6 ? flow : 0} />
        <TokenRack tokens={tokens} capacity={LIMIT} />
        <Traffic flow={flow} open={open} />
        <Jam count={Math.floor(rejected / PER_CAR)} />
        <Booth />
        <Barrier open={open} />
        <Counts
          through={through}
          rejected={rejected}
          rejectedNote="the burst is on purpose"
          throughNote={`${BUCKET.bytes} bytes per user`}
          noteOpacity={ramp(frame, b2e - 30, 12)}
        />
      </Stage>
    </>
  );
};

const Row: React.FC<{
  top: number;
  cells: readonly [string, string, string];
  opacity: number;
  dx?: number;
  color?: string;
  weight?: number;
}> = ({
  top,
  cells,
  opacity,
  dx = 0,
  color = theme.colors.chalk,
  weight = 500,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: columnLeft(top),
      width: columnWidth(top),
      display: "grid",
      gridTemplateColumns: "1.5fr 0.8fr 1fr",
      alignItems: "baseline",
      opacity,
      transform: `translateX(${dx}px)`,
      fontFamily: theme.monoFamily,
      fontSize: 31,
      fontWeight: weight,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    <span style={{ textAlign: "left" }}>{cells[0]}</span>
    <span style={{ textAlign: "right" }}>{cells[1]}</span>
    <span style={{ textAlign: "right" }}>{cells[2]}</span>
  </div>
);

export const Verdict: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <>
      <Label top={300} opacity={ramp(frame, -8, 8)}>
        Same attack · same limit
      </Label>

      <Row
        top={470}
        cells={["", "through", "bytes/user"]}
        opacity={ramp(frame, -6, 8) * 0.72}
        color={theme.colors.gray}
      />
      {ALGORITHMS.map((a, i) => {
        const at = ramp(frame, -2 + i * 7, 9);
        return (
          <Row
            key={a.name}
            top={538 + i * 66}
            cells={[a.name, commas(a.count), commas(a.bytes)]}
            opacity={at}
            dx={interpolate(at, [0, 1], [26, 0])}
            color={a === FIXED ? ACCENT : theme.colors.chalk}
            weight={a === FIXED ? 700 : 500}
          />
        );
      })}

      <Headline
        top={800}
        size={148}
        color={ACCENT}
        opacity={ramp(frame, 34, 12)}
        dy={interpolate(ramp(frame, 34, 12), [0, 1], [20, 0])}
      >
        2× the limit
      </Headline>

      <Provenance top={968} opacity={ramp(frame, 50, 12)}>
        node 22 · deterministic simulation · heap measured over 100,000 users
      </Provenance>
    </>
  );
};

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const lockup = ramp(frame, 22, 14);

  return (
    <>
      <Punch top={400} size={62} opacity={ramp(frame, -4, 10)}>
        Fixed window is two limits
        <br />
        with a seam.
      </Punch>

      <Provenance top={580} opacity={ramp(frame, 8, 10)}>
        an exact limit costs {MEMORY_RATIO}× the memory · {AT_100K.sliding} mb
        against {AT_100K.fixed} mb at 100,000 users
      </Provenance>

      <div
        style={{
          position: "absolute",
          top: 760,
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
