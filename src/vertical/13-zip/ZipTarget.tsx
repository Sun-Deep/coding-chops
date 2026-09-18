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
import { ARCHIVE, FOLDER, RATIO, RAW_TOTAL } from "./measurements";
import { MEMBERS, archiveAt } from "./lz77";
import { CYCLES, RATIO_FROM, SEALED, memberAt, readSoFar } from "./beats";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const n = (v: number) => Math.round(v).toLocaleString("en-US");

/**
 * A folder, the way every desktop has drawn one since 1984.
 *
 * The back panel with a tab, the front panel slightly proud of it. This and the
 * zip beside it are the whole reason the cut reads as compressing something on
 * your own machine rather than as an algorithm being demonstrated.
 */
const FolderMark: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path
      d="M1 5 a4 4 0 0 1 4 -4 h7 l3 4 h11 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-21 a4 4 0 0 1 -4 -4 z"
      fill="none"
      stroke={theme.colors.grayDark}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <line
      x1={1}
      y1={10}
      x2={30}
      y2={10}
      stroke={theme.colors.grayDark}
      strokeWidth={2}
    />
  </g>
);

/**
 * The archive: a box with a zipper down it.
 *
 * Drawn rather than lettered, because `.zip` on its own is a file extension and
 * the row has to read as a zip at a glance. Teeth either side of a closed seam,
 * with the pull at the top.
 */
const ZipMark: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect
      x={3}
      y={1}
      width={24}
      height={26}
      rx={5}
      fill="none"
      stroke={ACCENT}
      strokeWidth={2}
    />
    {[7, 12, 17, 22].map((ty) => (
      <g key={ty}>
        <rect x={7} y={ty} width={4} height={2} rx={1} fill={ACCENT} />
        <rect x={19} y={ty} width={4} height={2} rx={1} fill={ACCENT} />
      </g>
    ))}
    <rect x={14} y={5} width={2} height={20} rx={1} fill={ACCENT} />
    <rect x={12} y={3} width={6} height={4} rx={2} fill={ACCENT} />
  </g>
);

type BarProps = {
  labelTop: number;
  barTop: number;
  name: string;
  size: string;
  filled: number;
  accent: boolean;
  glyph: "folder" | "zip";
  note?: string;
  noteOn?: number;
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
  return (
    <>
      {glyph === "folder" ? (
        <FolderMark x={COLUMN_LEFT} y={labelTop - 3} />
      ) : (
        <ZipMark x={COLUMN_LEFT} y={labelTop - 4} />
      )}
      <text
        x={COLUMN_LEFT + 42}
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
 * The folder and the archive, to the same scale.
 *
 * This is what makes the cut a folder being compressed on somebody's computer
 * rather than an algorithm being demonstrated. The folder fills as its files
 * are read and `logs.zip` fills as the archive is written, both measured
 * against the same 2,080 byte track, so the lower bar stopping a third of the
 * way along is the claim and the empty end of it is the space that was saved.
 *
 * The archive's length is anchored on real `zip` output at every file boundary,
 * with the member being written walking its own measured curve in between. That
 * is why it visibly steps up when the second file starts, before any of its
 * content has been read: that step is the local header and directory entry the
 * archive pays for the file itself. It is not smoothed out, because it is the
 * reason a folder of small files zips worse than one big one.
 */
export const ZipTarget: React.FC = () => {
  const frame = useCurrentFrame();
  const index = memberAt(frame);
  const cycle = CYCLES[index];

  const read = Math.min(readSoFar(frame), RAW_TOTAL);
  const written = Math.min(
    archiveAt(
      index,
      Math.min(
        read - MEMBERS.slice(0, index).reduce((s, m) => s + m.bytes, 0),
        MEMBERS[index].bytes,
      ),
    ),
    ARCHIVE,
  );
  const sealed = frame >= SEALED;

  // The archive lights while a file is draining into it, so the two halves of
  // the frame are visibly the same event rather than two things happening.
  const landing =
    clamp((frame - cycle.drainFrom) / 8) *
    (1 - clamp((frame - cycle.drainTo + 4) / 12) * 0.6);

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
        name={FOLDER}
        size={`${n(read)} bytes`}
        filled={read / RAW_TOTAL}
        accent={false}
        glyph="folder"
      />
      <Bar
        labelTop={BAR_LABEL_TWO}
        barTop={BAR_TWO_TOP}
        name={`${FOLDER}.zip`}
        size={sealed ? `${ARCHIVE} bytes` : `${n(written)} bytes`}
        filled={written / RAW_TOTAL}
        accent
        glyph="zip"
        note={`${RATIO}x smaller`}
        noteOn={clamp((frame - RATIO_FROM) / 14)}
        glow={landing}
      />
    </svg>
  );
};
