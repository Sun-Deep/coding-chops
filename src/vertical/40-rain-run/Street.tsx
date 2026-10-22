import { Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Provenance } from "../../shared/vertical/type";
import { simAt } from "./beats";
import { COUNTER_W, Counter } from "./Counter";
import { CONDITIONS, DROPS, OUT } from "./measurements";
import { expected, timeOut, type Gait } from "./simulation";

/**
 * The same street in the same rain twice, one above the other, rendered in
 * Blender from the model's timeline by `scripts/blender/rain/render.sh`.
 * Above, you walk the 14 m from the shop's awning to the bus shelter; below,
 * you run it. Beside each street, the drops that have hit you so far
 * (`Counter.tsx`), read off the model on every frame.
 */

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 424;
/** The counter stands on the left margin, the street fills the rest. */
const COUNTER_LEFT = 96;
const LEFT = COUNTER_LEFT + COUNTER_W + 14;
const W = 930 - LEFT;
const H = 380;
/** The renders are 1300 x 760; the panel shows their middle. */
const VIDEO_W = Math.round((H * 1300) / 760);
const CROP = (VIDEO_W - W) / 2;
const PANELS: { gait: Gait; label: string; top: number }[] = [
  { gait: "walk", label: "Walk it", top: 494 },
  { gait: "run", label: "Run for it", top: 920 },
];
const LABEL_GAP = 34;

/** The drops on you at a frame, held at the trip's figures once you are in. */
export const countAt = (gait: Gait, frame: number) => {
  const t = simAt(frame);
  if (t >= timeOut(gait)) return DROPS[gait];
  return expected(gait, Math.max(0, t));
};

/** What you are doing, and the clock: out in the rain, then in after. */
const clockAt = (gait: Gait, frame: number) => {
  const t = simAt(frame);
  if (t < 0) return { word: "under the awning", clock: null };
  if (t >= timeOut(gait))
    return { word: "under cover after", clock: OUT[gait] };
  return { word: "out in the rain", clock: t };
};

const Panel: React.FC<{
  gait: Gait;
  label: string;
  top: number;
  frame: number;
  /** Set for a still: the video frame to hold. */
  still?: number;
}> = ({ gait, label, top, frame, still }) => {
  const now = clockAt(gait, frame);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top,
          left: LEFT,
          width: W,
          height: H,
          borderRadius: 14,
          overflow: "hidden",
          background: theme.colors.black,
          boxShadow: "0 0 0 1px #2A2B30",
        }}
      >
        {still === undefined ? (
          <OffthreadVideo
            src={staticFile(`vr40/${gait}.mp4`)}
            muted
            style={{
              position: "absolute",
              left: -CROP,
              width: VIDEO_W,
              height: H,
            }}
          />
        ) : (
          <Img
            src={staticFile(
              `vr40/${gait}-${String(still).padStart(4, "0")}.png`,
            )}
            style={{
              position: "absolute",
              left: -CROP,
              width: VIDEO_W,
              height: H,
            }}
          />
        )}
      </div>
      <div style={{ position: "absolute", top, left: COUNTER_LEFT }}>
        <Counter count={countAt(gait, frame)} height={H} />
      </div>
      <div
        style={{
          position: "absolute",
          top: top - LABEL_GAP,
          left: COUNTER_LEFT,
          width: 930 - COUNTER_LEFT,
          height: 30,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          color: theme.colors.chalk,
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 23,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            paddingBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 19,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: theme.colors.grayDark,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {now.word}{" "}
          {now.clock !== null ? (
            <span
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: theme.colors.chalk,
                textTransform: "none",
              }}
            >
              {now.clock.toFixed(1)} s
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
};

/** `still` holds every part of the scene at one frame, for the cover. */
export const Street: React.FC<{ still?: number }> = ({ still }) => {
  const current = useCurrentFrame();
  const frame = still ?? current;
  return (
    <>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => (
        <Panel key={p.gait} {...p} frame={frame} still={still} />
      ))}
    </>
  );
};
