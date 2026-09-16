import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { cellsPath, rowOf } from "./draw";
import {
  ADVANCE,
  FIELD_HEIGHT,
  FIELD_TOP,
  FIELD_WIDTH,
  FONT_SIZE,
  LINE_HEIGHT,
  PAD,
  PANEL_HEIGHT,
  PANEL_WIDTH,
} from "./grid";
import { COLS, LENGTH, PATTERN, ROWS } from "./measurements";
import { TEXT, type Matcher } from "./search";

/** The page itself. Dim, so a read character is the thing that stands out. */
const INK = "#79838E";

/**
 * Looked-at ground, oldest first.
 *
 * The highlight is the point and it is deliberately the highlight a reader
 * already knows: this is what Ctrl+F does to a page. A character the matcher
 * looked at is lit and one it never looked at is not, so a panel at the end of
 * the sweep is a picture of how much of the page that matcher needed.
 *
 * Banded by when rather than drawn in one colour, so the sweep has a warm
 * leading edge and the panels are not six identical wipes. One hue: the ramp
 * runs neutral to accent and nothing else on the page has a colour.
 */
const BANDS = 8;
const COLD = [0x39, 0x43, 0x4f] as const;
const HOT = [0xff, 0x7a, 0x33] as const;

const BAND_FILLS = Array.from({ length: BANDS }, (_, i) => {
  const t = (i / (BANDS - 1)) ** 2.8;
  const c = COLD.map((v, k) => Math.round(v + (HOT[k] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
});

export const TextPanel: React.FC<{
  matcher: Matcher;
  left: number;
  top: number;
  /** Reads consumed so far, from the shared sweep. */
  reads: number;
  opacity?: number;
}> = ({ matcher, left, top, reads, opacity = 1 }) => {
  const { touchedAt, hits } = matcher.playback;

  const bands: number[][] = Array.from({ length: BANDS }, () => []);
  let seen = 0;
  for (let i = 0; i < LENGTH; i++) {
    const at = touchedAt[i];
    if (at < 0 || at >= reads) continue;
    seen++;
    const band = Math.min(
      BANDS - 1,
      Math.floor(((at + 1) / Math.max(1, reads)) * BANDS),
    );
    bands[band].push(i);
  }

  const found = hits.filter((h) => touchedAt[h] >= 0 && touchedAt[h] < reads);
  const hitCells: number[] = [];
  for (const h of found) {
    for (let k = 0; k < PATTERN.length; k++) hitCells.push(h + k);
  }

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        opacity,
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        background: "linear-gradient(150deg, #12161B 0%, #090B0E 100%)",
        boxShadow: "0 14px 30px #0000004A",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PAD + 2,
          top: 12,
          fontFamily: theme.monoFamily,
          fontSize: 21,
          fontWeight: 700,
          color: theme.colors.chalk,
        }}
      >
        {matcher.name}
      </div>
      <div
        style={{
          position: "absolute",
          right: PAD + 2,
          top: 16,
          fontFamily: theme.monoFamily,
          fontSize: 15,
          fontWeight: 500,
          color: theme.colors.grayDark,
        }}
      >
        {matcher.note}
      </div>

      <svg
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
        viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
        style={{ position: "absolute", inset: 0 }}
        aria-label={`${matcher.name}, ${seen} characters looked at`}
      >
        <g transform={`translate(${PAD} ${FIELD_TOP})`}>
          <rect
            x={0}
            y={0}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            fill="#0B0E12"
          />
          {bands.map((cells, i) =>
            cells.length ? (
              <path
                key={i}
                d={cellsPath(cells, ADVANCE, LINE_HEIGHT)}
                fill={BAND_FILLS[i]}
                opacity={0.82}
              />
            ) : null,
          )}
          <path d={cellsPath(hitCells, ADVANCE, LINE_HEIGHT)} fill={ACCENT} />
          {Array.from({ length: ROWS }, (_, row) => (
            <text
              key={row}
              x={0}
              y={row * LINE_HEIGHT + FONT_SIZE * 0.78}
              fill={INK}
              fontFamily={theme.monoFamily}
              fontSize={FONT_SIZE}
              xmlSpace="preserve"
            >
              {rowOf(TEXT, row)}
            </text>
          ))}
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: PAD + 2,
          bottom: 12,
          fontFamily: theme.monoFamily,
          fontSize: 21,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: theme.colors.chalk,
        }}
      >
        {seen.toLocaleString()}
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: theme.colors.grayDark,
            marginLeft: 5,
          }}
        >
          of {COLS * ROWS} read
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: PAD + 2,
          bottom: 14,
          fontFamily: theme.monoFamily,
          fontSize: 17,
          fontWeight: 700,
          color: ACCENT,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {found.length}/3 found
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          height: 6,
          background: "#1C2128",
        }}
      >
        <div
          style={{
            width: (seen / LENGTH) * PANEL_WIDTH,
            height: 6,
            background: ACCENT,
          }}
        />
      </div>
    </div>
  );
};
