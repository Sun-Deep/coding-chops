import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import {
  CLIMB_TO,
  COUNT_FROM,
  COUNT_TO,
  DIGIT_EVERY,
  DIGITS_FROM,
  flyStart,
  handedDigit,
  landedAt,
  NOTE_AT,
  NUMBERS_FROM,
  OUTPUT_AT,
  pointedRow,
  PROOF_FROM,
  SWAP,
  SWAP_FROM,
  TRIPLETS_FROM,
  TYPE_EVERY,
  TYPE_FROM,
} from "./beats";
import {
  column,
  digitOf,
  FILE,
  FOLDER,
  INSIDE,
  KEYS,
  TRIPLETS,
  type Column,
  type ColumnKey,
} from "./columns";
import {
  ADVANCE,
  BAND_TOP,
  COLUMN_LEFT,
  COLUMN_WIDTH,
  GRID_CELL,
  GRID_COLUMNS,
  GRID_GAP,
  LINE_FONT,
  LINE_TOP,
  MEANING_LEFT,
  PROOF_FONT,
  rowTop,
  STRIP_HEIGHT,
  STRIP_LEFT,
  STRIP_PAD,
  STRIP_TOP,
  STRIP_WIDTH,
  TOKEN_FONT,
} from "./layout";
import {
  CONDITIONS,
  FILE_COMMAND,
  FILE_LINE,
  FOLDER_COMMAND,
  FOLDER_LINE,
  FOLDER_SIZE,
  INSIDE_COMMAND,
  INSIDE_LINE,
  INSIDE_SIZE,
  USR_FOLDERS,
  USR_FOLDERS_4096,
} from "./measurements";

const EASE_IN_OUT = { ...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1) };
const EASE_OUT = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };

const MONO = theme.monoFamily;
const DIM = "#5E6670";

/** What each column is, said plainly. The note under it can change with the line. */
const MEANING: Record<
  ColumnKey,
  { label: string; file: string; folder: string }
> = {
  mode: {
    label: "type, then chmod",
    file: "- means a file",
    folder: "d means a folder",
  },
  links: {
    label: "links",
    file: "names pointing at it",
    folder: "names pointing at it",
  },
  owner: {
    label: "owner",
    file: "gets the first rwx",
    folder: "gets the first rwx",
  },
  group: {
    label: "group",
    file: "gets the middle rwx",
    folder: "gets the middle rwx",
  },
  size: { label: "size in bytes", file: "what is in the file", folder: "" },
  date: {
    label: "last changed",
    file: "the year instead, after 6 months",
    folder: "the year instead, after 6 months",
  },
  name: { label: "name", file: "", folder: "" },
};

/**
 * The command, set in the monospace. In Inter a lowercase l is drawn like a
 * capital I, and the first render's headline read "Is -l".
 */
export const Command: React.FC = () => (
  <span
    style={{
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: "0.9em",
      letterSpacing: "-0.03em",
      marginRight: "0.18em",
    }}
  >
    ls -l
  </span>
);

/** How far the file has turned into the folder, 0 to 1. */
const swapAt = (frame: number) =>
  interpolate(frame, [SWAP_FROM, SWAP_FROM + SWAP], [0, 1], EASE_IN_OUT);

/** Which column is being looked at on this frame, if any. */
const activeKey = (frame: number): ColumnKey | null => {
  for (let i = KEYS.length - 1; i >= 0; i--) {
    if (frame >= flyStart(i) && frame < landedAt(i) + 12) return KEYS[i];
  }
  const handed = handedDigit(frame);
  if (handed === 0) return "owner";
  if (handed === 1) return "group";
  const pointed = pointedRow(frame);
  if (pointed >= 0) return KEYS[pointed];
  if (frame >= SWAP_FROM) return "size";
  return null;
};

/** One line of ls output, with one column lit. */
const Line: React.FC<{
  line: string;
  cols: readonly Column[];
  lit: ColumnKey | null;
  font: number;
}> = ({ line, cols, lit, font }) => {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  cols.forEach((c) => {
    if (c.at > cursor) parts.push(line.slice(cursor, c.at));
    parts.push(
      <span
        key={c.key}
        style={{ color: c.key === lit ? ACCENT : theme.colors.chalk }}
      >
        {c.text}
      </span>,
    );
    cursor = c.at + c.text.length;
  });
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: font,
        fontWeight: 600,
        whiteSpace: "pre",
        lineHeight: 1,
      }}
    >
      {parts}
    </div>
  );
};

/** The terminal, holding the real line for the whole cut. */
const Strip: React.FC = () => {
  const frame = useCurrentFrame();
  const s = swapAt(frame);
  const lit = activeKey(frame);
  const place = {
    position: "absolute" as const,
    left: STRIP_PAD,
    top: LINE_TOP - STRIP_TOP,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: STRIP_LEFT,
        top: STRIP_TOP,
        width: STRIP_WIDTH,
        height: STRIP_HEIGHT,
        overflow: "hidden",
        borderRadius: 14,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        background: "#0D1115",
        boxShadow: "0 12px 26px #00000055",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: STRIP_PAD,
          right: STRIP_PAD,
          top: 12,
          display: "flex",
          fontFamily: MONO,
          fontSize: 17,
          color: theme.colors.grayDark,
        }}
      >
        <span style={{ flex: 1 }}>
          <span style={{ color: ACCENT }}>$</span>{" "}
          {s < 0.5 ? FILE_COMMAND : FOLDER_COMMAND}
        </span>
        <span style={{ fontSize: 15 }}>{CONDITIONS}</span>
      </div>
      <div
        style={{
          ...place,
          opacity: interpolate(s, [0, 0.5], [1, 0], clamp),
          transform: `translateY(${-s * 30}px)`,
        }}
      >
        <Line line={FILE_LINE} cols={FILE} lit={lit} font={LINE_FONT} />
      </div>
      <div
        style={{
          ...place,
          opacity: interpolate(s, [0.5, 1], [0, 1], clamp),
          transform: `translateY(${(1 - s) * 30}px)`,
        }}
      >
        <Line line={FOLDER_LINE} cols={FOLDER} lit={lit} font={LINE_FONT} />
      </div>
    </div>
  );
};

/** A token in flight from the line down to its row. */
const Flying: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {FILE.map((c, i) => {
        const t = interpolate(
          frame,
          [flyStart(i), landedAt(i)],
          [0, 1],
          EASE_IN_OUT,
        );
        if (t <= 0 || t >= 1) return null;
        const fromX = STRIP_LEFT + STRIP_PAD + c.at * LINE_FONT * ADVANCE;
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: interpolate(t, [0, 1], [fromX, COLUMN_LEFT]),
              top: interpolate(t, [0, 1], [LINE_TOP, rowTop(i) + 8]),
              fontFamily: MONO,
              fontSize: interpolate(t, [0, 1], [LINE_FONT, TOKEN_FONT]),
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: "pre",
              color: ACCENT,
              // Later tokens cross rows that have already landed on the way
              // down, and without a backing the two sets of text overlap.
              background: "rgba(9, 11, 14, 0.94)",
              padding: "3px 6px",
              margin: "-3px -6px",
              borderRadius: 6,
            }}
          >
            {c.text}
          </div>
        );
      })}
    </>
  );
};

/** The key. Seven rows, one per column, the thing a viewer keeps. */
const Rows: React.FC = () => {
  const frame = useCurrentFrame();
  const s = swapAt(frame);
  const lit = activeKey(frame);
  const note = interpolate(frame, [NOTE_AT, NOTE_AT + 10], [0, 1], clamp);

  return (
    <>
      {KEYS.map((key, i) => {
        const landed = interpolate(
          frame,
          [landedAt(i), landedAt(i) + 8],
          [0, 1],
          clamp,
        );
        if (landed <= 0) return null;
        const before = column(FILE, key);
        const after = column(FOLDER, key);
        const changes = before !== after;
        const on = lit === key;
        const meaning = MEANING[key];
        const tokenStyle = {
          position: "absolute" as const,
          left: 0,
          top: 8,
          fontFamily: MONO,
          fontSize: TOKEN_FONT,
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: "pre" as const,
          color: on ? ACCENT : theme.colors.chalk,
        };
        const noteText = s < 0.5 ? meaning.file : meaning.folder;
        return (
          <div
            key={key}
            style={{
              position: "absolute",
              left: COLUMN_LEFT,
              top: rowTop(i),
              width: COLUMN_WIDTH,
              height: 70,
              overflow: "hidden",
              borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
            }}
          >
            {changes ? (
              <>
                <div
                  style={{
                    ...tokenStyle,
                    opacity: interpolate(s, [0, 0.5], [1, 0], clamp),
                    transform: `translateY(${-s * 44}px)`,
                  }}
                >
                  {before}
                </div>
                <div
                  style={{
                    ...tokenStyle,
                    opacity: interpolate(s, [0.5, 1], [0, 1], clamp),
                    transform: `translateY(${(1 - s) * 44}px)`,
                  }}
                >
                  {after}
                </div>
              </>
            ) : (
              <div style={tokenStyle}>{before}</div>
            )}
            <div
              style={{
                position: "absolute",
                left: MEANING_LEFT - COLUMN_LEFT,
                top: 4,
                opacity: landed,
                fontFamily: theme.fontFamily,
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: on ? theme.colors.chalk : theme.colors.grayLight,
              }}
            >
              {meaning.label}
            </div>
            <div
              style={{
                position: "absolute",
                left: MEANING_LEFT - COLUMN_LEFT,
                top: 40,
                opacity: landed,
                fontFamily: MONO,
                fontSize: 20,
                color: theme.colors.grayDark,
              }}
            >
              {key === "size" && note > 0 ? (
                <span style={{ color: ACCENT, opacity: note, fontWeight: 700 }}>
                  its list of names
                </span>
              ) : (
                noteText
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

/** chmod's digits, lifted out of the mode. The callback to VR12. */
const Digits: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const drop = interpolate(
    frame,
    [TRIPLETS_FROM, TRIPLETS_FROM + 16],
    [0, 1],
    EASE_IN_OUT,
  );
  const width = COLUMN_WIDTH / 3;
  return (
    <div style={{ opacity: opacity * drop }}>
      {TRIPLETS.map((t, k) => {
        const shown = interpolate(
          frame,
          [DIGITS_FROM + k * DIGIT_EVERY, DIGITS_FROM + k * DIGIT_EVERY + 8],
          [0, 1],
          EASE_OUT,
        );
        const left = COLUMN_LEFT + k * width;
        const bits = [4, 2, 1].map((v, b) => (t[b] === "-" ? 0 : v));
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left,
              top: BAND_TOP,
              width,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 50,
                fontWeight: 700,
                color: theme.colors.chalk,
                transform: `translateY(${(1 - drop) * -120}px)`,
              }}
            >
              {t}
            </div>
            <div
              style={{
                marginTop: 14,
                opacity: shown,
                fontFamily: MONO,
                fontSize: 86,
                fontWeight: 700,
                lineHeight: 1,
                color: ACCENT,
                transform: `scale(${(0.7 + 0.3 * shown) * (handedDigit(frame) === k ? 1.12 : 1)})`,
              }}
            >
              {digitOf(t)}
            </div>
            <div
              style={{
                marginTop: 12,
                opacity: shown,
                fontFamily: MONO,
                fontSize: 22,
                color: theme.colors.grayDark,
              }}
            >
              {bits.join(" + ")}
            </div>
            <div
              style={{
                marginTop: 6,
                opacity: shown,
                fontFamily: MONO,
                fontSize: 20,
                fontWeight: 700,
                color:
                  handedDigit(frame) === k ? ACCENT : theme.colors.grayDark,
              }}
            >
              {["owner", "group", "everyone"][k]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Every folder in Debian's /usr, one square each. */
const Count: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const shown = Math.round(
    interpolate(frame, [COUNT_FROM, COUNT_TO], [0, USR_FOLDERS], clamp),
  );
  const says4096 = Math.min(shown, USR_FOLDERS_4096);
  const rows = Math.ceil(USR_FOLDERS / GRID_COLUMNS);
  const gridWidth = GRID_COLUMNS * (GRID_CELL + GRID_GAP) - GRID_GAP;
  const left = COLUMN_LEFT + (COLUMN_WIDTH - gridWidth) / 2;
  const top = BAND_TOP + 46;
  let d4096 = "";
  let dOther = "";
  for (let n = 0; n < shown; n++) {
    const x = (n % GRID_COLUMNS) * (GRID_CELL + GRID_GAP);
    const y = Math.floor(n / GRID_COLUMNS) * (GRID_CELL + GRID_GAP);
    const cell = `M${x} ${y}h${GRID_CELL}v${GRID_CELL}h-${GRID_CELL}z`;
    if (n < USR_FOLDERS_4096) d4096 += cell;
    else dOther += cell;
  }
  return (
    <div style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          left: COLUMN_LEFT,
          top: BAND_TOP,
          width: COLUMN_WIDTH,
          display: "flex",
          alignItems: "baseline",
          fontFamily: MONO,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ flex: 1, fontSize: 21, color: theme.colors.grayLight }}>
          folders in Debian&apos;s /usr
        </span>
        <span style={{ fontSize: 30, fontWeight: 700, color: ACCENT }}>
          {says4096} of {USR_FOLDERS}
        </span>
        <span
          style={{
            fontSize: 21,
            color: theme.colors.grayLight,
            marginLeft: 10,
          }}
        >
          say {FOLDER_SIZE}
        </span>
      </div>
      <svg
        width={gridWidth}
        height={rows * (GRID_CELL + GRID_GAP)}
        style={{ position: "absolute", left, top }}
        aria-label={`${says4096} of ${USR_FOLDERS} folders say ${FOLDER_SIZE}`}
      >
        <path d={d4096} fill={ACCENT} />
        <path d={dOther} fill={DIM} />
      </svg>
    </div>
  );
};

/** The folder's contents, listed, and the two numbers side by side. */
const Proof: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const typed = Math.max(0, Math.floor((frame - TYPE_FROM) / TYPE_EVERY));
  const command = INSIDE_COMMAND.slice(0, typed);
  const output = interpolate(frame, [OUTPUT_AT, OUTPUT_AT + 6], [0, 1], clamp);
  const numbers = interpolate(
    frame,
    [NUMBERS_FROM, NUMBERS_FROM + 10],
    [0, 1],
    EASE_OUT,
  );
  const climbed = Math.round(
    interpolate(frame, [NUMBERS_FROM, CLIMB_TO], [0, INSIDE_SIZE], {
      ...clamp,
      easing: Easing.bezier(0.3, 0, 0.7, 1),
    }),
  );
  const half = COLUMN_WIDTH / 2;
  const figure = (
    value: string,
    label: string,
    color: string,
    left: number,
  ) => (
    <div
      style={{
        position: "absolute",
        left,
        top: BAND_TOP + 128,
        width: half,
        textAlign: "center",
        opacity: numbers,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1,
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: MONO,
          fontSize: 20,
          color: theme.colors.grayLight,
        }}
      >
        {label}
      </div>
    </div>
  );
  return (
    <div style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          left: COLUMN_LEFT,
          top: BAND_TOP,
          width: COLUMN_WIDTH,
          height: 96,
          borderRadius: 14,
          border: "1px solid rgba(255, 255, 255, 0.14)",
          background: "#0D1115",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: STRIP_PAD,
            top: 12,
            fontFamily: MONO,
            fontSize: 17,
            color: theme.colors.grayDark,
          }}
        >
          <span style={{ color: ACCENT }}>$</span> {command}
        </div>
        <div
          style={{
            position: "absolute",
            left: STRIP_PAD,
            top: 50,
            opacity: output,
          }}
        >
          <Line line={INSIDE_LINE} cols={INSIDE} lit="size" font={PROOF_FONT} />
        </div>
      </div>
      {figure(
        FOLDER_SIZE.toLocaleString("en-US"),
        "the folder says",
        ACCENT,
        COLUMN_LEFT,
      )}
      {figure(
        climbed.toLocaleString("en-US"),
        "what is inside it",
        theme.colors.chalk,
        COLUMN_LEFT + half,
      )}
    </div>
  );
};

export const Listing: React.FC = () => {
  const frame = useCurrentFrame();
  const digits = interpolate(
    frame,
    [SWAP_FROM - 4, SWAP_FROM + 6],
    [1, 0],
    clamp,
  );
  const count =
    interpolate(frame, [COUNT_FROM - 10, COUNT_FROM], [0, 1], clamp) *
    interpolate(frame, [PROOF_FROM - 4, PROOF_FROM + 4], [1, 0], clamp);
  const proof = interpolate(frame, [PROOF_FROM, PROOF_FROM + 6], [0, 1], clamp);

  return (
    <>
      <Eyebrow top={242}>Reading ls -l</Eyebrow>
      <Headline top={268} size={58}>
        <Command /> is seven columns.
      </Headline>
      <Headline top={326} size={58} color={ACCENT}>
        4096 isn&apos;t what&apos;s inside.
      </Headline>

      <Strip />
      <Rows />
      <Flying />

      {frame < SWAP_FROM + 8 ? <Digits opacity={digits} /> : null}
      {count > 0 ? <Count opacity={count} /> : null}
      {proof > 0 ? <Proof opacity={proof} /> : null}
    </>
  );
};
