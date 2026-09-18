import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import {
  BAR_HEIGHT,
  BAR_LABEL_ONE,
  BAR_LABEL_TWO,
  BAR_ONE_TOP,
  BAR_TWO_TOP,
  COLUMN_LEFT,
  COLUMN_WIDTH,
} from "./layout";
import { BYTES, DEFLATE, RATIO } from "./measurements";
import { outputAt } from "./lz77";
import { DRAIN_FROM, DRAIN_TO, RATIO_FROM, READ_TO, headAt } from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const n = (v: number) => Math.round(v).toLocaleString("en-US");

/**
 * The zipper glyph.
 *
 * Small and drawn rather than lettered, because `.zip` on its own is a file
 * extension and the row has to read as a zip being made at a glance. Two rows
 * of teeth either side of a closed seam, with the pull below it.
 */
const ZipMark: React.FC<{ x: number; y: number; on: number }> = ({
  x,
  y,
  on,
}) => (
  <g transform={`translate(${x}, ${y})`} opacity={0.35 + on * 0.65}>
    <rect
      x={0}
      y={0}
      width={24}
      height={28}
      rx={5}
      fill="none"
      stroke={ACCENT}
      strokeWidth={2}
    />
    {[6, 11, 16, 21].map((ty) => (
      <g key={ty}>
        <rect x={4} y={ty} width={5} height={2} rx={1} fill={ACCENT} />
        <rect x={15} y={ty} width={5} height={2} rx={1} fill={ACCENT} />
      </g>
    ))}
    <rect x={11} y={4} width={2} height={22} rx={1} fill={ACCENT} />
  </g>
);

type BarProps = {
  labelTop: number;
  barTop: number;
  name: string;
  size: string;
  filled: number;
  accent: boolean;
  glyph?: boolean;
  /** Written into the empty end of the track, once there is a point to it. */
  note?: string;
  noteOn?: number;
  /** Lifts while the sheet is emptying into this file. */
  glow?: number;
};

const Bar: React.FC<BarProps> = ({
  labelTop,
  barTop,
  name,
  size,
  filled,
  accent,
  glyph,
  note,
  noteOn = 0,
  glow = 0,
}) => {
  const width = Math.max(0, filled) * COLUMN_WIDTH;
  const textX = COLUMN_LEFT + (glyph ? 34 : 0);
  return (
    <>
      <text
        x={textX}
        y={labelTop + 20}
        fontFamily={theme.monoFamily}
        fontSize={25}
        fontWeight={500}
        fill={accent ? ACCENT : theme.colors.grayDark}
      >
        {name}
      </text>
      <text
        x={COLUMN_LEFT + COLUMN_WIDTH}
        y={labelTop + 20}
        textAnchor="end"
        fontFamily={theme.monoFamily}
        fontSize={25}
        fontWeight={600}
        fill={accent ? ACCENT : theme.colors.chalk}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {size}
      </text>
      {glyph ? <ZipMark x={COLUMN_LEFT} y={labelTop - 3} on={1} /> : null}

      <rect
        x={COLUMN_LEFT}
        y={barTop}
        width={COLUMN_WIDTH}
        height={BAR_HEIGHT}
        rx={7}
        fill="#15171C"
        stroke="#23252C"
        strokeWidth={2}
      />
      {glow > 0 ? (
        <rect
          x={COLUMN_LEFT - 5}
          y={barTop - 5}
          width={width + 10}
          height={BAR_HEIGHT + 10}
          rx={11}
          fill={ACCENT}
          opacity={glow * 0.3}
        />
      ) : null}
      <rect
        x={COLUMN_LEFT}
        y={barTop}
        width={width}
        height={BAR_HEIGHT}
        rx={7}
        fill={accent ? ACCENT : theme.colors.grayDark}
        opacity={accent ? 1 : 0.7}
      />
      {note ? (
        <text
          x={COLUMN_LEFT + COLUMN_WIDTH - 16}
          y={barTop + BAR_HEIGHT / 2 + 7}
          textAnchor="end"
          fontFamily={theme.monoFamily}
          fontSize={21}
          fontWeight={600}
          fill={ACCENT}
          opacity={noteOn}
        >
          {note}
        </text>
      ) : null}
    </>
  );
};

/**
 * The two files, to the same scale.
 *
 * Without this the cut showed a log being marked up and never showed a zip
 * being made, which is what the whole thing is supposed to be about. Here the
 * source fills as the head reads it and the zip fills as the encoder writes it,
 * against the same 1,035 byte track, so the lower bar stopping a sixth of the
 * way along is the claim.
 *
 * The zip's length at every point is a real `deflateRaw` of the file up to
 * there rather than a line drawn between the two ends. What that buys is the
 * shape: the first three samples grow one for one with the source, and then the
 * file grows thirty bytes and the zip does not move at all, because the whole
 * of the second line was already on the first. A fitted curve would have drawn
 * a smooth ramp and thrown away the only moment where the mechanism is visible
 * in the bar itself.
 *
 * The ratio is written into the empty end of the lower track, so the number
 * sits in the space it is describing.
 */
export const ZipTarget: React.FC = () => {
  const frame = useCurrentFrame();
  const head = Math.min(headAt(frame), BYTES);
  const written = outputAt(head);
  const done = frame >= READ_TO;

  // The zip lights while the sheet is emptying into it, so the two halves of
  // the frame are visibly the same event rather than two things happening.
  const landing =
    clamp((frame - DRAIN_FROM) / 10) *
    (1 - clamp((frame - DRAIN_TO + 6) / 14) * 0.65);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      <Bar
        labelTop={BAR_LABEL_ONE}
        barTop={BAR_ONE_TOP}
        name="server.log"
        size={`${n(head)} bytes`}
        filled={head / BYTES}
        accent={false}
      />
      <Bar
        labelTop={BAR_LABEL_TWO}
        barTop={BAR_TWO_TOP}
        name="server.log.zip"
        size={done ? `${DEFLATE.out} bytes` : `${n(written)} bytes`}
        filled={written / BYTES}
        accent
        glyph
        note={`${RATIO}x smaller`}
        noteOn={clamp((frame - RATIO_FROM) / 14)}
        glow={landing}
      />
    </svg>
  );
};
