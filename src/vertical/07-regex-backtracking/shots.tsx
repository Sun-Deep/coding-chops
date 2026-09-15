import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { LEFT, RIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline, Label, Provenance } from "../../shared/vertical/type";
import {
  DOUBLE_LANDS,
  EXTRA_A_IN,
  LOOP_FROM,
  LOOP_TO,
  REMOVE_IN,
  RETRY_FAIL,
  RETRY_STARTS,
  RETRY_TRAVEL,
  SCAN_FROM,
  SCAN_LANDS,
} from "./beats";
import { CURVE, SCREEN_SAFE, SETUP } from "./measurements";

const EASE_OUT = {
  ...clamp,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

const mono = (size: number, color: string, weight = 600) =>
  ({
    fontFamily: theme.monoFamily,
    fontSize: size,
    fontWeight: weight,
    letterSpacing: "-0.025em",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    color,
  }) satisfies React.CSSProperties;

const Pattern: React.FC<{
  top: number;
  rewrite?: number;
  size?: number;
}> = ({ top, rewrite = 0, size = 62 }) => {
  const chars = [..."^(a+)+$"];
  const removed = new Set([1, 4, 5]);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: WIDTH,
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
      }}
    >
      {chars.map((char, index) => {
        const leaves = removed.has(index) ? rewrite : 0;
        const isPlus = index === 3 || index === 5;
        return (
          <span
            key={`${char}-${index}`}
            style={{
              ...mono(size, isPlus ? ACCENT : theme.colors.chalk, 700),
              display: "inline-block",
              width: interpolate(leaves, [0, 1], [size * 0.62, 0], clamp),
              opacity: 1 - leaves,
              overflow: "hidden",
              transform: `translateY(${interpolate(
                leaves,
                [0, 1],
                [0, -28],
                EASE_OUT,
              )}px) rotate(${leaves * -10}deg)`,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

const InputWord: React.FC<{
  top: number;
  count?: number;
  added?: number;
  compact?: boolean;
}> = ({ top, count = 5, added = 1, compact = false }) => {
  const size = compact ? 54 : 82;
  const gap = compact ? 8 : 12;
  const rise = interpolate(added, [0, 1], [-42, 0], EASE_OUT);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: WIDTH,
        display: "flex",
        justifyContent: "center",
        gap,
      }}
    >
      {Array.from({ length: count }, (_, index) => {
        const isAdded = index === count - 1 && added < 1;
        return (
          <div
            key={index}
            style={{
              ...mono(compact ? 30 : 42, isAdded ? ACCENT : theme.colors.chalk),
              width: size,
              height: compact ? 62 : 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: `2px solid ${
                isAdded ? ACCENT : theme.colors.grayDark
              }`,
              opacity: isAdded ? added : 1,
              transform: isAdded ? `translateY(${rise}px)` : undefined,
              background: isAdded
                ? `rgba(255, 122, 51, ${0.08 * added})`
                : "rgba(233, 228, 216, 0.025)",
            }}
          >
            a
          </div>
        );
      })}
      <div
        style={{
          ...mono(compact ? 30 : 42, theme.colors.chalk, 700),
          width: size,
          height: compact ? 62 : 88,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${theme.colors.grayDark}`,
        }}
      >
        X
      </div>
    </div>
  );
};

const Grouping: React.FC<{
  groups: readonly number[];
  muted?: boolean;
}> = ({ groups, muted = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    {groups.map((count, index) => (
      <div
        key={`${count}-${index}`}
        style={{
          display: "flex",
          justifyContent: "center",
          minWidth: count * 56 + 16,
          height: 60,
          borderLeft: `2px solid ${theme.colors.grayDark}`,
          borderRight: `2px solid ${theme.colors.grayDark}`,
          borderBottom: `2px solid ${theme.colors.grayDark}`,
          borderRadius: "0 0 10px 10px",
          ...mono(32, muted ? theme.colors.grayDark : theme.colors.chalk, 500),
          letterSpacing: "0.08em",
        }}
      >
        {"a".repeat(count)}
      </div>
    ))}
  </div>
);

const AttemptRow: React.FC<{
  top: number;
  start: number;
  groups: readonly number[];
  frameOverride?: number;
  cursorOpacity?: number;
}> = ({ top, start, groups, frameOverride, cursorOpacity = 1 }) => {
  const timelineFrame = useCurrentFrame();
  const frame = frameOverride ?? timelineFrame;
  const groupingWidth =
    groups.reduce((sum, count) => sum + count * 56 + 16, 0) +
    (groups.length - 1) * 9;
  const totalWidth = groupingWidth + 104;
  const local = frame - start;
  const enter = interpolate(local, [0, 8], [0, 1], EASE_OUT);
  const progress = interpolate(local, [0, RETRY_TRAVEL], [0, 1], clamp);
  const failed = interpolate(
    local,
    [RETRY_FAIL, RETRY_FAIL + 7],
    [0, 1],
    clamp,
  );
  const pulse = interpolate(
    local,
    [RETRY_FAIL - 2, RETRY_FAIL + 2, RETRY_FAIL + 12],
    [0, 1, 0],
    clamp,
  );

  if (local < -1) return null;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: (WIDTH - totalWidth) / 2,
        width: totalWidth,
        height: 64,
        opacity: enter * (1 - failed * 0.62),
        transform: `translateY(${(1 - enter) * -20}px)`,
      }}
    >
      <Grouping groups={groups} muted={failed > 0.5} />
      <div
        style={{
          ...mono(
            30,
            failed > 0.5 ? theme.colors.grayDark : theme.colors.chalk,
          ),
          position: "absolute",
          left: groupingWidth + 30,
          top: 12,
        }}
      >
        X
      </div>
      <div
        style={{
          position: "absolute",
          top: 49,
          left: 8,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: ACCENT,
          boxShadow: `0 0 22px ${ACCENT}`,
          transform: `translateX(${progress * (groupingWidth + 30)}px) scale(${
            1 - failed * 0.25
          })`,
          opacity: (1 - failed * 0.7) * cursorOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: groupingWidth + 8,
          top: -5,
          width: 72,
          height: 72,
          borderRadius: "50%",
          border: `3px solid ${ACCENT}`,
          opacity: pulse,
          transform: `scale(${0.55 + pulse * 0.7})`,
        }}
      />
      <div
        style={{
          ...mono(24, ACCENT, 700),
          position: "absolute",
          left: groupingWidth + 82,
          top: 19,
          opacity: failed,
        }}
      >
        ×
      </div>
    </div>
  );
};

const ATTEMPTS = [[5], [4, 1], [3, 2], [3, 1, 1]] as const;

export const Retry: React.FC<{
  frameOverride?: number;
  cursorOpacity?: number;
}> = ({ frameOverride, cursorOpacity = 1 }) => {
  const timelineFrame = useCurrentFrame();
  const frame = frameOverride ?? timelineFrame;
  const glow = RETRY_STARTS.reduce((sum, start) => {
    const local = frame - start;
    return (
      sum +
      interpolate(
        local,
        [RETRY_FAIL - 3, RETRY_FAIL + 2, RETRY_FAIL + 10],
        [0, 1, 0],
        clamp,
      )
    );
  }, 0);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 83% 47%, rgba(255,122,51,${
            Math.min(glow, 1) * 0.13
          }) 0%, rgba(255,122,51,0) 28%)`,
        }}
      />
      <Headline top={300} size={84}>
        WHY THIS REGEX
        <br />
        FREEZES
      </Headline>
      <Pattern top={500} />
      <Label top={586}>THE SAME INPUT</Label>
      <InputWord top={628} />

      {ATTEMPTS.map((groups, index) => (
        <AttemptRow
          key={index}
          top={786 + index * 96}
          start={RETRY_STARTS[index]}
          groups={groups}
          frameOverride={frame}
          cursorOpacity={cursorOpacity}
        />
      ))}
      <Label
        top={1190}
        color={
          interpolate(frame, [116, 146], [0, 1], clamp) > 0.5
            ? ACCENT
            : theme.colors.grayDark
        }
        opacity={interpolate(frame, [112, 130], [0, 1], clamp)}
      >
        SAME CHARACTERS · NEW SPLIT
      </Label>
    </>
  );
};

const TimingLane: React.FC<{
  top: number;
  count: number;
  seconds: number;
  added?: number;
  enter?: number;
  active?: boolean;
}> = ({ top, count, seconds, added = 1, enter = 1, active = false }) => {
  const cells = 30;
  const shown = Math.min(count, cells);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: LEFT,
        width: RIGHT - LEFT,
        height: 180,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 32}px)`,
      }}
    >
      <div style={{ ...mono(22, theme.colors.grayDark), marginBottom: 18 }}>
        {count} a&apos;s
      </div>
      <div style={{ display: "flex", gap: 4, width: 610 }}>
        {Array.from({ length: shown }, (_, index) => {
          const extra = active && index === shown - 1;
          return (
            <div
              key={index}
              style={{
                width: 17,
                height: 54,
                background: extra ? ACCENT : theme.colors.grayDark,
                opacity: extra ? added : 0.62,
                transform: extra
                  ? `translateY(${(1 - added) * -34}px)`
                  : undefined,
                boxShadow: extra
                  ? `0 0 24px rgba(255,122,51,${0.55 * added})`
                  : undefined,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 106,
          width: active ? 610 : 305,
          height: 4,
          background: active ? ACCENT : theme.colors.chalk,
          boxShadow: active ? `0 0 28px rgba(255,122,51,0.55)` : undefined,
          transformOrigin: "left center",
          transform: `scaleX(${enter})`,
        }}
      />
      <div
        style={{
          ...mono(72, active ? ACCENT : theme.colors.chalk, 700),
          position: "absolute",
          right: 0,
          top: 40,
        }}
      >
        {seconds} s
      </div>
    </div>
  );
};

export const Double: React.FC = () => {
  const frame = useCurrentFrame();
  const added = interpolate(
    frame,
    [EXTRA_A_IN, EXTRA_A_IN + 16],
    [0, 1],
    EASE_OUT,
  );
  const second = interpolate(
    frame,
    [EXTRA_A_IN - 4, EXTRA_A_IN + 14],
    [0, 1],
    EASE_OUT,
  );
  const verdict = interpolate(
    frame,
    [DOUBLE_LANDS, DOUBLE_LANDS + 14],
    [0, 1],
    EASE_OUT,
  );
  const previous = CURVE[CURVE.length - 2];

  return (
    <>
      <Headline top={300} size={80}>
        ONE MORE
        <br />
        CHARACTER
      </Headline>
      <Pattern top={486} size={52} />

      <TimingLane
        top={574}
        count={previous.n}
        seconds={SCREEN_SAFE.nodePreviousSeconds}
      />
      <TimingLane
        top={800}
        count={SETUP.headlineRun}
        seconds={SCREEN_SAFE.nodeSeconds}
        added={added}
        enter={second}
        active
      />

      <div
        style={{
          position: "absolute",
          top: 1018,
          left: 0,
          width: WIDTH,
          textAlign: "center",
          opacity: verdict,
          transform: `translateY(${(1 - verdict) * 18}px) scale(${0.94 + verdict * 0.06})`,
        }}
      >
        <div style={mono(112, ACCENT, 700)}>
          {SCREEN_SAFE.doubling.toFixed(1)}×
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: theme.monoFamily,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "0.2em",
            color: theme.colors.grayDark,
          }}
        >
          RETRY TIME
        </div>
      </div>
      <Provenance top={1190} opacity={verdict}>
        Node {SETUP.node}, median of {SETUP.runsPerPoint} runs
      </Provenance>
    </>
  );
};

const FrozenAttempt: React.FC<{
  groups: readonly number[];
  top: number;
  collapse: number;
}> = ({ groups, top, collapse }) => (
  <div
    style={{
      position: "absolute",
      top: interpolate(collapse, [0, 1], [top, 790], EASE_OUT),
      left: LEFT + 54,
      opacity: 0.28 * (1 - collapse),
      transform: `scaleX(${1 - collapse * 0.58})`,
      transformOrigin: "center center",
    }}
  >
    <Grouping groups={groups} muted />
  </div>
);

export const Fix: React.FC = () => {
  const frame = useCurrentFrame();
  const bodyOpacity = interpolate(
    frame,
    [LOOP_FROM, LOOP_FROM + 6],
    [1, 0],
    clamp,
  );
  const loop = interpolate(frame, [LOOP_FROM + 8, LOOP_TO], [0, 1], EASE_OUT);
  const loopFrame = interpolate(
    frame,
    [LOOP_FROM + 8, LOOP_TO],
    [-8, 0],
    clamp,
  );
  const bridge = interpolate(frame, [LOOP_FROM, LOOP_TO], [0, 1], EASE_OUT);
  const bridgeOpacity = interpolate(
    frame,
    [LOOP_FROM, LOOP_FROM + 4, LOOP_TO - 4, LOOP_TO],
    [0, 1, 1, 0],
    clamp,
  );
  const rewrite = interpolate(
    frame,
    [REMOVE_IN, REMOVE_IN + 22],
    [0, 1],
    EASE_OUT,
  );
  const collapse = interpolate(
    frame,
    [REMOVE_IN + 8, REMOVE_IN + 40],
    [0, 1],
    EASE_OUT,
  );
  const scan = interpolate(frame, [SCAN_FROM, SCAN_LANDS], [0, 1], clamp);
  const lands = interpolate(
    frame,
    [SCAN_LANDS, SCAN_LANDS + 14],
    [0, 1],
    EASE_OUT,
  );
  const pulse = interpolate(
    frame,
    [SCAN_LANDS - 2, SCAN_LANDS + 3, SCAN_LANDS + 16],
    [0, 1, 0],
    clamp,
  );

  // Avoid a fractional-opacity residue on the seam. The final rendered frame
  // is the same component at the same local frame as the opening.
  if (frame >= LOOP_TO) return <Retry frameOverride={0} />;

  return (
    <>
      <div style={{ opacity: bodyOpacity }}>
        <Headline top={300} size={82}>
          REMOVE THE OUTER +
        </Headline>
        <Pattern top={430} rewrite={rewrite} />
        <Label top={528}>SAME INPUT</Label>
        <InputWord top={570} />

        {ATTEMPTS.map((groups, index) => (
          <FrozenAttempt
            key={index}
            groups={groups}
            top={714 + index * 82}
            collapse={collapse}
          />
        ))}

        <div
          style={{
            position: "absolute",
            top: 810,
            left: LEFT + 34,
            width: RIGHT - LEFT - 68,
            height: 6,
            borderRadius: 3,
            background: theme.colors.grayDark,
            opacity: collapse,
          }}
        >
          <div
            style={{
              width: `${scan * 100}%`,
              height: "100%",
              borderRadius: 3,
              background: ACCENT,
              boxShadow: `0 0 26px rgba(255,122,51,0.58)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `calc(${scan * 100}% - 10px)`,
              top: -8,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: ACCENT,
              opacity: collapse,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -18,
              top: -26,
              width: 58,
              height: 58,
              borderRadius: "50%",
              border: `3px solid ${ACCENT}`,
              opacity: pulse,
              transform: `scale(${0.6 + pulse * 0.7})`,
            }}
          />
        </div>

        <Label top={886} opacity={collapse} color={theme.colors.grayDark}>
          ONE LINEAR SCAN
        </Label>
        <div
          style={{
            position: "absolute",
            top: 988,
            left: 0,
            width: WIDTH,
            textAlign: "center",
            opacity: lands,
            transform: `translateY(${(1 - lands) * 18}px)`,
          }}
        >
          <div style={mono(96, ACCENT, 700)}>{SCREEN_SAFE.rewriteMs} ms</div>
        </div>
        <Provenance top={1154} opacity={lands}>
          same accepted strings, Node {SETUP.node}
        </Provenance>
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: loop }}>
        <Retry
          frameOverride={loopFrame}
          cursorOpacity={interpolate(
            frame,
            [LOOP_TO - 4, LOOP_TO],
            [0, 1],
            clamp,
          )}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: interpolate(bridge, [0, 1], [RIGHT - 44, 441], EASE_OUT),
          top: interpolate(bridge, [0, 1], [801, 826], EASE_OUT),
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: ACCENT,
          boxShadow: `0 0 28px rgba(255,122,51,0.72)`,
          opacity: bridgeOpacity,
        }}
      />
    </>
  );
};
