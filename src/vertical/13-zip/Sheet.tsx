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
import { FOLDER } from "./measurements";
import { MEMBERS, runsOf, seatOf } from "./lz77";
import {
  CYCLES,
  FIRE,
  FIRINGS,
  SHOWN_FROM,
  collapsedAt,
  drainAt,
  headAt,
  memberAt,
} from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const channel = (hex: string, at: number) =>
  parseInt(hex.slice(at, at + 2), 16);

/**
 * Chalk to accent, across the frames a stretch takes to fire.
 *
 * A copied stretch has to look like ordinary text until the head reaches it.
 * Colouring it on load put most of the file in accent from frame zero, gave the
 * answer away before the mechanism ran, and left almost nothing neutral on
 * screen for the accent to mean anything against.
 */
const blend = (from: string, to: string, t: number) => {
  const channels = [0, 1, 2].map((i) =>
    Math.round(mix(channel(from, 1 + i * 2), channel(to, 1 + i * 2), t)),
  );
  return `rgb(${channels.join(",")})`;
};

/** What a copied stretch shrinks to: a stub, roughly a character and a half. */
const STUB = 21;

/** How long an arc stays up. Shorter than one file's sweep can afford to be. */
const ARC_LIFE = 18;

const x = (column: number) => column * CHAR_W;
const rowTop = (line: number) => line * LINE_H;
const mid = (line: number) => rowTop(line) + LINE_H / 2;

/** Where everything that survived the collapse ends up: the archive's bar. */
const DRAIN_X = 62;
const DRAIN_Y = BAR_TWO_TOP + BAR_HEIGHT / 2 - SHEET_TOP;

const drainTransform = (px: number, py: number, t: number) => {
  if (t <= 0) return undefined;
  const eased = t * t * (3 - 2 * t);
  const dx = (DRAIN_X - px) * eased;
  const dy = (DRAIN_Y - py) * eased;
  const scale = 1 - 0.75 * eased;
  return `translate(${dx}, ${dy}) translate(${px}, ${py}) scale(${scale}) translate(${-px}, ${-py})`;
};

/**
 * The file being compressed, as an object rather than a readout.
 *
 * One member at a time, because that is how a zip works. The head runs through
 * it once, and when it reaches a stretch it has seen *in this file* it lights
 * and throws an arc back to the earlier copy. Then the member collapses onto
 * what the encoder kept, drains into the archive, and the next file comes up
 * with nothing behind it.
 *
 * No arc ever crosses a file boundary, and that is not a simplification. A zip
 * compresses each member against its own window, so the second file genuinely
 * cannot point at the first, however similar they look. Watching the ticking
 * start again from nothing is the truest thing in the cut.
 */
export const Sheet: React.FC = () => {
  const frame = useCurrentFrame();
  const index = memberAt(frame);
  const member = MEMBERS[index];
  const cycle = CYCLES[index];

  const head = headAt(frame);
  const collapse = collapsedAt(frame, index);
  const reading = frame >= cycle.readFrom - 4 && frame <= cycle.readTo;
  const seat = seatOf(member, Math.min(head, member.bytes - 1));

  /** The card swaps in when its member takes over. */
  const arrival = clamp((frame - SHOWN_FROM[index]) / 8);

  const lit = (copyIndex: number) => {
    const fired = FIRINGS.find(
      (f) => f.member === index && f.at === member.copies[copyIndex].at,
    );
    return fired ? clamp((frame - fired.frame) / FIRE) : 0;
  };

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

      {/*
        The header names the member being compressed and which of the folder's
        files it is, so the sheet and the folder bar under it are visibly the
        same job. The size is the file's own and does not change: zipping does
        not shrink the original, it writes an archive beside it.
      */}
      <g opacity={arrival}>
        <text
          x={COLUMN_LEFT}
          y={HEADER_BASELINE}
          fontFamily={theme.monoFamily}
          fontSize={26}
          fontWeight={500}
          fill={theme.colors.grayDark}
        >
          {FOLDER}/{member.name}
        </text>
        <text
          x={COLUMN_LEFT + COLUMN_WIDTH}
          y={HEADER_BASELINE}
          textAnchor="end"
          fontFamily={theme.monoFamily}
          fontSize={26}
          fontWeight={600}
          fill={theme.colors.chalk}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {member.bytes.toLocaleString("en-US")} bytes
        </text>
      </g>

      <g
        transform={`translate(${COLUMN_LEFT}, ${SHEET_TOP})`}
        opacity={arrival}
      >
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
        {member.copies.map((copy, c) => {
          const on = lit(c);
          if (on <= 0) return null;
          return runsOf(member, copy.at, copy.length).map((run, r) => {
            const full = (run.to - run.from) * CHAR_W;
            const width = mix(full, Math.min(STUB, full), collapse);
            const gone = drainAt(frame, index, run.line);
            return (
              <rect
                key={`band-${c}-${r}`}
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
          The file, put back.

          Zipping does not consume what it reads, and draining the sheet with
          nothing left over read as the file having been deleted. As each line
          leaves for the archive the original line fades back in underneath it,
          plain and neutral, because the mechanism has finished arguing by then.
        */}
        {member.segments.map((segment, s) => {
          const back = drainAt(frame, index, segment.line);
          if (back <= 0) return null;
          return (
            <text
              key={`back-${s}`}
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
              {member.lines[segment.line].slice(segment.from, segment.to)}
            </text>
          );
        })}

        {/* The text. One node per stretch that shares an owner. */}
        {member.segments.map((segment, s) => {
          const copied = segment.copy >= 0;
          const on = copied ? lit(segment.copy) : 0;
          const gone = drainAt(frame, index, segment.line);
          const base = copied
            ? mix(0.78, 1, on) * (1 - collapse)
            : mix(0.78, 1, collapse);
          return (
            <text
              key={`text-${s}`}
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
              {member.lines[segment.line].slice(segment.from, segment.to)}
            </text>
          );
        })}

        {/* The arc back to the earlier copy. This is the whole mechanism. */}
        {FIRINGS.filter((f) => f.member === index).map((fired, f) => {
          const age = frame - fired.frame;
          if (age < 0 || age > ARC_LIFE) return null;
          const draw = clamp(age / 8);
          const fade = 1 - clamp((age - 10) / (ARC_LIFE - 10));

          const to = seatOf(member, fired.at);
          const from = seatOf(member, fired.source);
          const x1 = x(to.column) + CHAR_W / 2;
          const y1 = mid(to.line);
          const x2 = x(from.column) + CHAR_W / 2;
          const y2 = mid(from.line);
          const bow = 34 + Math.abs(y1 - y2) * 0.3;
          const d = `M ${x1} ${y1} Q ${Math.min(x1, x2) - bow} ${(y1 + y2) / 2} ${x2} ${y2}`;

          return (
            <g key={`arc-${f}`} opacity={fade}>
              {/* A dark halo, so the arc separates from the text it crosses. */}
              <path
                d={d}
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
                d={d}
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
              {runsOf(member, fired.source, fired.length).map((run, r) => (
                <rect
                  key={`src-${f}-${r}`}
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
