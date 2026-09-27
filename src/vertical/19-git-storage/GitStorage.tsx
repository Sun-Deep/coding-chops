import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { RAIL_EDGE } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import {
  COMMIT2_CMD,
  COPY,
  COPY1_FROM,
  COPY1_LANDS,
  COPY2_FROM,
  COPY2_LANDS,
  COUNT,
  CRUSH,
  CRUSH_FROM,
  DIFF_AT,
  DIFF_CMD,
  EDIT_EVERY,
  EDIT_FROM,
  GC_CMD,
  PACK_CMD,
  PACK_LINE_EVERY,
  PACK_LINES_FROM,
  REBUILD_FROM,
  REBUILD_TYPE,
  SAME_FROM,
  SAME_TO,
  sweptAt,
  TYPE_EVERY,
} from "./beats";
import { AFTER, BEFORE } from "./file";
import {
  CHANGED_LINE,
  CONDITIONS,
  FILE_BYTES,
  LINES,
  PACKED,
  V1,
  V2,
} from "./measurements";

/** Lines the two copies share, counted rather than assumed. */
const SAME_LINES = BEFORE.filter((l, k) => l === AFTER[k]).length;
if (SAME_LINES !== LINES - 1)
  throw new Error("the copies differ by more than one line");

const EASE_IN_OUT = { ...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1) };
const MONO = theme.monoFamily;

/** Where things sit. Everything below y 1000 stays left of the action rail. */
const FILE_LEFT = 150;
const FILE_WIDTH = 320;
const TOP = 432;
const HEADER = 40;
const TEXT_TOP = TOP + HEADER;
const TEXT_HEIGHT = 528;

const STORE_LEFT = 496;
const STORE_WIDTH = 434;
const LABEL = 30;
const BLOCK_WIDTH = STORE_WIDTH - 24;
/** Pixels per byte on disk, so a block's height is its size. */
const PX_PER_BYTE = 220 / V1.onDisk;
const V1_TOP = TOP + HEADER + 8;
const GAP = 18;

const TERM_TOP = 1_070;
const TERM_HEIGHT = 222;
const TERM_LEFT = 150;
const TERM_WIDTH = 780;

if (
  STORE_LEFT + STORE_WIDTH > RAIL_EDGE ||
  TERM_LEFT + TERM_WIDTH > RAIL_EDGE
) {
  throw new Error("the frame runs under the platform action rail");
}

/** Line 80 as it stands at `frame`, typed over one character at a time. */
const line80At = (frame: number) => {
  const before = BEFORE[CHANGED_LINE - 1];
  const after = AFTER[CHANGED_LINE - 1];
  const start = before.indexOf("= ") + 2;
  const typed = Math.max(
    0,
    Math.min(43, Math.floor((frame - EDIT_FROM) / EDIT_EVERY)),
  );
  return after.slice(0, start + typed) + before.slice(start + typed);
};

const linesAt = (frame: number): readonly string[] =>
  frame < EDIT_FROM
    ? BEFORE
    : BEFORE.map((l, k) => (k + 1 === CHANGED_LINE ? line80At(frame) : l));

/**
 * A copy of the file, squeezed to whatever box it is drawn in.
 *
 * Real lines, not a texture: at the file's own size the text is small but
 * true, and squeezed into a block it becomes the grain of the block while the
 * changed line still shows as the one line in the accent.
 */
const FileText: React.FC<{
  lines: readonly string[];
  width: number;
  height: number;
  lit: boolean;
  dim?: number;
}> = ({ lines, width, height, lit, dim = 1 }) => {
  const font = width / 64 / 0.6;
  const spacing = font * 1.25;
  const squeeze = height / (lines.length * spacing);
  return (
    <svg
      width={width}
      height={Math.max(1, height)}
      style={{ display: "block", overflow: "hidden" }}
    >
      <g transform={`scale(1 ${squeeze})`}>
        {lines.map((l, k) => {
          const changed = lit && k + 1 === CHANGED_LINE;
          return (
            <text
              key={k}
              x={0}
              y={(k + 1) * spacing - font * 0.25}
              fontFamily={MONO}
              fontSize={font}
              fontWeight={changed ? 700 : 400}
              fill={changed ? ACCENT : "#8C939C"}
              opacity={changed ? 1 : 0.55 * dim}
              xmlSpace="preserve"
            >
              {l}
            </text>
          );
        })}
        {lit ? (
          <rect
            x={0}
            y={(CHANGED_LINE - 1) * spacing}
            width={width}
            height={spacing}
            fill={ACCENT}
            opacity={0.18}
          />
        ) : null}
      </g>
    </svg>
  );
};

const count = (frame: number, from: number, to: number) =>
  Math.round(interpolate(frame, [from, from + COUNT], [0, to], clamp));

const n = (v: number) => v.toLocaleString("en-US");

/** The working copy on the left. */
const WorkingFile: React.FC = () => {
  const frame = useCurrentFrame();
  const edited = frame >= EDIT_FROM;
  return (
    <div
      style={{
        position: "absolute",
        left: FILE_LEFT,
        top: TOP,
        width: FILE_WIDTH,
        height: HEADER + TEXT_HEIGHT + 12,
        borderRadius: 14,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        background: "#0D1115",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: HEADER,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          fontFamily: MONO,
          fontSize: 19,
          color: theme.colors.chalk,
        }}
      >
        <span style={{ flex: 1, fontWeight: 700 }}>config.txt</span>
        <span style={{ color: theme.colors.grayDark, fontSize: 16 }}>
          {n(FILE_BYTES)} B
        </span>
      </div>
      <FileText
        lines={linesAt(frame)}
        width={FILE_WIDTH}
        height={TEXT_HEIGHT}
        lit={edited}
      />
      {edited ? (
        <div
          style={{
            position: "absolute",
            right: 8,
            top: HEADER + ((CHANGED_LINE - 0.5) / LINES) * TEXT_HEIGHT - 15,
            padding: "3px 8px",
            borderRadius: 6,
            background: ACCENT,
            color: theme.colors.black,
            fontFamily: MONO,
            fontSize: 17,
            fontWeight: 700,
            opacity: interpolate(
              frame,
              [EDIT_FROM, EDIT_FROM + 6],
              [0, 1],
              clamp,
            ),
          }}
        >
          line {CHANGED_LINE}
        </div>
      ) : null}
    </div>
  );
};

type Placement = { left: number; top: number; width: number; height: number };

const FILE_BOX: Placement = {
  left: FILE_LEFT,
  top: TEXT_TOP,
  width: FILE_WIDTH,
  height: TEXT_HEIGHT,
};

/** A copy crossing from the file to its place in the store. */
const Flying: React.FC<{
  from: number;
  to: Placement;
  lines: readonly string[];
  lit: boolean;
}> = ({ from, to, lines, lit }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, from + COPY], [0, 1], EASE_IN_OUT);
  if (t <= 0 || t >= 1) return null;
  const at = (k: keyof Placement) =>
    interpolate(t, [0, 1], [FILE_BOX[k], to[k]]);
  return (
    <div
      style={{
        position: "absolute",
        left: at("left"),
        top: at("top"),
        width: at("width"),
        height: at("height"),
        border: `2px solid ${ACCENT}`,
        borderRadius: 6,
        background: "#11161B",
        boxShadow: "0 16px 30px #00000088",
        overflow: "hidden",
      }}
    >
      <FileText
        lines={lines}
        width={at("width")}
        height={at("height")}
        lit={lit}
      />
    </div>
  );
};

/** `.git/objects`: every copy git has kept, drawn to scale. */
const Store: React.FC = () => {
  const frame = useCurrentFrame();
  const crush = interpolate(
    frame,
    [CRUSH_FROM, CRUSH_FROM + CRUSH],
    [0, 1],
    EASE_IN_OUT,
  );
  const v1Height =
    interpolate(crush, [0, 1], [V1.onDisk, PACKED.v1Delta]) * PX_PER_BYTE;
  const v1Shown = frame >= COPY1_LANDS;
  const v2Shown = frame >= COPY2_LANDS;
  const v2Top = V1_TOP + LABEL + Math.max(4, v1Height) + GAP;
  const v2Height =
    interpolate(crush, [0, 1], [V2.onDisk, PACKED.v2Whole]) * PX_PER_BYTE;

  const total =
    (v1Shown
      ? crush > 0
        ? Math.round(interpolate(crush, [0, 1], [V1.onDisk, PACKED.v1Delta]))
        : count(frame, COPY1_LANDS, V1.onDisk)
      : 0) +
    (v2Shown
      ? crush > 0
        ? Math.round(interpolate(crush, [0, 1], [V2.onDisk, PACKED.v2Whole]))
        : count(frame, COPY2_LANDS, V2.onDisk)
      : 0);

  const label = (top: number, children: React.ReactNode) => (
    <div
      style={{
        position: "absolute",
        left: STORE_LEFT + 12,
        top,
        width: BLOCK_WIDTH,
        height: LABEL,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: MONO,
        fontSize: 18,
        color: theme.colors.grayLight,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );

  const block = (
    top: number,
    height: number,
    lines: readonly string[],
    lit: boolean,
  ) => (
    <div
      style={{
        position: "absolute",
        left: STORE_LEFT + 12,
        top,
        width: BLOCK_WIDTH,
        height: Math.max(4, height),
        borderRadius: 4,
        background: "#11161B",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        overflow: "hidden",
      }}
    >
      <FileText
        lines={lines}
        width={BLOCK_WIDTH}
        height={Math.max(4, height)}
        lit={lit}
      />
    </div>
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: STORE_LEFT,
          top: TOP,
          width: STORE_WIDTH,
          height: 578,
          borderRadius: 14,
          border: "1px dashed rgba(255, 255, 255, 0.16)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: STORE_LEFT + 14,
          top: TOP,
          width: STORE_WIDTH - 28,
          height: HEADER,
          display: "flex",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 19,
          color: theme.colors.chalk,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ flex: 1, fontWeight: 700 }}>.git/objects</span>
        <span
          style={{
            color: crush > 0 ? ACCENT : theme.colors.chalk,
            fontWeight: 700,
          }}
        >
          {n(total)} B
        </span>
      </div>

      {v1Shown
        ? label(
            V1_TOP,
            crush < 0.5 ? (
              <>
                <span style={{ color: theme.colors.chalk, fontWeight: 700 }}>
                  v1
                </span>
                <span>whole file</span>
                <span style={{ marginLeft: "auto" }}>
                  {n(count(frame, COPY1_LANDS, V1.onDisk))} B
                </span>
              </>
            ) : (
              <>
                <span style={{ color: theme.colors.chalk, fontWeight: 700 }}>
                  v1
                </span>
                <span style={{ color: ACCENT }}>delta against v2</span>
                <span
                  style={{
                    marginLeft: "auto",
                    color: ACCENT,
                    fontWeight: 700,
                    fontSize: 24,
                  }}
                >
                  {n(
                    Math.round(
                      interpolate(crush, [0, 1], [V1.onDisk, PACKED.v1Delta]),
                    ),
                  )}{" "}
                  B
                </span>
              </>
            ),
          )
        : null}
      {v1Shown ? block(V1_TOP + LABEL, v1Height, BEFORE, false) : null}

      {v2Shown
        ? label(
            v2Top,
            <>
              <span style={{ color: theme.colors.chalk, fontWeight: 700 }}>
                v2
              </span>
              <span>
                {crush >= 0.5
                  ? "kept whole"
                  : frame >= SAME_FROM
                    ? `${Math.min(SAME_LINES, sweptAt(frame, LINES) - (sweptAt(frame, LINES) >= CHANGED_LINE ? 1 : 0))} of ${LINES} lines same as v1`
                    : "whole file, again"}
              </span>
              <span style={{ marginLeft: "auto" }}>
                {n(
                  crush > 0
                    ? Math.round(
                        interpolate(crush, [0, 1], [V2.onDisk, PACKED.v2Whole]),
                      )
                    : count(frame, COPY2_LANDS, V2.onDisk),
                )}{" "}
                B
              </span>
            </>,
          )
        : null}
      {v2Shown ? block(v2Top + LABEL, v2Height, AFTER, true) : null}
      <Sweep v1Top={V1_TOP + LABEL} v2Top={v2Top + LABEL} height={v2Height} />
      <Rebuild top={v2Top + LABEL + v2Height + 20} />
    </>
  );
};

/** One line across both copies, moving down them together. */
const Sweep: React.FC<{ v1Top: number; v2Top: number; height: number }> = ({
  v1Top,
  v2Top,
  height,
}) => {
  const frame = useCurrentFrame();
  // Gone the moment the sweep is, or it parks on the last line and reads as a
  // cursor waiting for input. VR16 shipped a cover that way.
  if (frame < SAME_FROM || frame >= SAME_TO) return null;
  const p = sweptAt(frame, LINES) / LINES;
  const bar = (top: number) => (
    <div
      style={{
        position: "absolute",
        left: STORE_LEFT + 8,
        top: top + p * height - 1,
        width: BLOCK_WIDTH + 8,
        height: 3,
        background: theme.colors.white,
        boxShadow: "0 0 10px #FFFFFF88",
      }}
    />
  );
  return (
    <>
      {bar(v1Top)}
      {bar(v2Top)}
    </>
  );
};

/** What the delta holds: take v2 and put the old line 80 back. */
const Rebuild: React.FC<{ top: number }> = ({ top }) => {
  const frame = useCurrentFrame();
  const shown = interpolate(
    frame,
    [REBUILD_FROM, REBUILD_FROM + 8],
    [0, 1],
    clamp,
  );
  if (shown <= 0) return null;
  const old = BEFORE[CHANGED_LINE - 1];
  const value = old.slice(old.indexOf("= ") + 2, old.indexOf(" #"));
  const typed = Math.floor(
    interpolate(
      frame,
      [REBUILD_FROM + 6, REBUILD_FROM + REBUILD_TYPE],
      [0, 16],
      clamp,
    ),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: STORE_LEFT + 12,
        top,
        width: BLOCK_WIDTH,
        opacity: shown,
        padding: "12px 14px",
        boxSizing: "border-box",
        borderRadius: 10,
        border: `1px solid ${ACCENT}`,
        background: "#1A130E",
        fontFamily: MONO,
        color: theme.colors.chalk,
      }}
    >
      <div style={{ fontSize: 18, color: theme.colors.grayLight }}>
        to rebuild v1:
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
        take v2, put back line {CHANGED_LINE}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginTop: 6,
          color: ACCENT,
          whiteSpace: "pre",
        }}
      >
        = {value.slice(0, typed)}
        {typed >= 16 ? "…" : ""}
      </div>
    </div>
  );
};

type Entry = {
  at: number;
  text: string;
  kind: "cmd" | "out" | "minus" | "plus";
};

const ENTRIES: readonly Entry[] = [
  { at: -40, text: 'git commit -m "add config"', kind: "cmd" },
  { at: DIFF_CMD, text: "git diff", kind: "cmd" },
  { at: DIFF_AT, text: `-${BEFORE[CHANGED_LINE - 1]}`, kind: "minus" },
  { at: DIFF_AT + 4, text: `+${AFTER[CHANGED_LINE - 1]}`, kind: "plus" },
  { at: COMMIT2_CMD, text: 'git commit -m "change line 80"', kind: "cmd" },
  { at: GC_CMD, text: "git gc", kind: "cmd" },
  { at: PACK_CMD, text: "git verify-pack -v", kind: "cmd" },
  {
    at: PACK_LINES_FROM,
    text: `${V2.id.slice(0, 7)} blob  ${FILE_BYTES}  ${PACKED.v2Whole}`,
    kind: "out",
  },
  {
    at: PACK_LINES_FROM + PACK_LINE_EVERY,
    text: `${V1.id.slice(0, 7)} blob     ${PACKED.v1DeltaData}    ${PACKED.v1Delta}  … ${V2.id.slice(0, 7)}`,
    kind: "plus",
  },
];

const VISIBLE = 5;
const ROW = 34;
const TERM_FONT = Math.floor((TERM_WIDTH - 36) / 66 / 0.6);

/** The commands and what git printed, the last five lines of it. */
const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = ENTRIES.filter((e) => frame >= e.at);
  const rows = shown.slice(-VISIBLE);
  return (
    <div
      style={{
        position: "absolute",
        left: TERM_LEFT,
        top: TERM_TOP,
        width: TERM_WIDTH,
        height: TERM_HEIGHT,
        borderRadius: 14,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        background: "#0D1115",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 18,
          top: 10,
          fontFamily: MONO,
          fontSize: 14,
          color: theme.colors.grayDark,
        }}
      >
        {CONDITIONS}
      </div>
      {rows.map((e, i) => {
        const typed =
          e.kind === "cmd"
            ? e.text.slice(
                0,
                Math.max(0, Math.floor((frame - e.at) / TYPE_EVERY)),
              )
            : e.text;
        const color =
          e.kind === "plus"
            ? ACCENT
            : e.kind === "minus"
              ? theme.colors.grayDark
              : theme.colors.chalk;
        return (
          <div
            key={`${e.at}-${e.text}`}
            style={{
              position: "absolute",
              left: 18,
              top: 36 + i * ROW,
              fontFamily: MONO,
              fontSize: e.kind === "cmd" ? 22 : TERM_FONT,
              fontWeight: e.kind === "cmd" ? 600 : 700,
              whiteSpace: "pre",
              color,
            }}
          >
            {e.kind === "cmd" ? (
              <>
                <span style={{ color: ACCENT }}>$ </span>
                {typed}
              </>
            ) : (
              typed
            )}
          </div>
        );
      })}
    </div>
  );
};

export const GitStorage: React.FC = () => {
  const frame = useCurrentFrame();
  const v1To: Placement = {
    left: STORE_LEFT + 12,
    top: V1_TOP + LABEL,
    width: BLOCK_WIDTH,
    height: V1.onDisk * PX_PER_BYTE,
  };
  const v2To: Placement = {
    left: STORE_LEFT + 12,
    top: V1_TOP + LABEL + V1.onDisk * PX_PER_BYTE + GAP + LABEL,
    width: BLOCK_WIDTH,
    height: V2.onDisk * PX_PER_BYTE,
  };
  return (
    <>
      <Eyebrow top={242}>How git stores a change</Eyebrow>
      <Headline top={268} size={58}>
        Change one line.
      </Headline>
      <Headline top={326} size={58} color={ACCENT}>
        Git stores the whole file.
      </Headline>

      <WorkingFile />
      <Store />
      <Terminal />
      <Flying from={COPY1_FROM} to={v1To} lines={BEFORE} lit={false} />
      <Flying from={COPY2_FROM} to={v2To} lines={linesAt(frame)} lit />
    </>
  );
};
