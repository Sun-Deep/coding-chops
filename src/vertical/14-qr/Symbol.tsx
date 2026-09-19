import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import {
  MODULE,
  QUIET,
  RESULT_HEIGHT,
  RESULT_TOP,
  SYMBOL_LEFT,
  SYMBOL_TOP,
  SYMBOL_WIDTH,
} from "./layout";
import { GRID, HERO, SIZE, TEXT } from "./measurements";
import { holeRect, inHole } from "./grid";
import {
  HOLE_TO,
  SCANS_FROM,
  holeAt,
  rebuiltAt,
  rebuiltBy,
  typedBy,
} from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Frames the scan line takes to cross the symbol. */
const SWEEP = 22;

/**
 * The QR code itself.
 *
 * Dark modules on a light plate with a quiet zone, which is what a QR code is.
 * Drawn chalk-on-black it would be on brand and it would stop looking like the
 * thing everybody recognises, and recognising it instantly is the entire reason
 * this topic was picked.
 *
 * The hole opens a ring at a time rather than growing smoothly, because the
 * number the band underneath is claiming is countable and so the picture should
 * be countable too. Eleven steps, eleven cues, ending on a square the viewer
 * can measure against the grid it sits in.
 */
export const Symbol: React.FC = () => {
  const frame = useCurrentFrame();
  const side = holeAt(frame);
  const { from, to } = holeRect(side);

  // The blanked modules, in reading order, so the rebuild fills like text.
  const missing: { x: number; y: number }[] = [];
  for (let y = from; y < to; y++) {
    for (let x = from; x < to; x++) missing.push({ x, y });
  }
  const rebuilt = rebuiltAt(frame);

  const plate = SYMBOL_WIDTH + QUIET * 2;
  const x0 = SYMBOL_LEFT - QUIET;
  const y0 = SYMBOL_TOP - QUIET;

  // The moment of truth: a line crosses the damaged code and it reads anyway.
  const sweep = clamp((frame - HOLE_TO - 2) / SWEEP);
  const sweeping = sweep > 0 && sweep < 1;
  const scanned = clamp((frame - SCANS_FROM) / 8);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* The plate, with its quiet zone. */}
      <rect
        x={x0}
        y={y0}
        width={plate}
        height={plate}
        rx={16}
        fill={theme.colors.paper}
      />

      {/* Every module. */}
      {GRID.map((row, y) =>
        [...row].map((cell, x) => {
          if (cell !== "1") return null;
          if (inHole(x, y, side) && rebuilt <= 0) return null;
          if (inHole(x, y, side)) {
            const i = missing.findIndex((m) => m.x === x && m.y === y);
            if (!rebuiltBy(i, missing.length, frame)) return null;
          }
          return (
            <rect
              key={`m-${x}-${y}`}
              x={SYMBOL_LEFT + x * MODULE}
              y={SYMBOL_TOP + y * MODULE}
              width={MODULE + 0.5}
              height={MODULE + 0.5}
              fill={theme.colors.ink}
            />
          );
        }),
      )}

      {/* The hole, outlined so it reads as removed rather than as white space. */}
      {side > 0 ? (
        <rect
          x={SYMBOL_LEFT + from * MODULE}
          y={SYMBOL_TOP + from * MODULE}
          width={(to - from) * MODULE}
          height={(to - from) * MODULE}
          fill="none"
          stroke={ACCENT}
          strokeWidth={4}
          strokeDasharray="10 7"
          opacity={1 - rebuilt}
        />
      ) : null}

      {/* The scan. */}
      {sweeping ? (
        <>
          <rect
            x={x0}
            y={y0 + sweep * plate - 3}
            width={plate}
            height={6}
            fill={ACCENT}
            opacity={0.9}
          />
          <rect
            x={x0}
            y={y0}
            width={plate}
            height={sweep * plate}
            fill={ACCENT}
            opacity={0.12}
          />
        </>
      ) : null}

      {/*
        It read, and what it read.

        One strip under the code rather than a badge inside it. The badge sat on
        modules the cut later shows healing, and the decoded text above the plate
        ran straight through the headline.
      */}
      {scanned > 0 ? (
        <g opacity={scanned}>
          <rect
            x={SYMBOL_LEFT}
            y={RESULT_TOP}
            width={SYMBOL_WIDTH}
            height={RESULT_HEIGHT}
            rx={10}
            fill={ACCENT}
          />
          <text
            x={SYMBOL_LEFT + 18}
            y={RESULT_TOP + 31}
            fontFamily={theme.monoFamily}
            fontSize={25}
            fontWeight={700}
            fill={theme.colors.black}
          >
            STILL SCANS
          </text>
          <text
            x={SYMBOL_LEFT + SYMBOL_WIDTH - 18}
            y={RESULT_TOP + 31}
            textAnchor="end"
            fontFamily={theme.monoFamily}
            fontSize={25}
            fontWeight={500}
            fill={theme.colors.black}
          >
            {TEXT.slice(0, typedBy(frame, TEXT.length))}
          </text>
        </g>
      ) : null}

      {/* The grid the hole is measured against, once it has stopped growing. */}
      {side >= HERO.hole ? (
        <text
          x={SYMBOL_LEFT + from * MODULE + ((to - from) * MODULE) / 2}
          y={SYMBOL_TOP + from * MODULE + ((to - from) * MODULE) / 2 + 12}
          textAnchor="middle"
          fontFamily={theme.monoFamily}
          fontSize={34}
          fontWeight={700}
          fill={theme.colors.ink}
          opacity={clamp((frame - HOLE_TO) / 10) * 0.55 * (1 - rebuilt)}
        >
          {HERO.hole} x {HERO.hole}
        </text>
      ) : null}
    </svg>
  );
};

/** `SIZE` is re-exported so the band can label the grid without a second import. */
export const GRID_SIZE = SIZE;
