import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { RAIL_EDGE } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import {
  DIFF_FROM,
  DUMP,
  FILL_EVERY,
  FILE_FLY,
  FILL_FROM,
  LEFT_FROM,
  MOVE,
  MOVE_FROM,
  REFILL_EVERY,
  RIGHT_FROM,
  slabAt,
  STEP_EVERY,
  stepAt,
  TYPE_EVERY,
  TYPE_FROM,
  VERDICT_FROM,
} from "./beats";
import {
  CHANGED,
  CODE_FIRST,
  CODE_LAYER,
  CONDITIONS,
  FILES,
  type FileName,
  INSTALL_LAYER,
  LINE_AFTER,
  LINE_BEFORE,
  LINE_NUMBER,
  PACKAGES,
  PACKAGES_FIRST,
  type Step,
} from "./measurements";

const EASE_OUT = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
const EASE_IN_OUT = { ...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1) };
const MONO = theme.monoFamily;
const GRAY = "#8C939C";

/** Two towers, each built to the width the action rail allows. */
const TOWER_WIDTH = 380;
const TOWER_X = [150, 550] as const;
const FILES_TOP = 432;
const FILE_HEIGHT = 40;
const TOP = 490;
const ROW = 58;
const INSTALL_ROW = 172;
const GAP = 10;
const VERDICT_TOP = 948;
const DIFF_TOP = 1_032;

if (TOWER_X[1] + TOWER_WIDTH > RAIL_EDGE) {
  throw new Error("the right tower runs under the platform action rail");
}

const rowTop = (steps: readonly Step[], i: number) =>
  TOP +
  steps
    .slice(0, i)
    .reduce((y, s) => y + (s.install ? INSTALL_ROW : ROW) + GAP, 0);

const towerBottom = (steps: readonly Step[]) =>
  rowTop(steps, steps.length) - GAP;

/** The build context's files, as chips over each tower. */
const FILE_FONT = 22;
const fileWidth = (f: FileName) => f.length * FILE_FONT * 0.6 + 24;
const FILES_WIDTH = FILES.reduce((w, f) => w + fileWidth(f), 0) + 12;
const fileLeft = (towerX: number, f: FileName) =>
  towerX +
  (TOWER_WIDTH - FILES_WIDTH) / 2 +
  FILES.slice(0, FILES.indexOf(f)).reduce((w, g) => w + fileWidth(g) + 12, 0);

const FileChip: React.FC<{
  name: FileName;
  left: number;
  top: number;
  changed: boolean;
  opacity?: number;
  scale?: number;
}> = ({ name, left, top, changed, opacity = 1, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      height: FILE_HEIGHT,
      width: fileWidth(name),
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "left center",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      border: `${changed ? 2 : 1}px solid ${changed ? ACCENT : "rgba(255, 255, 255, 0.22)"}`,
      background: changed ? "#2A1A10" : "#151A20",
      fontFamily: MONO,
      fontSize: FILE_FONT,
      fontWeight: 700,
      color: changed ? ACCENT : theme.colors.grayLight,
    }}
  >
    {name}
  </div>
);

/**
 * The files each COPY takes in, flying from the context into the step.
 *
 * This is the half of the mechanism the first cut left out. A COPY's cache
 * key is the contents of what it copies, so which step the changed file lands
 * in decides everything: above the install, or below it.
 */
const Files: React.FC<{ steps: readonly Step[]; x: number; from: number }> = ({
  steps,
  x,
  from,
}) => {
  const frame = useCurrentFrame();
  const changedNow = frame >= DIFF_FROM;
  const pop = interpolate(
    frame,
    [DIFF_FROM, DIFF_FROM + 6, DIFF_FROM + 14],
    [1, 1.14, 1],
    clamp,
  );
  return (
    <>
      {FILES.map((f) => (
        <FileChip
          key={f}
          name={f}
          left={fileLeft(x, f)}
          top={FILES_TOP}
          changed={changedNow && f === CHANGED}
          scale={f === CHANGED ? pop : 1}
        />
      ))}
      {steps.flatMap((step, i) =>
        (step.inputs ?? []).map((f, k) => {
          const land = stepAt(from, i);
          const t = interpolate(
            frame,
            [land - FILE_FLY, land],
            [0, 1],
            EASE_IN_OUT,
          );
          if (t <= 0 || t >= 1) return null;
          const toLeft = x + 128 + k * (fileWidth(f) * 0.55 + 6);
          const toTop = rowTop(steps, i) + (ROW - FILE_HEIGHT) / 2;
          return (
            <FileChip
              key={`${step.text}-${f}`}
              name={f}
              left={interpolate(t, [0, 1], [fileLeft(x, f), toLeft])}
              top={interpolate(t, [0, 1], [FILES_TOP, toTop])}
              changed={f === CHANGED}
              scale={interpolate(t, [0, 1], [1, 0.55])}
              opacity={interpolate(t, [0.8, 1], [1, 0.3], clamp)}
            />
          );
        }),
      )}
    </>
  );
};

/**
 * The rule, drawn: from the first step that ran, down to the bottom.
 *
 * Every step below a changed one runs again, whatever it is. On the left the
 * line runs through the install. On the right it has one step left to cross.
 */
const Cascade: React.FC<{
  steps: readonly Step[];
  x: number;
  from: number;
}> = ({ steps, x, from }) => {
  const frame = useCurrentFrame();
  const first = steps.findIndex((s) => s.rebuild === "ran");
  const start = stepAt(from, first);
  const end = stepAt(from, steps.length - 1) + STEP_EVERY;
  const t = interpolate(frame, [start, end], [0, 1], EASE_IN_OUT);
  if (t <= 0) return null;
  const top = rowTop(steps, first);
  const full = towerBottom(steps) - top;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 16,
          top,
          width: 8,
          height: full * t,
          borderRadius: 4,
          background: ACCENT,
          boxShadow: `0 0 14px ${ACCENT}AA`,
        }}
      />
      {t < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x - 16,
            top: top + full * t - 2,
            width: TOWER_WIDTH + 16,
            height: 4,
            borderRadius: 2,
            background: ACCENT,
            boxShadow: `0 0 18px ${ACCENT}`,
          }}
        />
      ) : null}
    </>
  );
};

/** Packages in the install at `frame`, and whether they are this rebuild's. */
const installAt = (frame: number, steps: readonly Step[], from: number) => {
  const i = steps.findIndex((s) => s.install);
  const first = Math.max(
    0,
    Math.min(PACKAGES, Math.floor((frame - FILL_FROM) / FILL_EVERY)),
  );
  const reached = stepAt(from, i);
  if (steps[i].rebuild !== "ran" || frame < reached)
    return { count: first, fresh: false, dumping: 0 };
  const dumping = interpolate(frame, [reached, reached + DUMP], [0, 1], clamp);
  if (frame < reached + DUMP) return { count: PACKAGES, fresh: false, dumping };
  const refill = Math.max(
    0,
    Math.min(PACKAGES, Math.floor((frame - reached - DUMP) / REFILL_EVERY)),
  );
  return { count: refill, fresh: true, dumping: 0 };
};

const CHIP = 17;
const CHIP_GAP = 4;
const CHIP_COLUMNS = 17;

const Chips: React.FC<{
  count: number;
  fresh: boolean;
  dumping: number;
  pulse: number;
}> = ({ count, fresh, dumping, pulse }) => {
  let d = "";
  for (let n = 0; n < count; n++) {
    const x = (n % CHIP_COLUMNS) * (CHIP + CHIP_GAP);
    const y = Math.floor(n / CHIP_COLUMNS) * (CHIP + CHIP_GAP);
    d += `M${x} ${y + dumping * 60}h${CHIP}v${CHIP}h-${CHIP}z`;
  }
  const width = CHIP_COLUMNS * (CHIP + CHIP_GAP) - CHIP_GAP;
  return (
    <svg
      width={width}
      height={4 * (CHIP + CHIP_GAP)}
      style={{ position: "absolute", left: 14, top: 46, overflow: "visible" }}
    >
      <path
        d={d}
        fill={fresh ? ACCENT : GRAY}
        opacity={(fresh ? 1 : 0.7) * (1 - dumping)}
      />
      {pulse > 0 ? (
        <path
          d={d}
          fill="none"
          stroke={theme.colors.white}
          strokeWidth={1.5}
          opacity={pulse}
        />
      ) : null}
    </svg>
  );
};

const Tower: React.FC<{
  steps: readonly Step[];
  x: number;
  from: number;
  title: string;
  moved: number;
}> = ({ steps, x, from, title, moved }) => {
  const frame = useCurrentFrame();
  const install = installAt(frame, steps, from);
  const checking = steps.findIndex(
    (_, i) => frame >= stepAt(from, i) && frame < stepAt(from, i) + STEP_EVERY,
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: 398,
          width: TOWER_WIDTH,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: theme.colors.grayLight,
        }}
      >
        {title}
      </div>
      {steps.map((step, i) => {
        const shown = interpolate(
          frame,
          [slabAt(i), slabAt(i) + 8],
          [0, 1],
          EASE_OUT,
        );
        if (shown <= 0) return null;
        const reached = frame >= stepAt(from, i);
        const ran = reached && step.rebuild === "ran";
        const cached = reached && step.rebuild === "cached";
        const isCodeCopy = step.text === "COPY . .";
        const highlight = isCodeCopy ? moved : 0;
        const pulse =
          step.install && cached
            ? interpolate(
                frame,
                [stepAt(from, i), stepAt(from, i) + 14],
                [1, 0],
                clamp,
              )
            : 0;
        const status = !reached
          ? frame < 0 || shown < 1
            ? ""
            : "built"
          : step.rebuild === "base"
            ? "base image"
            : cached
              ? "cached"
              : step.inputs?.includes(CHANGED)
                ? "input changed"
                : "ran again";
        return (
          <div
            key={step.text}
            style={{
              position: "absolute",
              left: x,
              top: rowTop(steps, i),
              width: TOWER_WIDTH,
              height: step.install ? INSTALL_ROW : ROW,
              opacity: shown,
              transform: `translateY(${(1 - shown) * -14}px)`,
              boxSizing: "border-box",
              borderRadius: 10,
              border: `${ran || highlight > 0 ? 2 : 1}px solid ${
                ran || highlight > 0 ? ACCENT : "rgba(255, 255, 255, 0.14)"
              }`,
              background: ran ? "#1D140E" : "#0D1115",
              boxShadow:
                checking === i ? `0 0 0 3px ${theme.colors.white}55` : "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 16,
                fontFamily: MONO,
                fontSize: 21,
                fontWeight: 700,
                color: ran ? ACCENT : theme.colors.chalk,
                whiteSpace: "pre",
              }}
            >
              {step.text}
            </div>
            <div
              style={{
                position: "absolute",
                right: 14,
                top: 18,
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: ran ? 700 : 500,
                color: ran
                  ? ACCENT
                  : cached
                    ? theme.colors.grayLight
                    : theme.colors.grayDark,
              }}
            >
              {status}
            </div>
            {step.install ? (
              <>
                <Chips
                  count={install.count}
                  fresh={install.fresh}
                  dumping={install.dumping}
                  pulse={pulse}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    bottom: 10,
                    fontFamily: MONO,
                    fontSize: 17,
                    color: install.fresh ? ACCENT : theme.colors.grayDark,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {install.count} of {PACKAGES}{" "}
                  {install.fresh ? "reinstalled" : "packages"} · {step.bytes}
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

/** What each rebuild cost. */
const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 10],
    [0, 1],
    EASE_OUT,
  );
  if (shown <= 0) return null;
  const packages = Math.round(
    interpolate(frame, [VERDICT_FROM, VERDICT_FROM + 20], [0, PACKAGES], clamp),
  );
  const cell = (x: number, big: string, small: string, lit: boolean) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: VERDICT_TOP,
        width: TOWER_WIDTH,
        textAlign: "center",
        opacity: shown,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 38,
          fontWeight: 700,
          color: lit ? ACCENT : theme.colors.chalk,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {big}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: MONO,
          fontSize: 18,
          color: theme.colors.grayLight,
        }}
      >
        {small}
      </div>
    </div>
  );
  return (
    <>
      {cell(
        TOWER_X[0],
        `${INSTALL_LAYER} + ${CODE_LAYER}`,
        `rebuilt · ${packages} packages reinstalled`,
        true,
      )}
      {cell(TOWER_X[1], CODE_LAYER, "rebuilt · 0 packages reinstalled", false)}
    </>
  );
};

/** The one line that changed, as a diff. */
const Diff: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = interpolate(
    frame,
    [DIFF_FROM, DIFF_FROM + 10],
    [0, 1],
    EASE_OUT,
  );
  if (shown <= 0) return null;
  const typed = Math.max(0, Math.floor((frame - TYPE_FROM) / TYPE_EVERY));
  return (
    <div
      style={{
        position: "absolute",
        left: TOWER_X[0],
        top: DIFF_TOP,
        width: TOWER_X[1] + TOWER_WIDTH - TOWER_X[0],
        height: 132,
        opacity: shown,
        boxSizing: "border-box",
        padding: "12px 18px",
        borderRadius: 12,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        background: "#0D1115",
        fontFamily: MONO,
      }}
    >
      <div
        style={{ display: "flex", fontSize: 17, color: theme.colors.grayDark }}
      >
        <span style={{ flex: 1, color: theme.colors.chalk, fontWeight: 700 }}>
          server.js
        </span>
        <span>line {LINE_NUMBER}, the only change</span>
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 25,
          color: theme.colors.grayDark,
          whiteSpace: "pre",
        }}
      >
        -{LINE_BEFORE}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 25,
          fontWeight: 700,
          color: ACCENT,
          whiteSpace: "pre",
        }}
      >
        +{frame >= TYPE_FROM ? LINE_AFTER.slice(0, typed) : ""}
      </div>
    </div>
  );
};

/** The line that moved: the same COPY . ., above the install or below it. */
const Moved: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0) return null;
  const from = {
    x: TOWER_X[0] + TOWER_WIDTH,
    y: rowTop(CODE_FIRST, 2) + ROW / 2,
  };
  const to = { x: TOWER_X[1], y: rowTop(PACKAGES_FIRST, 4) + ROW / 2 };
  const mid = (from.x + to.x) / 2;
  const d = `M${from.x} ${from.y} C${mid} ${from.y} ${mid} ${to.y} ${to.x} ${to.y}`;
  /** A point on that curve, so the line itself can be carried along it. */
  const point = (t: number) => {
    const u = 1 - t;
    const bez = (a: number, b: number, c: number, e: number) =>
      u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * e;
    return {
      x: bez(from.x, mid, mid, to.x),
      y: bez(from.y, from.y, to.y, to.y),
    };
  };
  const length = 420;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <path
        d={d}
        fill="none"
        stroke={ACCENT}
        strokeWidth={4}
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
        strokeLinecap="round"
      />
      {progress >= 1 ? (
        <circle cx={to.x} cy={to.y} r={7} fill={ACCENT} />
      ) : null}
      {progress > 0 && progress < 1 ? (
        <g transform={`translate(${point(progress).x} ${point(progress).y})`}>
          <rect
            x={-62}
            y={-19}
            width={124}
            height={38}
            rx={8}
            fill="#1D140E"
            stroke={ACCENT}
            strokeWidth={2}
          />
          <text
            x={0}
            y={7}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={19}
            fontWeight={700}
            fill={ACCENT}
          >
            COPY . .
          </text>
        </g>
      ) : null}
    </svg>
  );
};

export const DockerLayers: React.FC = () => {
  const frame = useCurrentFrame();
  const moved = interpolate(
    frame,
    [MOVE_FROM, MOVE_FROM + MOVE],
    [0, 1],
    EASE_IN_OUT,
  );
  return (
    <>
      <Eyebrow top={242}>Docker build cache</Eyebrow>
      <Headline top={268} size={58}>
        Same app. One line changed.
      </Headline>
      <Headline top={326} size={58} color={ACCENT}>
        One reinstalls {PACKAGES} packages.
      </Headline>

      <Tower
        steps={CODE_FIRST}
        x={TOWER_X[0]}
        from={LEFT_FROM}
        title="code first"
        moved={moved}
      />
      <Tower
        steps={PACKAGES_FIRST}
        x={TOWER_X[1]}
        from={RIGHT_FROM}
        title="packages first"
        moved={moved}
      />
      <Files steps={CODE_FIRST} x={TOWER_X[0]} from={LEFT_FROM} />
      <Files steps={PACKAGES_FIRST} x={TOWER_X[1]} from={RIGHT_FROM} />
      <Cascade steps={CODE_FIRST} x={TOWER_X[0]} from={LEFT_FROM} />
      <Cascade steps={PACKAGES_FIRST} x={TOWER_X[1]} from={RIGHT_FROM} />
      <Moved progress={moved} />
      <Verdict />
      <Diff />

      <div
        style={{
          position: "absolute",
          left: TOWER_X[0],
          top: DIFF_TOP + 146,
          width: TOWER_X[1] + TOWER_WIDTH - TOWER_X[0],
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 16,
          color: theme.colors.grayDark,
        }}
      >
        {CONDITIONS}
      </div>
    </>
  );
};
