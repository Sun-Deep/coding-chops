import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import {
  BAR_HEIGHT,
  BAR_TWO_TOP,
  BASELINE,
  CARD_BOTTOM,
  CARD_TOP,
  CHAR_SIZE,
  CHAR_W,
  COLUMN_LEFT,
  COLUMN_WIDTH,
  HEADER_BASELINE,
  HEADER_H,
  LINE_H,
  PAD,
  SHEET_TOP,
} from "./layout";
import { BYTES, LINES, TEXT } from "./measurements";
import { COPIES, SEGMENTS, runsOf, seatOf } from "./lz77";
import { FIRE, FIRINGS, READ_TO, collapsedAt, drainAt, headAt } from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const channel = (hex: string, at: number) =>
  parseInt(hex.slice(at, at + 2), 16);

/**
 * Chalk to accent, across the frames a stretch takes to fire.
 *
 * A copied stretch has to look like ordinary text until the head reaches it.
 * Colouring it on load put most of the file in accent from frame zero, which
 * gave the answer away before the mechanism had run and left almost nothing
 * neutral on screen for the accent to mean anything against.
 */
const blend = (from: string, to: string, t: number) => {
  const channels = [0, 1, 2].map((i) =>
    Math.round(mix(channel(from, 1 + i * 2), channel(to, 1 + i * 2), t)),
  );
  return `rgb(${channels.join(",")})`;
};

/** What a copied stretch shrinks to: a stub, roughly a character and a half. */
const STUB = 21;

/** How long an arc stays up after it is thrown. */
const ARC_LIFE = 26;

const x = (column: number) => column * CHAR_W;
const rowTop = (line: number) => line * LINE_H;
const mid = (line: number) => rowTop(line) + LINE_H / 2;

/**
 * Where everything that survived the collapse ends up.
 *
 * The filled part of the zip bar, in the sheet's own coordinates, because that
 * is the file the bytes are going into.
 */
const DRAIN_X = COLUMN_LEFT + 62 - COLUMN_LEFT;
const DRAIN_Y = BAR_TWO_TOP + BAR_HEIGHT / 2 - SHEET_TOP;

/** A drained element, falling toward the zip and shrinking as it goes. */
const drainTransform = (px: number, py: number, t: number) => {
  if (t <= 0) return undefined;
  const eased = t * t * (3 - 2 * t);
  const dx = (DRAIN_X - px) * eased;
  const dy = (DRAIN_Y - py) * eased;
  const scale = 1 - 0.75 * eased;
  return `translate(${dx}, ${dy}) translate(${px}, ${py}) scale(${scale}) translate(${-px}, ${-py})`;
};

/**
 * The file, as an object rather than a readout.
 *
 * Everything in this cut happens on one sheet of text. The head runs through it
 * once, left to right and top to bottom, the way the encoder does. When it
 * reaches a stretch it has seen before, that stretch lights and throws an arc
 * back to the earlier copy it matched, so the claim is made by the picture
 * before the narration says it: this is the same text again.
 *
 * Then it collapses. Every lit stretch contracts to a stub and its characters
 * go, and the size in the file's own header falls with them. Up to that point
 * the viewer is told the repeats are redundant. Here they watch them leave, and
 * the number that changes is the file's, not a caption's.
 */
export const Sheet: React.FC = () => {
  const frame = useCurrentFrame();
  const head = headAt(frame);
  const collapse = collapsedAt(frame);
  const reading = frame <= READ_TO;
  const seat = seatOf(Math.min(head, TEXT.length - 1));

  const lit = (index: number) => clamp((frame - FIRINGS[index].frame) / FIRE);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* The card the file is written on. */}
      <rect
        x={COLUMN_LEFT - PAD}
        y={CARD_TOP}
        width={COLUMN_WIDTH + PAD * 2}
        height={CARD_BOTTOM - CARD_TOP}
        rx={18}
        fill={theme.colors.blackSoft}
        stroke="#23252C"
        strokeWidth={2}
      />
      <line
        x1={COLUMN_LEFT - PAD}
        y1={CARD_TOP + HEADER_H}
        x2={COLUMN_LEFT + COLUMN_WIDTH + PAD}
        y2={CARD_TOP + HEADER_H}
        stroke="#23252C"
        strokeWidth={2}
      />

      {/* The header: the file's name, and the file's size. */}
      <text
        x={COLUMN_LEFT}
        y={HEADER_BASELINE}
        fontFamily={theme.monoFamily}
        fontSize={27}
        fontWeight={500}
        fill={theme.colors.grayDark}
      >
        server.log
      </text>
      {/*
        The source keeps its size for the whole cut. Zipping a file does not
        shrink it, it writes a second file, and the first version of this header
        counted down from 1,035 to 177 as though the log itself had got smaller.
        The number that falls belongs on the zip, which is where it is now.
      */}
      <text
        x={COLUMN_LEFT + COLUMN_WIDTH}
        y={HEADER_BASELINE}
        textAnchor="end"
        fontFamily={theme.monoFamily}
        fontSize={31}
        fontWeight={600}
        fill={theme.colors.chalk}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {BYTES.toLocaleString("en-US")} bytes
      </text>

      <g transform={`translate(${COLUMN_LEFT}, ${SHEET_TOP})`}>
        {/* The row the head is on, so the eye knows where to be. */}
        {reading ? (
          <rect
            x={-PAD + 6}
            y={rowTop(seat.line) + 2}
            width={COLUMN_WIDTH + PAD * 2 - 12}
            height={LINE_H - 4}
            rx={6}
            fill="#FFFFFF"
            opacity={0.045}
          />
        ) : null}

        {/* Every copy the head has passed, as a band under its characters. */}
        {COPIES.map((copy, index) => {
          const on = lit(index);
          if (on <= 0) return null;
          return runsOf(copy.at, copy.length).map((run, r) => {
            const full = (run.to - run.from) * CHAR_W;
            const width = mix(full, Math.min(STUB, full), collapse);
            const gone = drainAt(frame, run.line, LINES.length);
            return (
              <rect
                key={`band-${index}-${r}`}
                x={x(run.from)}
                y={rowTop(run.line) + 3}
                width={mix(full * 0.3, width, on)}
                height={LINE_H - 6}
                rx={5}
                fill={ACCENT}
                opacity={
                  (mix(0.15, 0.3, on) + collapse * 0.55) * (1 - gone ** 2)
                }
                transform={drainTransform(
                  x(run.from),
                  rowTop(run.line) + LINE_H / 2,
                  gone,
                )}
              />
            );
          });
        })}

        {/*
          The log, put back.

          Zipping a file does not consume it, and draining the sheet into the
          zip with nothing left over ended the cut on an empty card, which reads
          as the log having been deleted. So as each line leaves for the zip,
          the original line fades back in underneath it, plain and neutral,
          because the mechanism has finished arguing by then.

          The last frame is then the true one: the log exactly as it was, and a
          copy of it a sixth of the size sitting under it. It also keeps the
          closing seconds moving, which is what the frozen-frame check wanted.
        */}
        {SEGMENTS.map((segment, index) => {
          const back = drainAt(frame, segment.line, LINES.length);
          if (back <= 0) return null;
          return (
            <text
              key={`back-${index}`}
              x={x(segment.from)}
              y={rowTop(segment.line) + BASELINE}
              textLength={(segment.to - segment.from) * CHAR_W}
              lengthAdjust="spacing"
              fontFamily={theme.monoFamily}
              fontSize={CHAR_SIZE}
              fill={theme.colors.chalk}
              opacity={0.5 * back}
              style={{ whiteSpace: "pre" }}
            >
              {LINES[segment.line].slice(segment.from, segment.to)}
            </text>
          );
        })}

        {/* The text. One node per stretch that shares an owner. */}
        {SEGMENTS.map((segment, index) => {
          const text = LINES[segment.line].slice(segment.from, segment.to);
          const copied = segment.copy >= 0;
          const on = copied ? lit(segment.copy) : 0;
          const gone = drainAt(frame, segment.line, LINES.length);
          const base = copied
            ? mix(0.78, 1, on) * (1 - collapse)
            : mix(0.78, 1, collapse);
          return (
            <text
              key={`text-${index}`}
              x={x(segment.from)}
              y={rowTop(segment.line) + BASELINE}
              textLength={(segment.to - segment.from) * CHAR_W}
              lengthAdjust="spacing"
              fontFamily={theme.monoFamily}
              fontSize={CHAR_SIZE}
              fill={blend(theme.colors.chalk, ACCENT, on)}
              opacity={base * (1 - gone ** 2)}
              transform={drainTransform(
                x(segment.from),
                rowTop(segment.line) + LINE_H / 2,
                gone,
              )}
              style={{ whiteSpace: "pre" }}
            >
              {text}
            </text>
          );
        })}

        {/* The arc back to the earlier copy. This is the whole mechanism. */}
        {FIRINGS.map((fired, index) => {
          const age = frame - fired.frame;
          if (age < 0 || age > ARC_LIFE) return null;
          const draw = clamp(age / 10);
          const fade = 1 - clamp((age - 14) / (ARC_LIFE - 14));

          const to = seatOf(fired.at);
          const from = seatOf(fired.source);
          const x1 = x(to.column) + CHAR_W / 2;
          const y1 = mid(to.line);
          const x2 = x(from.column) + CHAR_W / 2;
          const y2 = mid(from.line);
          const bow = 34 + Math.abs(y1 - y2) * 0.3;

          return (
            <g key={`arc-${index}`} opacity={fade}>
              {/* A dark halo, so the arc separates from the text it crosses. */}
              <path
                d={`M ${x1} ${y1} Q ${Math.min(x1, x2) - bow} ${(y1 + y2) / 2} ${x2} ${y2}`}
                fill="none"
                stroke={theme.colors.black}
                strokeWidth={9}
                strokeLinecap="round"
                opacity={0.85}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw}
              />
              <path
                d={`M ${x1} ${y1} Q ${Math.min(x1, x2) - bow} ${(y1 + y2) / 2} ${x2} ${y2}`}
                fill="none"
                stroke={ACCENT}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw}
              />
              <circle cx={x2} cy={y2} r={draw >= 1 ? 4.5 : 0} fill={ACCENT} />
              {/* Where it landed: the text this stretch is a copy of. */}
              {runsOf(fired.source, fired.length).map((run, r) => (
                <rect
                  key={`src-${index}-${r}`}
                  x={x(run.from) - 1}
                  y={rowTop(run.line) + 3}
                  width={(run.to - run.from) * CHAR_W + 2}
                  height={LINE_H - 6}
                  rx={5}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={1.5}
                  opacity={draw * 0.85}
                />
              ))}
            </g>
          );
        })}

        {/* The head. */}
        {reading ? (
          <rect
            x={x(seat.column) - 1.5}
            y={rowTop(seat.line) + 2}
            width={3}
            height={LINE_H - 4}
            rx={1.5}
            fill={theme.colors.chalk}
          />
        ) : null}
      </g>
    </svg>
  );
};
